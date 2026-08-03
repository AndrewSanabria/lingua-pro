document.addEventListener('DOMContentLoaded', () => {
    // --- APP STATE ---
    const state = {
        streak: 3,
        gems: 140,
        hearts: 5,
        currentLesson: 1,
        currentQuestionIdx: 0,
        correctCount: 0,
        selectedChips: [], // Array of { id, text }
        audioCtx: null
    };

    // --- QUESTION DATA BANK ---
    const lessons = {
        1: [
            {
                type: 'translate',
                prompt: 'The quick brown fox jumps over the lazy dog.',
                answer: ['El', 'rápido', 'zorro', 'marrón', 'salta', 'sobre', 'el', 'perro', 'perezoso'],
                pool: ['El', 'rápido', 'zorro', 'marrón', 'salta', 'sobre', 'el', 'perro', 'perezoso', 'gato', 'lindo', 'vuela']
            },
            {
                type: 'translate',
                prompt: 'Hello, nice to meet you!',
                answer: ['Hola', 'gusto', 'en', 'conocerte'],
                pool: ['Hola', 'gusto', 'en', 'conocerte', 'buenos', 'días', 'gracias', 'adiós']
            },
            {
                type: 'translate',
                prompt: 'I would like a cup of coffee, please.',
                answer: ['Me', 'gustaría', 'una', 'taza', 'de', 'café', 'por', 'favor'],
                pool: ['Me', 'gustaría', 'una', 'taza', 'de', 'café', 'por', 'favor', 'té', 'agua', 'con']
            },
            {
                type: 'translate',
                prompt: 'She works at a tech company.',
                answer: ['Ella', 'trabaja', 'en', 'una', 'empresa', 'de', 'tecnología'],
                pool: ['Ella', 'trabaja', 'en', 'una', 'empresa', 'de', 'tecnología', 'él', 'estudia', 'casa']
            },
            {
                type: 'translate',
                prompt: 'Learning English is fun and easy.',
                answer: ['Aprender', 'inglés', 'es', 'divertido', 'y', 'fácil'],
                pool: ['Aprender', 'inglés', 'es', 'divertido', 'y', 'fácil', 'difícil', 'hablar', 'mucho']
            }
        ]
    };

    // --- DOM ELEMENTS ---
    const pathView = document.getElementById('path-view');
    const lessonView = document.getElementById('lesson-view');
    const node1 = document.getElementById('node-1');
    const closeLessonBtn = document.getElementById('close-lesson-btn');
    
    const userStreakEl = document.getElementById('user-streak');
    const userGemsEl = document.getElementById('user-gems');
    const userHeartsEl = document.getElementById('user-hearts');
    const lessonHeartsCount = document.getElementById('lesson-hearts-count');
    const lessonProgressFill = document.getElementById('lesson-progress-fill');

    const promptText = document.getElementById('prompt-text');
    const ttsBtn = document.getElementById('tts-btn');
    const answerSlotLine = document.getElementById('answer-slot-line');
    const placeholderHint = document.getElementById('placeholder-hint');
    const wordPool = document.getElementById('word-pool');

    const checkBtn = document.getElementById('check-btn');
    const feedbackSheet = document.getElementById('feedback-sheet');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackSubtitle = document.getElementById('feedback-subtitle');
    const continueBtn = document.getElementById('continue-btn');

    const completionModal = document.getElementById('completion-modal');
    const finishLessonBtn = document.getElementById('finish-lesson-btn');
    const accuracyVal = document.getElementById('accuracy-val');

    // --- SOUND EFFECTS (WEB AUDIO API) ---
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
            osc.frequency.setValueAtTime(400, state.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, state.audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.15, state.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(state.audioCtx.destination);
            osc.start();
            osc.stop(state.audioCtx.currentTime + 0.05);
        } catch(e) {}
    }

    function playSuccessSound() {
        try {
            initAudioContext();
            const now = state.audioCtx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.2, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.25);
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
            osc.frequency.linearRampToValueAtTime(150, now + 0.25);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            gain.connect(state.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch(e) {}
    }

    // --- TEXT TO SPEECH ---
    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    ttsBtn.addEventListener('click', () => {
        speakText(promptText.textContent);
    });

    // --- VIEW SWITCHING ---
    function startLesson(lessonId) {
        state.currentLesson = lessonId;
        state.currentQuestionIdx = 0;
        state.correctCount = 0;
        state.hearts = 5;
        updateStatsDisplay();

        pathView.classList.remove('active');
        lessonView.classList.add('active');
        loadQuestion();
    }

    closeLessonBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres salir? Perderás el progreso de esta lección.')) {
            lessonView.classList.remove('active');
            pathView.classList.add('active');
        }
    });

    node1.addEventListener('click', () => startLesson(1));

    // --- QUESTION LOAD & RENDER ---
    function loadQuestion() {
        const currentQuestions = lessons[state.currentLesson];
        const q = currentQuestions[state.currentQuestionIdx];

        // Reset state & UI
        state.selectedChips = [];
        wordPool.innerHTML = '';
        answerSlotLine.innerHTML = '';
        answerSlotLine.appendChild(placeholderHint);
        placeholderHint.style.display = 'inline';
        
        feedbackSheet.className = 'feedback-sheet';
        checkBtn.disabled = true;

        // Update progress bar
        const progressPct = ((state.currentQuestionIdx) / currentQuestions.length) * 100;
        lessonProgressFill.style.width = `${progressPct}%`;

        // Update prompt text
        promptText.textContent = q.prompt;

        // Auto-play TTS sound
        setTimeout(() => speakText(q.prompt), 300);

        // Render Word Pool Chips (Shuffled or preset)
        const shuffledPool = [...q.pool].sort(() => Math.random() - 0.5);

        shuffledPool.forEach((wordText, index) => {
            const chipId = `chip-${index}-${Date.now()}`;
            const chip = document.createElement('button');
            chip.className = 'word-chip';
            chip.id = chipId;
            chip.textContent = wordText;
            chip.dataset.word = wordText;

            chip.addEventListener('click', () => handlePoolChipClick(chip, chipId, wordText));
            wordPool.appendChild(chip);
        });
    }

    // --- WORD BANK INTERACTION MECHANICS ---
    function handlePoolChipClick(poolChip, chipId, wordText) {
        if (poolChip.classList.contains('chip-disabled')) return;

        playClickSound();

        // 1. Disable pool chip
        poolChip.classList.add('chip-disabled');

        // 2. Hide placeholder hint
        placeholderHint.style.display = 'none';

        // 3. Create target chip in answer slot
        const slotChip = document.createElement('button');
        slotChip.className = 'word-chip';
        slotChip.textContent = wordText;
        slotChip.dataset.poolId = chipId;

        // Clicking chip in answer slot removes it
        slotChip.addEventListener('click', () => {
            playClickSound();
            slotChip.remove();
            poolChip.classList.remove('chip-disabled');
            
            state.selectedChips = state.selectedChips.filter(item => item.slotElem !== slotChip);

            if (state.selectedChips.length === 0) {
                placeholderHint.style.display = 'inline';
                checkBtn.disabled = true;
            }
        });

        answerSlotLine.appendChild(slotChip);

        // Record in state
        state.selectedChips.push({
            id: chipId,
            text: wordText,
            slotElem: slotChip
        });

        // Enable check button
        checkBtn.disabled = false;
    }

    // --- ANSWER CHECKING & FEEDBACK ---
    checkBtn.addEventListener('click', () => {
        const currentQuestions = lessons[state.currentLesson];
        const q = currentQuestions[state.currentQuestionIdx];

        const userWords = state.selectedChips.map(c => c.text);
        const isCorrect = JSON.stringify(userWords) === JSON.stringify(q.answer);

        if (isCorrect) {
            playSuccessSound();
            state.correctCount++;
            feedbackSheet.className = 'feedback-sheet show success';
            feedbackIcon.textContent = '✓';
            feedbackTitle.textContent = '¡Excelente!';
            feedbackSubtitle.textContent = 'Traducción perfecta.';
        } else {
            playErrorSound();
            state.hearts = Math.max(0, state.hearts - 1);
            updateStatsDisplay();

            feedbackSheet.className = 'feedback-sheet show error';
            feedbackIcon.textContent = '✕';
            feedbackTitle.textContent = 'Solución correcta:';
            feedbackSubtitle.textContent = q.answer.join(' ');
        }
    });

    continueBtn.addEventListener('click', () => {
        feedbackSheet.classList.remove('show');

        const currentQuestions = lessons[state.currentLesson];
        state.currentQuestionIdx++;

        if (state.currentQuestionIdx < currentQuestions.length && state.hearts > 0) {
            loadQuestion();
        } else {
            // Lesson Complete!
            finishLesson();
        }
    });

    function finishLesson() {
        const currentQuestions = lessons[state.currentLesson];
        const accuracy = Math.round((state.correctCount / currentQuestions.length) * 100);
        accuracyVal.textContent = `${accuracy}%`;

        state.gems += 20;
        state.streak += 1;
        updateStatsDisplay();

        completionModal.classList.add('active');
        playSuccessSound();
    }

    finishLessonBtn.addEventListener('click', () => {
        completionModal.classList.remove('active');
        lessonView.classList.remove('active');
        pathView.classList.add('active');
    });

    function updateStatsDisplay() {
        userStreakEl.textContent = state.streak;
        userGemsEl.textContent = state.gems;
        userHeartsEl.textContent = state.hearts;
        lessonHeartsCount.textContent = state.hearts;
    }
});
