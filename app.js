document.addEventListener('DOMContentLoaded', () => {
    const state = {
        currentLevel: 'A1', streak: 1, gems: 50, hearts: 5, xp: 0,
        activeLesson: null, currentQuestionIdx: 0, correctCount: 0,
        selectedChips: [], audioCtx: null, firstMatchCard: null,
        matchedPairsCount: 0, comboStreak: 0, maxCombo: 0, hintsUsed: 0,
        selectedChoice: null,
        tutorialSeen: localStorage.getItem('lp_tut') === '1'
    };

    // ====== FULL PROGRESSIVE CURRICULUM ======
    const curriculum = {
        A1: {
            title: "Primeras Palabras",
            desc: "Aprende jugando con colores, animales y objetos",
            lessons: [
                { id:'a1-1', name:'Animales 🐾', icon:'🐱', questions:[
                    { type:'image_select', emoji:'🐱', word:'Cat', prompt:'¿Qué animal es este?', options:['Cat','Dog','Bird','Fish'], correct:'Cat' },
                    { type:'image_select', emoji:'🐶', word:'Dog', prompt:'¿Qué animal es este?', options:['Cat','Dog','Horse','Rabbit'], correct:'Dog' },
                    { type:'image_select', emoji:'🐦', word:'Bird', prompt:'¿Qué animal es este?', options:['Bird','Fish','Cat','Bear'], correct:'Bird' },
                    { type:'emoji_match', word:'Fish', prompt:'¿Cuál es el emoji correcto?', emojis:['🐟','🐱','🐶','🐸'], correct:'🐟' },
                    { type:'emoji_match', word:'Bear', prompt:'¿Cuál es el emoji correcto?', emojis:['🐻','🐦','🐶','🐱'], correct:'🐻' },
                    { type:'matching', prompt:'Empareja animales:', pairs:[
                        {en:'Cat',es:'🐱 Gato'},{en:'Dog',es:'🐶 Perro'},{en:'Bird',es:'🐦 Pájaro'},{en:'Fish',es:'🐟 Pez'},{en:'Bear',es:'🐻 Oso'}
                    ]}
                ]},
                { id:'a1-2', name:'Colores 🎨', icon:'🌈', questions:[
                    { type:'image_select', emoji:'🔴', word:'Red', prompt:'¿Qué color es?', options:['Red','Blue','Green','Yellow'], correct:'Red' },
                    { type:'image_select', emoji:'🔵', word:'Blue', prompt:'¿Qué color es?', options:['Red','Blue','Green','Yellow'], correct:'Blue' },
                    { type:'image_select', emoji:'🟢', word:'Green', prompt:'¿Qué color es?', options:['Green','Orange','Purple','Red'], correct:'Green' },
                    { type:'emoji_match', word:'Yellow', prompt:'¿Cuál es el color correcto?', emojis:['🟡','🔴','🟢','🔵'], correct:'🟡' },
                    { type:'emoji_match', word:'Orange', prompt:'¿Cuál es el color correcto?', emojis:['🟠','🟣','🔵','🟢'], correct:'🟠' },
                    { type:'matching', prompt:'Empareja los colores:', pairs:[
                        {en:'Red',es:'🔴 Rojo'},{en:'Blue',es:'🔵 Azul'},{en:'Green',es:'🟢 Verde'},{en:'Yellow',es:'🟡 Amarillo'},{en:'Orange',es:'🟠 Naranja'}
                    ]}
                ]},
                { id:'a1-3', name:'Comida 🍎', icon:'🍕', questions:[
                    { type:'image_select', emoji:'🍎', word:'Apple', prompt:'¿Qué fruta es?', options:['Apple','Banana','Orange','Grape'], correct:'Apple' },
                    { type:'image_select', emoji:'🍌', word:'Banana', prompt:'¿Qué fruta es?', options:['Apple','Banana','Strawberry','Grape'], correct:'Banana' },
                    { type:'emoji_match', word:'Water', prompt:'¿Cuál es el emoji correcto?', emojis:['💧','🍕','🍎','🧀'], correct:'💧' },
                    { type:'emoji_match', word:'Pizza', prompt:'¿Cuál es el emoji correcto?', emojis:['🍕','🍔','🌮','🍩'], correct:'🍕' },
                    { type:'matching', prompt:'Empareja la comida:', pairs:[
                        {en:'Apple',es:'🍎 Manzana'},{en:'Banana',es:'🍌 Plátano'},{en:'Water',es:'💧 Agua'},{en:'Pizza',es:'🍕 Pizza'},{en:'Bread',es:'🍞 Pan'}
                    ]}
                ]},
                { id:'a1-4', name:'Objetos 🏠', icon:'📱', questions:[
                    { type:'image_select', emoji:'📱', word:'Phone', prompt:'¿Qué objeto es?', options:['Phone','Book','Car','Key'], correct:'Phone' },
                    { type:'image_select', emoji:'📚', word:'Book', prompt:'¿Qué objeto es?', options:['Phone','Book','Chair','Pen'], correct:'Book' },
                    { type:'emoji_match', word:'Car', prompt:'¿Cuál es el emoji correcto?', emojis:['🚗','📱','📚','🔑'], correct:'🚗' },
                    { type:'emoji_match', word:'Key', prompt:'¿Cuál es el emoji correcto?', emojis:['🔑','🚗','📱','✏️'], correct:'🔑' },
                    { type:'matching', prompt:'Empareja objetos:', pairs:[
                        {en:'Phone',es:'📱 Teléfono'},{en:'Book',es:'📚 Libro'},{en:'Car',es:'🚗 Carro'},{en:'Key',es:'🔑 Llave'},{en:'Pen',es:'✏️ Pluma'}
                    ]}
                ]},
                { id:'a1-5', name:'Saludos 👋', icon:'👋', questions:[
                    { type:'choice', prompt:'¿Cómo se dice "Hola" en inglés?', options:['Hello','Goodbye','Please','Thanks'], correct:'Hello' },
                    { type:'choice', prompt:'¿Cómo se dice "Adiós" en inglés?', options:['Hello','Goodbye','Sorry','Yes'], correct:'Goodbye' },
                    { type:'choice', prompt:'¿Qué significa "Thank you"?', options:['Gracias','Hola','Por favor','De nada'], correct:'Gracias' },
                    { type:'translate', prompt:'Hello, how are you?', answer:['Hola','¿cómo','estás?'], pool:['Hola','¿cómo','estás?','bien','gracias','adiós'] },
                    { type:'matching', prompt:'Empareja saludos:', pairs:[
                        {en:'Hello',es:'Hola'},{en:'Goodbye',es:'Adiós'},{en:'Please',es:'Por favor'},{en:'Thank you',es:'Gracias'},{en:'Yes',es:'Sí'}
                    ]}
                ]},
                { id:'a1-6', name:'Frases Cortas ✨', icon:'💬', questions:[
                    { type:'choice', prompt:'¿Qué significa "I am happy"?', options:['Estoy feliz','Estoy triste','Tengo hambre','Tengo sueño'], correct:'Estoy feliz' },
                    { type:'translate', prompt:'I like cats.', answer:['Me','gustan','los','gatos'], pool:['Me','gustan','los','gatos','perros','no','ellos'] },
                    { type:'translate', prompt:'The water is cold.', answer:['El','agua','está','fría'], pool:['El','agua','está','fría','caliente','la','pan'] },
                    { type:'choice', prompt:'¿Qué significa "Good morning"?', options:['Buenos días','Buenas noches','Buenas tardes','Hasta luego'], correct:'Buenos días' },
                    { type:'matching', prompt:'Empareja frases:', pairs:[
                        {en:'Good morning',es:'Buenos días'},{en:'Good night',es:'Buenas noches'},{en:'I am',es:'Yo soy'},{en:'Thank you',es:'Gracias'},{en:'See you',es:'Nos vemos'}
                    ]}
                ]}
            ]
        },
        A2: {
            title: "Conversaciones Básicas",
            desc: "Frases completas, familia y vida diaria",
            lessons: [
                { id:'a2-1', name:'Familia 👨‍👩‍👧', icon:'👨‍👩‍👧', questions:[
                    { type:'image_select', emoji:'👩', word:'Mother', prompt:'¿Quién es?', options:['Mother','Father','Sister','Brother'], correct:'Mother' },
                    { type:'image_select', emoji:'👨', word:'Father', prompt:'¿Quién es?', options:['Mother','Father','Son','Daughter'], correct:'Father' },
                    { type:'matching', prompt:'Empareja la familia:', pairs:[
                        {en:'Mother',es:'👩 Madre'},{en:'Father',es:'👨 Padre'},{en:'Sister',es:'👧 Hermana'},{en:'Brother',es:'👦 Hermano'},{en:'Baby',es:'👶 Bebé'}
                    ]},
                    { type:'translate', prompt:'My brother is tall.', answer:['Mi','hermano','es','alto'], pool:['Mi','hermano','es','alto','bajo','ella','hermana'] },
                    { type:'choice', prompt:'¿Qué significa "grandmother"?', options:['Abuela','Tía','Prima','Mamá'], correct:'Abuela' }
                ]},
                { id:'a2-2', name:'En el restaurante 🍽️', icon:'🍽️', questions:[
                    { type:'choice', prompt:'¿Cómo pides la cuenta en inglés?', options:['The check, please','Good morning','Thank you','Goodbye'], correct:'The check, please' },
                    { type:'translate', prompt:'I would like water, please.', answer:['Me','gustaría','agua','por','favor'], pool:['Me','gustaría','agua','por','favor','comida','el','café'] },
                    { type:'matching', prompt:'Empareja vocabulario:', pairs:[
                        {en:'Menu',es:'Menú'},{en:'Water',es:'Agua'},{en:'Coffee',es:'Café'},{en:'Table',es:'Mesa'},{en:'Waiter',es:'Mesero'}
                    ]}
                ]}
            ]
        },
        B1: {
            title: "Intermedio Avanzado",
            desc: "Trabajo, negocios y gramática compleja",
            lessons: [
                { id:'b1-1', name:'Negocios 💼', icon:'💼', questions:[
                    { type:'translate', prompt:'We need to increase our revenue.', answer:['Necesitamos','incrementar','nuestros','ingresos'], pool:['Necesitamos','incrementar','nuestros','ingresos','gastos','bajar','subir'] },
                    { type:'matching', prompt:'Empareja negocios:', pairs:[
                        {en:'Deadline',es:'Fecha límite'},{en:'Budget',es:'Presupuesto'},{en:'Meeting',es:'Reunión'},{en:'Growth',es:'Crecimiento'},{en:'Profit',es:'Ganancia'}
                    ]},
                    { type:'choice', prompt:'¿Qué significa "Schedule a meeting"?', options:['Programar una reunión','Cancelar un proyecto','Pedir un aumento','Enviar un correo'], correct:'Programar una reunión' }
                ]}
            ]
        },
        C1: {
            title: "Fluidez Nativa",
            desc: "Modismos, expresiones y soltura total",
            lessons: [
                { id:'c1-1', name:'Idioms 🚀', icon:'🚀', questions:[
                    { type:'choice', prompt:'¿Qué significa "Break a leg"?', options:['¡Buena suerte!','Rómpete una pierna','Cálmate','Llegas tarde'], correct:'¡Buena suerte!' },
                    { type:'translate', prompt:'It is a blessing in disguise.', answer:['No','hay','mal','que','por','bien','no','venga'], pool:['No','hay','mal','que','por','bien','no','venga','todo','es'] },
                    { type:'choice', prompt:'¿Qué significa "Piece of cake"?', options:['Muy fácil','Un pastel','Muy caro','Imposible'], correct:'Muy fácil' }
                ]}
            ]
        }
    };

    // ====== SOUNDS ======
    function initAudio() { if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    function playClick() { try { initAudio(); const o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='sine'; o.frequency.setValueAtTime(450,state.audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(850,state.audioCtx.currentTime+0.04); g.gain.setValueAtTime(0.12,state.audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,state.audioCtx.currentTime+0.04); o.connect(g); g.connect(state.audioCtx.destination); o.start(); o.stop(state.audioCtx.currentTime+0.04); } catch(e){} }
    function playPop() { try { initAudio(); const n=state.audioCtx.currentTime,o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='triangle'; o.frequency.setValueAtTime(600,n); o.frequency.exponentialRampToValueAtTime(1200,n+0.08); g.gain.setValueAtTime(0.2,n); g.gain.exponentialRampToValueAtTime(0.001,n+0.08); o.connect(g); g.connect(state.audioCtx.destination); o.start(n); o.stop(n+0.08); } catch(e){} }
    function playSuccess() { try { initAudio(); const n=state.audioCtx.currentTime; [523.25,659.25,783.99,1046.50].forEach((f,i)=>{ const o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='triangle'; o.frequency.setValueAtTime(f,n+i*0.07); g.gain.setValueAtTime(0.18,n+i*0.07); g.gain.exponentialRampToValueAtTime(0.001,n+i*0.07+0.2); o.connect(g); g.connect(state.audioCtx.destination); o.start(n+i*0.07); o.stop(n+i*0.07+0.2); }); } catch(e){} }
    function playError() { try { initAudio(); const n=state.audioCtx.currentTime,o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(220,n); o.frequency.linearRampToValueAtTime(140,n+0.22); g.gain.setValueAtTime(0.18,n); g.gain.exponentialRampToValueAtTime(0.001,n+0.25); o.connect(g); g.connect(state.audioCtx.destination); o.start(n); o.stop(n+0.25); } catch(e){} }
    function playCombo() { try { initAudio(); const n=state.audioCtx.currentTime; [440,554.37,659.25].forEach((f,i)=>{ const o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='sine'; o.frequency.setValueAtTime(f,n+i*0.05); g.gain.setValueAtTime(0.15,n+i*0.05); g.gain.exponentialRampToValueAtTime(0.001,n+i*0.05+0.12); o.connect(g); g.connect(state.audioCtx.destination); o.start(n+i*0.05); o.stop(n+i*0.05+0.12); }); } catch(e){} }

    // ====== TTS ======
    const mascotAvatar = document.getElementById('mascot-avatar');
    function speak(text, rate=0.95) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=rate;
            if (mascotAvatar) { mascotAvatar.classList.add('mascot-speaking'); u.onend=()=>mascotAvatar.classList.remove('mascot-speaking'); }
            window.speechSynthesis.speak(u);
        }
    }

    // ====== CONFETTI ======
    const confettiCanvas=document.getElementById('confetti-canvas');
    const ctx=confettiCanvas?confettiCanvas.getContext('2d'):null;
    function resizeCanvas(){if(confettiCanvas){confettiCanvas.width=window.innerWidth;confettiCanvas.height=window.innerHeight;}}
    window.addEventListener('resize',resizeCanvas); resizeCanvas();
    function triggerConfetti(){if(!ctx)return;const ps=[];const colors=['#58CC02','#1CB0F6','#FFC800','#FF4B4B','#FF9600','#CE82FF'];for(let i=0;i<100;i++)ps.push({x:window.innerWidth/2,y:window.innerHeight/2,vx:(Math.random()-0.5)*14,vy:(Math.random()-0.7)*16,size:Math.random()*8+6,color:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*360,rs:(Math.random()-0.5)*10,op:1});(function draw(){ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);let alive=false;ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.4;p.rot+=p.rs;p.op-=0.012;if(p.op>0){alive=true;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.globalAlpha=Math.max(0,p.op);ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore();}});if(alive)requestAnimationFrame(draw);else ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);})();}

    // ====== MESSAGES ======
    const msgs={ok:['¡Excelente! 🌟','¡Genial! ⚡','¡Perfecto! 🎯','¡Correcto! ✨','¡Bravo! 🏆','¡Increíble! 🚀','¡Muy bien! 💪'],combo:['🔥 ¡Racha de fuego!','⚡ ¡Imparable!','💎 ¡Brillante!','🌟 ¡Combo increíble!'],end:['¡Tu inglés mejora cada día!','¡Eres un campeón del aprendizaje!','¡Cada lección te acerca a la fluidez!','¡Sigue así, vas increíble!']};
    function randMsg(arr){return arr[Math.floor(Math.random()*arr.length)];}

    // ====== DOM ======
    const $=id=>document.getElementById(id);
    const levelSelectorBtn=$('level-selector-btn'),levelDrawer=$('level-drawer'),currentLevelBadge=$('current-level-badge');
    const pathTree=$('path-tree'),bannerUnit=$('banner-unit'),bannerTitle=$('banner-title'),bannerDesc=$('banner-desc');
    const lessonView=$('lesson-view'),closeLessonBtn=$('close-lesson-btn'),progressFill=$('lesson-progress-fill'),lessonHeartsCount=$('lesson-hearts-count');
    const promptTitle=$('prompt-title'),promptText=$('prompt-text'),ttsNormal=$('tts-normal-btn'),ttsSlow=$('tts-slow-btn');
    const modImageSelect=$('mod-image-select'),bigEmoji=$('big-emoji'),imageOptions=$('image-options');
    const modEmojiMatch=$('mod-emoji-match'),bigWord=$('big-word'),emojiOptions=$('emoji-options');
    const modTranslate=$('mod-translate'),answerSlot=$('answer-slot-line'),placeholder=$('placeholder-hint'),wordPool=$('word-pool');
    const modMatching=$('mod-matching'),matchingGrid=$('matching-grid');
    const modChoice=$('mod-choice'),choicesGrid=$('choices-grid');
    const checkBtn=$('check-btn'),feedbackSheet=$('feedback-sheet'),feedbackIcon=$('feedback-icon'),feedbackTitleEl=$('feedback-title'),feedbackSubtitle=$('feedback-subtitle'),continueBtn=$('continue-btn');
    const comboCounter=$('combo-counter'),comboNumber=$('combo-number'),qCurrent=$('q-current'),qTotal=$('q-total');
    const hintBtn=$('hint-btn'),charPrompt=$('character-prompt');
    const completionModal=$('completion-modal'),finishBtn=$('finish-lesson-btn'),accuracyVal=$('accuracy-val'),comboMaxVal=$('combo-max-val'),xpRewardVal=$('xp-reward-val'),completionEncourage=$('completion-encourage');
    const mainHeartIcon=$('main-heart-icon'),floatingHeartLoss=$('floating-heart-loss');
    const tutorialOverlay=$('tutorial-overlay'),tutorialText=$('tutorial-text'),tutorialNextBtn=$('tutorial-next-btn'),tutorialDots=$('tutorial-dots'),tutorialMascot=document.querySelector('.tutorial-mascot');

    // ====== TUTORIAL ======
    const tutSteps=[
        {t:'¡Hola! 👋 Soy tu asistente. Te enseñaré inglés paso a paso, ¡jugando!',m:'🤖'},
        {t:'🐱 Empezarás reconociendo animales, colores y objetos con emojis gigantes.',m:'🎮'},
        {t:'👆 Toca la opción correcta. ¡Es súper fácil! Luego avanzarás a frases.',m:'✨'},
        {t:'💡 Usa "Pista" si necesitas ayuda. ¡Acumula combos 🔥 respondiendo bien seguido!',m:'🏆'}
    ];
    let tutStep=0;

    function showTutorial(){if(state.tutorialSeen)return;tutorialOverlay.classList.remove('hidden');tutStep=0;renderTutDots();renderTutStep();}
    function renderTutDots(){tutorialDots.innerHTML='';tutSteps.forEach((_,i)=>{const d=document.createElement('span');d.className=`tutorial-dot ${i===0?'active':''}`;tutorialDots.appendChild(d);});}
    function renderTutStep(){tutorialText.textContent=tutSteps[tutStep].t;tutorialMascot.textContent=tutSteps[tutStep].m;tutorialDots.querySelectorAll('.tutorial-dot').forEach((d,i)=>d.classList.toggle('active',i===tutStep));tutorialNextBtn.textContent=tutStep===tutSteps.length-1?'¡A JUGAR! 🚀':'SIGUIENTE →';}
    tutorialNextBtn.addEventListener('click',()=>{playClick();tutStep++;if(tutStep>=tutSteps.length){tutorialOverlay.classList.add('hidden');state.tutorialSeen=true;localStorage.setItem('lp_tut','1');}else renderTutStep();});

    // ====== ENCOURAGEMENT ======
    function showToast(msg){const t=$('encouragement-toast'),tx=$('encouragement-text');if(!t||!tx)return;tx.textContent=msg;t.classList.remove('hidden');t.style.animation='none';t.offsetHeight;t.style.animation='';setTimeout(()=>t.classList.add('hidden'),2200);}
    function updateCombo(ok){if(ok){state.comboStreak++;if(state.comboStreak>state.maxCombo)state.maxCombo=state.comboStreak;if(state.comboStreak>=2){comboCounter.classList.remove('hidden');comboNumber.textContent=state.comboStreak;playCombo();if(state.comboStreak>=3)showToast(randMsg(msgs.combo));}}else{state.comboStreak=0;comboCounter.classList.add('hidden');}}

    // ====== LEVEL SELECTOR ======
    levelSelectorBtn.addEventListener('click',()=>{playClick();levelDrawer.classList.toggle('active');});
    document.querySelectorAll('.level-opt').forEach(o=>o.addEventListener('click',()=>{playClick();document.querySelectorAll('.level-opt').forEach(x=>x.classList.remove('active'));o.classList.add('active');state.currentLevel=o.dataset.level;currentLevelBadge.textContent=state.currentLevel;levelDrawer.classList.remove('active');renderPath();}));

    // ====== NAV TABS ======
    document.querySelectorAll('.nav-tab').forEach(t=>t.addEventListener('click',()=>{playClick();const id=t.dataset.target;document.querySelectorAll('.nav-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.querySelectorAll('.view').forEach(v=>{v.id===id?v.classList.add('active'):v.classList.remove('active');});}));

    // ====== PROGRESS STORAGE ======
    const levelOrder = ['A1', 'A2', 'B1', 'C1'];
    const savedUnlocked = localStorage.getItem('lp_unlocked');
    state.unlockedIndex = savedUnlocked ? JSON.parse(savedUnlocked) : { A1: 1, A2: 1, B1: 1, C1: 1 };
    
    const savedLevel = localStorage.getItem('lp_level');
    if (savedLevel && curriculum[savedLevel]) {
        state.currentLevel = savedLevel;
        if (currentLevelBadge) currentLevelBadge.textContent = state.currentLevel;
    }

    function saveProgress() {
        localStorage.setItem('lp_unlocked', JSON.stringify(state.unlockedIndex));
        localStorage.setItem('lp_level', state.currentLevel);
    }

    // ====== PATH TREE ======
    function renderPath(){
        const d = curriculum[state.currentLevel];
        bannerUnit.textContent = `Nivel ${state.currentLevel}`;
        bannerTitle.textContent = d.title;
        bannerDesc.textContent = d.desc;
        pathTree.innerHTML = '';

        const unlockedCount = state.unlockedIndex[state.currentLevel] || 1;
        const totalLessons = d.lessons.length;
        // Clamp current active node so tooltip is always visible on the active lesson
        const currentActiveIdx = Math.min(unlockedCount - 1, totalLessons - 1);

        d.lessons.forEach((l, i) => {
            const isUnlocked = i < unlockedCount;
            const isCurrent = i === currentActiveIdx;
            const isCompleted = i < currentActiveIdx;

            const w = document.createElement('div');
            w.className = `node-wrapper ${isCurrent ? 'level-active' : (isCompleted ? 'level-completed' : 'level-locked')}`;
            
            const b = document.createElement('button');
            b.className = 'path-node';
            b.innerHTML = `<div class="node-icon">${isUnlocked ? l.icon : '🔒'}</div>`;
            
            if (isUnlocked) {
                if (isCurrent) {
                    const tip = document.createElement('div');
                    tip.className = 'node-tooltip';
                    tip.textContent = '¡EMPEZAR!';
                    w.appendChild(tip);
                }
                b.addEventListener('click', () => startLesson(l));
            }

            w.appendChild(b);
            const lbl = document.createElement('div');
            lbl.className = 'node-label';
            lbl.textContent = l.name;
            w.appendChild(lbl);
            pathTree.appendChild(w);
        });
    }

    // ====== LESSON START ======
    function startLesson(l){
        state.activeLesson = l;
        state.currentQuestionIdx = 0;
        state.correctCount = 0;
        state.hearts = 5;
        state.comboStreak = 0;
        state.maxCombo = 0;
        state.hintsUsed = 0;
        state.selectedChoice = null;
        comboCounter.classList.add('hidden');
        updateStats();

        // Hide bottom nav bar so lesson has full viewport
        const bottomNav = $('bottom-nav-bar');
        if (bottomNav) bottomNav.style.display = 'none';

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        lessonView.classList.add('active');
        loadQ();
    }

    closeLessonBtn.addEventListener('click', () => {
        if (confirm('¿Salir? Perderás el progreso.')) {
            lessonView.classList.remove('active');
            $('path-view').classList.add('active');
            const bottomNav = $('bottom-nav-bar');
            if (bottomNav) bottomNav.style.display = 'flex';
        }
    });
    ttsNormal.addEventListener('click',()=>speak(promptText.textContent,0.95));
    ttsSlow.addEventListener('click',()=>speak(promptText.textContent,0.55));

    // ====== LOAD QUESTION ======
    function loadQ(){
        const q=state.activeLesson.questions[state.currentQuestionIdx];
        const total=state.activeLesson.questions.length;
        state.selectedChips=[];state.firstMatchCard=null;state.matchedPairsCount=0;state.selectedChoice=null;
        feedbackSheet.className='feedback-sheet';checkBtn.disabled=true;
        qCurrent.textContent=state.currentQuestionIdx+1;qTotal.textContent=total;
        if(hintBtn)hintBtn.classList.remove('used');
        progressFill.style.width=`${(state.currentQuestionIdx/total)*100}%`;

        // Hide all modules
        [modImageSelect,modEmojiMatch,modTranslate,modMatching,modChoice].forEach(m=>m.classList.add('hidden'));

        // Show/hide character prompt based on type
        const showBubble = q.type==='translate'||q.type==='choice';
        charPrompt.style.display=showBubble?'flex':'none';

        if(q.type==='image_select'){
            promptTitle.textContent=q.prompt;
            modImageSelect.classList.remove('hidden');
            bigEmoji.textContent=q.emoji;
            bigEmoji.style.animation='none';bigEmoji.offsetHeight;bigEmoji.style.animation='';
            speak(q.word,0.9);
            imageOptions.innerHTML='';
            q.options.sort(()=>Math.random()-0.5).forEach(opt=>{
                const btn=document.createElement('button');btn.className='image-option';btn.textContent=opt;
                btn.addEventListener('click',()=>{playClick();imageOptions.querySelectorAll('.image-option').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');state.selectedChoice=opt;checkBtn.disabled=false;});
                imageOptions.appendChild(btn);
            });

        } else if(q.type==='emoji_match'){
            promptTitle.textContent=q.prompt;
            modEmojiMatch.classList.remove('hidden');
            bigWord.textContent=q.word;
            bigWord.style.animation='none';bigWord.offsetHeight;bigWord.style.animation='';
            speak(q.word,0.9);
            emojiOptions.innerHTML='';
            q.emojis.sort(()=>Math.random()-0.5).forEach(em=>{
                const btn=document.createElement('button');btn.className='emoji-option';btn.textContent=em;
                btn.addEventListener('click',()=>{playClick();emojiOptions.querySelectorAll('.emoji-option').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');state.selectedChoice=em;checkBtn.disabled=false;});
                emojiOptions.appendChild(btn);
            });

        } else if(q.type==='translate'){
            promptTitle.textContent='Traduce esta oración';promptText.textContent=q.prompt;
            modTranslate.classList.remove('hidden');speak(q.prompt,0.95);
            wordPool.innerHTML='';answerSlot.innerHTML='';answerSlot.appendChild(placeholder);placeholder.style.display='inline';
            [...q.pool].sort(()=>Math.random()-0.5).forEach((w,i)=>{
                const cid=`c${i}-${Date.now()}`;
                const chip=document.createElement('button');chip.className='word-chip';chip.id=cid;chip.textContent=w;
                chip.addEventListener('click',()=>{
                    if(chip.classList.contains('chip-disabled'))return;playClick();chip.classList.add('chip-disabled');chip.classList.remove('hint-glow');placeholder.style.display='none';
                    const sc=document.createElement('button');sc.className='word-chip';sc.textContent=w;
                    sc.addEventListener('click',()=>{playClick();sc.remove();chip.classList.remove('chip-disabled');state.selectedChips=state.selectedChips.filter(c=>c.el!==sc);if(!state.selectedChips.length){placeholder.style.display='inline';checkBtn.disabled=true;}});
                    answerSlot.appendChild(sc);state.selectedChips.push({id:cid,text:w,el:sc});checkBtn.disabled=false;
                });
                wordPool.appendChild(chip);
            });

        } else if(q.type==='matching'){
            promptTitle.textContent='Empareja los pares';promptText.textContent=q.prompt;
            modMatching.classList.remove('hidden');matchingGrid.innerHTML='';
            const cards=[];q.pairs.forEach((p,i)=>{cards.push({id:i,text:p.en,lang:'en'});cards.push({id:i,text:p.es,lang:'es'});});
            cards.sort(()=>Math.random()-0.5);
            cards.forEach(c=>{
                const btn=document.createElement('button');btn.className='match-card';btn.textContent=c.text;btn.dataset.pairId=c.id;
                btn.addEventListener('click',()=>{
                    if(btn.classList.contains('matched'))return;
                    if(c.lang==='en')speak(c.text,0.95);else playClick();
                    if(!state.firstMatchCard){state.firstMatchCard={elem:btn,id:c.id};btn.classList.add('selected');}
                    else{
                        if(state.firstMatchCard.elem===btn)return;
                        if(state.firstMatchCard.id===Number(btn.dataset.pairId)){playPop();state.firstMatchCard.elem.className='match-card matched';btn.className='match-card matched';state.firstMatchCard=null;state.matchedPairsCount++;if(state.matchedPairsCount===q.pairs.length)checkBtn.disabled=false;}
                        else{playError();btn.classList.add('wrong');state.firstMatchCard.elem.classList.add('wrong');const fm=state.firstMatchCard;setTimeout(()=>{btn.classList.remove('wrong','selected');fm.elem.classList.remove('wrong','selected');state.firstMatchCard=null;},400);}
                    }
                });
                matchingGrid.appendChild(btn);
            });

        } else if(q.type==='choice'){
            promptTitle.textContent='Selecciona la opción correcta';promptText.textContent=q.prompt;
            modChoice.classList.remove('hidden');choicesGrid.innerHTML='';
            q.options.forEach(o=>{
                const btn=document.createElement('button');btn.className='choice-card';btn.textContent=o;
                btn.addEventListener('click',()=>{playClick();choicesGrid.querySelectorAll('.choice-card').forEach(c=>c.classList.remove('selected'));btn.classList.add('selected');state.selectedChoice=o;checkBtn.disabled=false;});
                choicesGrid.appendChild(btn);
            });
        }
    }

    // ====== HINT ======
    if(hintBtn)hintBtn.addEventListener('click',()=>{
        const q=state.activeLesson?.questions[state.currentQuestionIdx];if(!q||q.type!=='translate')return;
        playClick();state.hintsUsed++;
        const placed=state.selectedChips.map(c=>c.text);
        const next=q.answer.find((w,i)=>{const pc=placed.filter(p=>p===w).length;const nc=q.answer.slice(0,i+1).filter(a=>a===w).length;return pc<nc;});
        if(next){const chips=wordPool.querySelectorAll('.word-chip:not(.chip-disabled)');for(const c of chips)if(c.textContent===next){c.classList.add('hint-glow');setTimeout(()=>c.classList.remove('hint-glow'),2500);break;}}
        hintBtn.classList.add('used');
    });

    // ====== CHECK ======
    checkBtn.addEventListener('click',()=>{
        const q=state.activeLesson.questions[state.currentQuestionIdx];
        let ok=false;
        if(q.type==='translate'){ok=JSON.stringify(state.selectedChips.map(c=>c.text))===JSON.stringify(q.answer);}
        else if(q.type==='matching'){ok=state.matchedPairsCount===q.pairs.length;}
        else if(q.type==='choice'||q.type==='image_select'){ok=state.selectedChoice===q.correct;}
        else if(q.type==='emoji_match'){ok=state.selectedChoice===q.correct;}

        if(ok){
            playSuccess();state.correctCount++;updateCombo(true);
            feedbackSheet.className='feedback-sheet show success';feedbackIcon.textContent='✓';
            feedbackTitleEl.textContent=randMsg(msgs.ok);
            feedbackSubtitle.textContent=state.comboStreak>=2?`🔥 Combo x${state.comboStreak}`:'¡Sigue así!';
        } else {
            playError();updateCombo(false);triggerHeartLoss();state.hearts=Math.max(0,state.hearts-1);updateStats();
            feedbackSheet.className='feedback-sheet show error';feedbackIcon.textContent='✕';
            feedbackTitleEl.textContent='No te preocupes, la respuesta era:';
            feedbackSubtitle.textContent=q.type==='translate'?q.answer.join(' '):(q.correct||'Sigue practicando');
        }
    });

    function triggerHeartLoss(){if(mainHeartIcon&&floatingHeartLoss){mainHeartIcon.classList.add('shake-heart');floatingHeartLoss.classList.add('animate-loss');setTimeout(()=>{mainHeartIcon.classList.remove('shake-heart');floatingHeartLoss.classList.remove('animate-loss');},1200);}}

    continueBtn.addEventListener('click',()=>{
        feedbackSheet.classList.remove('show');state.currentQuestionIdx++;
        if(state.currentQuestionIdx<state.activeLesson.questions.length&&state.hearts>0)loadQ();
        else finishLesson();
    });

    function finishLesson(){
        const total = state.activeLesson.questions.length;
        const acc = Math.round((state.correctCount / total) * 100);
        const bonus = state.maxCombo >= 3 ? 25 : 15;
        accuracyVal.textContent = `${acc}%`;
        comboMaxVal.textContent = `🔥 ${state.maxCombo}`;
        xpRewardVal.textContent = `+${bonus}`;
        completionEncourage.textContent = randMsg(msgs.end);

        state.gems += 20;
        state.xp += bonus;

        // Unlock next lesson or next level
        const currentLessons = curriculum[state.currentLevel].lessons;
        const activeIdx = currentLessons.findIndex(l => l.id === state.activeLesson.id);
        
        if (activeIdx !== -1) {
            const isLastLesson = activeIdx === currentLessons.length - 1;
            const nextUnlocked = activeIdx + 2; // 1-indexed next lesson

            if (isLastLesson) {
                // Find next level in order (e.g. A1 -> A2)
                const currentLvlIdx = levelOrder.indexOf(state.currentLevel);
                if (currentLvlIdx !== -1 && currentLvlIdx + 1 < levelOrder.length) {
                    const nextLvlKey = levelOrder[currentLvlIdx + 1];
                    state.unlockedIndex[nextLvlKey] = Math.max(state.unlockedIndex[nextLvlKey] || 1, 1);
                    state.nextLevelToSwitch = nextLvlKey;
                    
                    const modalTitle = completionModal.querySelector('h2');
                    if (modalTitle) modalTitle.textContent = '🏆 ¡NIVEL COMPLETADO!';
                    completionEncourage.textContent = `¡Felicidades! Has superado el Nivel ${state.currentLevel} y desbloqueado el Nivel ${nextLvlKey} 🚀`;
                }
            } else {
                if (nextUnlocked > (state.unlockedIndex[state.currentLevel] || 1)) {
                    state.unlockedIndex[state.currentLevel] = nextUnlocked;
                }
            }
            saveProgress();
        }

        updateStats();
        completionModal.classList.add('active');
        triggerConfetti();
        playSuccess();
    }

    finishBtn.addEventListener('click', () => {
        completionModal.classList.remove('active');
        lessonView.classList.remove('active');
        $('path-view').classList.add('active');
        
        const bottomNav = $('bottom-nav-bar');
        if (bottomNav) bottomNav.style.display = 'flex';

        // Reset modal title back to standard for regular lessons
        const modalTitle = completionModal.querySelector('h2');
        if (modalTitle) modalTitle.textContent = '¡Lección Completada!';

        // Advance to next level if completed current level
        if (state.nextLevelToSwitch) {
            state.currentLevel = state.nextLevelToSwitch;
            state.nextLevelToSwitch = null;
            if (currentLevelBadge) currentLevelBadge.textContent = state.currentLevel;
            
            levelOpts.forEach(o => {
                o.classList.toggle('active', o.dataset.level === state.currentLevel);
            });
            saveProgress();
        }

        renderPath(); // Re-render path tree to show newly unlocked node or new level!
    });

    // ====== SHOP ======
    $('buy-hearts-btn').addEventListener('click',()=>{if(state.gems>=50){state.gems-=50;state.hearts=5;updateStats();playSuccess();alert('¡5 ❤️ recargadas!');}else alert('Necesitas 50 💎');});
    $('buy-freeze-btn').addEventListener('click',()=>{if(state.gems>=100){state.gems-=100;updateStats();playSuccess();alert('🛡️ Escudo activado');}else alert('Necesitas 100 💎');});
    $('reveal-srs-btn').addEventListener('click',()=>{playClick();$('srs-translation').classList.remove('hidden');});
    $('srs-tts-btn').addEventListener('click',()=>speak('Apple',0.95));

    function updateStats(){
        $('user-streak').textContent=state.streak;$('user-gems').textContent=state.gems;$('user-hearts').textContent=state.hearts;
        lessonHeartsCount.textContent=state.hearts;$('prof-streak').textContent=state.streak;$('prof-xp').textContent=`${state.xp} XP`;$('prof-gems').textContent=state.gems;
    }

    renderPath();updateStats();showTutorial();
});
