document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        currentLevel: 'A1',
        streak: 3,
        gems: 150,
        hearts: 5,
        xp: 450,
        activeLesson: null,
        currentQuestionIdx: 0,
        correctCount: 0,
        selectedChips: [],
        audioCtx: null,
        // Pair matching temporary selection
        firstMatchCard: null,
        matchedPairsCount: 0
    };

    // --- CURRICULUM DATABASE (A1 -> C1) ---
    const curriculum = {
        A1: {
            title: "Fundamentos del Inglés (A1)",
            desc: "Paso a paso desde cero con saludos, comida y objetos diarios",
            lessons: [
                {
                    id: 'a1-1',
                    name: 'Saludos & Presentación',
                    icon: '⭐',
                    questions: [
                        {
                            type: 'translate',
                            prompt: 'The quick brown fox jumps over the lazy dog.',
                            answer: ['El', 'rápido', 'zorro', 'marrón', 'salta', 'sobre', 'el', 'perro', 'perezoso'],
                            pool: ['El', 'rápido', 'zorro', 'marrón', 'salta', 'sobre', 'el', 'perro', 'perezoso', 'gato', 'lindo']
                        },
                        {
                            type: 'matching',
                            prompt: 'Empareja las palabras correspondientes:',
                            pairs: [
                                { en: 'Hello', es: 'Hola' },
                                { en: 'Water', es: 'Agua' },
                                { en: 'Goodbye', es: 'Adiós' },
                                { en: 'Please', es: 'Por favor' },
                                { en: 'Thank you', es: 'Gracias' }
                            ]
                        },
                        {
                            type: 'choice',
                            prompt: '¿Cómo se dice "Buenos días" en inglés?',
                            options: ['Good morning', 'Good night', 'Good evening', 'See you later'],
                            correct: 'Good morning'
                        }
                    ]
                },
                {
                    id: 'a1-2',
                    name: 'Familia & Objetos',
                    icon: '💬',
                    questions: [
                        {
                            type: 'translate',
                            prompt: 'My brother lives in a big house.',
                            answer: ['Mi', 'hermano', 'vive', 'en', 'una', 'casa', 'grande'],
                            pool: ['Mi', 'hermano', 'vive', 'en', 'una', 'casa', 'grande', 'pequeña', 'auto']
                        },
                        {
                            type: 'matching',
                            prompt: 'Empareja los miembros de la familia:',
                            pairs: [
                                { en: 'Mother', es: 'Madre' },
                                { en: 'Father', es: 'Padre' },
                                { en: 'Sister', es: 'Hermana' },
                                { en: 'Friend', es: 'Amigo' },
                                { en: 'House', es: 'Casa' }
                            ]
                        }
                    ]
                }
            ]
        },
        A2: {
            title: "Intermedio Elemental (A2)",
            desc: "Viajes, conversaciones diarias, restaurantes y pasados",
            lessons: [
                {
                    id: 'a2-1',
                    name: 'En el Aeropuerto & Viajes',
                    icon: '✈️',
                    questions: [
                        {
                            type: 'translate',
                            prompt: 'Where is the international departure gate?',
                            answer: ['¿Dónde', 'está', 'la', 'puerta', 'de', 'salida', 'internacional?'],
                            pool: ['¿Dónde', 'está', 'la', 'puerta', 'de', 'salida', 'internacional?', 'llegada', 'hotel']
                        },
                        {
                            type: 'choice',
                            prompt: '¿Qué significa "Passport check"?',
                            options: ['Control de pasaportes', 'Equipaje perdido', 'Reserva de hotel', 'Boleto de avión'],
                            correct: 'Control de pasaportes'
                        }
                    ]
                }
            ]
        },
        B1: {
            title: "Intermedio Avanzado (B1/B2)",
            desc: "Entrevistas de trabajo, reuniones de negocios y gramática superior",
            lessons: [
                {
                    id: 'b1-1',
                    name: 'Negocios & Entrevistas',
                    icon: '💼',
                    questions: [
                        {
                            type: 'translate',
                            prompt: 'We need to increase our quarterly revenue.',
                            answer: ['Necesitamos', 'incrementar', 'nuestros', 'ingresos', 'trimestrales'],
                            pool: ['Necesitamos', 'incrementar', 'nuestros', 'ingresos', 'trimestrales', 'gastos', 'bajar']
                        },
                        {
                            type: 'matching',
                            prompt: 'Empareja términos de negocios:',
                            pairs: [
                                { en: 'Deadline', es: 'Fecha límite' },
                                { en: 'Budget', es: 'Presupuesto' },
                                { en: 'Meeting', es: 'Reunión' },
                                { en: 'Growth', es: 'Crecimiento' },
                                { en: 'Profit', es: 'Ganancia' }
                            ]
                        }
                    ]
                }
            ]
        },
        C1: {
            title: "Fluidez & Modismos (C1/C2)",
            desc: "Inglés nativo profesional, idioms y soltura total",
            lessons: [
                {
                    id: 'c1-1',
                    name: 'Native Idioms & Metaphors',
                    icon: '🚀',
                    questions: [
                        {
                            type: 'translate',
                            prompt: 'It is a blessing in disguise.',
                            answer: ['Es', 'un', 'bien', 'que', 'por', 'mal', 'viene'],
                            pool: ['Es', 'un', 'bien', 'que', 'por', 'mal', 'viene', 'malo', 'camino']
                        },
                        {
                            type: 'choice',
                            prompt: '¿Qué significa el idiom "Break a leg"?',
                            options: ['¡Buena suerte!', 'Rómpete una pierna', 'Cálmate', 'Llegas tarde'],
                            correct: '¡Buena suerte!'
                        }
                    ]
                }
            ]
        }
    };

    // --- SOUND ENGINE (WEB AUDIO API) ---
    function initAudioContext() {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playClickSound() {
        try {
            initAudioContext();
            const osc = state.audioCtx.createOscillator();
            const gain = state.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, state.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(850, state.audioCtx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.12, state.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(state.audioCtx.destination);
            osc.start();
            osc.stop(state.audioCtx.currentTime + 0.04);
        } catch(e) {}
    }

    function playMatchPopSound() {
        try {
            initAudioContext();
            const now = state.audioCtx.currentTime;
            const osc = state.audioCtx.createOscillator();
            const gain = state.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain);
            gain.connect(state.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } catch(e) {}
    }

    function playSuccessSound() {
        try {
            initAudioContext();
            const now = state.audioCtx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.18, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.2);
            });
        } catch(e) {}
    }

    function playErrorSound() {
        try {
            initAudioContext();
            const now = state.audioCtx.currentTime;
            const osc = state.audioCtx.createOscillator();
            const gain = state.audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(140, now + 0.22);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(state.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch(e) {}
    }

    // --- SPEECH SYNTHESIS ENGINE (DUAL SPEED) ---
    function speakText(text, rate = 0.95) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = rate;
            window.speechSynthesis.speak(utterance);
        }
    }

    // --- DOM ELEMENTS ---
    const levelSelectorBtn = document.getElementById('level-selector-btn');
    const levelDrawer = document.getElementById('level-drawer');
    const currentLevelBadge = document.getElementById('current-level-badge');
    const levelOpts = document.querySelectorAll('.level-opt');

    const pathTree = document.getElementById('path-tree');
    const bannerUnit = document.getElementById('banner-unit');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');

    const navTabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.view');

    const lessonView = document.getElementById('lesson-view');
    const closeLessonBtn = document.getElementById('close-lesson-btn');
    const lessonProgressFill = document.getElementById('lesson-progress-fill');
    const lessonHeartsCount = document.getElementById('lesson-hearts-count');
    
    const promptTitle = document.getElementById('prompt-title');
    const promptText = document.getElementById('prompt-text');
    const ttsNormalBtn = document.getElementById('tts-normal-btn');
    const ttsSlowBtn = document.getElementById('tts-slow-btn');

    const modTranslate = document.getElementById('mod-translate');
    const modMatching = document.getElementById('mod-matching');
    const modChoice = document.getElementById('mod-choice');

    const answerSlotLine = document.getElementById('answer-slot-line');
    const placeholderHint = document.getElementById('placeholder-hint');
    const wordPool = document.getElementById('word-pool');

    const matchingGrid = document.getElementById('matching-grid');
    const choicesGrid = document.getElementById('choices-grid');

    const checkBtn = document.getElementById('check-btn');
    const feedbackSheet = document.getElementById('feedback-sheet');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackSubtitle = document.getElementById('feedback-subtitle');
    const continueBtn = document.getElementById('continue-btn');

    const userStreak = document.getElementById('user-streak');
    const userGems = document.getElementById('user-gems');
    const userHearts = document.getElementById('user-hearts');
    const profStreak = document.getElementById('prof-streak');
    const profXp = document.getElementById('prof-xp');
    const profGems = document.getElementById('prof-gems');

    const completionModal = document.getElementById('completion-modal');
    const finishLessonBtn = document.getElementById('finish-lesson-btn');
    const accuracyVal = document.getElementById('accuracy-val');

    const buyHeartsBtn = document.getElementById('buy-hearts-btn');
    const buyFreezeBtn = document.getElementById('buy-freeze-btn');

    const revealSrsBtn = document.getElementById('reveal-srs-btn');
    const srsTranslation = document.getElementById('srs-translation');
    const srsTtsBtn = document.getElementById('srs-tts-btn');

    // --- LEVEL SELECTOR HANDLERS ---
    levelSelectorBtn.addEventListener('click', () => {
        playClickSound();
        levelDrawer.classList.toggle('active');
    });

    levelOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            playClickSound();
            levelOpts.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            
            state.currentLevel = opt.dataset.level;
            currentLevelBadge.textContent = state.currentLevel;
            levelDrawer.classList.remove('active');
            
            renderPathTree();
        });
    });

    // --- NAVIGATION TABS ---
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playClickSound();
            const targetId = tab.dataset.target;
            
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            views.forEach(v => {
                if (v.id === targetId) v.classList.add('active');
                else v.classList.remove('active');
            });
        });
    });

    // --- PATH TREE RENDERER ---
    function renderPathTree() {
        const lvlData = curriculum[state.currentLevel];
        bannerUnit.textContent = `Sección (${state.currentLevel})`;
        bannerTitle.textContent = lvlData.title;
        bannerDesc.textContent = lvlData.desc;

        pathTree.innerHTML = '';

        lvlData.lessons.forEach((l, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = `node-wrapper ${idx === 0 ? 'level-active' : 'level-locked'}`;
            
            const btn = document.createElement('button');
            btn.className = 'path-node';
            btn.innerHTML = `<div class="node-icon">${l.icon}</div>`;
            
            if (idx === 0) {
                const tooltip = document.createElement('div');
                tooltip.className = 'node-tooltip';
                tooltip.textContent = '¡EMPEZAR!';
                wrapper.appendChild(tooltip);
                
                btn.addEventListener('click', () => startLesson(l));
            }

            wrapper.appendChild(btn);
            pathTree.appendChild(wrapper);
        });
    }

    // --- EXERCISE ENGINE ---
    function startLesson(lessonObj) {
        state.activeLesson = lessonObj;
        state.currentQuestionIdx = 0;
        state.correctCount = 0;
        state.hearts = 5;
        updateStats();

        // Switch view to lesson view
        views.forEach(v => v.classList.remove('active'));
        lessonView.classList.add('active');

        loadQuestion();
    }

    closeLessonBtn.addEventListener('click', () => {
        if (confirm('¿Quieres salir de la lección? Perderás el progreso actual.')) {
            lessonView.classList.remove('active');
            document.getElementById('path-view').classList.add('active');
        }
    });

    ttsNormalBtn.addEventListener('click', () => speakText(promptText.textContent, 0.95));
    ttsSlowBtn.addEventListener('click', () => speakText(promptText.textContent, 0.55));

    function loadQuestion() {
        const q = state.activeLesson.questions[state.currentQuestionIdx];
        const totalQ = state.activeLesson.questions.length;

        // Reset state
        state.selectedChips = [];
        state.firstMatchCard = null;
        state.matchedPairsCount = 0;

        feedbackSheet.className = 'feedback-sheet';
        checkBtn.disabled = true;

        // Progress Fill
        const pct = (state.currentQuestionIdx / totalQ) * 100;
        lessonProgressFill.style.width = `${pct}%`;

        // Hide all exercise modules
        modTranslate.classList.add('hidden');
        modMatching.classList.add('hidden');
        modChoice.classList.add('hidden');

        // Render according to Exercise Type
        if (q.type === 'translate') {
            promptTitle.textContent = 'Traduce esta oración';
            promptText.textContent = q.prompt;
            modTranslate.classList.remove('hidden');

            speakText(q.prompt, 0.95);

            wordPool.innerHTML = '';
            answerSlotLine.innerHTML = '';
            answerSlotLine.appendChild(placeholderHint);
            placeholderHint.style.display = 'inline';

            const shuffled = [...q.pool].sort(() => Math.random() - 0.5);
            shuffled.forEach((wordText, i) => {
                const chipId = `chip-${i}-${Date.now()}`;
                const chip = document.createElement('button');
                chip.className = 'word-chip';
                chip.id = chipId;
                chip.textContent = wordText;

                chip.addEventListener('click', () => {
                    if (chip.classList.contains('chip-disabled')) return;
                    playClickSound();

                    chip.classList.add('chip-disabled');
                    placeholderHint.style.display = 'none';

                    const slotChip = document.createElement('button');
                    slotChip.className = 'word-chip';
                    slotChip.textContent = wordText;

                    slotChip.addEventListener('click', () => {
                        playClickSound();
                        slotChip.remove();
                        chip.classList.remove('chip-disabled');
                        state.selectedChips = state.selectedChips.filter(c => c.slotElem !== slotChip);

                        if (state.selectedChips.length === 0) {
                            placeholderHint.style.display = 'inline';
                            checkBtn.disabled = true;
                        }
                    });

                    answerSlotLine.appendChild(slotChip);
                    state.selectedChips.push({ id: chipId, text: wordText, slotElem: slotChip });
                    checkBtn.disabled = false;
                });

                wordPool.appendChild(chip);
            });

        } else if (q.type === 'matching') {
            promptTitle.textContent = 'Toca los pares que correspondan';
            promptText.textContent = 'Selecciona la palabra en inglés y su traducción';
            modMatching.classList.remove('hidden');

            matchingGrid.innerHTML = '';
            const allCards = [];

            q.pairs.forEach((p, idx) => {
                allCards.push({ id: idx, text: p.en, lang: 'en' });
                allCards.push({ id: idx, text: p.es, lang: 'es' });
            });

            allCards.sort(() => Math.random() - 0.5);

            allCards.forEach(cObj => {
                const card = document.createElement('button');
                card.className = 'match-card';
                card.textContent = cObj.text;
                card.dataset.pairId = cObj.id;

                card.addEventListener('click', () => {
                    if (card.classList.contains('matched')) return;

                    if (cObj.lang === 'en') speakText(cObj.text, 0.95);
                    else playClickSound();

                    if (!state.firstMatchCard) {
                        state.firstMatchCard = { elem: card, id: cObj.id };
                        card.classList.add('selected');
                    } else {
                        if (state.firstMatchCard.elem === card) return; // Same card tapped

                        if (state.firstMatchCard.id === Number(card.dataset.pairId)) {
                            // Match!
                            playMatchPopSound();
                            state.firstMatchCard.elem.className = 'match-card matched';
                            card.className = 'match-card matched';
                            state.firstMatchCard = null;
                            state.matchedPairsCount++;

                            if (state.matchedPairsCount === q.pairs.length) {
                                checkBtn.disabled = false;
                            }
                        } else {
                            // Wrong pair!
                            playErrorSound();
                            card.classList.add('wrong');
                            state.firstMatchCard.elem.classList.add('wrong');

                            setTimeout(() => {
                                card.classList.remove('wrong', 'selected');
                                state.firstMatchCard.elem.classList.remove('wrong', 'selected');
                                state.firstMatchCard = null;
                            }, 400);
                        }
                    }
                });

                matchingGrid.appendChild(card);
            });

        } else if (q.type === 'choice') {
            promptTitle.textContent = 'Selecciona la opción correcta';
            promptText.textContent = q.prompt;
            modChoice.classList.remove('hidden');

            choicesGrid.innerHTML = '';
            q.options.forEach(optText => {
                const card = document.createElement('button');
                card.className = 'choice-card';
                card.textContent = optText;

                card.addEventListener('click', () => {
                    playClickSound();
                    choicesGrid.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    state.selectedChoice = optText;
                    checkBtn.disabled = false;
                });

                choicesGrid.appendChild(card);
            });
        }
    }

    // --- CHECK BUTTON HANDLER ---
    checkBtn.addEventListener('click', () => {
        const q = state.activeLesson.questions[state.currentQuestionIdx];
        let isCorrect = false;

        if (q.type === 'translate') {
            const userWords = state.selectedChips.map(c => c.text);
            isCorrect = JSON.stringify(userWords) === JSON.stringify(q.answer);
        } else if (q.type === 'matching') {
            isCorrect = state.matchedPairsCount === q.pairs.length;
        } else if (q.type === 'choice') {
            isCorrect = state.selectedChoice === q.correct;
        }

        if (isCorrect) {
            playSuccessSound();
            state.correctCount++;
            feedbackSheet.className = 'feedback-sheet show success';
            feedbackIcon.textContent = '✓';
            feedbackTitle.textContent = '¡Excelente trabajo!';
            feedbackSubtitle.textContent = 'Respuesta totalmente correcta.';
        } else {
            playErrorSound();
            state.hearts = Math.max(0, state.hearts - 1);
            updateStats();

            feedbackSheet.className = 'feedback-sheet show error';
            feedbackIcon.textContent = '✕';
            feedbackTitle.textContent = 'Solución correcta:';
            feedbackSubtitle.textContent = q.type === 'translate' ? q.answer.join(' ') : (q.correct || 'Sigue practicando');
        }
    });

    continueBtn.addEventListener('click', () => {
        feedbackSheet.classList.remove('show');

        state.currentQuestionIdx++;
        if (state.currentQuestionIdx < state.activeLesson.questions.length && state.hearts > 0) {
            loadQuestion();
        } else {
            finishLesson();
        }
    });

    function finishLesson() {
        const totalQ = state.activeLesson.questions.length;
        const accuracy = Math.round((state.correctCount / totalQ) * 100);
        accuracyVal.textContent = `${accuracy}%`;

        state.gems += 20;
        state.xp += 15;
        updateStats();

        completionModal.classList.add('active');
        playSuccessSound();
    }

    finishLessonBtn.addEventListener('click', () => {
        completionModal.classList.remove('active');
        lessonView.classList.remove('active');
        document.getElementById('path-view').classList.add('active');
    });

    // --- SHOP & SRS HANDLERS ---
    buyHeartsBtn.addEventListener('click', () => {
        if (state.gems >= 50) {
            state.gems -= 50;
            state.hearts = 5;
            updateStats();
            playSuccessSound();
            alert('¡Vidas completadas al 100% (5 ❤️)!');
        } else {
            alert('Necesitas 50 Gemas para recargar vidas.');
        }
    });

    buyFreezeBtn.addEventListener('click', () => {
        if (state.gems >= 100) {
            state.gems -= 100;
            updateStats();
            playSuccessSound();
            alert('¡Escudo de Racha activado 🛡️!');
        } else {
            alert('Necesitas 100 Gemas.');
        }
    });

    revealSrsBtn.addEventListener('click', () => {
        playClickSound();
        srsTranslation.classList.remove('hidden');
    });

    srsTtsBtn.addEventListener('click', () => {
        speakText('Apple', 0.95);
    });

    function updateStats() {
        userStreak.textContent = state.streak;
        userGems.textContent = state.gems;
        userHearts.textContent = state.hearts;
        lessonHeartsCount.textContent = state.hearts;

        profStreak.textContent = `${state.streak} Días`;
        profXp.textContent = `${state.xp} XP`;
        profGems.textContent = state.gems;
    }

    // Initialize initial Path tree & stats
    renderPathTree();
    updateStats();
});
