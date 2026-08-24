document.addEventListener('DOMContentLoaded', () => {
    const DATA = window.LinguaData;
    if (!DATA) {
        document.body.innerHTML = '<p style="padding:24px;color:white;font-family:sans-serif">No se pudo cargar el currículo.</p>';
        return;
    }

    const levelOrder = DATA.levelOrder || ['K0', 'A1', 'A2', 'B1', 'C1'];
    const curriculum = DATA.curriculum;
    const aacDB = DATA.aacDB;
    const PASS_SCORE = 0.6;
    const TYPE_META = {
        image_select: 'Mira y elige la palabra',
        emoji_match: 'Elige la imagen',
        listen_select: 'Escucha y elige',
        translate: 'Arma la frase',
        matching: 'Empareja los pares',
        choice: 'Elige el significado',
        fill_blank: 'Completa la frase',
        clap_count: 'Cuenta las palmas'
    };

    let profiles = [];
    let activeUser = null;
    const state = {
        name: 'Aventurero', avatar: '🦁', currentLevel: 'A1',
        streak: 1, gems: 50, hearts: 5, xp: 0, streakFreeze: false,
        lastPlayDate: '', srs: [],
        unlockedIndex: { K0: 1, A1: 1, A2: 1, B1: 1, C1: 1 },
        activeLesson: null, currentQuestionIdx: 0, correctCount: 0,
        selectedChips: [], audioCtx: null, firstMatchCard: null,
        matchedPairsCount: 0, comboStreak: 0, maxCombo: 0, hintsUsed: 0,
        selectedChoice: null, nextLevelToSwitch: null, aacPhrase: [],
        clapTaps: 0, lessonPassed: false,
        tutorialSeen: localStorage.getItem('lp_tut') === '1'
    };

    const $ = (id) => document.getElementById(id);
    const bind = (node, ev, fn) => { if (node) node.addEventListener(ev, fn); };
    const byId = (id, ev, fn) => bind($(id), ev, fn);
    const todayStr = () => new Date().toISOString().slice(0, 10);
    const yesterdayStr = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
    };

    function loadProfiles() {
        try {
            const data = localStorage.getItem('lp_profiles_v2');
            profiles = data ? JSON.parse(data) : [];
            if (!Array.isArray(profiles)) profiles = [];
        } catch (e) {
            profiles = [];
        }
        const activeId = localStorage.getItem('lp_active_user_v2');
        activeUser = profiles.find((p) => p.id === activeId) || profiles[0] || null;
        if (activeUser) syncStateFromActiveUser();
    }

    function defaultUnlock() {
        return { K0: 1, A1: 1, A2: 1, B1: 1, C1: 1 };
    }

    function syncStateFromActiveUser() {
        if (!activeUser) return;
        state.name = activeUser.name || 'Aventurero';
        state.avatar = activeUser.avatar || '🦁';
        state.currentLevel = levelOrder.includes(activeUser.currentLevel) ? activeUser.currentLevel : 'A1';
        state.streak = typeof activeUser.streak === 'number' ? activeUser.streak : 1;
        state.gems = typeof activeUser.gems === 'number' ? activeUser.gems : 50;
        state.hearts = typeof activeUser.hearts === 'number' ? activeUser.hearts : 5;
        state.xp = typeof activeUser.xp === 'number' ? activeUser.xp : 0;
        state.streakFreeze = !!activeUser.streakFreeze;
        state.lastPlayDate = activeUser.lastPlayDate || '';
        state.srs = Array.isArray(activeUser.srs) ? activeUser.srs : [];
        state.unlockedIndex = defaultUnlock();
        if (activeUser.unlockedIndex && typeof activeUser.unlockedIndex === 'object') {
            levelOrder.forEach((lvl) => {
                if (typeof activeUser.unlockedIndex[lvl] === 'number') {
                    state.unlockedIndex[lvl] = Math.max(activeUser.unlockedIndex[lvl], 1);
                }
            });
        }
    }

    function saveProgress() {
        if (!activeUser) return;
        Object.assign(activeUser, {
            name: state.name, avatar: state.avatar, currentLevel: state.currentLevel,
            streak: state.streak, gems: state.gems, hearts: state.hearts, xp: state.xp,
            streakFreeze: state.streakFreeze, lastPlayDate: state.lastPlayDate,
            srs: state.srs, unlockedIndex: { ...state.unlockedIndex }
        });
        localStorage.setItem('lp_profiles_v2', JSON.stringify(profiles));
        localStorage.setItem('lp_active_user_v2', activeUser.id);
    }

    function touchStreak() {
        const today = todayStr();
        if (state.lastPlayDate === today) return;
        if (state.lastPlayDate === yesterdayStr()) {
            state.streak += 1;
        } else if (state.lastPlayDate && state.streakFreeze) {
            state.streakFreeze = false;
        } else if (state.lastPlayDate) {
            state.streak = 1;
        }
        state.lastPlayDate = today;
    }

    function dueCards() {
        const now = Date.now();
        return state.srs.filter((c) => c.due <= now);
    }

    function upsertSrs(q, dueInMs) {
        if (!q || !q.word) return;
        const existing = state.srs.find((c) => c.word === q.word);
        const card = {
            word: q.word,
            es: q.es || '',
            emoji: q.emoji || (Array.isArray(q.emojis) ? q.emojis[0] : '🔤'),
            soundsLike: q.soundsLike || '',
            phonetic: q.phonetic || '',
            context: q.context || '',
            due: Date.now() + dueInMs
        };
        if (existing) Object.assign(existing, card);
        else state.srs.push(card);
    }

    loadProfiles();

    function initAudio() {
        if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    function beep(type, freqFrom, freqTo, dur, vol = 0.14) {
        try {
            initAudio();
            const n = state.audioCtx.currentTime;
            const o = state.audioCtx.createOscillator();
            const g = state.audioCtx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freqFrom, n);
            o.frequency.exponentialRampToValueAtTime(Math.max(1, freqTo), n + dur);
            g.gain.setValueAtTime(vol, n);
            g.gain.exponentialRampToValueAtTime(0.001, n + dur);
            o.connect(g); g.connect(state.audioCtx.destination);
            o.start(n); o.stop(n + dur);
        } catch (e) {}
    }
    const playClick = () => beep('sine', 450, 850, 0.04, 0.1);
    const playPop = () => beep('triangle', 600, 1200, 0.08, 0.16);
    const playError = () => beep('sawtooth', 220, 140, 0.22, 0.16);
    function playSuccess() {
        try {
            initAudio();
            const n = state.audioCtx.currentTime;
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
                const o = state.audioCtx.createOscillator();
                const g = state.audioCtx.createGain();
                o.type = 'triangle';
                o.frequency.setValueAtTime(f, n + i * 0.07);
                g.gain.setValueAtTime(0.16, n + i * 0.07);
                g.gain.exponentialRampToValueAtTime(0.001, n + i * 0.07 + 0.2);
                o.connect(g); g.connect(state.audioCtx.destination);
                o.start(n + i * 0.07); o.stop(n + i * 0.07 + 0.2);
            });
        } catch (e) {}
    }
    function playCombo() {
        [440, 554, 659].forEach((f, i) => setTimeout(() => beep('sine', f, f, 0.1, 0.12), i * 50));
    }

    const mascotAvatar = $('mascot-avatar');
    function speak(text, rate = 0.85) {
        try {
            if (!('speechSynthesis' in window) || !text) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(String(text));
            u.lang = 'en-US';
            u.rate = rate;
            if (mascotAvatar) {
                mascotAvatar.classList.add('mascot-speaking');
                u.onend = () => mascotAvatar.classList.remove('mascot-speaking');
                u.onerror = () => mascotAvatar.classList.remove('mascot-speaking');
            }
            window.speechSynthesis.speak(u);
        } catch (e) {}
    }
    function speakEcho(text) {
        speak(text, 0.85);
        setTimeout(() => speak(text, 0.6), 1400);
    }

    const confettiCanvas = $('confetti-canvas');
    const ctx = confettiCanvas && confettiCanvas.getContext ? confettiCanvas.getContext('2d') : null;
    function resizeCanvas() {
        if (!confettiCanvas) return;
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    function triggerConfetti() {
        if (!ctx || !confettiCanvas) return;
        confettiCanvas.classList.add('is-on');
        resizeCanvas();
        const ps = [];
        const colors = ['#FF6A4A', '#2EC4B6', '#F5C14A', '#4C7DFF', '#FF7EB6'];
        for (let i = 0; i < 90; i++) {
            ps.push({
                x: window.innerWidth / 2, y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.7) * 16,
                size: Math.random() * 8 + 6, color: colors[i % colors.length],
                rot: Math.random() * 360, rs: (Math.random() - 0.5) * 10, op: 1
            });
        }
        (function draw() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let alive = false;
            ps.forEach((p) => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.rot += p.rs; p.op -= 0.012;
                if (p.op > 0) {
                    alive = true;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rot * Math.PI) / 180);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = Math.max(0, p.op);
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                }
            });
            if (alive) requestAnimationFrame(draw);
            else {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
                confettiCanvas.classList.remove('is-on');
            }
        })();
    }

    const msgs = {
        ok: ['¡Excelente!', '¡Genial!', '¡Así se hace!', '¡Correcto!', '¡Muy bien!'],
        combo: ['¡Racha de fuego!', '¡Imparable!', '¡Combo!'],
        end: ['Cada palabra suma.', 'Vas con paso firme.', 'Hoy aprendiste de verdad.']
    };
    const randMsg = (arr) => arr[Math.floor(Math.random() * arr.length)];
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const levelSelectorBtn = $('level-selector-btn');
    const levelDrawer = $('level-drawer');
    const currentLevelBadge = $('current-level-badge');
    const levelOpts = document.querySelectorAll('.level-opt');
    const pathTree = $('path-tree');
    const lessonView = $('lesson-view');
    const comboCounter = $('combo-counter');
    const checkBtn = $('check-btn');
    const feedbackSheet = $('feedback-sheet');
    const hintBtn = $('hint-btn');
    const charPrompt = $('character-prompt');
    const mods = {
        image_select: $('mod-image-select'),
        emoji_match: $('mod-emoji-match'),
        listen_select: $('mod-listen-select'),
        translate: $('mod-translate'),
        matching: $('mod-matching'),
        choice: $('mod-choice'),
        fill_blank: $('mod-fill-blank'),
        clap_count: $('mod-clap')
    };

    function showToast(msg) {
        const t = $('encouragement-toast');
        const tx = $('encouragement-text');
        if (!t || !tx) return;
        tx.textContent = msg;
        t.classList.remove('hidden');
        setTimeout(() => t.classList.add('hidden'), 1800);
    }

    function isKids() { return state.currentLevel === 'K0'; }

    function updateStats() {
        const heartsDisplay = isKids() ? '∞' : String(state.hearts);
        if ($('user-streak')) $('user-streak').textContent = state.streak;
        if ($('user-gems')) $('user-gems').textContent = state.gems;
        if ($('user-hearts')) $('user-hearts').textContent = heartsDisplay;
        if ($('lesson-hearts-count')) $('lesson-hearts-count').textContent = heartsDisplay;
        if ($('top-user-avatar-icon')) $('top-user-avatar-icon').textContent = state.avatar;
        if ($('top-user-name')) $('top-user-name').textContent = state.name;
        if ($('banner-user-avatar')) $('banner-user-avatar').textContent = state.avatar;
        if ($('banner-user-name')) $('banner-user-name').textContent = state.name;
        if ($('banner-user-sub')) $('banner-user-sub').textContent = `Nivel ${state.currentLevel} · ${state.xp} XP`;
        if ($('mascot-avatar')) $('mascot-avatar').textContent = state.avatar;
        if ($('profile-name-display')) $('profile-name-display').textContent = state.name;
        if ($('profile-avatar-display')) $('profile-avatar-display').textContent = state.avatar;
        if ($('profile-rank-display')) $('profile-rank-display').textContent = `Nivel ${state.currentLevel} · ${state.xp} XP`;
        if ($('prof-streak')) $('prof-streak').textContent = state.streak;
        if ($('prof-xp')) $('prof-xp').textContent = `${state.xp} XP`;
        if ($('prof-gems')) $('prof-gems').textContent = state.gems;
        const due = dueCards().length;
        if ($('review-dot')) $('review-dot').classList.toggle('hidden', due === 0);
        if ($('srs-status')) {
            $('srs-status').textContent = due
                ? `${due} palabra${due === 1 ? '' : 's'} para repasar ahora.`
                : 'Las palabras que fallas vuelven aquí, un poco más tarde.';
        }
        renderProfilesList();
    }

    function switchTab(id) {
        document.querySelectorAll('.nav-tab').forEach((x) => x.classList.toggle('active', x.dataset.target === id));
        document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === id));
        if (id === 'dictionary-view') renderDictionary();
        if (id === 'aac-view') renderAAC('needs');
        if (id === 'path-view') renderPath();
        if (id === 'review-view') renderSrs();
    }

    document.querySelectorAll('.nav-tab').forEach((t) => t.addEventListener('click', (e) => {
        e.preventDefault();
        playClick();
        switchTab(t.dataset.target);
    }));

    bind(levelSelectorBtn, 'click', () => {
        playClick();
        if (!levelDrawer) return;
        levelDrawer.classList.toggle('active');
        levelSelectorBtn.setAttribute('aria-expanded', levelDrawer.classList.contains('active'));
    });
    levelOpts.forEach((o) => o.addEventListener('click', () => {
        playClick();
        levelOpts.forEach((x) => x.classList.remove('active'));
        o.classList.add('active');
        state.currentLevel = o.dataset.level;
        currentLevelBadge.textContent = state.currentLevel;
        levelDrawer.classList.remove('active');
        saveProgress();
        renderPath();
        renderDictionary();
        updateStats();
    }));

    function el(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function renderAAC(cat = 'needs') {
        const grid = $('aac-cards-grid');
        if (!grid) return;
        grid.replaceChildren();
        (aacDB[cat] || aacDB.needs).forEach((item) => {
            const card = el('button', 'aac-card');
            card.type = 'button';
            card.append(el('div', 'aac-card-emoji', item.emoji), el('div', 'aac-card-en', item.en), el('div', 'aac-card-sounds', item.sounds), el('div', 'aac-card-es', item.es));
            card.addEventListener('click', () => {
                playPop();
                speak(item.en, 0.85);
                addAACToStrip(item);
            });
            grid.appendChild(card);
        });
    }
    function addAACToStrip(item) {
        state.aacPhrase.push(item);
        if ($('aac-placeholder')) $('aac-placeholder').style.display = 'none';
        const chip = el('button', 'aac-phrase-chip');
        chip.type = 'button';
        chip.textContent = `${item.emoji} ${item.en}`;
        chip.addEventListener('click', () => {
            chip.remove();
            state.aacPhrase = state.aacPhrase.filter((x) => x !== item);
            if (!state.aacPhrase.length && $('aac-placeholder')) $('aac-placeholder').style.display = 'inline';
        });
        $('aac-strip').appendChild(chip);
    }
    if ($('aac-speak-btn')) {
        $('aac-speak-btn').addEventListener('click', () => {
            if (!state.aacPhrase.length) {
                showToast('Toca pictogramas para armar tu frase');
                return;
            }
            playSuccess();
            const phrase = state.aacPhrase.map((p) => p.en).join(' ');
            speak(phrase, 0.8);
            showToast(phrase);
        });
    }
    if ($('aac-clear-btn')) {
        $('aac-clear-btn').addEventListener('click', () => {
            playClick();
            state.aacPhrase = [];
            $('aac-strip').querySelectorAll('.aac-phrase-chip').forEach((c) => c.remove());
            if ($('aac-placeholder')) $('aac-placeholder').style.display = 'inline';
        });
    }
    if ($('aac-category-tabs')) {
        $('aac-category-tabs').querySelectorAll('.aac-cat-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                playClick();
                $('aac-category-tabs').querySelectorAll('.aac-cat-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                renderAAC(btn.dataset.cat);
            });
        });
    }

    function renderPath() {
        const d = curriculum[state.currentLevel] || curriculum.A1;
        $('banner-unit').textContent = `Nivel ${state.currentLevel}`;
        $('banner-title').textContent = d.title;
        $('banner-desc').textContent = d.desc;
        pathTree.replaceChildren();
        const unlockedCount = state.unlockedIndex[state.currentLevel] || 1;
        const total = d.lessons.length;
        const currentActiveIdx = Math.min(unlockedCount - 1, total - 1);
        d.lessons.forEach((l, i) => {
            const isUnlocked = i < unlockedCount;
            const isCurrent = i === currentActiveIdx && unlockedCount <= total;
            const isCompleted = i < currentActiveIdx || (unlockedCount > total && i < total);
            const w = el('div', `node-wrapper ${isCurrent ? 'level-active' : (isCompleted ? 'level-completed' : 'level-locked')}`);
            const b = el('button', 'path-node');
            b.type = 'button';
            b.appendChild(el('div', 'node-icon', isUnlocked ? l.icon : '🔒'));
            if (isUnlocked) {
                if (isCurrent) w.appendChild(el('div', 'node-tooltip', 'Empezar'));
                w.addEventListener('click', () => startLesson(l));
            }
            w.append(b, el('div', 'node-label', l.name));
            pathTree.appendChild(w);
        });
        const currentLvlIdx = levelOrder.indexOf(state.currentLevel);
        if (unlockedCount > total && currentLvlIdx + 1 < levelOrder.length) {
            const nextLvlKey = levelOrder[currentLvlIdx + 1];
            const card = el('div', 'next-level-card');
            const info = el('div', 'next-level-info');
            info.append(el('strong', null, `Nivel ${state.currentLevel} superado`), el('span', null, `Sigue en ${nextLvlKey}`));
            const btn = el('button', 'next-level-btn', `Ir a ${nextLvlKey}`);
            btn.type = 'button';
            btn.addEventListener('click', () => {
                playSuccess();
                state.currentLevel = nextLvlKey;
                state.unlockedIndex[nextLvlKey] = Math.max(state.unlockedIndex[nextLvlKey] || 1, 1);
                currentLevelBadge.textContent = state.currentLevel;
                levelOpts.forEach((o) => o.classList.toggle('active', o.dataset.level === state.currentLevel));
                saveProgress();
                renderPath();
                renderDictionary();
                updateStats();
            });
            card.append(el('div', 'next-level-icon', '🚀'), info, btn);
            pathTree.appendChild(card);
        }
    }

    function renderDictionary() {
        const wrap = $('dictionary-categories');
        if (!wrap) return;
        wrap.replaceChildren();
        const data = curriculum[state.currentLevel] || curriculum.A1;
        data.lessons.forEach((l) => {
            const block = el('div', 'dict-category-block');
            block.appendChild(el('h3', 'dict-cat-title', `${l.icon} ${l.name}`));
            const grid = el('div', 'dict-words-grid');
            const seen = new Set();
            l.questions.forEach((q) => {
                if (!q.word || !q.es || seen.has(q.word)) return;
                seen.add(q.word);
                const card = el('div', 'dict-word-card');
                const info = el('div', 'dict-info');
                info.append(
                    el('span', 'dict-english', q.word),
                    el('span', 'dict-sounds', q.soundsLike ? `Suena: “${q.soundsLike}”` : ''),
                    el('span', 'dict-spanish', q.es),
                    el('span', 'dict-context', q.syllables || q.context || '')
                );
                const listen = el('button', 'dict-listen-btn', '🔊');
                listen.type = 'button';
                listen.addEventListener('click', () => speak(q.word, 0.85));
                card.append(el('div', 'dict-emoji', q.emoji || '🔤'), info, listen);
                grid.appendChild(card);
            });
            if (grid.children.length) {
                block.appendChild(grid);
                wrap.appendChild(block);
            }
        });
    }

    let srsIndex = 0;
    function renderSrs() {
        const due = dueCards();
        const empty = $('srs-empty');
        const card = $('srs-card');
        if (!due.length) {
            empty.classList.remove('hidden');
            card.classList.add('hidden');
            return;
        }
        empty.classList.add('hidden');
        card.classList.remove('hidden');
        if (srsIndex >= due.length) srsIndex = 0;
        paintSrs(due[srsIndex]);
    }
    function paintSrs(item) {
        $('srs-emoji').textContent = item.emoji || '🔤';
        $('srs-word').textContent = item.word;
        $('srs-sounds-like').textContent = item.soundsLike ? `Suena: “${item.soundsLike}”` : '';
        $('srs-phonetic').textContent = item.phonetic || '';
        $('srs-context-line').textContent = item.context || '';
        $('srs-translation').textContent = item.es || '';
        $('srs-translation').classList.add('hidden');
        $('reveal-srs-btn').classList.remove('hidden');
        $('srs-grade').classList.add('hidden');
        $('srs-tts-btn').onclick = () => speak(item.word, 0.85);
        $('reveal-srs-btn').onclick = () => {
            playClick();
            $('srs-translation').classList.remove('hidden');
            $('reveal-srs-btn').classList.add('hidden');
            $('srs-grade').classList.remove('hidden');
        };
        $('srs-grade').querySelectorAll('button').forEach((btn) => {
            btn.onclick = () => {
                const grade = btn.dataset.grade;
                const ms = grade === 'again' ? 10 * 60 * 1000 : grade === 'good' ? 86400000 : 3 * 86400000;
                upsertSrs(item, ms);
                saveProgress();
                playPop();
                srsIndex++;
                renderSrs();
                updateStats();
            };
        });
    }

    function hideAllMods() {
        Object.values(mods).forEach((m) => m && m.classList.add('hidden'));
    }

    function showLessonChrome(on) {
        const intro = $('lesson-intro');
        const area = $('exercise-area');
        const footer = document.querySelector('.lesson-footer');
        if (intro) intro.classList.toggle('show', !on);
        if (area) area.style.display = on ? 'flex' : 'none';
        if (footer) footer.style.display = on ? 'block' : 'none';
        if ($('question-badge')) $('question-badge').style.display = on ? 'block' : 'none';
        if ($('type-pill')) $('type-pill').style.display = on ? 'block' : 'none';
    }

    function startLesson(l) {
        if (!isKids() && state.hearts <= 0) {
            $('hearts-modal').classList.add('active');
            return;
        }
        state.activeLesson = l;
        state.currentQuestionIdx = 0;
        state.correctCount = 0;
        state.comboStreak = 0;
        state.maxCombo = 0;
        state.hintsUsed = 0;
        state.selectedChoice = null;
        state.lessonPassed = false;
        comboCounter.classList.add('hidden');
        lessonView.classList.toggle('k0-mode', isKids());
        if ($('bottom-nav-bar')) $('bottom-nav-bar').style.display = 'none';
        document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
        lessonView.classList.add('active');
        $('intro-kicker').textContent = `Nivel ${state.currentLevel}`;
        $('intro-title').textContent = l.name;
        $('intro-goal').textContent = l.goal || 'Mira, escucha y usa cada palabra.';
        const words = $('intro-words');
        words.replaceChildren();
        const seen = new Set();
        l.questions.forEach((q) => {
            if (q.word && !seen.has(q.word) && seen.size < 8) {
                seen.add(q.word);
                words.appendChild(el('span', 'intro-chip', `${q.emoji || ''} ${q.word}`));
            }
        });
        showLessonChrome(false);
        updateStats();
    }

    byId('intro-start-btn', 'click', () => {
        playClick();
        showLessonChrome(true);
        loadQ();
    });

    byId('close-lesson-btn', 'click', () => {
        if (!window.confirm || window.confirm('¿Salir? Esta lección no se guardará.')) {
            lessonView.classList.remove('active');
            if ($('path-view')) $('path-view').classList.add('active');
            if ($('bottom-nav-bar')) $('bottom-nav-bar').style.display = 'flex';
        }
    });

    byId('tts-normal-btn', 'click', () => speak($('prompt-text') ? $('prompt-text').textContent : '', 0.85));
    byId('tts-slow-btn', 'click', () => speak($('prompt-text') ? $('prompt-text').textContent : '', 0.5));
    byId('tts-echo-btn', 'click', () => speakEcho($('prompt-text') ? $('prompt-text').textContent : ''));

    function setSupport(soundsEl, phonEl, ctxEl, sylRow, sylText, mouthBox, q) {
        if (soundsEl) soundsEl.textContent = q.soundsLike ? `Suena: “${q.soundsLike}”` : '';
        if (phonEl) phonEl.textContent = q.phonetic || '';
        if (ctxEl) ctxEl.textContent = q.context || '';
        if (sylRow) {
            if (q.syllables) {
                sylRow.classList.remove('hidden');
                if (sylText) sylText.textContent = q.syllables;
                else sylRow.textContent = q.syllables;
            } else sylRow.classList.add('hidden');
        }
        if (mouthBox) {
            if (q.mouth) {
                mouthBox.classList.remove('hidden');
                const span = mouthBox.querySelector('span');
                if (span) span.textContent = q.mouth;
            } else mouthBox.classList.add('hidden');
        }
    }

    function optionButtons(container, labels, onPick, className) {
        container.replaceChildren();
        shuffle(labels).forEach((label) => {
            const btn = el('button', className, typeof label === 'string' ? label : '');
            btn.type = 'button';
            if (typeof label !== 'string') {
                btn.append(el('span', null, label.emoji || ''), el('span', 'listen-option-lbl', label.text));
            }
            btn.addEventListener('click', () => {
                playClick();
                container.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                onPick(typeof label === 'string' ? label : label.text);
            });
            container.appendChild(btn);
        });
    }

    function loadQ() {
        const q = state.activeLesson.questions[state.currentQuestionIdx];
        const total = state.activeLesson.questions.length;
        state.selectedChips = [];
        state.firstMatchCard = null;
        state.matchedPairsCount = 0;
        state.selectedChoice = null;
        state.clapTaps = 0;
        feedbackSheet.className = 'feedback-sheet';
        checkBtn.disabled = true;
        $('q-current').textContent = state.currentQuestionIdx + 1;
        $('q-total').textContent = total;
        $('lesson-progress-fill').style.width = `${(state.currentQuestionIdx / total) * 100}%`;
        if (hintBtn) hintBtn.classList.remove('used');
        $('type-pill').textContent = TYPE_META[q.type] || 'Practica';
        hideAllMods();
        charPrompt.style.display = q.type === 'translate' || q.type === 'choice' ? 'flex' : 'none';
        $('prompt-title').textContent = q.prompt || TYPE_META[q.type];

        if (q.type === 'image_select') {
            mods.image_select.classList.remove('hidden');
            $('big-emoji').textContent = q.emoji;
            setSupport($('sounds-like-pill'), $('phonetic-badge'), $('word-context-box'), $('syllables-clap-row'), $('syllables-text'), $('mouth-guide-box'), q);
            optionButtons($('image-options'), q.options, (v) => { state.selectedChoice = v; checkBtn.disabled = false; }, 'image-option');
            setTimeout(() => speak(q.word, 0.85), 80);
        } else if (q.type === 'emoji_match') {
            mods.emoji_match.classList.remove('hidden');
            $('big-word').textContent = q.word;
            setSupport($('big-word-sounds-like'), $('big-word-phonetic'), $('big-word-context-box'), $('big-syllables-clap-row'), $('big-syllables-text'), $('big-mouth-guide-box'), q);
            optionButtons($('emoji-options'), q.emojis, (v) => { state.selectedChoice = v; checkBtn.disabled = false; }, 'emoji-option');
            setTimeout(() => speak(q.word, 0.85), 80);
        } else if (q.type === 'listen_select') {
            mods.listen_select.classList.remove('hidden');
            $('listen-big-btn').onclick = () => speak(q.word, 0.85);
            $('listen-normal-btn').onclick = () => speak(q.word, 0.85);
            $('listen-slow-btn').onclick = () => speak(q.word, 0.5);
            $('listen-echo-btn').onclick = () => speakEcho(q.word);
            optionButtons($('listen-options'), q.options, (v) => { state.selectedChoice = v; checkBtn.disabled = false; }, 'listen-option');
            setTimeout(() => speak(q.word, 0.85), 120);
        } else if (q.type === 'translate') {
            mods.translate.classList.remove('hidden');
            $('prompt-text').textContent = q.prompt;
            const pool = $('word-pool');
            const slot = $('answer-slot-line');
            const ph = $('placeholder-hint');
            pool.replaceChildren();
            slot.replaceChildren(ph);
            ph.style.display = 'inline';
            shuffle(q.pool).forEach((w, i) => {
                const cid = `c${i}-${Date.now()}`;
                const chip = el('button', 'word-chip', w);
                chip.id = cid;
                chip.addEventListener('click', () => {
                    if (chip.classList.contains('chip-disabled')) return;
                    playClick();
                    chip.classList.add('chip-disabled');
                    ph.style.display = 'none';
                    const sc = el('button', 'word-chip', w);
                    sc.addEventListener('click', () => {
                        playClick();
                        sc.remove();
                        chip.classList.remove('chip-disabled');
                        state.selectedChips = state.selectedChips.filter((c) => c.el !== sc);
                        if (!state.selectedChips.length) { ph.style.display = 'inline'; checkBtn.disabled = true; }
                    });
                    slot.appendChild(sc);
                    state.selectedChips.push({ id: cid, text: w, el: sc });
                    checkBtn.disabled = false;
                });
                pool.appendChild(chip);
            });
            setTimeout(() => speak(q.prompt, 0.85), 80);
        } else if (q.type === 'matching') {
            mods.matching.classList.remove('hidden');
            const grid = $('matching-grid');
            grid.replaceChildren();
            const cards = [];
            q.pairs.forEach((p, i) => {
                cards.push({ id: i, text: p.en, lang: 'en' });
                cards.push({ id: i, text: p.es, lang: 'es' });
            });
            shuffle(cards).forEach((c) => {
                const btn = el('button', 'match-card', c.text);
                btn.dataset.pairId = String(c.id);
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('matched')) return;
                    if (c.lang === 'en') speak(c.text, 0.85);
                    else playClick();
                    if (!state.firstMatchCard) {
                        state.firstMatchCard = { elem: btn, id: c.id };
                        btn.classList.add('selected');
                    } else {
                        if (state.firstMatchCard.elem === btn) return;
                        if (state.firstMatchCard.id === Number(btn.dataset.pairId)) {
                            playPop();
                            state.firstMatchCard.elem.className = 'match-card matched';
                            btn.className = 'match-card matched';
                            state.firstMatchCard = null;
                            state.matchedPairsCount++;
                            if (state.matchedPairsCount === q.pairs.length) checkBtn.disabled = false;
                        } else {
                            playError();
                            btn.classList.add('wrong');
                            state.firstMatchCard.elem.classList.add('wrong');
                            const fm = state.firstMatchCard;
                            setTimeout(() => {
                                btn.classList.remove('wrong', 'selected');
                                fm.elem.classList.remove('wrong', 'selected');
                                state.firstMatchCard = null;
                            }, 400);
                        }
                    }
                });
                grid.appendChild(btn);
            });
        } else if (q.type === 'choice') {
            mods.choice.classList.remove('hidden');
            optionButtons($('choices-grid'), q.options, (v) => { state.selectedChoice = v; checkBtn.disabled = false; }, 'choice-card');
        } else if (q.type === 'fill_blank') {
            mods.fill_blank.classList.remove('hidden');
            $('blank-sentence').textContent = q.sentence || '___';
            $('blank-es').textContent = q.es ? `(${q.es})` : '';
            optionButtons($('blank-options'), q.options, (v) => { state.selectedChoice = v; checkBtn.disabled = false; }, 'image-option');
            setTimeout(() => speak(q.word, 0.85), 80);
        } else if (q.type === 'clap_count') {
            mods.clap_count.classList.remove('hidden');
            $('clap-emoji').textContent = q.emoji || '👏';
            $('clap-word').textContent = q.word;
            $('clap-syllables').textContent = q.syllables || q.word;
            $('clap-live').textContent = 'Palmas: 0';
            $('clap-pad').onclick = () => {
                playPop();
                state.clapTaps += 1;
                $('clap-live').textContent = `Palmas: ${state.clapTaps}`;
                speak(q.word, 0.7);
            };
            optionButtons($('clap-options'), (q.options || [1, 2, 3, 4]).map(String), (v) => {
                state.selectedChoice = Number(v);
                checkBtn.disabled = false;
            }, 'clap-opt');
            setTimeout(() => speak(q.word, 0.7), 80);
        }
    }

    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            const q = state.activeLesson?.questions[state.currentQuestionIdx];
            if (!q) return;
            playClick();
            state.hintsUsed++;
            if (q.type === 'translate') {
                const placed = state.selectedChips.map((c) => c.text);
                const next = q.answer.find((w, i) => placed.filter((p) => p === w).length < q.answer.slice(0, i + 1).filter((a) => a === w).length);
                if (next) {
                    const chips = $('word-pool').querySelectorAll('.word-chip:not(.chip-disabled)');
                    for (const c of chips) if (c.textContent === next) { c.classList.add('hint-glow'); break; }
                }
            } else if (q.soundsLike) {
                showToast(`Suena: “${q.soundsLike}”`);
                speak(q.word || q.prompt, 0.6);
            } else {
                showToast('Escucha otra vez');
                speak(q.word || q.prompt, 0.6);
            }
        });
    }

    function updateCombo(ok) {
        if (ok) {
            state.comboStreak++;
            if (state.comboStreak > state.maxCombo) state.maxCombo = state.comboStreak;
            if (state.comboStreak >= 2) {
                comboCounter.classList.remove('hidden');
                $('combo-number').textContent = state.comboStreak;
                playCombo();
                if (state.comboStreak >= 3) showToast(randMsg(msgs.combo));
            }
        } else {
            state.comboStreak = 0;
            comboCounter.classList.add('hidden');
        }
    }

    function triggerHeartLoss() {
        const icon = $('hearts-stat-container');
        if (icon) icon.classList.add('shake-heart');
        const fl = $('floating-heart-loss');
        if (fl) fl.classList.add('animate-loss');
        setTimeout(() => {
            if (icon) icon.classList.remove('shake-heart');
            if (fl) fl.classList.remove('animate-loss');
        }, 1000);
    }

    bind(checkBtn, 'click', () => {
        const q = state.activeLesson.questions[state.currentQuestionIdx];
        let ok = false;
        if (q.type === 'translate') ok = JSON.stringify(state.selectedChips.map((c) => c.text)) === JSON.stringify(q.answer);
        else if (q.type === 'matching') ok = state.matchedPairsCount === q.pairs.length;
        else if (q.type === 'clap_count') ok = Number(state.selectedChoice) === Number(q.correct);
        else ok = state.selectedChoice === q.correct;

        if (ok) {
            playSuccess();
            state.correctCount++;
            updateCombo(true);
            upsertSrs(q, 86400000);
            feedbackSheet.className = 'feedback-sheet show success';
            $('feedback-icon').textContent = '✓';
            $('feedback-title').textContent = randMsg(msgs.ok);
            $('feedback-subtitle').textContent = q.word ? `${q.word} = ${q.es || ''} · ${q.soundsLike ? 'suena “' + q.soundsLike + '”' : ''}` : '¡Respuesta correcta!';
        } else {
            playError();
            updateCombo(false);
            upsertSrs(q, 0);
            if (!isKids()) {
                triggerHeartLoss();
                state.hearts = Math.max(0, state.hearts - 1);
                updateStats();
                saveProgress();
            }
            feedbackSheet.className = 'feedback-sheet show error';
            $('feedback-icon').textContent = '✕';
            $('feedback-title').textContent = isKids() ? 'Casi. Escucha y prueba otra vez' : 'La respuesta era:';
            const right = q.word ? `${q.word} = ${q.es || ''}` : String(q.correct ?? '');
            $('feedback-subtitle').textContent = right;
        }
    });

    byId('continue-btn', 'click', () => {
        feedbackSheet.classList.remove('show');
        const more = state.currentQuestionIdx + 1 < state.activeLesson.questions.length;
        const alive = isKids() || state.hearts > 0;
        if (more && alive) {
            state.currentQuestionIdx++;
            loadQ();
        } else {
            const acc = state.correctCount / state.activeLesson.questions.length;
            finishLesson(isKids() || (alive && acc >= PASS_SCORE));
        }
    });

    function finishLesson(passed) {
        const total = state.activeLesson.questions.length;
        const acc = Math.round((state.correctCount / total) * 100);
        const bonus = passed ? (state.maxCombo >= 3 ? 28 : 18) : 8;
        state.lessonPassed = passed;
        $('accuracy-val').textContent = `${acc}%`;
        $('combo-max-val').textContent = `🔥 ${state.maxCombo}`;
        $('xp-reward-val').textContent = `+${bonus}`;
        $('complete-title').textContent = passed ? '¡Lección completada!' : 'Sigue practicando';
        $('completion-encourage').textContent = passed ? (isKids() ? 'Nuevas palabras y sonidos, muy bien.' : randMsg(msgs.end)) : 'Aún no desbloqueas la siguiente. Repite cuando quieras.';
        $('pass-note').textContent = passed ? 'Siguiente unidad desbloqueada.' : `Necesitas ${Math.round(PASS_SCORE * 100)}% para avanzar. Tus fallos están en Repaso.`;
        state.gems += passed ? 15 : 5;
        state.xp += bonus;
        touchStreak();

        if (passed) {
            const lessons = curriculum[state.currentLevel].lessons;
            const activeIdx = lessons.findIndex((l) => l.id === state.activeLesson.id);
            if (activeIdx !== -1) {
                const isLast = activeIdx === lessons.length - 1;
                const nextUnlocked = activeIdx + 2;
                if (isLast) {
                    const idx = levelOrder.indexOf(state.currentLevel);
                    if (idx !== -1 && idx + 1 < levelOrder.length) {
                        const next = levelOrder[idx + 1];
                        state.unlockedIndex[next] = Math.max(state.unlockedIndex[next] || 1, 1);
                        state.unlockedIndex[state.currentLevel] = lessons.length + 1;
                        state.nextLevelToSwitch = next;
                        $('complete-title').textContent = '¡Nivel completado!';
                        $('completion-encourage').textContent = `Desbloqueaste el nivel ${next}.`;
                    }
                } else if (nextUnlocked > (state.unlockedIndex[state.currentLevel] || 1)) {
                    state.unlockedIndex[state.currentLevel] = nextUnlocked;
                }
            }
        }
        saveProgress();
        updateStats();
        $('completion-modal').classList.add('active');
        if (passed) triggerConfetti();
        playSuccess();
    }

    byId('finish-lesson-btn', 'click', () => {
        $('completion-modal').classList.remove('active');
        lessonView.classList.remove('active');
        $('path-view').classList.add('active');
        if ($('bottom-nav-bar')) $('bottom-nav-bar').style.display = 'flex';
        if (state.nextLevelToSwitch) {
            state.currentLevel = state.nextLevelToSwitch;
            state.nextLevelToSwitch = null;
            currentLevelBadge.textContent = state.currentLevel;
            levelOpts.forEach((o) => o.classList.toggle('active', o.dataset.level === state.currentLevel));
            saveProgress();
        }
        renderPath();
        renderDictionary();
        updateStats();
    });

    byId('buy-hearts-btn', 'click', () => {
        if (state.gems >= 50) {
            state.gems -= 50;
            state.hearts = 5;
            saveProgress();
            updateStats();
            playSuccess();
            showToast('5 vidas listas');
        } else showToast('Necesitas 50 gemas');
    });
    byId('buy-freeze-btn', 'click', () => {
        if (state.gems >= 100) {
            state.gems -= 100;
            state.streakFreeze = true;
            saveProgress();
            updateStats();
            playSuccess();
            showToast('Escudo activo para un día');
        } else showToast('Necesitas 100 gemas');
    });
    if ($('hearts-shop-btn')) {
        $('hearts-shop-btn').addEventListener('click', () => {
            $('hearts-modal').classList.remove('active');
            switchTab('shop-view');
        });
    }

    const onboardingModal = $('onboarding-modal');
    const onboardingNameInput = $('onboarding-name-input');
    let selectedOnboardingAvatar = '🦁';
    let selectedOnboardingLevel = 'A1';
    let isEditingProfile = false;

    document.querySelectorAll('.avatar-opt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            playClick();
            document.querySelectorAll('.avatar-opt-btn').forEach((b) => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedOnboardingAvatar = btn.dataset.avatar || '🦁';
        });
    });
    document.querySelectorAll('.level-choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            playClick();
            document.querySelectorAll('.level-choice-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            selectedOnboardingLevel = btn.dataset.level || 'A1';
        });
    });

    function showOnboardingModal(isNew = true) {
        isEditingProfile = !isNew;
        onboardingModal.classList.add('active');
        $('onboarding-title').textContent = isNew ? (profiles.length ? 'Nuevo perfil' : '¡Hola! Crea tu perfil') : 'Editar perfil';
        $('onboarding-subtitle').textContent = isNew
            ? 'Cada persona guarda su propio camino, gemas y repaso.'
            : 'Actualiza tu nombre y avatar.';
        onboardingNameInput.value = isNew ? '' : state.name;
        selectedOnboardingAvatar = isNew ? '🦁' : state.avatar;
        selectedOnboardingLevel = isNew ? 'A1' : state.currentLevel;
        if ($('onboarding-submit-btn')) $('onboarding-submit-btn').textContent = isNew ? 'Empezar' : 'Guardar';
        document.querySelectorAll('.avatar-opt-btn').forEach((b) => b.classList.toggle('selected', b.dataset.avatar === selectedOnboardingAvatar));
        document.querySelectorAll('.level-choice-btn').forEach((b) => b.classList.toggle('active', b.dataset.level === selectedOnboardingLevel));
    }

    function handleOnboardingSubmit() {
        const name = (onboardingNameInput.value || '').trim() || (isEditingProfile ? state.name : `Aventurero ${profiles.length + 1}`);
        if (isEditingProfile && activeUser) {
            activeUser.name = name;
            activeUser.avatar = selectedOnboardingAvatar;
            state.name = name;
            state.avatar = selectedOnboardingAvatar;
            saveProgress();
        } else {
            const profile = {
                id: 'usr_' + Date.now(),
                name, avatar: selectedOnboardingAvatar, currentLevel: selectedOnboardingLevel,
                streak: 1, gems: 50, hearts: 5, xp: 0, streakFreeze: false, lastPlayDate: '',
                srs: [], unlockedIndex: defaultUnlock(), createdAt: Date.now()
            };
            profiles.push(profile);
            activeUser = profile;
            syncStateFromActiveUser();
            saveProgress();
            state.tutorialSeen = true;
            localStorage.setItem('lp_tut', '1');
        }
        playSuccess();
        if (onboardingNameInput) onboardingNameInput.blur();
        if (onboardingModal) onboardingModal.classList.remove('active');
        currentLevelBadge.textContent = state.currentLevel;
        levelOpts.forEach((o) => o.classList.toggle('active', o.dataset.level === state.currentLevel));
        renderPath(); renderDictionary(); renderAAC('needs'); updateStats();
        if (!isEditingProfile && !state.tutorialSeen) showTutorial();
    }
    byId('onboarding-submit-btn', 'click', handleOnboardingSubmit);
    bind(onboardingNameInput, 'keydown', (e) => { if (e.key === 'Enter') handleOnboardingSubmit(); });

    function switchUserProfile(id) {
        const target = profiles.find((p) => p.id === id);
        if (!target) return;
        activeUser = target;
        syncStateFromActiveUser();
        saveProgress();
        currentLevelBadge.textContent = state.currentLevel;
        levelOpts.forEach((o) => o.classList.toggle('active', o.dataset.level === state.currentLevel));
        renderPath(); renderDictionary(); renderAAC('needs'); updateStats();
        playSuccess();
    }

    function renderProfilesList() {
        const list = $('profiles-list');
        if (!list) return;
        list.replaceChildren();
        profiles.forEach((p) => {
            const card = el('button', `profile-item-card ${activeUser && activeUser.id === p.id ? 'active' : ''}`);
            card.type = 'button';
            const info = el('div', 'profile-item-info');
            const nameRow = el('div', 'profile-item-name', p.name || 'Usuario');
            if (activeUser && activeUser.id === p.id) nameRow.appendChild(el('span', 'profile-item-active-badge', 'ACTIVO'));
            info.append(nameRow, el('div', 'profile-item-sub', `Nivel ${p.currentLevel || 'A1'} · ${p.xp || 0} XP`));
            card.append(el('div', 'profile-item-avatar', p.avatar || '🦁'), info);
            card.addEventListener('click', () => switchUserProfile(p.id));
            list.appendChild(card);
        });
    }

    byId('add-profile-btn', 'click', () => { playClick(); showOnboardingModal(true); });
    byId('edit-profile-btn', 'click', () => { playClick(); showOnboardingModal(false); });
    byId('delete-profile-btn', 'click', () => {
        if (profiles.length <= 1) { showToast('Crea otro perfil antes de borrar este'); return; }
        if (!window.confirm || window.confirm(`¿Eliminar el perfil de "${state.name}"?`)) {
            profiles = profiles.filter((p) => p.id !== activeUser.id);
            activeUser = profiles[0] || null;
            if (activeUser) { syncStateFromActiveUser(); saveProgress(); }
            updateStats(); renderPath(); renderDictionary();
        }
    });

    const tutSteps = [
        { t: 'Lingua Pro te enseña inglés en tres pasos: mira, escucha y usa la palabra.' },
        { t: 'K0 es para niños y terapia: pictogramas grandes, palmas y sin quitar vidas.' },
        { t: 'Hablar es un tablero PECS. Arma frases y pulsa el botón para oírlas.' },
        { t: 'Si te equivocas, la palabra va a Repaso. Necesitas 60% para desbloquear la siguiente lección.' }
    ];
    let tutStep = 0;
    function renderTutDots() {
        const box = $('tutorial-dots');
        box.replaceChildren();
        tutSteps.forEach((_, i) => box.appendChild(el('span', `tutorial-dot ${i === 0 ? 'active' : ''}`)));
    }
    function renderTutStep() {
        $('tutorial-text').textContent = tutSteps[tutStep].t;
        $('tutorial-dots').querySelectorAll('.tutorial-dot').forEach((d, i) => d.classList.toggle('active', i === tutStep));
        $('tutorial-next-btn').textContent = tutStep === tutSteps.length - 1 ? '¡Vamos!' : 'Siguiente';
    }
    function showTutorial() {
        if (state.tutorialSeen) return;
        $('tutorial-overlay').classList.remove('hidden');
        tutStep = 0;
        renderTutDots();
        renderTutStep();
    }
    function dismissTutorial() {
        $('tutorial-overlay').classList.add('hidden');
        state.tutorialSeen = true;
        localStorage.setItem('lp_tut', '1');
    }
    byId('tutorial-next-btn', 'click', () => {
        playClick();
        tutStep++;
        if (tutStep >= tutSteps.length) dismissTutorial();
        else renderTutStep();
    });
    byId('tutorial-close-btn', 'click', () => { playClick(); dismissTutorial(); });
    byId('tutorial-overlay', 'click', (e) => { if (e.target.id === 'tutorial-overlay') dismissTutorial(); });

    if ($('top-user-avatar-btn')) $('top-user-avatar-btn').addEventListener('click', () => { playClick(); switchTab('profile-view'); });
    if ($('banner-profile-link')) $('banner-profile-link').addEventListener('click', () => { playClick(); switchTab('profile-view'); });

    try {
        renderPath();
        renderDictionary();
        renderAAC('needs');
        updateStats();
        if (!activeUser || !profiles.length) showOnboardingModal(true);
        else if (!state.tutorialSeen) showTutorial();
    } catch (err) {
        console.error('Lingua Pro init', err);
    }
});
