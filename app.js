document.addEventListener('DOMContentLoaded', () => {
    const state = {
        currentLevel: 'A1', streak: 1, gems: 50, hearts: 5, xp: 0,
        activeLesson: null, currentQuestionIdx: 0, correctCount: 0,
        selectedChips: [], audioCtx: null, firstMatchCard: null,
        matchedPairsCount: 0, comboStreak: 0, maxCombo: 0, hintsUsed: 0,
        selectedChoice: null,
        tutorialSeen: localStorage.getItem('lp_tut') === '1'
    };

    // ====== EXTENSIVE WORD-FIRST CURRICULUM (TEXT + VISUAL + LISTENING) ======
    const curriculum = {
        A1: {
            title: "Vocabulario Esencial (A1)",
            desc: "Aprende palabras sencillas con texto, imágenes y audios de pronunciación",
            lessons: [
                { id:'a1-1', name:'Animales 🐾', icon:'🐱', questions:[
                    { type:'image_select', emoji:'🐱', word:'Cat', phonetic:'/kæt/', prompt:'¿Qué animal es este?', options:['Cat','Dog','Bird','Fish'], correct:'Cat' },
                    { type:'emoji_match', word:'Dog', phonetic:'/dɔːɡ/', prompt:'¿Cuál es el emoji de Dog?', emojis:['🐶','🐱','🐴','🐰'], correct:'🐶' },
                    { type:'listen_select', word:'Bird', phonetic:'/bɜːrd/', prompt:'Escucha y selecciona la imagen correcta:', options:[{text:'Bird',emoji:'🐦'},{text:'Fish',emoji:'🐟'},{text:'Cat',emoji:'🐱'},{text:'Bear',emoji:'🐻'}], correct:'Bird' },
                    { type:'image_select', emoji:'🐟', word:'Fish', phonetic:'/fɪʃ/', prompt:'¿Qué animal es este?', options:['Fish','Bird','Cat','Rabbit'], correct:'Fish' },
                    { type:'listen_select', word:'Bear', phonetic:'/beər/', prompt:'Escucha y selecciona el emoji correcto:', options:[{text:'Bear',emoji:'🐻'},{text:'Lion',emoji:'🦁'},{text:'Dog',emoji:'🐶'},{text:'Cat',emoji:'🐱'}], correct:'Bear' },
                    { type:'matching', prompt:'Empareja los animales:', pairs:[
                        {en:'Cat',es:'🐱 Gato'},{en:'Dog',es:'🐶 Perro'},{en:'Bird',es:'🐦 Pájaro'},{en:'Fish',es:'🐟 Pez'},{en:'Bear',es:'🐻 Oso'}
                    ]}
                ]},
                { id:'a1-2', name:'Colores 🎨', icon:'🌈', questions:[
                    { type:'image_select', emoji:'🔴', word:'Red', phonetic:'/red/', prompt:'¿Qué color es este?', options:['Red','Blue','Green','Yellow'], correct:'Red' },
                    { type:'emoji_match', word:'Blue', phonetic:'/bluː/', prompt:'¿Cuál es el color Blue?', emojis:['🔵','🔴','🟢','🟡'], correct:'🔵' },
                    { type:'listen_select', word:'Green', phonetic:'/ɡriːn/', prompt:'Escucha y selecciona el color:', options:[{text:'Green',emoji:'🟢'},{text:'Orange',emoji:'🟠'},{text:'Purple',emoji:'🟣'},{text:'Red',emoji:'🔴'}], correct:'Green' },
                    { type:'emoji_match', word:'Yellow', phonetic:'/ˈjel.oʊ/', prompt:'¿Cuál es el color Yellow?', emojis:['🟡','🔴','🟢','🔵'], correct:'🟡' },
                    { type:'listen_select', word:'White', phonetic:'/waɪt/', prompt:'Escucha y elige el color:', options:[{text:'White',emoji:'⚪'},{text:'Black',emoji:'⚫'},{text:'Red',emoji:'🔴'},{text:'Blue',emoji:'🔵'}], correct:'White' },
                    { type:'matching', prompt:'Empareja los colores:', pairs:[
                        {en:'Red',es:'🔴 Rojo'},{en:'Blue',es:'🔵 Azul'},{en:'Green',es:'🟢 Verde'},{en:'Yellow',es:'🟡 Amarillo'},{en:'White',es:'⚪ Blanco'}
                    ]}
                ]},
                { id:'a1-3', name:'Frutas & Verduras 🍎', icon:'🍎', questions:[
                    { type:'image_select', emoji:'🍎', word:'Apple', phonetic:'/ˈæp.əl/', prompt:'¿Qué fruta es esta?', options:['Apple','Banana','Orange','Grape'], correct:'Apple' },
                    { type:'emoji_match', word:'Banana', phonetic:'/bəˈnæn.ə/', prompt:'Selecciona el emoji de Banana:', emojis:['🍌','🍎','🍓','🍇'], correct:'🍌' },
                    { type:'listen_select', word:'Orange', phonetic:'/ˈɔːr.ɪndʒ/', prompt:'Escucha la palabra y elige la fruta:', options:[{text:'Orange',emoji:'🍊'},{text:'Lemon',emoji:'🍋'},{text:'Apple',emoji:'🍎'},{text:'Grape',emoji:'🍇'}], correct:'Orange' },
                    { type:'image_select', emoji:'🍅', word:'Tomato', phonetic:'/təˈmeɪ.toʊ/', prompt:'¿Qué vegetal es este?', options:['Tomato','Potato','Corn','Carrot'], correct:'Tomato' },
                    { type:'matching', prompt:'Empareja las frutas y verduras:', pairs:[
                        {en:'Apple',es:'🍎 Manzana'},{en:'Banana',es:'🍌 Plátano'},{en:'Orange',es:'🍊 Naranja'},{en:'Grape',es:'🍇 Uva'},{en:'Tomato',es:'🍅 Tomate'}
                    ]}
                ]},
                { id:'a1-4', name:'Comida & Bebidas 🍕', icon:'🍕', questions:[
                    { type:'image_select', emoji:'🍕', word:'Pizza', phonetic:'/ˈpiːt.sə/', prompt:'¿Qué comida es esta?', options:['Pizza','Bread','Cheese','Burger'], correct:'Pizza' },
                    { type:'emoji_match', word:'Water', phonetic:'/ˈwɔː.tər/', prompt:'¿Cuál es el emoji de Water?', emojis:['💧','🥛','☕','🧃'], correct:'💧' },
                    { type:'listen_select', word:'Milk', phonetic:'/mɪlk/', prompt:'Escucha la palabra y elige el emoji:', options:[{text:'Milk',emoji:'🥛'},{text:'Water',emoji:'💧'},{text:'Coffee',emoji:'☕'},{text:'Juice',emoji:'🧃'}], correct:'Milk' },
                    { type:'image_select', emoji:'🍞', word:'Bread', phonetic:'/bred/', prompt:'¿Qué comida es esta?', options:['Bread','Pizza','Cheese','Cake'], correct:'Bread' },
                    { type:'matching', prompt:'Empareja alimentos y bebidas:', pairs:[
                        {en:'Pizza',es:'🍕 Pizza'},{en:'Bread',es:'🍞 Pan'},{en:'Cheese',es:'🧀 Queso'},{en:'Water',es:'💧 Agua'},{en:'Milk',es:'🥛 Leche'}
                    ]}
                ]},
                { id:'a1-5', name:'Cuerpo Humano 👁️', icon:'👁️', questions:[
                    { type:'image_select', emoji:'👁️', word:'Eye', phonetic:'/aɪ/', prompt:'¿Qué parte del cuerpo es?', options:['Eye','Ear','Nose','Hand'], correct:'Eye' },
                    { type:'emoji_match', word:'Hand', phonetic:'/hænd/', prompt:'Selecciona el emoji de Hand:', emojis:['🖐️','🦶','👁️','👂'], correct:'🖐️' },
                    { type:'listen_select', word:'Ear', phonetic:'/ɪər/', prompt:'Escucha y selecciona la imagen:', options:[{text:'Ear',emoji:'👂'},{text:'Nose',emoji:'👃'},{text:'Eye',emoji:'👁️'},{text:'Foot',emoji:'🦶'}], correct:'Ear' },
                    { type:'image_select', emoji:'👃', word:'Nose', phonetic:'/noʊz/', prompt:'¿Qué parte del cuerpo es?', options:['Nose','Mouth','Eye','Head'], correct:'Nose' },
                    { type:'matching', prompt:'Empareja las partes del cuerpo:', pairs:[
                        {en:'Eye',es:'👁️ Ojo'},{en:'Ear',es:'👂 Oreja'},{en:'Nose',es:'👃 Nariz'},{en:'Hand',es:'🖐️ Mano'},{en:'Foot',es:'🦶 Pie'}
                    ]}
                ]},
                { id:'a1-6', name:'La Familia 👨‍👩‍👧', icon:'👨‍👩‍👧', questions:[
                    { type:'image_select', emoji:'👩', word:'Mother', phonetic:'/ˈmʌð.ər/', prompt:'¿Quién es?', options:['Mother','Father','Sister','Brother'], correct:'Mother' },
                    { type:'image_select', emoji:'👨', word:'Father', phonetic:'/ˈfɑː.ðər/', prompt:'¿Quién es?', options:['Father','Mother','Grandpa','Baby'], correct:'Father' },
                    { type:'listen_select', word:'Baby', phonetic:'/ˈbeɪ.bi/', prompt:'Escucha la palabra de la familia:', options:[{text:'Baby',emoji:'👶'},{text:'Sister',emoji:'👧'},{text:'Brother',emoji:'👦'},{text:'Mother',emoji:'👩'}], correct:'Baby' },
                    { type:'emoji_match', word:'Sister', phonetic:'/ˈsɪs.tər/', prompt:'¿Cuál es el emoji de Sister?', emojis:['👧','👦','👩','👨'], correct:'👧' },
                    { type:'matching', prompt:'Empareja los miembros de la familia:', pairs:[
                        {en:'Mother',es:'👩 Madre'},{en:'Father',es:'👨 Padre'},{en:'Sister',es:'👧 Hermana'},{en:'Brother',es:'👦 Hermano'},{en:'Baby',es:'👶 Bebé'}
                    ]}
                ]},
                { id:'a1-7', name:'Ropa & Vestimenta 👕', icon:'👕', questions:[
                    { type:'image_select', emoji:'👕', word:'Shirt', phonetic:'/ʃɜːrt/', prompt:'¿Qué prenda es?', options:['Shirt','Pants','Shoes','Hat'], correct:'Shirt' },
                    { type:'emoji_match', word:'Shoes', phonetic:'/ʃuːz/', prompt:'Selecciona el emoji de Shoes:', emojis:['👟','👕','🧢','👗'], correct:'👟' },
                    { type:'listen_select', word:'Hat', phonetic:'/hæt/', prompt:'Escucha y elige la prenda:', options:[{text:'Hat',emoji:'🧢'},{text:'Shirt',emoji:'👕'},{text:'Shoes',emoji:'👟'},{text:'Jacket',emoji:'🧥'}], correct:'Hat' },
                    { type:'image_select', emoji:'👗', word:'Dress', phonetic:'/dres/', prompt:'¿Qué prenda es?', options:['Dress','Shirt','Socks','Hat'], correct:'Dress' },
                    { type:'matching', prompt:'Empareja la ropa:', pairs:[
                        {en:'Shirt',es:'👕 Camisa'},{en:'Shoes',es:'👟 Zapatos'},{en:'Hat',es:'🧢 Sombrero'},{en:'Dress',es:'👗 Vestido'},{en:'Socks',es:'🧦 Calcetines'}
                    ]}
                ]},
                { id:'a1-8', name:'Casa & Objetos 🏠', icon:'📱', questions:[
                    { type:'image_select', emoji:'📱', word:'Phone', phonetic:'/foʊn/', prompt:'¿Qué objeto es este?', options:['Phone','Book','Car','Key'], correct:'Phone' },
                    { type:'image_select', emoji:'📚', word:'Book', phonetic:'/bʊk/', prompt:'¿Qué objeto es este?', options:['Book','Phone','Chair','Table'], correct:'Book' },
                    { type:'listen_select', word:'Key', phonetic:'/kiː/', prompt:'Escucha la palabra del objeto:', options:[{text:'Key',emoji:'🔑'},{text:'Door',emoji:'🚪'},{text:'Phone',emoji:'📱'},{text:'Bed',emoji:'🛏️'}], correct:'Key' },
                    { type:'emoji_match', word:'House', phonetic:'/haʊs/', prompt:'¿Cuál es el emoji de House?', emojis:['🏠','🚪','🪑','📚'], correct:'🏠' },
                    { type:'matching', prompt:'Empareja los objetos de casa:', pairs:[
                        {en:'Phone',es:'📱 Teléfono'},{en:'Book',es:'📚 Libro'},{en:'Key',es:'🔑 Llave'},{en:'House',es:'🏠 Casa'},{en:'Door',es:'🚪 Puerta'}
                    ]}
                ]},
                { id:'a1-9', name:'Naturaleza & Clima 🌿', icon:'☀️', questions:[
                    { type:'image_select', emoji:'☀️', word:'Sun', phonetic:'/sʌn/', prompt:'¿Qué elemento de la naturaleza es?', options:['Sun','Moon','Star','Rain'], correct:'Sun' },
                    { type:'emoji_match', word:'Moon', phonetic:'/muːn/', prompt:'¿Cuál es el emoji de Moon?', emojis:['🌙','☀️','⭐','🌧️'], correct:'🌙' },
                    { type:'listen_select', word:'Star', phonetic:'/stɑːr/', prompt:'Escucha la palabra:', options:[{text:'Star',emoji:'⭐'},{text:'Sun',emoji:'☀️'},{text:'Moon',emoji:'🌙'},{text:'Tree',emoji:'🌳'}], correct:'Star' },
                    { type:'image_select', emoji:'🌳', word:'Tree', phonetic:'/triː/', prompt:'¿Qué es esto?', options:['Tree','Flower','Fire','Rain'], correct:'Tree' },
                    { type:'matching', prompt:'Empareja la naturaleza:', pairs:[
                        {en:'Sun',es:'☀️ Sol'},{en:'Moon',es:'🌙 Luna'},{en:'Star',es:'⭐ Estrella'},{en:'Tree',es:'🌳 Árbol'},{en:'Rain',es:'🌧️ Lluvia'}
                    ]}
                ]},
                { id:'a1-10', name:'Vehículos & Transporte 🚗', icon:'🚗', questions:[
                    { type:'image_select', emoji:'🚗', word:'Car', phonetic:'/kɑːr/', prompt:'¿Qué vehículo es este?', options:['Car','Bus','Train','Airplane'], correct:'Car' },
                    { type:'emoji_match', word:'Bus', phonetic:'/bʌs/', prompt:'Selecciona el emoji de Bus:', emojis:['🚌','🚗','🚂','✈️'], correct:'🚌' },
                    { type:'listen_select', word:'Airplane', phonetic:'/ˈer.pleɪn/', prompt:'Escucha y elige el transporte:', options:[{text:'Airplane',emoji:'✈️'},{text:'Boat',emoji:'🛥️'},{text:'Car',emoji:'🚗'},{text:'Bus',emoji:'🚌'}], correct:'Airplane' },
                    { type:'image_select', emoji:'🚲', word:'Bicycle', phonetic:'/ˈbaɪ.sə.kəl/', prompt:'¿Qué vehículo es?', options:['Bicycle','Car','Bus','Train'], correct:'Bicycle' },
                    { type:'matching', prompt:'Empareja los medios de transporte:', pairs:[
                        {en:'Car',es:'🚗 Carro'},{en:'Bus',es:'🚌 Autobús'},{en:'Train',es:'🚂 Tren'},{en:'Airplane',es:'✈️ Avión'},{en:'Bicycle',es:'🚲 Bicicleta'}
                    ]}
                ]}
            ]
        },
        A2: {
            title: "Verbos & Conceptos Clave (A2)",
            desc: "Acciones principales, sentimientos, lugares y adjetivos básicos",
            lessons: [
                { id:'a2-1', name:'Verbos de Acción 🏃', icon:'🏃', questions:[
                    { type:'image_select', emoji:'🏃', word:'Run', phonetic:'/rʌn/', prompt:'¿Qué acción es esta?', options:['Run','Walk','Sleep','Eat'], correct:'Run' },
                    { type:'emoji_match', word:'Eat', phonetic:'/iːt/', prompt:'Selecciona el emoji de Eat:', emojis:['🍕','🏃','😴','📖'], correct:'🍕' },
                    { type:'listen_select', word:'Sleep', phonetic:'/sliːp/', prompt:'Escucha y selecciona la acción:', options:[{text:'Sleep',emoji:'😴'},{text:'Run',emoji:'🏃'},{text:'Read',emoji:'📖'},{text:'Jump',emoji:'🤸'}], correct:'Sleep' },
                    { type:'matching', prompt:'Empareja los verbos de acción:', pairs:[
                        {en:'Run',es:'🏃 Correr'},{en:'Eat',es:'🍕 Comer'},{en:'Drink',es:'💧 Beber'},{en:'Sleep',es:'😴 Dormir'},{en:'Read',es:'📖 Leer'}
                    ]}
                ]},
                { id:'a2-2', name:'Emociones 😊', icon:'😊', questions:[
                    { type:'image_select', emoji:'😊', word:'Happy', phonetic:'/ˈhæp.i/', prompt:'¿Qué emoción es esta?', options:['Happy','Sad','Angry','Tired'], correct:'Happy' },
                    { type:'emoji_match', word:'Sad', phonetic:'/sæd/', prompt:'¿Cuál es el emoji de Sad?', emojis:['😢','😊','😡','😴'], correct:'😢' },
                    { type:'listen_select', word:'Angry', phonetic:'/ˈæŋ.ɡri/', prompt:'Escucha y selecciona la emoción:', options:[{text:'Angry',emoji:'😡'},{text:'Happy',emoji:'😊'},{text:'Tired',emoji:'😴'},{text:'Scared',emoji:'😱'}], correct:'Angry' },
                    { type:'matching', prompt:'Empareja las emociones:', pairs:[
                        {en:'Happy',es:'😊 Feliz'},{en:'Sad',es:'😢 Triste'},{en:'Angry',es:'😡 Enojado'},{en:'Tired',es:'😴 Cansado'},{en:'Scared',es:'😱 Asustado'}
                    ]}
                ]},
                { id:'a2-3', name:'Lugares 🏖️', icon:'🏖️', questions:[
                    { type:'image_select', emoji:'🏫', word:'School', phonetic:'/skuːl/', prompt:'¿Qué lugar es este?', options:['School','Hospital','Park','Beach'], correct:'School' },
                    { type:'listen_select', word:'Beach', phonetic:'/biːtʃ/', prompt:'Escucha y elige el lugar:', options:[{text:'Beach',emoji:'🏖️'},{text:'Park',emoji:'🏞️'},{text:'School',emoji:'🏫'},{text:'Hotel',emoji:'🏨'}], correct:'Beach' },
                    { type:'matching', prompt:'Empareja los lugares:', pairs:[
                        {en:'School',es:'🏫 Escuela'},{en:'Hospital',es:'🏥 Hospital'},{en:'Park',es:'🏞️ Parque'},{en:'Beach',es:'🏖️ Playa'},{en:'Store',es:'🏪 Tienda'}
                    ]}
                ]}
            ]
        },
        B1: {
            title: "Vocabulario de Trabajo & Viajes (B1)",
            desc: "Términos útiles de negocios, aeropuerto y frases frecuentes",
            lessons: [
                { id:'b1-1', name:'Viajes & Aeropuerto ✈️', icon:'✈️', questions:[
                    { type:'image_select', emoji:'🛂', word:'Passport', phonetic:'/ˈpæs.pɔːrt/', prompt:'¿Qué documento es?', options:['Passport','Ticket','Money','Hotel'], correct:'Passport' },
                    { type:'matching', prompt:'Empareja términos de viaje:', pairs:[
                        {en:'Passport',es:'🛂 Pasaporte'},{en:'Ticket',es:'🎫 Boleto'},{en:'Luggage',es:'🧳 Equipaje'},{en:'Airport',es:'✈️ Aeropuerto'},{en:'Hotel',es:'🏨 Hotel'}
                    ]}
                ]}
            ]
        },
        C1: {
            title: "Modismos & Fluidez Nativa (C1)",
            desc: "Idioms profesionales y modismos frecuentes",
            lessons: [
                { id:'c1-1', name:'Native Idioms 🚀', icon:'🚀', questions:[
                    { type:'choice', prompt:'¿Qué significa "Break a leg"?', options:['¡Buena suerte!','Rómpete una pierna','Cálmate','Llegas tarde'], correct:'¡Buena suerte!' },
                    { type:'matching', prompt:'Empareja modismos:', pairs:[
                        {en:'Break a leg',es:'¡Buena suerte!'},{en:'Piece of cake',es:'Muy fácil'},{en:'Under the weather',es:'Enfermo'},{en:'Time flies',es:'El tiempo vuela'},{en:'Hit the books',es:'Estudiar'}
                    ]}
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

    // ====== SPEECH SYNTHESIS ======
    const mascotAvatar = document.getElementById('mascot-avatar');
    function speak(text, rate=0.9) {
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
    const msgs={ok:['¡Excelente! 🌟','¡Genial! ⚡','¡Perfecto! 🎯','¡Correcto! ✨','¡Bravo! 🏆','¡Increíble! 🚀','¡Muy bien! 💪'],combo:['🔥 ¡Racha de fuego!','⚡ ¡Imparable!','💎 ¡Brillante!','🌟 ¡Combo increíble!'],end:['¡Tu inglés mejora cada día!','¡Eres un campeón del aprendizaje!','¡Cada palabra te acerca a la fluidez!','¡Sigue así, vas increíble!']};
    function randMsg(arr){return arr[Math.floor(Math.random()*arr.length)];}

    // ====== DOM ======
    const $=id=>document.getElementById(id);
    const levelSelectorBtn=$('level-selector-btn'),levelDrawer=$('level-drawer'),currentLevelBadge=$('current-level-badge');
    const pathTree=$('path-tree'),bannerUnit=$('banner-unit'),bannerTitle=$('banner-title'),bannerDesc=$('banner-desc');
    const lessonView=$('lesson-view'),closeLessonBtn=$('close-lesson-btn'),progressFill=$('lesson-progress-fill'),lessonHeartsCount=$('lesson-hearts-count');
    const promptTitle=$('prompt-title'),promptText=$('prompt-text'),ttsNormal=$('tts-normal-btn'),ttsSlow=$('tts-slow-btn');
    const modImageSelect=$('mod-image-select'),bigEmoji=$('big-emoji'),imageOptions=$('image-options'),phoneticBadge=$('phonetic-badge');
    const modEmojiMatch=$('mod-emoji-match'),bigWord=$('big-word'),emojiOptions=$('emoji-options'),bigWordPhonetic=$('big-word-phonetic');
    const modListenSelect=$('mod-listen-select'),listenBigBtn=$('listen-big-btn'),listenNormalBtn=$('listen-normal-btn'),listenSlowBtn=$('listen-slow-btn'),listenOptions=$('listen-options');
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
        {t:'¡Hola! 👋 Soy tu asistente. Te enseñaré palabras sencillas con imágenes, texto y audios.',m:'🤖'},
        {t:'🐱 Cada palabra incluye su pronunciación fonética y su audio de voz nativa.',m:'🎧'},
        {t:'🔊 En las preguntas de escucha, toca el altavoz azul para escuchar la palabra y elegir la imagen.',m:'👂'},
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
    ttsNormal.addEventListener('click',()=>speak(promptText.textContent,0.9));
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
        [modImageSelect,modEmojiMatch,modListenSelect,modTranslate,modMatching,modChoice].forEach(m=>m.classList.add('hidden'));

        // Show/hide character prompt based on type
        const showBubble = q.type==='translate'||q.type==='choice';
        charPrompt.style.display=showBubble?'flex':'none';

        if(q.type==='image_select'){
            promptTitle.textContent=q.prompt;
            modImageSelect.classList.remove('hidden');
            bigEmoji.textContent=q.emoji;
            if(phoneticBadge) phoneticBadge.textContent=q.phonetic||'';
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
            if(bigWordPhonetic) bigWordPhonetic.textContent=q.phonetic||'';
            speak(q.word,0.9);
            emojiOptions.innerHTML='';
            q.emojis.sort(()=>Math.random()-0.5).forEach(em=>{
                const btn=document.createElement('button');btn.className='emoji-option';btn.textContent=em;
                btn.addEventListener('click',()=>{playClick();emojiOptions.querySelectorAll('.emoji-option').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');state.selectedChoice=em;checkBtn.disabled=false;});
                emojiOptions.appendChild(btn);
            });

        } else if(q.type==='listen_select'){
            promptTitle.textContent=q.prompt;
            modListenSelect.classList.remove('hidden');
            // Auto play audio for listening exercise
            setTimeout(()=>speak(q.word, 0.85), 200);

            if(listenBigBtn) listenBigBtn.onclick=()=>speak(q.word, 0.85);
            if(listenNormalBtn) listenNormalBtn.onclick=()=>speak(q.word, 0.9);
            if(listenSlowBtn) listenSlowBtn.onclick=()=>speak(q.word, 0.5);

            listenOptions.innerHTML='';
            q.options.sort(()=>Math.random()-0.5).forEach(opt=>{
                const btn=document.createElement('button');btn.className='listen-option';
                btn.innerHTML=`<span>${opt.emoji}</span><span class="listen-option-lbl">${opt.text}</span>`;
                btn.addEventListener('click',()=>{
                    playClick();
                    listenOptions.querySelectorAll('.listen-option').forEach(b=>b.classList.remove('selected'));
                    btn.classList.add('selected');
                    state.selectedChoice=opt.text;
                    checkBtn.disabled=false;
                });
                listenOptions.appendChild(btn);
            });

        } else if(q.type==='translate'){
            promptTitle.textContent='Traduce la frase';promptText.textContent=q.prompt;
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
            promptTitle.textContent='Empareja los pares de palabras';promptText.textContent=q.prompt;
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
        else if(q.type==='choice'||q.type==='image_select'||q.type==='listen_select'){ok=state.selectedChoice===q.correct;}
        else if(q.type==='emoji_match'){ok=state.selectedChoice===q.correct;}

        if(ok){
            playSuccess();state.correctCount++;updateCombo(true);
            feedbackSheet.className='feedback-sheet show success';feedbackIcon.textContent='✓';
            feedbackTitleEl.textContent=randMsg(msgs.ok);
            feedbackSubtitle.textContent=q.word?`${q.word} ${q.phonetic||''}`:'¡Respuesta correcta!';
        } else {
            playError();updateCombo(false);triggerHeartLoss();state.hearts=Math.max(0,state.hearts-1);updateStats();
            feedbackSheet.className='feedback-sheet show error';feedbackIcon.textContent='✕';
            feedbackTitleEl.textContent='No te preocupes, la respuesta era:';
            feedbackSubtitle.textContent=q.word?`${q.word} (${q.correct})`: (q.correct||'Sigue practicando');
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

        const currentLessons = curriculum[state.currentLevel].lessons;
        const activeIdx = currentLessons.findIndex(l => l.id === state.activeLesson.id);
        
        if (activeIdx !== -1) {
            const isLastLesson = activeIdx === currentLessons.length - 1;
            const nextUnlocked = activeIdx + 2;

            if (isLastLesson) {
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

        const modalTitle = completionModal.querySelector('h2');
        if (modalTitle) modalTitle.textContent = '¡Lección Completada!';

        if (state.nextLevelToSwitch) {
            state.currentLevel = state.nextLevelToSwitch;
            state.nextLevelToSwitch = null;
            if (currentLevelBadge) currentLevelBadge.textContent = state.currentLevel;
            
            levelOpts.forEach(o => {
                o.classList.toggle('active', o.dataset.level === state.currentLevel);
            });
            saveProgress();
        }

        renderPath();
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
