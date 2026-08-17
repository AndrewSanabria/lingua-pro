document.addEventListener('DOMContentLoaded', () => {
    const levelOrder = ['K0', 'A1', 'A2', 'B1', 'C1'];

    const state = {
        currentLevel: 'A1', streak: 1, gems: 50, hearts: 5, xp: 0,
        activeLesson: null, currentQuestionIdx: 0, correctCount: 0,
        selectedChips: [], audioCtx: null, firstMatchCard: null,
        matchedPairsCount: 0, comboStreak: 0, maxCombo: 0, hintsUsed: 0,
        selectedChoice: null, nextLevelToSwitch: null,
        tutorialSeen: localStorage.getItem('lp_tut') === '1',
        unlockedIndex: { K0: 1, A1: 1, A2: 1, B1: 1, C1: 1 },
        aacPhrase: []
    };

    // ====== PROGRESS STORAGE & NORMALIZATION ======
    function normalizeProgress() {
        const savedUnlocked = localStorage.getItem('lp_unlocked');
        if (savedUnlocked) {
            try {
                const parsed = JSON.parse(savedUnlocked);
                if (parsed && typeof parsed === 'object') {
                    levelOrder.forEach(lvl => {
                        state.unlockedIndex[lvl] = (typeof parsed[lvl] === 'number' && parsed[lvl] >= 1) ? parsed[lvl] : 1;
                    });
                }
            } catch (e) {
                state.unlockedIndex = { K0: 1, A1: 1, A2: 1, B1: 1, C1: 1 };
            }
        }
        const savedLevel = localStorage.getItem('lp_level');
        if (savedLevel && levelOrder.includes(savedLevel)) {
            state.currentLevel = savedLevel;
        }
    }
    normalizeProgress();

    function saveProgress() {
        localStorage.setItem('lp_unlocked', JSON.stringify(state.unlockedIndex));
        localStorage.setItem('lp_level', state.currentLevel);
    }

    // ====== MASSIVE CURRICULUM WITH CLINICAL SPEECH & COGNITIVE THERAPY (K0) ======
        const curriculum = {
        K0: {
            title: "Terapia de Lenguaje & Estimulación Cognitiva 🧸",
            desc: "10 Unidades clínicas: Onomatopeyas, PECS funcional, silabeo con palmas, autorregulación, pares mínimos, rutinas, esquema corporal, formas visuales, masticación y familia",
            lessons: [
                { id:'k0-1', name:'Sonidos Guía & Animales 🐮', icon:'🐮', questions:[
                    { type:'image_select', emoji:'🐮', word:'Cow', soundsLike:'káu (Moo!)', phonetic:'/kaʊ/', prompt:'¿Qué animal hace "Moo"?', options:['Cow','Cat','Dog','Duck'], correct:'Cow', es:'Vaca', context:'The cow says Moo (La vaca dice Mu)', syllables:'KÁU 🐮 (1 palma)', mouth:'Junta los labios y suelta aire: Mmm-oo 👄' },
                    { type:'emoji_match', word:'Cat', soundsLike:'kat (Meow!)', phonetic:'/kæt/', prompt:'¿Cuál es el Cat que dice "Meow"?', emojis:['🐱','🐶','🐮','🦆'], correct:'🐱', es:'Gato', context:'The cat says Meow (El gato dice Miau)', syllables:'KAT 🐱 (1 palma)', mouth:'Abre la boca suavemente: M-iáu 👄' },
                    { type:'listen_select', word:'Dog', soundsLike:'dog (Woof!)', phonetic:'/dɔːɡ/', prompt:'Escucha el animal y selecciona:', options:[{text:'Dog',emoji:'🐶'},{text:'Cow',emoji:'🐮'},{text:'Duck',emoji:'🦆'},{text:'Cat',emoji:'🐱'}], correct:'Dog', es:'Perro', context:'The friendly dog (El perro amigable)', syllables:'DOG 🐶 (1 palma)', mouth:'Coloca la lengua detrás de los dientes: D-og 👅' },
                    { type:'image_select', emoji:'🦆', word:'Duck', soundsLike:'dák (Quack!)', phonetic:'/dʌk/', prompt:'¿Qué animal nada y dice "Quack"?', options:['Duck','Cow','Cat','Dog'], correct:'Duck', es:'Pato', context:'Yellow duck swims (El pato amarillo nada)', syllables:'DAK 🦆 (1 palma)', mouth:'Sonido corto desde la garganta: Kuák 🗣️' },
                    { type:'emoji_match', word:'Sheep', soundsLike:'shíp (Baa!)', phonetic:'/ʃiːp/', prompt:'¿Qué animal hace "Baa-Baa"?', emojis:['🐑','🐱','🐮','🦆'], correct:'🐑', es:'Oveja', context:'The white sheep (La oveja blanca)', syllables:'SHÍP 🐑 (1 palma)', mouth:'Sonido suave de silencio: Shhh-íp 🤫' },
                    { type:'image_select', emoji:'🚗', word:'Car', soundsLike:'kár (Beep!)', phonetic:'/kɑːr/', prompt:'¿Qué transporte hace "Beep-Beep"?', options:['Car','Duck','Dog','Cat'], correct:'Car', es:'Carro', context:'The red car goes Beep (El carro rojo hace Bip)', syllables:'KÁR 🚗 (1 palma)', mouth:'Junta los labios con fuerza: B-ip 👄' },
                    { type:'matching', prompt:'Empareja animales y sus sonidos onomatopéyicos:', pairs:[
                        {en:'Cow',es:'🐮 Vaca (Moo / káu)'},{en:'Cat',es:'🐱 Gato (Meow / kat)'},{en:'Dog',es:'🐶 Perro (Woof / dog)'},{en:'Duck',es:'🦆 Pato (Quack / dák)'},{en:'Sheep',es:'🐑 Oveja (Baa / shíp)'}
                    ]}
                ]},
                { id:'k0-2', name:'Comunicación Funcional PECS 🥤', icon:'🥤', questions:[
                    { type:'image_select', emoji:'💧', word:'Water', soundsLike:'uá-ter', phonetic:'/ˈwɔː.tər/', prompt:'Pictograma PECS: Quiero agua', options:['Water','Food','Sleep','Help'], correct:'Water', es:'Agua', context:'I want water please (Quiero agua por favor)', syllables:'UÁ - TER (2 palmas 👏)', mouth:'Redondea los labios como un círculo: Uá 👄' },
                    { type:'emoji_match', word:'Food', soundsLike:'fúd', phonetic:'/fuːd/', prompt:'¿Cuál es el pictograma de Comida (Food)?', emojis:['🍕','💧','😴','🚽'], correct:'🍕', es:'Comida', context:'I want food (Quiero comida)', syllables:'FUD 🍕 (1 palma)', mouth:'Dientes de arriba sobre labio inferior: Fff 🐰' },
                    { type:'listen_select', word:'Help', soundsLike:'jélp', phonetic:'/help/', prompt:'Escucha la palabra de ayuda:', options:[{text:'Help',emoji:'🆘'},{text:'Water',emoji:'💧'},{text:'Food',emoji:'🍕'},{text:'Sleep',emoji:'😴'}], correct:'Help', es:'Ayuda', context:'Help me please (Ayúdame por favor)', syllables:'JELP 🆘 (1 palma)', mouth:'Expulsa aire suave como un suspiro: Jélp 💨' },
                    { type:'image_select', emoji:'😴', word:'Sleep', soundsLike:'slíp', phonetic:'/sliːp/', prompt:'Pictograma: Tengo sueño / Dormir', options:['Sleep','Help','Water','Bathroom'], correct:'Sleep', es:'Dormir / Sueño', context:'Time to sleep (Hora de dormir)', syllables:'SLIP 😴 (1 palma)', mouth:'Sonido continuo de serpiente: Sss-líp 🐍' },
                    { type:'emoji_match', word:'Bathroom', soundsLike:'báz-rum', phonetic:'/ˈbæθ.ruːm/', prompt:'¿Cuál es el pictograma de Baño (Bathroom)?', emojis:['🚽','🍕','💧','🆘'], correct:'🚽', es:'Baño', context:'I need the bathroom (Necesito ir al baño)', syllables:'BÁZ - RUM (2 palmas 👏)', mouth:'Lengua entre los dientes para la Z: Báz 👅' },
                    { type:'image_select', emoji:'🩹', word:'Pain', soundsLike:'péin', phonetic:'/peɪn/', prompt:'Pictograma: Me duele / Dolor', options:['Pain','Water','Food','Sleep'], correct:'Pain', es:'Dolor / Me duele', context:'I feel pain here (Siento dolor aquí)', syllables:'PÉIN 🩹 (1 palma)', mouth:'Explosión suave con labios: P-éin 👄' },
                    { type:'matching', prompt:'Empareja las necesidades básicas PECS:', pairs:[
                        {en:'Water',es:'💧 Agua (uá-ter)'},{en:'Food',es:'🍕 Comida (fúd)'},{en:'Sleep',es:'😴 Dormir (slíp)'},{en:'Help',es:'🆘 Ayuda (jélp)'},{en:'Bathroom',es:'🚽 Baño (báz-rum)'}
                    ]}
                ]},
                { id:'k0-3', name:'Conciencia Fonológica & Silabeo 👏', icon:'👏', questions:[
                    { type:'image_select', emoji:'🍌', word:'Banana', soundsLike:'ba-ná-na', phonetic:'/bəˈnæn.ə/', prompt:'Silabeo rítmico: 3 palmadas (Ba - Na - Na)', options:['Banana','Apple','Milk','Baby'], correct:'Banana', es:'Plátano', context:'Sweet banana (Plátano dulce)', syllables:'BA - NÁ - NA (3 palmas 👏)', mouth:'Junta labios (BA), lengua arriba (NA) 👄' },
                    { type:'emoji_match', word:'Apple', soundsLike:'áp-ol', phonetic:'/ˈæp.əl/', prompt:'Silabeo rítmico: 2 palmadas (Áp - Ol)', emojis:['🍎','🍌','🥛','👶'], correct:'🍎', es:'Manzana', context:'Red apple (Manzana roja)', syllables:'ÁP - OL (2 palmas 👏)', mouth:'Abre bien la boca para la A: Áp 👄' },
                    { type:'listen_select', word:'Baby', soundsLike:'béi-bi', phonetic:'/ˈbeɪ.bi/', prompt:'Escucha la palabra de 2 sílabas:', options:[{text:'Baby',emoji:'👶'},{text:'Sun',emoji:'☀️'},{text:'Star',emoji:'⭐'},{text:'Ball',emoji:'⚽'}], correct:'Baby', es:'Bebé', context:'Little baby (Pequeño bebé)', syllables:'BÉI - BI (2 palmas 👏)', mouth:'Junta los labios dos veces: Béi-bi 👄' },
                    { type:'image_select', emoji:'🦋', word:'Butterfly', soundsLike:'bá-ter-flai', phonetic:'/ˈbʌt.ə.flaɪ/', prompt:'Silabeo rítmico: 3 palmadas (Bá - ter - flai)', options:['Butterfly','Star','Sun','Milk'], correct:'Butterfly', es:'Mariposa', context:'Colorful butterfly (Mariposa colorida)', syllables:'BÁ - TER - FLAI (3 palmas 👏)', mouth:'Junta labios y sopla: Bá-ter-flai 👄' },
                    { type:'emoji_match', word:'Tomato', soundsLike:'to-méi-tou', phonetic:'/təˈmeɪ.toʊ/', prompt:'Silabeo rítmico: 3 palmadas (To - Méi - Tou)', emojis:['🍅','🍎','🥛','⭐'], correct:'🍅', es:'Tomate', context:'Red tomato (Tomate rojo)', syllables:'TO - MÉI - TOU (3 palmas 👏)', mouth:'Lengua arriba: To-méi-tou 👅' },
                    { type:'matching', prompt:'Empareja las palabras y su número de palmas:', pairs:[
                        {en:'Banana',es:'🍌 BA-NÁ-NA (3 palmas)'},{en:'Apple',es:'🍎 ÁP-OL (2 palmas)'},{en:'Baby',es:'👶 BÉI-BI (2 palmas)'},{en:'Butterfly',es:'🦋 BÁ-TER-FLAI (3 palmas)'},{en:'Tomato',es:'🍅 TO-MÉI-TOU (3 palmas)'}
                    ]}
                ]},
                { id:'k0-4', name:'Emociones & Regulación Sensorial 💖', icon:'💖', questions:[
                    { type:'image_select', emoji:'😊', word:'Happy', soundsLike:'já-pi', phonetic:'/ˈhæp.i/', prompt:'Pictograma: Me siento Feliz', options:['Happy','Calm','Sad','Love'], correct:'Happy', es:'Feliz', context:'I am happy (Estoy feliz)', syllables:'JÁ - PI 😊 (2 palmas)', mouth:'Sonríe mostrando los dientes: Já-pi 😁' },
                    { type:'emoji_match', word:'Calm', soundsLike:'kám', phonetic:'/kɑːm/', prompt:'¿Cuál representa Calma y Respirar?', emojis:['🧘','😊','😢','😡'], correct:'🧘', es:'Calma / Tranquilo', context:'Take a deep breath and stay calm (Respira hondo y mantén la calma)', syllables:'KÁM 🧘 (1 palma)', mouth:'Inhala y exhala despacio: Kám 🌬️' },
                    { type:'listen_select', word:'Love', soundsLike:'láv', phonetic:'/lʌv/', prompt:'Escucha la palabra de afecto:', options:[{text:'Love',emoji:'❤️'},{text:'Sad',emoji:'😢'},{text:'Angry',emoji:'😡'},{text:'Tired',emoji:'😴'}], correct:'Love', es:'Amor / Cariño', context:'I love my family (Amo a mi familia)', syllables:'LÁV ❤️ (1 palma)', mouth:'Lengua arriba y labio suave: Lll-av 👄' },
                    { type:'image_select', emoji:'🤗', word:'Hug', soundsLike:'jág', phonetic:'/hʌɡ/', prompt:'Pictograma: Quiero un Abrazo', options:['Hug','Sad','Angry','Sleep'], correct:'Hug', es:'Abrazo', context:'A warm hug (Un abrazo cálido)', syllables:'JÁG 🤗 (1 palma)', mouth:'Expulsa aire y cierra suave: Jág 👄' },
                    { type:'emoji_match', word:'Proud', soundsLike:'práud', phonetic:'/praʊd/', prompt:'Pictograma: Orgulloso / ¡Lo logré!', emojis:['🌟','😢','😡','😴'], correct:'🌟', es:'Orgulloso', context:'I am proud of you (Estoy orgulloso de ti)', syllables:'PRÁUD 🌟 (1 palma)', mouth:'Labios juntos y sonrisa: Pr-áud 👄' },
                    { type:'matching', prompt:'Empareja emociones y calma sensorial:', pairs:[
                        {en:'Happy',es:'😊 Feliz (já-pi)'},{en:'Calm',es:'🧘 Calma (kám)'},{en:'Love',es:'❤️ Amor (láv)'},{en:'Hug',es:'🤗 Abrazo (jág)'},{en:'Proud',es:'🌟 Orgulloso (práud)'}
                    ]}
                ]},
                { id:'k0-5', name:'Caja de Sonidos & Pares Mínimos 👂', icon:'👂', questions:[
                    { type:'image_select', emoji:'🥛', word:'Milk', soundsLike:'mílk', phonetic:'/mɪlk/', prompt:'Caja del sonido M: ¿Qué empieza con /m/?', options:['Milk','Dog','Sun','Car'], correct:'Milk', es:'Leche', context:'Cold glass of milk (Vaso de leche fría)', syllables:'MÍLK 🥛 (1 palma)', mouth:'Junta los labios: Mmm-ilk 👄' },
                    { type:'emoji_match', word:'Moon', soundsLike:'mún', phonetic:'/muːn/', prompt:'Caja del sonido M: ¿Cuál empieza con /m/?', emojis:['🌙','☀️','🚗','🐶'], correct:'🌙', es:'Luna', context:'The bright moon (La luna brillante)', syllables:'MÚN 🌙 (1 palma)', mouth:'Sonido bilabial continuo: Mmm-oon 👄' },
                    { type:'listen_select', word:'Ball', soundsLike:'ból', phonetic:'/bɔːl/', prompt:'Caja del sonido B: Escucha y elige:', options:[{text:'Ball',emoji:'⚽'},{text:'Cat',emoji:'🐱'},{text:'Sun',emoji:'☀️'},{text:'Dog',emoji:'🐶'}], correct:'Ball', es:'Pelota', context:'Play with the ball (Jugar con la pelota)', syllables:'BÓL ⚽ (1 palma)', mouth:'Explosión bilabial: B-all 👄' },
                    { type:'image_select', emoji:'🧢', word:'Hat', soundsLike:'ját', phonetic:'/hæt/', prompt:'Par Mínimo / Rima con Cat: ¿Cuál es Hat?', options:['Hat','Dog','Fish','Cow'], correct:'Hat', es:'Sombrero', context:'Wear a blue hat (Usa un sombrero azul)', syllables:'JÁT 🧢 (1 palma)', mouth:'Sonido suave: J-at (rima con Cat) 👄' },
                    { type:'emoji_match', word:'Pen', soundsLike:'pén', phonetic:'/pen/', prompt:'Caja del sonido P: ¿Cuál es Pen?', emojis:['🖊️','🥛','🌙','🧢'], correct:'🖊️', es:'Pluma / Bolígrafo', context:'Write with a pen (Escribe con una pluma)', syllables:'PÉN 🖊️ (1 palma)', mouth:'Explosión de aire con labios: P-en 👄' },
                    { type:'matching', prompt:'Empareja palabras de la caja de sonidos:', pairs:[
                        {en:'Milk',es:'🥛 Leche (Sonido M / mílk)'},{en:'Moon',es:'🌙 Luna (Sonido M / mún)'},{en:'Ball',es:'⚽ Pelota (Sonido B / ból)'},{en:'Hat',es:'🧢 Sombrero (Rima Cat / ját)'},{en:'Pen',es:'🖊️ Pluma (Sonido P / pén)'}
                    ]}
                ]},
                { id:'k0-6', name:'Rutinas Diarias & Autonomía ⏰', icon:'⏰', questions:[
                    { type:'image_select', emoji:'🧼', word:'Wash', soundsLike:'uósh', phonetic:'/wɑːʃ/', prompt:'Pictograma de Rutina: Lavarse las manos', options:['Wash','Brush','Eat','Sleep'], correct:'Wash', es:'Lavar', context:'Wash your hands with soap (Lava tus manos con jabón)', syllables:'UÓSH 🧼 (1 palma)', mouth:'Redondea labios y expulsa aire: Uósh 👄' },
                    { type:'emoji_match', word:'Brush', soundsLike:'brásh', phonetic:'/brʌʃ/', prompt:'Pictograma: Cepillarse los dientes', emojis:['🪥','🧼','🍕','🛏️'], correct:'🪥', es:'Cepillar', context:'Brush your teeth clean (Cepilla tus dientes limpios)', syllables:'BRÁSH 🪥 (1 palma)', mouth:'Junta labios y saca aire: Br-ash 👄' },
                    { type:'listen_select', word:'Play', soundsLike:'pléi', phonetic:'/pleɪ/', prompt:'Escucha la rutina divertida:', options:[{text:'Play',emoji:'🎮'},{text:'Wash',emoji:'🧼'},{text:'Sleep',emoji:'🛏️'},{text:'Eat',emoji:'🍽️'}], correct:'Play', es:'Jugar', context:'Time to play (Hora de jugar)', syllables:'PLÉI 🎮 (1 palma)', mouth:'Explosión bilabial: P-lay 👄' },
                    { type:'image_select', emoji:'🛏️', word:'Bed', soundsLike:'béd', phonetic:'/bed/', prompt:'Pictograma: Hora de ir a la Cama', options:['Bed','Car','Food','School'], correct:'Bed', es:'Cama', context:'Go to bed to rest (Ve a la cama a descansar)', syllables:'BÉD 🛏️ (1 palma)', mouth:'Labios juntos: B-ed 👄' },
                    { type:'emoji_match', word:'Dress', soundsLike:'drés', phonetic:'/dres/', prompt:'Pictograma: Vestirse / Ponerse ropa', emojis:['👕','🧼','🪥','🎮'], correct:'👕', es:'Vestir', context:'Dress yourself (Vístete tú solo)', syllables:'DRÉS 👕 (1 palma)', mouth:'Lengua arriba: Dr-ess 👅' },
                    { type:'matching', prompt:'Empareja las rutinas de autonomía:', pairs:[
                        {en:'Wash',es:'🧼 Lavar manos (uósh)'},{en:'Brush',es:'🪥 Cepillar dientes (brásh)'},{en:'Eat',es:'🍽️ Comer (ít)'},{en:'Play',es:'🎮 Jugar (pléi)'},{en:'Dress',es:'👕 Vestirse (drés)'}
                    ]}
                ]},
                { id:'k0-7', name:'Partes del Cuerpo & Esquema Corporal 🖐️', icon:'🖐️', questions:[
                    { type:'image_select', emoji:'🖐️', word:'Hand', soundsLike:'jánd', phonetic:'/hænd/', prompt:'Esquema Corporal: ¿Qué parte es Hand?', options:['Hand','Foot','Eye','Ear'], correct:'Hand', es:'Mano', context:'Clap with your hands (Aplaude con tus manos)', syllables:'JÁND 🖐️ (1 palma)', mouth:'Suspiro suave: J-and 💨' },
                    { type:'emoji_match', word:'Eye', soundsLike:'ái', phonetic:'/aɪ/', prompt:'¿Qué parte del cuerpo es Eye?', emojis:['👁️','🖐️','👂','👃'], correct:'👁️', es:'Ojo', context:'Open your eyes (Abre tus ojos)', syllables:'ÁI 👁️ (1 palma)', mouth:'Abre la boca: Á-i 👄' },
                    { type:'listen_select', word:'Ear', soundsLike:'íar', phonetic:'/ɪər/', prompt:'Escucha la parte del cuerpo para oír:', options:[{text:'Ear',emoji:'👂'},{text:'Nose',emoji:'👃'},{text:'Hand',emoji:'🖐️'},{text:'Foot',emoji:'🦶'}], correct:'Ear', es:'Oreja / Oído', context:'Listen with your ear (Escucha con tu oído)', syllables:'ÍAR 👂 (1 palma)', mouth:'Vocal estirada: Í-ar 👄' },
                    { type:'image_select', emoji:'👃', word:'Nose', soundsLike:'nóus', phonetic:'/noʊz/', prompt:'Esquema Corporal: ¿Qué parte es Nose?', options:['Nose','Mouth','Head','Foot'], correct:'Nose', es:'Nariz', context:'Smell with your nose (Huele con tu nariz)', syllables:'NÓUS 👃 (1 palma)', mouth:'Lengua en el paladar: N-ose 👅' },
                    { type:'emoji_match', word:'Foot', soundsLike:'fút', phonetic:'/fʊt/', prompt:'¿Qué parte del cuerpo es Foot para caminar?', emojis:['🦶','🖐️','👁️','👂'], correct:'🦶', es:'Pie', context:'Step with your foot (Pisa con tu pie)', syllables:'FÚT 🦶 (1 palma)', mouth:'Dientes superiores sobre labio: F-ut 🐰' },
                    { type:'matching', prompt:'Empareja las partes del esquema corporal:', pairs:[
                        {en:'Hand',es:'🖐️ Mano (jánd)'},{en:'Eye',es:'👁️ Ojo (ái)'},{en:'Ear',es:'👂 Oreja (íar)'},{en:'Nose',es:'👃 Nariz (nóus)'},{en:'Foot',es:'🦶 Pie (fút)'}
                    ]}
                ]},
                { id:'k0-8', name:'Formas & Estimulación Visual 🔷', icon:'🔷', questions:[
                    { type:'image_select', emoji:'🔵', word:'Circle', soundsLike:'sér-kol', phonetic:'/ˈsɜː.kəl/', prompt:'Estimulación Visual: ¿Cuál es Circle?', options:['Circle','Square','Star','Heart'], correct:'Circle', es:'Círculo', context:'Round blue circle (Círculo azul redondo)', syllables:'SÉR - KOL 🔵 (2 palmas)', mouth:'Sonido suave: Sss-er-kol 🐍' },
                    { type:'emoji_match', word:'Star', soundsLike:'stár', phonetic:'/stɑːr/', prompt:'¿Cuál es la forma de Estrella (Star)?', emojis:['⭐','🔵','⬛','❤️'], correct:'⭐', es:'Estrella', context:'Shining bright star (Estrella brillante)', syllables:'STÁR ⭐ (1 palma)', mouth:'Siseo continuo: St-ar 👄' },
                    { type:'listen_select', word:'Heart', soundsLike:'járt', phonetic:'/hɑːt/', prompt:'Escucha y selecciona la forma de afecto:', options:[{text:'Heart',emoji:'❤️'},{text:'Circle',emoji:'🔵'},{text:'Square',emoji:'⬛'},{text:'Star',emoji:'⭐'}], correct:'Heart', es:'Corazón', context:'Red heart (Corazón rojo)', syllables:'JÁRT ❤️ (1 palma)', mouth:'Aire suave: J-art 💨' },
                    { type:'image_select', emoji:'⬛', word:'Square', soundsLike:'skuér', phonetic:'/skwer/', prompt:'Estimulación Visual: ¿Cuál es Square?', options:['Square','Circle','Star','Heart'], correct:'Square', es:'Cuadrado', context:'Four sides square (Cuadrado de cuatro lados)', syllables:'SKUÉR ⬛ (1 palma)', mouth:'Sss-kuer 👄' },
                    { type:'emoji_match', word:'Sun', soundsLike:'sán', phonetic:'/sʌn/', prompt:'Estimulación Visual: ¿Cuál es el Sol (Sun)?', emojis:['☀️','🌙','⭐','🔵'], correct:'☀️', es:'Sol', context:'Warm yellow sun (Sol amarillo cálido)', syllables:'SÁN ☀️ (1 palma)', mouth:'Siseo suave: S-an 👄' },
                    { type:'matching', prompt:'Empareja formas y elementos visuales:', pairs:[
                        {en:'Circle',es:'🔵 Círculo (sér-kol)'},{en:'Star',es:'⭐ Estrella (stár)'},{en:'Heart',es:'❤️ Corazón (járt)'},{en:'Square',es:'⬛ Cuadrado (skuér)'},{en:'Sun',es:'☀️ Sol (sán)'}
                    ]}
                ]},
                { id:'k0-9', name:'Comidas Favoritas & Masticación 🍎', icon:'🍎', questions:[
                    { type:'image_select', emoji:'🍎', word:'Apple', soundsLike:'áp-ol', phonetic:'/ˈæp.əl/', prompt:'Praxias al masticar: ¿Cuál es Apple?', options:['Apple','Milk','Cookie','Juice'], correct:'Apple', es:'Manzana', context:'Crunchy red apple (Manzana roja crujiente)', syllables:'ÁP - OL 🍎 (2 palmas)', mouth:'Muerde con dientes delanteros: Áp-ol 👄' },
                    { type:'emoji_match', word:'Cookie', soundsLike:'kú-ki', phonetic:'/ˈkʊk.i/', prompt:'¿Cuál es la Galleta (Cookie)?', emojis:['🍪','🍎','🥛','🧃'], correct:'🍪', es:'Galleta', context:'Sweet cookie (Galleta dulce)', syllables:'KÚ - KI 🍪 (2 palmas)', mouth:'Sonido desde el paladar: Ku-ki 🗣️' },
                    { type:'listen_select', word:'Juice', soundsLike:'jús', phonetic:'/dʒuːs/', prompt:'Escucha y elige la bebida frutal:', options:[{text:'Juice',emoji:'🧃'},{text:'Cookie',emoji:'🍪'},{text:'Apple',emoji:'🍎'},{text:'Milk',emoji:'🥛'}], correct:'Juice', es:'Jugo', context:'Orange juice (Jugo de naranja)', syllables:'JÚS 🧃 (1 palma)', mouth:'Labios hacia adelante: J-us 👄' },
                    { type:'image_select', emoji:'🧀', word:'Cheese', soundsLike:'chís', phonetic:'/tʃiːz/', prompt:'Comida suave: ¿Cuál es Cheese?', options:['Cheese','Apple','Cookie','Water'], correct:'Cheese', es:'Queso', context:'Yellow cheese (Queso amarillo)', syllables:'CHÍS 🧀 (1 palma)', mouth:'Sonríe y di: Ch-ís 😁' },
                    { type:'emoji_match', word:'Bread', soundsLike:'bréd', phonetic:'/bred/', prompt:'¿Cuál es el Pan (Bread)?', emojis:['🍞','🧀','🍎','🍪'], correct:'🍞', es:'Pan', context:'Soft bread (Pan suave)', syllables:'BRÉD 🍞 (1 palma)', mouth:'Junta labios y sopla: Br-ed 👄' },
                    { type:'matching', prompt:'Empareja alimentos y texturas:', pairs:[
                        {en:'Apple',es:'🍎 Manzana (áp-ol)'},{en:'Cookie',es:'🍪 Galleta (kú-ki)'},{en:'Juice',es:'🧃 Jugo (jús)'},{en:'Cheese',es:'🧀 Queso (chís)'},{en:'Bread',es:'🍞 Pan (bréd)'}
                    ]}
                ]},
                { id:'k0-10', name:'Familia & Vínculos Afectivos 👨‍👩‍👧', icon:'👨‍👩‍👧', questions:[
                    { type:'image_select', emoji:'👩', word:'Mom', soundsLike:'mám', phonetic:'/mɑːm/', prompt:'Vínculo de afecto: ¿Cuál es Mom?', options:['Mom','Dad','Baby','Sister'], correct:'Mom', es:'Mamá', context:'I love my mom (Amo a mi mamá)', syllables:'MÁM 👩 (1 palma)', mouth:'Junta labios dos veces: Mmm-am 👄' },
                    { type:'emoji_match', word:'Dad', soundsLike:'dád', phonetic:'/dæd/', prompt:'Vínculo de afecto: ¿Cuál es Dad?', emojis:['👨','👩','👶','👧'], correct:'👨', es:'Papá', context:'My dad plays with me (Mi papá juega conmigo)', syllables:'DÁD 👨 (1 palma)', mouth:'Lengua arriba: D-ad 👅' },
                    { type:'listen_select', word:'Sister', soundsLike:'sís-ter', phonetic:'/ˈsɪs.tər/', prompt:'Escucha el miembro de la familia:', options:[{text:'Sister',emoji:'👧'},{text:'Dad',emoji:'👨'},{text:'Mom',emoji:'👩'},{text:'Baby',emoji:'👶'}], correct:'Sister', es:'Hermana', context:'My sister smiles (Mi hermana sonríe)', syllables:'SÍS - TER 👧 (2 palmas)', mouth:'Siseo continuo: Sss-is-ter 🐍' },
                    { type:'image_select', emoji:'👦', word:'Brother', soundsLike:'brá-der', phonetic:'/ˈbrʌð.ər/', prompt:'Vínculo familiar: ¿Cuál es Brother?', options:['Brother','Mom','Dad','Baby'], correct:'Brother', es:'Hermano', context:'My brother helps me (Mi hermano me ayuda)', syllables:'BRÁ - DER 👦 (2 palmas)', mouth:'Labios juntos y lengua suave: Br-a-der 👄' },
                    { type:'emoji_match', word:'Family', soundsLike:'fá-mi-li', phonetic:'/ˈfæm.əl.i/', prompt:'¿Cuál representa a toda la Familia (Family)?', emojis:['👨‍👩‍👧‍👦','👩','👨','👶'], correct:'👨‍👩‍👧‍👦', es:'Familia', context:'We are a happy family (Somos una familia feliz)', syllables:'FÁ - MI - LI 👨‍👩‍👧‍👦 (3 palmas)', mouth:'Dientes arriba, labios juntos: Fá-mi-li 👄' },
                    { type:'matching', prompt:'Empareja los miembros de la familia:', pairs:[
                        {en:'Mom',es:'👩 Mamá (mám)'},{en:'Dad',es:'👨 Papá (dád)'},{en:'Baby',es:'👶 Bebé (béi-bi)'},{en:'Sister',es:'👧 Hermana (sís-ter)'},{en:'Brother',es:'👦 Hermano (brá-der)'}
                    ]}
                ]}
            ]
        },
        A1: {
            title: "Vocabulario Inicial (A1)",
            desc: "12 Unidades completas: Animales, colores, frutas, comida, cuerpo, familia, números, saludos, ropa, transportes, clima y adjetivos básicos",
            lessons: [
                { id:'a1-1', name:'Animales 🐾', icon:'🐱', questions:[
                    { type:'image_select', emoji:'🐱', word:'Cat', soundsLike:'kat', phonetic:'/kæt/', prompt:'¿Qué animal es este?', options:['Cat','Dog','Bird','Fish'], correct:'Cat', es:'Gato', context:'The cat is sleeping (El gato está durmiendo)', syllables:'KAT 🐱' },
                    { type:'emoji_match', word:'Dog', soundsLike:'dog', phonetic:'/dɔːɡ/', prompt:'¿Cuál es el emoji de Dog?', emojis:['🐶','🐱','🐴','🐰'], correct:'🐶', es:'Perro', context:'My dog is friendly (Mi perro es amigable)', syllables:'DOG 🐶' },
                    { type:'listen_select', word:'Bird', soundsLike:'bérd', phonetic:'/bɜːrd/', prompt:'Escucha y selecciona la imagen:', options:[{text:'Bird',emoji:'🐦'},{text:'Fish',emoji:'🐟'},{text:'Cat',emoji:'🐱'},{text:'Bear',emoji:'🐻'}], correct:'Bird', es:'Pájaro', context:'A blue bird flies (Un pájaro azul vuela)' },
                    { type:'image_select', emoji:'🐟', word:'Fish', soundsLike:'físh', phonetic:'/fɪʃ/', prompt:'¿Qué animal es este?', options:['Fish','Bird','Cat','Rabbit'], correct:'Fish', es:'Pez', context:'The fish swims in water (El pez nada en el agua)' },
                    { type:'translate', prompt:'The cat and the dog', answer:['El','gato','y','el','perro'], pool:['El','gato','y','el','perro','un','pájaro','pez'], context:'The cat and the dog (El gato y el perro)' },
                    { type:'listen_select', word:'Bear', soundsLike:'bér', phonetic:'/beər/', prompt:'Escucha y selecciona el emoji:', options:[{text:'Bear',emoji:'🐻'},{text:'Lion',emoji:'🦁'},{text:'Dog',emoji:'🐶'},{text:'Cat',emoji:'🐱'}], correct:'Bear', es:'Oso', context:'A big brown bear (Un gran oso café)' },
                    { type:'choice', prompt:'¿Qué animal dice "Guau" y es el mejor amigo del hombre?', options:['Dog','Cat','Fish','Bird'], correct:'Dog', es:'Perro' },
                    { type:'matching', prompt:'Empareja los animales y su pronunciación:', pairs:[
                        {en:'Cat',es:'🐱 Gato (kat)'},{en:'Dog',es:'🐶 Perro (dog)'},{en:'Bird',es:'🐦 Pájaro (bérd)'},{en:'Fish',es:'🐟 Pez (físh)'},{en:'Bear',es:'🐻 Oso (bér)'}
                    ]}
                ]},
                { id:'a1-2', name:'Colores 🎨', icon:'🌈', questions:[
                    { type:'image_select', emoji:'🔴', word:'Red', soundsLike:'réd', phonetic:'/red/', prompt:'¿Qué color es este?', options:['Red','Blue','Green','Yellow'], correct:'Red', es:'Rojo', context:'A red apple (Una manzana roja)', syllables:'RÉD 🔴' },
                    { type:'emoji_match', word:'Blue', soundsLike:'blú', phonetic:'/bluː/', prompt:'¿Cuál es el color Blue?', emojis:['🔵','🔴','🟢','🟡'], correct:'🔵', es:'Azul', context:'The sky is blue (El cielo es azul)', syllables:'BLÚ 🔵' },
                    { type:'listen_select', word:'Green', soundsLike:'grín', phonetic:'/ɡriːn/', prompt:'Escucha y selecciona el color:', options:[{text:'Green',emoji:'🟢'},{text:'Orange',emoji:'🟠'},{text:'Purple',emoji:'🟣'},{text:'Red',emoji:'🔴'}], correct:'Green', es:'Verde', context:'Green tree (Árbol verde)' },
                    { type:'image_select', emoji:'🟡', word:'Yellow', soundsLike:'yél-ou', phonetic:'/ˈjel.oʊ/', prompt:'¿Qué color es este?', options:['Yellow','Red','Blue','White'], correct:'Yellow', es:'Amarillo', context:'Yellow sun (Sol amarillo)' },
                    { type:'translate', prompt:'The red car is fast', answer:['El','carro','rojo','es','rápido'], pool:['El','carro','rojo','es','rápido','azul','verde','un'], context:'The red car is fast (El carro rojo es rápido)' },
                    { type:'listen_select', word:'White', soundsLike:'huáit', phonetic:'/waɪt/', prompt:'Escucha y elige el color:', options:[{text:'White',emoji:'⚪'},{text:'Black',emoji:'⚫'},{text:'Red',emoji:'🔴'},{text:'Blue',emoji:'🔵'}], correct:'White', es:'Blanco', context:'White snow (Nieve blanca)' },
                    { type:'emoji_match', word:'Black', soundsLike:'blák', phonetic:'/blæk/', prompt:'¿Cuál es el color Black?', emojis:['⚫','⚪','🔴','🟡'], correct:'⚫', es:'Negro', context:'A black cat (Un gato negro)' },
                    { type:'matching', prompt:'Empareja los colores:', pairs:[
                        {en:'Red',es:'🔴 Rojo (réd)'},{en:'Blue',es:'🔵 Azul (blú)'},{en:'Green',es:'🟢 Verde (grín)'},{en:'Yellow',es:'🟡 Amarillo (yél-ou)'},{en:'White',es:'⚪ Blanco (huáit)'}
                    ]}
                ]},
                { id:'a1-3', name:'Frutas & Verduras 🍎', icon:'🍎', questions:[
                    { type:'image_select', emoji:'🍎', word:'Apple', soundsLike:'áp-ol', phonetic:'/ˈæp.əl/', prompt:'¿Qué fruta es esta?', options:['Apple','Banana','Orange','Grape'], correct:'Apple', es:'Manzana', context:'I eat an apple (Yo como una manzana)' },
                    { type:'emoji_match', word:'Banana', soundsLike:'ba-ná-na', phonetic:'/bəˈnæn.ə/', prompt:'Selecciona el emoji de Banana:', emojis:['🍌','🍎','🍓','🍇'], correct:'🍌', es:'Plátano', context:'A sweet yellow banana (Un plátano amarillo dulce)' },
                    { type:'listen_select', word:'Orange', soundsLike:'ó-ranj', phonetic:'/ˈɔːr.ɪndʒ/', prompt:'Escucha y elige la fruta:', options:[{text:'Orange',emoji:'🍊'},{text:'Lemon',emoji:'🍋'},{text:'Apple',emoji:'🍎'},{text:'Grape',emoji:'🍇'}], correct:'Orange', es:'Naranja', context:'Fresh orange juice (Jugo de naranja fresco)' },
                    { type:'image_select', emoji:'🍅', word:'Tomato', soundsLike:'to-méi-tou', phonetic:'/təˈmeɪ.toʊ/', prompt:'¿Qué vegetal es este?', options:['Tomato','Potato','Corn','Carrot'], correct:'Tomato', es:'Tomate', context:'Red tomato in salad (Tomate rojo en la ensalada)' },
                    { type:'translate', prompt:'I like apples and bananas', answer:['Me','gustan','las','manzanas','y','plátanos'], pool:['Me','gustan','las','manzanas','y','plátanos','naranjas','no'], context:'I like apples and bananas (Me gustan las manzanas y plátanos)' },
                    { type:'listen_select', word:'Grape', soundsLike:'gréip', phonetic:'/ɡreɪp/', prompt:'Escucha y selecciona la fruta:', options:[{text:'Grape',emoji:'🍇'},{text:'Apple',emoji:'🍎'},{text:'Banana',emoji:'🍌'},{text:'Tomato',emoji:'🍅'}], correct:'Grape', es:'Uva', context:'Purple grapes (Uvas moradas)' },
                    { type:'matching', prompt:'Empareja las frutas y verduras:', pairs:[
                        {en:'Apple',es:'🍎 Manzana (áp-ol)'},{en:'Banana',es:'🍌 Plátano (ba-ná-na)'},{en:'Orange',es:'🍊 Naranja (ó-ranj)'},{en:'Grape',es:'🍇 Uva (gréip)'},{en:'Tomato',es:'🍅 Tomate (to-méi-tou)'}
                    ]}
                ]},
                { id:'a1-4', name:'Comida & Bebidas 🍕', icon:'🍕', questions:[
                    { type:'image_select', emoji:'🍕', word:'Pizza', soundsLike:'pít-sa', phonetic:'/ˈpiːt.sə/', prompt:'¿Qué comida es esta?', options:['Pizza','Bread','Cheese','Burger'], correct:'Pizza', es:'Pizza', context:'Delicious cheese pizza (Deliciosa pizza de queso)' },
                    { type:'emoji_match', word:'Water', soundsLike:'uá-ter', phonetic:'/ˈwɔː.tər/', prompt:'¿Cuál es el emoji de Water?', emojis:['💧','🥛','☕','🧃'], correct:'💧', es:'Agua', context:'Drink cold water (Bebe agua fría)' },
                    { type:'listen_select', word:'Milk', soundsLike:'mílk', phonetic:'/mɪlk/', prompt:'Escucha y elige el emoji:', options:[{text:'Milk',emoji:'🥛'},{text:'Water',emoji:'💧'},{text:'Coffee',emoji:'☕'},{text:'Juice',emoji:'🧃'}], correct:'Milk', es:'Leche', context:'A glass of milk (Un vaso de leche)' },
                    { type:'image_select', emoji:'🍞', word:'Bread', soundsLike:'bréd', phonetic:'/bred/', prompt:'¿Qué comida es esta?', options:['Bread','Pizza','Cheese','Cake'], correct:'Bread', es:'Pan', context:'Fresh warm bread (Pan caliente fresco)' },
                    { type:'translate', prompt:'Water and bread please', answer:['Agua','y','pan','por','favor'], pool:['Agua','y','pan','por','favor','leche','queso','gracias'], context:'Water and bread please (Agua y pan por favor)' },
                    { type:'listen_select', word:'Cheese', soundsLike:'chís', phonetic:'/tʃiːz/', prompt:'Escucha la palabra:', options:[{text:'Cheese',emoji:'🧀'},{text:'Bread',emoji:'🍞'},{text:'Pizza',emoji:'🍕'},{text:'Milk',emoji:'🥛'}], correct:'Cheese', es:'Queso', context:'Yellow cheese (Queso amarillo)' },
                    { type:'matching', prompt:'Empareja alimentos y bebidas:', pairs:[
                        {en:'Pizza',es:'🍕 Pizza (pít-sa)'},{en:'Bread',es:'🍞 Pan (bréd)'},{en:'Cheese',es:'🧀 Queso (chís)'},{en:'Water',es:'💧 Agua (uá-ter)'},{en:'Milk',es:'🥛 Leche (mílk)'}
                    ]}
                ]},
                { id:'a1-5', name:'Cuerpo Humano 👁️', icon:'👁️', questions:[
                    { type:'image_select', emoji:'👁️', word:'Eye', soundsLike:'ái', phonetic:'/aɪ/', prompt:'¿Qué parte del cuerpo es?', options:['Eye','Ear','Nose','Hand'], correct:'Eye', es:'Ojo', context:'Blue eyes (Ojos azules)' },
                    { type:'emoji_match', word:'Hand', soundsLike:'jánd', phonetic:'/hænd/', prompt:'Selecciona el emoji de Hand:', emojis:['🖐️','🦶','👁️','👂'], correct:'🖐️', es:'Mano', context:'Raise your hand (Levanta tu mano)' },
                    { type:'listen_select', word:'Ear', soundsLike:'íar', phonetic:'/ɪər/', prompt:'Escucha y selecciona la imagen:', options:[{text:'Ear',emoji:'👂'},{text:'Nose',emoji:'👃'},{text:'Eye',emoji:'👁️'},{text:'Foot',emoji:'🦶'}], correct:'Ear', es:'Oreja', context:'Listen with ears (Escucha con las orejas)' },
                    { type:'image_select', emoji:'👃', word:'Nose', soundsLike:'nóus', phonetic:'/noʊz/', prompt:'¿Qué parte del cuerpo es?', options:['Nose','Mouth','Eye','Head'], correct:'Nose', es:'Nariz', context:'Smell with nose (Huele con la nariz)' },
                    { type:'translate', prompt:'My hands and my eyes', answer:['Mis','manos','y','mis','ojos'], pool:['Mis','manos','y','mis','ojos','orejas','pies','nariz'], context:'My hands and my eyes (Mis manos y mis ojos)' },
                    { type:'emoji_match', word:'Foot', soundsLike:'fút', phonetic:'/fʊt/', prompt:'¿Cuál es el emoji de Foot?', emojis:['🦶','🖐️','👃','👂'], correct:'🦶', es:'Pie', context:'Walk with your foot (Camina con tu pie)' },
                    { type:'matching', prompt:'Empareja partes del cuerpo:', pairs:[
                        {en:'Eye',es:'👁️ Ojo (ái)'},{en:'Hand',es:'🖐️ Mano (jánd)'},{en:'Ear',es:'👂 Oreja (íar)'},{en:'Nose',es:'👃 Nariz (nóus)'},{en:'Foot',es:'🦶 Pie (fút)'}
                    ]}
                ]},
                { id:'a1-6', name:'Familia & Casa 🏠', icon:'🏠', questions:[
                    { type:'image_select', emoji:'🏠', word:'House', soundsLike:'jáus', phonetic:'/haʊs/', prompt:'¿Qué lugar es este?', options:['House','School','Park','Hospital'], correct:'House', es:'Casa', context:'My house is warm (Mi casa es cálida)' },
                    { type:'emoji_match', word:'Mother', soundsLike:'má-der', phonetic:'/ˈmʌð.ər/', prompt:'¿Cuál es Mother?', emojis:['👩','👨','👧','👦'], correct:'👩', es:'Madre', context:'My mother is kind (Mi madre es amable)' },
                    { type:'listen_select', word:'Father', soundsLike:'fá-der', phonetic:'/ˈfɑː.ðər/', prompt:'Escucha y selecciona:', options:[{text:'Father',emoji:'👨'},{text:'Mother',emoji:'👩'},{text:'Sister',emoji:'👧'},{text:'Brother',emoji:'👦'}], correct:'Father', es:'Padre', context:'My father cooks (Mi padre cocina)' },
                    { type:'image_select', emoji:'🛏️', word:'Bed', soundsLike:'béd', phonetic:'/bed/', prompt:'¿Qué objeto es este?', options:['Bed','Table','Chair','Door'], correct:'Bed', es:'Cama', context:'Sleep in bed (Dormir en la cama)' },
                    { type:'translate', prompt:'I love my family and house', answer:['Amo','a','mi','familia','y','casa'], pool:['Amo','a','mi','familia','y','casa','escuela','amigos'], context:'I love my family and house (Amo a mi familia y casa)' },
                    { type:'matching', prompt:'Empareja familia y hogar:', pairs:[
                        {en:'House',es:'🏠 Casa (jáus)'},{en:'Mother',es:'👩 Madre (má-der)'},{en:'Father',es:'👨 Padre (fá-der)'},{en:'Bed',es:'🛏️ Cama (béd)'},{en:'Family',es:'👨‍👩‍👧‍👦 Familia (fá-mi-li)'}
                    ]}
                ]},
                { id:'a1-7', name:'Números & Tiempo 🔢', icon:'🔢', questions:[
                    { type:'image_select', emoji:'1️⃣', word:'One', soundsLike:'uán', phonetic:'/wʌn/', prompt:'¿Qué número es?', options:['One','Two','Three','Four'], correct:'One', es:'Uno', context:'One apple (Una manzana)' },
                    { type:'emoji_match', word:'Two', soundsLike:'tú', phonetic:'/tuː/', prompt:'¿Cuál es el número Two?', emojis:['2️⃣','1️⃣','3️⃣','4️⃣'], correct:'2️⃣', es:'Dos', context:'Two dogs (Dos perros)' },
                    { type:'listen_select', word:'Three', soundsLike:'zrí', phonetic:'/θriː/', prompt:'Escucha el número:', options:[{text:'Three',emoji:'3️⃣'},{text:'Two',emoji:'2️⃣'},{text:'One',emoji:'1️⃣'},{text:'Four',emoji:'4️⃣'}], correct:'Three', es:'Tres', context:'Three cats (Tres gatos)' },
                    { type:'image_select', emoji:'☀️', word:'Day', soundsLike:'déi', phonetic:'/deɪ/', prompt:'¿Qué momento es?', options:['Day','Night','Clock','Week'], correct:'Day', es:'Día', context:'Have a nice day (Ten un buen día)' },
                    { type:'emoji_match', word:'Night', soundsLike:'náit', phonetic:'/naɪt/', prompt:'¿Cuál representa Night?', emojis:['🌙','☀️','⏰','1️⃣'], correct:'🌙', es:'Noche', context:'Good night (Buenas noches)' },
                    { type:'matching', prompt:'Empareja números y tiempo:', pairs:[
                        {en:'One',es:'1️⃣ Uno (uán)'},{en:'Two',es:'2️⃣ Dos (tú)'},{en:'Three',es:'3️⃣ Tres (zrí)'},{en:'Day',es:'☀️ Día (déi)'},{en:'Night',es:'🌙 Noche (náit)'}
                    ]}
                ]},
                { id:'a1-8', name:'Saludos & Cortesía 👋', icon:'👋', questions:[
                    { type:'image_select', emoji:'👋', word:'Hello', soundsLike:'je-lóu', phonetic:'/həˈloʊ/', prompt:'¿Qué saludo es este?', options:['Hello','Goodbye','Please','Thanks'], correct:'Hello', es:'Hola', context:'Hello, how are you? (Hola, ¿cómo estás?)' },
                    { type:'emoji_match', word:'Please', soundsLike:'plís', phonetic:'/pliːz/', prompt:'¿Cuál representa Please (Por favor)?', emojis:['🙏','👋','✨','👍'], correct:'🙏', es:'Por favor', context:'Help me please (Ayúdame por favor)' },
                    { type:'listen_select', word:'Thank you', soundsLike:'zánk iu', phonetic:'/ˈθæŋk ˌjuː/', prompt:'Escucha la frase de gratitud:', options:[{text:'Thank you',emoji:'✨'},{text:'Hello',emoji:'👋'},{text:'Goodbye',emoji:'🏃'},{text:'Please',emoji:'🙏'}], correct:'Thank you', es:'Gracias', context:'Thank you very much (Muchas gracias)' },
                    { type:'image_select', emoji:'👍', word:'Yes', soundsLike:'yés', phonetic:'/jes/', prompt:'¿Qué afirmación es esta?', options:['Yes','No','Maybe','Please'], correct:'Yes', es:'Sí', context:'Yes, of course (Sí, por supuesto)' },
                    { type:'translate', prompt:'Hello, thank you and goodbye', answer:['Hola','gracias','y','adiós'], pool:['Hola','gracias','y','adiós','por','favor','sí'], context:'Hello, thank you and goodbye (Hola, gracias y adiós)' },
                    { type:'matching', prompt:'Empareja frases de cortesía:', pairs:[
                        {en:'Hello',es:'👋 Hola (je-lóu)'},{en:'Goodbye',es:'👋 Adiós (gud-bái)'},{en:'Please',es:'🙏 Por favor (plís)'},{en:'Thank you',es:'✨ Gracias (zánk iu)'},{en:'Yes',es:'👍 Sí (yés)'}
                    ]}
                ]},
                { id:'a1-9', name:'Ropa & Accesorios 👕', icon:'👕', questions:[
                    { type:'image_select', emoji:'👕', word:'Shirt', soundsLike:'shért', phonetic:'/ʃɜːrt/', prompt:'¿Qué prenda es?', options:['Shirt','Pants','Shoes','Hat'], correct:'Shirt', es:'Camisa / Playera', context:'A clean blue shirt (Una camisa azul limpia)' },
                    { type:'emoji_match', word:'Shoes', soundsLike:'shús', phonetic:'/ʃuːz/', prompt:'¿Cuál es Shoes?', emojis:['👟','👕','👖','🧢'], correct:'👟', es:'Zapatos', context:'Put on your shoes (Ponte tus zapatos)' },
                    { type:'listen_select', word:'Pants', soundsLike:'pánts', phonetic:'/pænts/', prompt:'Escucha la prenda:', options:[{text:'Pants',emoji:'👖'},{text:'Shirt',emoji:'👕'},{text:'Hat',emoji:'🧢'},{text:'Shoes',emoji:'👟'}], correct:'Pants', es:'Pantalones', context:'Black pants (Pantalones negros)' },
                    { type:'image_select', emoji:'🧢', word:'Hat', soundsLike:'ját', phonetic:'/hæt/', prompt:'¿Qué accesorio es?', options:['Hat','Shirt','Shoes','Coat'], correct:'Hat', es:'Gorra / Sombrero', context:'Wear a sun hat (Usa una gorra de sol)' },
                    { type:'matching', prompt:'Empareja ropa y accesorios:', pairs:[
                        {en:'Shirt',es:'👕 Camisa (shért)'},{en:'Pants',es:'👖 Pantalones (pánts)'},{en:'Shoes',es:'👟 Zapatos (shús)'},{en:'Hat',es:'🧢 Gorra (ját)'},{en:'Coat',es:'🧥 Abrigo (kóut)'}
                    ]}
                ]},
                { id:'a1-10', name:'Transportes & Viajes 🚗', icon:'🚗', questions:[
                    { type:'image_select', emoji:'🚗', word:'Car', soundsLike:'kár', phonetic:'/kɑːr/', prompt:'¿Qué transporte es?', options:['Car','Bus','Train','Plane'], correct:'Car', es:'Carro / Auto', context:'Drive a car (Conducir un auto)' },
                    { type:'emoji_match', word:'Bus', soundsLike:'bás', phonetic:'/bʌs/', prompt:'¿Cuál es el Bus?', emojis:['🚌','🚗','✈️','🚆'], correct:'🚌', es:'Autobús', context:'Take the school bus (Tomar el autobús escolar)' },
                    { type:'listen_select', word:'Plane', soundsLike:'pléin', phonetic:'/pleɪn/', prompt:'Escucha el transporte aéreo:', options:[{text:'Plane',emoji:'✈️'},{text:'Car',emoji:'🚗'},{text:'Bus',emoji:'🚌'},{text:'Train',emoji:'🚆'}], correct:'Plane', es:'Avión', context:'Fly in a plane (Volar en avión)' },
                    { type:'image_select', emoji:'🚆', word:'Train', soundsLike:'tréin', phonetic:'/treɪn/', prompt:'¿Qué transporte es?', options:['Train','Car','Plane','Bike'], correct:'Train', es:'Tren', context:'The fast train (El tren rápido)' },
                    { type:'matching', prompt:'Empareja medios de transporte:', pairs:[
                        {en:'Car',es:'🚗 Carro (kár)'},{en:'Bus',es:'🚌 Autobús (bás)'},{en:'Plane',es:'✈️ Avión (pléin)'},{en:'Train',es:'🚆 Tren (tréin)'},{en:'Bike',es:'🚲 Bicicleta (báik)'}
                    ]}
                ]},
                { id:'a1-11', name:'Clima & Naturaleza ☀️', icon:'☀️', questions:[
                    { type:'image_select', emoji:'☀️', word:'Sun', soundsLike:'sán', phonetic:'/sʌn/', prompt:'¿Qué elemento del clima es?', options:['Sun','Rain','Snow','Wind'], correct:'Sun', es:'Sol', context:'The sun is hot (El sol está caliente)' },
                    { type:'emoji_match', word:'Rain', soundsLike:'réin', phonetic:'/reɪn/', prompt:'¿Cuál es Rain?', emojis:['🌧️','☀️','❄️','💨'], correct:'🌧️', es:'Lluvia', context:'Water from rain (Agua de la lluvia)' },
                    { type:'listen_select', word:'Snow', soundsLike:'snóu', phonetic:'/snoʊ/', prompt:'Escucha la palabra de frío:', options:[{text:'Snow',emoji:'❄️'},{text:'Sun',emoji:'☀️'},{text:'Rain',emoji:'🌧️'},{text:'Wind',emoji:'💨'}], correct:'Snow', es:'Nieve', context:'White winter snow (Nieve blanca de invierno)' },
                    { type:'image_select', emoji:'🌳', word:'Tree', soundsLike:'trí', phonetic:'/triː/', prompt:'¿Qué elemento natural es?', options:['Tree','Flower','Sun','Sky'], correct:'Tree', es:'Árbol', context:'A tall green tree (Un árbol verde alto)' },
                    { type:'matching', prompt:'Empareja clima y naturaleza:', pairs:[
                        {en:'Sun',es:'☀️ Sol (sán)'},{en:'Rain',es:'🌧️ Lluvia (réin)'},{en:'Snow',es:'❄️ Nieve (snóu)'},{en:'Tree',es:'🌳 Árbol (trí)'},{en:'Flower',es:'🌸 Flor (fláu-er)'}
                    ]}
                ]},
                { id:'a1-12', name:'Emociones & Estados 😊', icon:'😊', questions:[
                    { type:'image_select', emoji:'😊', word:'Happy', soundsLike:'já-pi', phonetic:'/ˈhæp.i/', prompt:'¿Qué emoción es?', options:['Happy','Sad','Tired','Angry'], correct:'Happy', es:'Feliz', context:'I feel happy today (Me siento feliz hoy)' },
                    { type:'emoji_match', word:'Sad', soundsLike:'sád', phonetic:'/sæd/', prompt:'¿Cuál es Sad?', emojis:['😢','😊','😴','😡'], correct:'😢', es:'Triste', context:'Don’t be sad (No estés triste)' },
                    { type:'listen_select', word:'Tired', soundsLike:'tái-erd', phonetic:'/ˈtaɪərd/', prompt:'Escucha el estado físico:', options:[{text:'Tired',emoji:'😴'},{text:'Happy',emoji:'😊'},{text:'Sad',emoji:'😢'},{text:'Angry',emoji:'😡'}], correct:'Tired', es:'Cansado', context:'I am tired after running (Estoy cansado después de correr)' },
                    { type:'image_select', emoji:'🔥', word:'Hot', soundsLike:'jót', phonetic:'/hɑːt/', prompt:'¿Qué sensación es?', options:['Hot','Cold','Big','Small'], correct:'Hot', es:'Caliente / Calor', context:'Hot tea (Té caliente)' },
                    { type:'matching', prompt:'Empareja emociones y estados:', pairs:[
                        {en:'Happy',es:'😊 Feliz (já-pi)'},{en:'Sad',es:'😢 Triste (sád)'},{en:'Tired',es:'😴 Cansado (tái-erd)'},{en:'Hot',es:'🔥 Caliente (jót)'},{en:'Cold',es:'❄️ Frío (kóuld)'}
                    ]}
                ]}
            ]
        },
        A2: {
            title: "Elemental & Vida Cotidiana (A2)",
            desc: "12 Unidades funcionales: Rutinas, escuela, ciudad, compras, restaurante, deportes, viajes, salud, hobbies, tecnología, campo y direcciones",
            lessons: [
                { id:'a2-1', name:'Rutina Diaria ⏰', icon:'⏰', questions:[
                    { type:'image_select', emoji:'🌅', word:'Wake up', soundsLike:'uéik áp', phonetic:'/weɪk ʌp/', prompt:'¿Qué acción es?', options:['Wake up','Sleep','Shower','Cook'], correct:'Wake up', es:'Despertarse', context:'I wake up at 7 AM (Me despierto a las 7 AM)' },
                    { type:'emoji_match', word:'Breakfast', soundsLike:'brék-fast', phonetic:'/ˈbrek.fəst/', prompt:'¿Cuál es Breakfast?', emojis:['🍳','🚿','🛏️','💼'], correct:'🍳', es:'Desayuno', context:'Eat a healthy breakfast (Comer un desayuno saludable)' },
                    { type:'listen_select', word:'Shower', soundsLike:'sháu-er', phonetic:'/ˈʃaʊ.ər/', prompt:'Escucha la rutina matutina:', options:[{text:'Shower',emoji:'🚿'},{text:'Breakfast',emoji:'🍳'},{text:'Work',emoji:'💼'},{text:'Sleep',emoji:'🛏️'}], correct:'Shower', es:'Ducha / Bañarse', context:'Take a warm shower (Tomar una ducha caliente)' },
                    { type:'translate', prompt:'I wake up and eat breakfast', answer:['Me','despierto','y','como','desayuno'], pool:['Me','despierto','y','como','desayuno','cena','ducha'], context:'I wake up and eat breakfast (Me despierto y como desayuno)' },
                    { type:'matching', prompt:'Empareja acciones de la rutina diaria:', pairs:[
                        {en:'Wake up',es:'🌅 Despertarse (uéik áp)'},{en:'Breakfast',es:'🍳 Desayuno (brék-fast)'},{en:'Shower',es:'🚿 Ducha (sháu-er)'},{en:'Work',es:'💼 Trabajar (uérk)'},{en:'Sleep',es:'🛏️ Dormir (slíp)'}
                    ]}
                ]},
                { id:'a2-2', name:'Escuela & Oficina 📚', icon:'📚', questions:[
                    { type:'image_select', emoji:'💻', word:'Computer', soundsLike:'kom-piú-ter', phonetic:'/kəmˈpjuː.tər/', prompt:'¿Qué herramienta es?', options:['Computer','Book','Pencil','Desk'], correct:'Computer', es:'Computadora', context:'Work on the computer (Trabajar en la computadora)' },
                    { type:'emoji_match', word:'Book', soundsLike:'búk', phonetic:'/bʊk/', prompt:'¿Cuál es Book?', emojis:['📖','💻','✏️','🏫'], correct:'📖', es:'Libro', context:'Read an interesting book (Leer un libro interesante)' },
                    { type:'listen_select', word:'Teacher', soundsLike:'tí-cher', phonetic:'/ˈtiː.tʃər/', prompt:'Escucha la profesión educativa:', options:[{text:'Teacher',emoji:'👩‍🏫'},{text:'Student',emoji:'🧑‍🎓'},{text:'Doctor',emoji:'👨‍⚕️'},{text:'Chef',emoji:'👨‍🍳'}], correct:'Teacher', es:'Profesor / Maestra', context:'The teacher explains the lesson (La maestra explica la lección)' },
                    { type:'matching', prompt:'Empareja escuela y oficina:', pairs:[
                        {en:'Computer',es:'💻 Computadora (kom-piú-ter)'},{en:'Book',es:'📖 Libro (búk)'},{en:'Teacher',es:'👩‍🏫 Profesor (tí-cher)'},{en:'Desk',es:'🪑 Escritorio (désk)'},{en:'Pencil',es:'✏️ Lápiz (pén-sil)'}
                    ]}
                ]},
                { id:'a2-3', name:'En la Ciudad 🏙️', icon:'🏙️', questions:[
                    { type:'image_select', emoji:'🏥', word:'Hospital', soundsLike:'jós-pi-tal', phonetic:'/ˈhɑː.spɪ.t̬əl/', prompt:'¿Qué lugar público es?', options:['Hospital','Bank','Park','Store'], correct:'Hospital', es:'Hospital', context:'Go to the hospital (Ir al hospital)' },
                    { type:'emoji_match', word:'Park', soundsLike:'párk', phonetic:'/pɑːrk/', prompt:'¿Cuál es el Park?', emojis:['🌳','🏥','🏦','🏬'], correct:'🌳', es:'Parque', context:'Walk in the green park (Caminar en el parque verde)' },
                    { type:'listen_select', word:'Bank', soundsLike:'bánk', phonetic:'/bæŋk/', prompt:'Escucha el lugar financiero:', options:[{text:'Bank',emoji:'🏦'},{text:'Hospital',emoji:'🏥'},{text:'Park',emoji:'🌳'},{text:'Store',emoji:'🏬'}], correct:'Bank', es:'Banco', context:'Get money at the bank (Obtener dinero en el banco)' },
                    { type:'matching', prompt:'Empareja lugares de la ciudad:', pairs:[
                        {en:'Hospital',es:'🏥 Hospital (jós-pi-tal)'},{en:'Park',es:'🌳 Parque (párk)'},{en:'Bank',es:'🏦 Banco (bánk)'},{en:'Store',es:'🏬 Tienda (stór)'},{en:'Street',es:'🛣️ Calle (strít)'}
                    ]}
                ]},
                { id:'a2-4', name:'De Compras & Supermercado 🛒', icon:'🛒', questions:[
                    { type:'image_select', emoji:'💵', word:'Money', soundsLike:'má-ni', phonetic:'/ˈmʌn.i/', prompt:'¿Qué concepto es?', options:['Money','Price','Buy','Store'], correct:'Money', es:'Dinero', context:'Save your money (Ahorra tu dinero)' },
                    { type:'emoji_match', word:'Price', soundsLike:'práis', phonetic:'/praɪs/', prompt:'¿Cuál representa Price (Precio)?', emojis:['🏷️','💵','🛒','💳'], correct:'🏷️', es:'Precio', context:'What is the price? (¿Cuál es el precio?)' },
                    { type:'listen_select', word:'Buy', soundsLike:'bái', phonetic:'/baɪ/', prompt:'Escucha el verbo de compra:', options:[{text:'Buy',emoji:'🛍️'},{text:'Sell',emoji:'🏷️'},{text:'Pay',emoji:'💳'},{text:'Cost',emoji:'💵'}], correct:'Buy', es:'Comprar', context:'I want to buy fruit (Quiero comprar fruta)' },
                    { type:'matching', prompt:'Empareja compras y mercado:', pairs:[
                        {en:'Money',es:'💵 Dinero (má-ni)'},{en:'Price',es:'🏷️ Precio (práis)'},{en:'Buy',es:'🛍️ Comprar (bái)'},{en:'Pay',es:'💳 Pagar (péi)'},{en:'Cheap',es:'📉 Barato (chíp)'}
                    ]}
                ]},
                { id:'a2-5', name:'Restaurante & Pedidos 🍽️', icon:'🍽️', questions:[
                    { type:'image_select', emoji:'📜', word:'Menu', soundsLike:'mé-niu', phonetic:'/ˈmen.juː/', prompt:'¿Qué documento es?', options:['Menu','Bill','Table','Plate'], correct:'Menu', es:'Menú / Carta', context:'Can I see the menu? (¿Puedo ver el menú?)' },
                    { type:'emoji_match', word:'Delicious', soundsLike:'de-lí-shas', phonetic:'/dɪˈlɪʃ.əs/', prompt:'¿Cuál representa Delicious?', emojis:['😋','📜','🧾','🍴'], correct:'😋', es:'Delicioso', context:'The pasta is delicious (La pasta está deliciosa)' },
                    { type:'listen_select', word:'Bill', soundsLike:'bíl', phonetic:'/bɪl/', prompt:'Escucha la palabra de cuenta:', options:[{text:'Bill',emoji:'🧾'},{text:'Menu',emoji:'📜'},{text:'Fork',emoji:'🍴'},{text:'Water',emoji:'💧'}], correct:'Bill', es:'Cuenta / Factura', context:'The bill please (La cuenta por favor)' },
                    { type:'matching', prompt:'Empareja términos de restaurante:', pairs:[
                        {en:'Menu',es:'📜 Menú (mé-niu)'},{en:'Delicious',es:'😋 Delicioso (de-lí-shas)'},{en:'Bill',es:'🧾 Cuenta (bíl)'},{en:'Fork',es:'🍴 Tenedor (fórk)'},{en:'Order',es:'📋 Pedir / Ordenar (ór-der)'}
                    ]}
                ]},
                { id:'a2-6', name:'Deportes & Tiempo Libre ⚽', icon:'⚽', questions:[
                    { type:'image_select', emoji:'⚽', word:'Soccer', soundsLike:'só-ker', phonetic:'/ˈsɑː.kɚ/', prompt:'¿Qué deporte es?', options:['Soccer','Basketball','Tennis','Run'], correct:'Soccer', es:'Fútbol', context:'Play soccer with friends (Jugar fútbol con amigos)' },
                    { type:'emoji_match', word:'Run', soundsLike:'rán', phonetic:'/rʌn/', prompt:'¿Cuál es Run?', emojis:['🏃','⚽','🏊','🏋️'], correct:'🏃', es:'Correr', context:'Run in the morning (Correr por la mañana)' },
                    { type:'listen_select', word:'Swim', soundsLike:'suím', phonetic:'/swɪm/', prompt:'Escucha el deporte acuático:', options:[{text:'Swim',emoji:'🏊'},{text:'Run',emoji:'🏃'},{text:'Play',emoji:'⚽'},{text:'Gym',emoji:'🏋️'}], correct:'Swim', es:'Nadar', context:'Swim in the pool (Nadar en la alberca)' },
                    { type:'matching', prompt:'Empareja deportes y actividades:', pairs:[
                        {en:'Soccer',es:'⚽ Fútbol (só-ker)'},{en:'Run',es:'🏃 Correr (rán)'},{en:'Swim',es:'🏊 Nadar (suím)'},{en:'Tennis',es:'🎾 Tenis (té-nis)'},{en:'Gym',es:'🏋️ Gimnasio (jím)'}
                    ]}
                ]},
                { id:'a2-7', name:'Viajes & Aeropuerto ✈️', icon:'✈️', questions:[
                    { type:'image_select', emoji:'🛂', word:'Passport', soundsLike:'pás-port', phonetic:'/ˈpæs.pɔːrt/', prompt:'¿Qué documento de viaje es?', options:['Passport','Ticket','Luggage','Hotel'], correct:'Passport', es:'Pasaporte', context:'Show your passport (Muestra tu pasaporte)' },
                    { type:'emoji_match', word:'Luggage', soundsLike:'lá-guej', phonetic:'/ˈlʌɡ.ɪdʒ/', prompt:'¿Cuál es Luggage?', emojis:['🧳','🛂','🎫','🏨'], correct:'🧳', es:'Equipaje / Maleta', context:'Heavy luggage (Equipaje pesado)' },
                    { type:'listen_select', word:'Hotel', soundsLike:'jou-tél', phonetic:'/hoʊˈtel/', prompt:'Escucha el lugar de descanso:', options:[{text:'Hotel',emoji:'🏨'},{text:'Airport',emoji:'✈️'},{text:'Beach',emoji:'🏖️'},{text:'Ticket',emoji:'🎫'}], correct:'Hotel', es:'Hotel', context:'Book a nice hotel (Reservar un buen hotel)' },
                    { type:'matching', prompt:'Empareja términos de viaje:', pairs:[
                        {en:'Passport',es:'🛂 Pasaporte (pás-port)'},{en:'Luggage',es:'🧳 Equipaje (lá-guej)'},{en:'Hotel',es:'🏨 Hotel (jou-tél)'},{en:'Ticket',es:'🎫 Boleto (tí-ket)'},{en:'Flight',es:'✈️ Vuelo (fláit)'}
                    ]}
                ]},
                { id:'a2-8', name:'Salud & En el Médico 🏥', icon:'🏥', questions:[
                    { type:'image_select', emoji:'👨‍⚕️', word:'Doctor', soundsLike:'dók-tor', phonetic:'/ˈdɑːk.tɚ/', prompt:'¿Qué profesional de la salud es?', options:['Doctor','Dentist','Nurse','Patient'], correct:'Doctor', es:'Médico / Doctor', context:'The doctor checks the patient (El doctor revisa al paciente)' },
                    { type:'emoji_match', word:'Medicine', soundsLike:'mé-di-sin', phonetic:'/ˈmed.ə.sɪn/', prompt:'¿Cuál es Medicine?', emojis:['💊','👨‍⚕️','🩹','🌡️'], correct:'💊', es:'Medicina / Pastilla', context:'Take your medicine (Toma tu medicina)' },
                    { type:'listen_select', word:'Healthy', soundsLike:'jél-zi', phonetic:'/ˈhel.θi/', prompt:'Escucha el adjetivo de bienestar:', options:[{text:'Healthy',emoji:'🥗'},{text:'Pain',emoji:'🩹'},{text:'Doctor',emoji:'👨‍⚕️'},{text:'Sick',emoji:'🤒'}], correct:'Healthy', es:'Saludable', context:'Eat healthy food (Come comida saludable)' },
                    { type:'matching', prompt:'Empareja salud y medicina:', pairs:[
                        {en:'Doctor',es:'👨‍⚕️ Doctor (dók-tor)'},{en:'Medicine',es:'💊 Medicina (mé-di-sin)'},{en:'Healthy',es:'🥗 Saludable (jél-zi)'},{en:'Fever',es:'🌡️ Fiebre (fí-ver)'},{en:'Dentist',es:'🦷 Dentista (dén-tist)'}
                    ]}
                ]},
                { id:'a2-9', name:'Música & Pasatiempos 🎸', icon:'🎸', questions:[
                    { type:'image_select', emoji:'🎸', word:'Guitar', soundsLike:'gui-tár', phonetic:'/ɡɪˈtɑːr/', prompt:'¿Qué instrumento musical es?', options:['Guitar','Piano','Drums','Sing'], correct:'Guitar', es:'Guitarra', context:'Play acoustic guitar (Tocar guitarra acústica)' },
                    { type:'emoji_match', word:'Sing', soundsLike:'sing', phonetic:'/sɪŋ/', prompt:'¿Cuál es Sing?', emojis:['🎤','🎸','💃','🎨'], correct:'🎤', es:'Cantar', context:'Sing a happy song (Cantar una canción feliz)' },
                    { type:'listen_select', word:'Dance', soundsLike:'dáns', phonetic:'/dæns/', prompt:'Escucha la actividad artística:', options:[{text:'Dance',emoji:'💃'},{text:'Sing',emoji:'🎤'},{text:'Read',emoji:'📖'},{text:'Paint',emoji:'🎨'}], correct:'Dance', es:'Bailar', context:'Dance to the rhythm (Bailar al ritmo)' },
                    { type:'matching', prompt:'Empareja música y pasatiempos:', pairs:[
                        {en:'Guitar',es:'🎸 Guitarra (gui-tár)'},{en:'Sing',es:'🎤 Cantar (sing)'},{en:'Dance',es:'💃 Bailar (dáns)'},{en:'Paint',es:'🎨 Pintar (péint)'},{en:'Read',es:'📖 Leer (ríd)'}
                    ]}
                ]},
                { id:'a2-10', name:'Tecnología & Teléfonos 📱', icon:'📱', questions:[
                    { type:'image_select', emoji:'📱', word:'Phone', soundsLike:'fóun', phonetic:'/foʊn/', prompt:'¿Qué dispositivo es?', options:['Phone','Computer','Tablet','Camera'], correct:'Phone', es:'Teléfono / Celular', context:'Answer the phone (Responder al teléfono)' },
                    { type:'emoji_match', word:'Message', soundsLike:'mé-sej', phonetic:'/ˈmes.ɪdʒ/', prompt:'¿Cuál es Message?', emojis:['💬','📱','🌐','🔋'], correct:'💬', es:'Mensaje', context:'Send a quick message (Enviar un mensaje rápido)' },
                    { type:'listen_select', word:'Internet', soundsLike:'ín-ter-net', phonetic:'/ˈɪn.t̬ɚ.net/', prompt:'Escucha el término de red:', options:[{text:'Internet',emoji:'🌐'},{text:'Phone',emoji:'📱'},{text:'Screen',emoji:'🖥️'},{text:'Battery',emoji:'🔋'}], correct:'Internet', es:'Internet', context:'Connect to the internet (Conectarse a internet)' },
                    { type:'matching', prompt:'Empareja tecnología digital:', pairs:[
                        {en:'Phone',es:'📱 Teléfono (fóun)'},{en:'Message',es:'💬 Mensaje (mé-sej)'},{en:'Internet',es:'🌐 Internet (ín-ter-net)'},{en:'Battery',es:'🔋 Batería (bá-te-ri)'},{en:'Screen',es:'🖥️ Pantalla (skrín)'}
                    ]}
                ]},
                { id:'a2-11', name:'Mascotas & El Campo 🐕', icon:'🐕', questions:[
                    { type:'image_select', emoji:'🐴', word:'Horse', soundsLike:'jors', phonetic:'/hɔːrs/', prompt:'¿Qué animal de campo es?', options:['Horse','Sheep','Cow','Dog'], correct:'Horse', es:'Caballo', context:'Ride a fast horse (Montar un caballo rápido)' },
                    { type:'emoji_match', word:'Garden', soundsLike:'gár-den', phonetic:'/ˈɡɑːr.dən/', prompt:'¿Cuál es Garden?', emojis:['🏡','🐴','🌳','🐕'], correct:'🏡', es:'Jardín', context:'Flowers in the garden (Flores en el jardín)' },
                    { type:'listen_select', word:'River', soundsLike:'rí-ver', phonetic:'/ˈrɪv.ɚ/', prompt:'Escucha el elemento natural:', options:[{text:'River',emoji:'🏞️'},{text:'Forest',emoji:'🌲'},{text:'Farm',emoji:'🚜'},{text:'Garden',emoji:'🏡'}], correct:'River', es:'Río', context:'Clear water river (Río de agua clara)' },
                    { type:'matching', prompt:'Empareja campo y naturaleza:', pairs:[
                        {en:'Horse',es:'🐴 Caballo (jors)'},{en:'Garden',es:'🏡 Jardín (gár-den)'},{en:'River',es:'🏞️ Río (rí-ver)'},{en:'Forest',es:'🌲 Bosque (fó-rest)'},{en:'Farm',es:'🚜 Granja (fárm)'}
                    ]}
                ]},
                { id:'a2-12', name:'Direcciones & Orientación 🗺️', icon:'🗺️', questions:[
                    { type:'image_select', emoji:'⬅️', word:'Left', soundsLike:'left', phonetic:'/left/', prompt:'¿Qué dirección es?', options:['Left','Right','Straight','Near'], correct:'Left', es:'Izquierda', context:'Turn left at corner (Gira a la izquierda en la esquina)' },
                    { type:'emoji_match', word:'Right', soundsLike:'ráit', phonetic:'/raɪt/', prompt:'¿Cuál es Right?', emojis:['➡️','⬅️','⬆️','🗺️'], correct:'➡️', es:'Derecha', context:'Turn right now (Gira a la derecha ahora)' },
                    { type:'listen_select', word:'Straight', soundsLike:'stréit', phonetic:'/streɪt/', prompt:'Escucha la indicación:', options:[{text:'Straight',emoji:'⬆️'},{text:'Left',emoji:'⬅️'},{text:'Right',emoji:'➡️'},{text:'Near',emoji:'📍'}], correct:'Straight', es:'Derecho / Todo recto', context:'Go straight ahead (Ve todo recto hacia adelante)' },
                    { type:'matching', prompt:'Empareja direcciones:', pairs:[
                        {en:'Left',es:'⬅️ Izquierda (left)'},{en:'Right',es:'➡️ Derecha (ráit)'},{en:'Straight',es:'⬆️ Recto (stréit)'},{en:'Near',es:'📍 Cerca (níar)'},{en:'Far',es:'🔭 Lejos (fár)'}
                    ]}
                ]}
            ]
        },
        B1: {
            title: "Intermedio & Conversación Fluida (B1)",
            desc: "12 Unidades intermedias: Entrevistas de trabajo, metas, IA, ecología, debates, cine, aventuras, cocina mundial, redes sociales, emergencias, relaciones y negociación",
            lessons: [
                { id:'b1-1', name:'Entrevista de Trabajo 💼', icon:'💼', questions:[
                    { type:'image_select', emoji:'📄', word:'Resume', soundsLike:'ré-zu-méi', phonetic:'/ˈrez.ə.meɪ/', prompt:'¿Qué documento profesional es?', options:['Resume','Interview','Skills','Salary'], correct:'Resume', es:'Currículum / CV', context:'Send your updated resume (Envía tu currículum actualizado)' },
                    { type:'emoji_match', word:'Skills', soundsLike:'skils', phonetic:'/skɪlz/', prompt:'¿Cuál representa Habilidades (Skills)?', emojis:['🎯','📄','🤝','💰'], correct:'🎯', es:'Habilidades', context:'Highlight your technical skills (Destaca tus habilidades técnicas)' },
                    { type:'listen_select', word:'Salary', soundsLike:'sá-la-ri', phonetic:'/ˈsæl.ɚ.i/', prompt:'Escucha el término de compensación:', options:[{text:'Salary',emoji:'💰'},{text:'Resume',emoji:'📄'},{text:'Skills',emoji:'🎯'},{text:'Interview',emoji:'🤝'}], correct:'Salary', es:'Salario / Sueldo', context:'Competitive annual salary (Salario anual competitivo)' },
                    { type:'translate', prompt:'I have experience and strong teamwork skills', answer:['Tengo','experiencia','y','habilidades','de','trabajo','en','equipo'], pool:['Tengo','experiencia','y','habilidades','de','trabajo','en','equipo','dinero','solicitud'], context:'I have experience and strong teamwork skills (Tengo experiencia y habilidades de trabajo en equipo)' },
                    { type:'matching', prompt:'Empareja vocabulario laboral B1:', pairs:[
                        {en:'Resume',es:'📄 Currículum (ré-zu-méi)'},{en:'Skills',es:'🎯 Habilidades (skils)'},{en:'Salary',es:'💰 Salario (sá-la-ri)'},{en:'Interview',es:'🤝 Entrevista (ín-ter-viu)'},{en:'Experience',es:'📈 Experiencia (eks-pí-riens)'}
                    ]}
                ]},
                { id:'b1-2', name:'Metas & Planes Futuros 🎯', icon:'🎯', questions:[
                    { type:'image_select', emoji:'🎓', word:'Graduate', soundsLike:'grá-dju-eit', phonetic:'/ˈɡrædʒ.u.eɪt/', prompt:'¿Qué logro académico es?', options:['Graduate','Career','Achieve','Goal'], correct:'Graduate', es:'Graduarse', context:'I will graduate from university (Me graduaré de la universidad)' },
                    { type:'emoji_match', word:'Goal', soundsLike:'góul', phonetic:'/ɡoʊl/', prompt:'¿Cuál representa Meta (Goal)?', emojis:['🏆','🎓','🚀','🗺️'], correct:'🏆', es:'Meta / Objetivo', context:'Reach your professional goal (Alcanza tu meta profesional)' },
                    { type:'listen_select', word:'Achieve', soundsLike:'a-chív', phonetic:'/əˈtʃiːv/', prompt:'Escucha el verbo de éxito:', options:[{text:'Achieve',emoji:'🚀'},{text:'Graduate',emoji:'🎓'},{text:'Goal',emoji:'🏆'},{text:'Career',emoji:'💼'}], correct:'Achieve', es:'Lograr / Alcanzar', context:'Achieve your dreams (Logra tus sueños)' },
                    { type:'matching', prompt:'Empareja metas y ambiciones:', pairs:[
                        {en:'Graduate',es:'🎓 Graduarse (grá-dju-eit)'},{en:'Goal',es:'🏆 Meta (góul)'},{en:'Achieve',es:'🚀 Lograr (a-chív)'},{en:'Career',es:'💼 Carrera (ka-ríer)'},{en:'Dream',es:'✨ Sueño (drím)'}
                    ]}
                ]},
                { id:'b1-3', name:'Tecnología & El Futuro 🤖', icon:'🤖', questions:[
                    { type:'image_select', emoji:'🤖', word:'Artificial Intelligence', soundsLike:'ar-ti-fí-shal in-té-li-jens', phonetic:'/ˌɑːr.t̬ə.fɪʃ.əl ɪnˈtel.ə.dʒəns/', prompt:'¿Qué tecnología de vanguardia es?', options:['Artificial Intelligence','Software','Device','Network'], correct:'Artificial Intelligence', es:'Inteligencia Artificial', context:'AI changes the modern world (La IA transforma el mundo moderno)' },
                    { type:'emoji_match', word:'Innovation', soundsLike:'i-nou-véi-shan', phonetic:'/ˌɪn.əˈveɪ.ʃən/', prompt:'¿Cuál representa Innovación (Innovation)?', emojis:['💡','🤖','📱','⚙️'], correct:'💡', es:'Innovación', context:'Constant technological innovation (Innovación tecnológica constante)' },
                    { type:'listen_select', word:'Software', soundsLike:'sóft-uer', phonetic:'/ˈsɑːft.wer/', prompt:'Escucha el término informático:', options:[{text:'Software',emoji:'💻'},{text:'Innovation',emoji:'💡'},{text:'Device',emoji:'📱'},{text:'Robot',emoji:'🤖'}], correct:'Software', es:'Software / Programa', context:'Develop cutting-edge software (Desarrollar software de vanguardia)' },
                    { type:'matching', prompt:'Empareja conceptos tecnológicos:', pairs:[
                        {en:'AI',es:'🤖 Inteligencia Artificial'},{en:'Innovation',es:'💡 Innovación (i-nou-véi-shan)'},{en:'Software',es:'💻 Software (sóft-uer)'},{en:'Device',es:'📱 Dispositivo (di-váis)'},{en:'Network',es:'🌐 Red (nét-uork)'}
                    ]}
                ]},
                { id:'b1-4', name:'Medio Ambiente & Clima 🌍', icon:'🌍', questions:[
                    { type:'image_select', emoji:'♻️', word:'Recycle', soundsLike:'ri-sái-kol', phonetic:'/ˌriːˈsaɪ.kəl/', prompt:'¿Qué acción ecológica es?', options:['Recycle','Pollution','Protect','Energy'], correct:'Recycle', es:'Reciclar', context:'Recycle plastic and glass (Reciclar plástico y vidrio)' },
                    { type:'emoji_match', word:'Climate', soundsLike:'klái-mit', phonetic:'/ˈklaɪ.mət/', prompt:'¿Cuál es Climate?', emojis:['🌡️','♻️','🏭','🌱'], correct:'🌡️', es:'Clima', context:'Global climate change (Cambio climático global)' },
                    { type:'listen_select', word:'Protect', soundsLike:'pro-tékt', phonetic:'/prəˈtekt/', prompt:'Escucha el verbo de conservación:', options:[{text:'Protect',emoji:'🛡️'},{text:'Recycle',emoji:'♻️'},{text:'Pollute',emoji:'🏭'},{text:'Energy',emoji:'⚡'}], correct:'Protect', es:'Proteger / Cuidar', context:'Protect the endangered planet (Proteger el planeta en peligro)' },
                    { type:'matching', prompt:'Empareja términos ecológicos:', pairs:[
                        {en:'Recycle',es:'♻️ Reciclar (ri-sái-kol)'},{en:'Climate',es:'🌡️ Clima (klái-mit)'},{en:'Protect',es:'🛡️ Proteger (pro-tékt)'},{en:'Pollution',es:'🏭 Contaminación (po-lú-shan)'},{en:'Energy',es:'⚡ Energía (é-ner-ji)'}
                    ]}
                ]},
                { id:'b1-5', name:'Opiniones & Debates 🗣️', icon:'🗣️', questions:[
                    { type:'image_select', emoji:'🤝', word:'Agree', soundsLike:'a-grí', phonetic:'/əˈɡriː/', prompt:'¿Qué postura es estar de acuerdo?', options:['Agree','Disagree','Believe','Argue'], correct:'Agree', es:'Estar de acuerdo', context:'I completely agree with you (Estoy completamente de acuerdo contigo)' },
                    { type:'emoji_match', word:'Disagree', soundsLike:'dis-a-grí', phonetic:'/ˌdɪs.əˈɡriː/', prompt:'¿Cuál es Disagree?', emojis:['🙅','🤝','💭','📢'], correct:'🙅', es:'Estar en desacuerdo', context:'I respectfully disagree (Estoy en desacuerdo respetuosamente)' },
                    { type:'listen_select', word:'Perspective', soundsLike:'per-spék-tiv', phonetic:'/pɚˈspek.tɪv/', prompt:'Escucha la palabra de punto de vista:', options:[{text:'Perspective',emoji:'👁️'},{text:'Agree',emoji:'🤝'},{text:'Disagree',emoji:'🙅'},{text:'Debate',emoji:'🗣️'}], correct:'Perspective', es:'Perspectiva / Punto de vista', context:'From my perspective (Desde mi perspectiva)' },
                    { type:'matching', prompt:'Empareja vocabulario de debate:', pairs:[
                        {en:'Agree',es:'🤝 De acuerdo (a-grí)'},{en:'Disagree',es:'🙅 Desacuerdo (dis-a-grí)'},{en:'Perspective',es:'👁️ Perspectiva (per-spék-tiv)'},{en:'Argument',es:'📢 Argumento (ár-guiu-ment)'},{en:'Believe',es:'💭 Creer (bi-lív)'}
                    ]}
                ]},
                { id:'b1-6', name:'Cine, Arte & Cultura 🎭', icon:'🎭', questions:[
                    { type:'image_select', emoji:'🎬', word:'Director', soundsLike:'di-rék-tor', phonetic:'/daɪˈrek.tɚ/', prompt:'¿Quién dirige una película?', options:['Director','Actor','Artist','Writer'], correct:'Director', es:'Director de cine', context:'The film director wins an award (El director de cine gana un premio)' },
                    { type:'emoji_match', word:'Culture', soundsLike:'kál-cher', phonetic:'/ˈkʌl.tʃɚ/', prompt:'¿Cuál representa Cultura (Culture)?', emojis:['🏛️','🎬','🎨','🎭'], correct:'🏛️', es:'Cultura', context:'Rich ancient culture (Rica cultura milenaria)' },
                    { type:'listen_select', word:'Performance', soundsLike:'per-fór-mans', phonetic:'/pɚˈfɔːr.məns/', prompt:'Escucha el término de actuación:', options:[{text:'Performance',emoji:'🎭'},{text:'Director',emoji:'🎬'},{text:'Culture',emoji:'🏛️'},{text:'Cinema',emoji:'🍿'}], correct:'Performance', es:'Actuación / Desempeño', context:'Outstanding artistic performance (Destacada actuación artística)' },
                    { type:'matching', prompt:'Empareja arte y entretenimiento:', pairs:[
                        {en:'Director',es:'🎬 Director (di-rék-tor)'},{en:'Culture',es:'🏛️ Cultura (kál-cher)'},{en:'Performance',es:'🎭 Actuación (per-fór-mans)'},{en:'Actor',es:'🌟 Actor (ák-tor)'},{en:'Cinema',es:'🍿 Cine (sí-ne-ma)'}
                    ]}
                ]},
                { id:'b1-7', name:'Viajes & Aventuras 🎒', icon:'🎒', questions:[
                    { type:'image_select', emoji:'🏔️', word:'Mountain', soundsLike:'máun-ten', phonetic:'/ˈmaʊn.tən/', prompt:'¿Qué relieve geográfico es?', options:['Mountain','Beach','Desert','Forest'], correct:'Mountain', es:'Montaña', context:'Climb the snowy mountain (Escalar la montaña nevada)' },
                    { type:'emoji_match', word:'Explore', soundsLike:'eks-plór', phonetic:'/ɪkˈsplɔːr/', prompt:'¿Cuál es Explore?', emojis:['🧭','🏔️','🎒','⛺'], correct:'🧭', es:'Explorar', context:'Explore new countries (Explorar nuevos países)' },
                    { type:'listen_select', word:'Journey', soundsLike:'jér-ni', phonetic:'/ˈdʒɝː.ni/', prompt:'Escucha la palabra de travesía:', options:[{text:'Journey',emoji:'✈️'},{text:'Mountain',emoji:'🏔️'},{text:'Camp',emoji:'⛺'},{text:'Map',emoji:'🗺️'}], correct:'Journey', es:'Viaje / Travesía', context:'An incredible life journey (Una increíble travesía de vida)' },
                    { type:'matching', prompt:'Empareja términos de expedición:', pairs:[
                        {en:'Mountain',es:'🏔️ Montaña (máun-ten)'},{en:'Explore',es:'🧭 Explorar (eks-plór)'},{en:'Journey',es:'✈️ Travesía (jér-ni)'},{en:'Adventure',es:'🎒 Aventura (ad-vén-cher)'},{en:'Camp',es:'⛺ Acampar (kámp)'}
                    ]}
                ]},
                { id:'b1-8', name:'Gastronomía Mundial 🥘', icon:'🥘', questions:[
                    { type:'image_select', emoji:'📖', word:'Recipe', soundsLike:'ré-si-pi', phonetic:'/ˈres.ə.pi/', prompt:'¿Qué guía de cocina es?', options:['Recipe','Ingredient','Flavor','Chef'], correct:'Recipe', es:'Receta', context:'Follow the secret recipe (Sigue la receta secreta)' },
                    { type:'emoji_match', word:'Flavor', soundsLike:'fléi-ver', phonetic:'/ˈfleɪ.vɚ/', prompt:'¿Cuál representa Flavor (Sabor)?', emojis:['👅','📖','🌶️','🥘'], correct:'👅', es:'Sabor', context:'Rich aromatic flavor (Rico sabor aromático)' },
                    { type:'listen_select', word:'Ingredient', soundsLike:'in-grí-di-ent', phonetic:'/ɪnˈɡriː.di.ənt/', prompt:'Escucha el término culinario:', options:[{text:'Ingredient',emoji:'🧅'},{text:'Recipe',emoji:'📖'},{text:'Flavor',emoji:'👅'},{text:'Kitchen',emoji:'🍳'}], correct:'Ingredient', es:'Ingrediente', context:'Fresh organic ingredients (Ingredientes orgánicos frescos)' },
                    { type:'matching', prompt:'Empareja gastronomía y cocina:', pairs:[
                        {en:'Recipe',es:'📖 Receta (ré-si-pi)'},{en:'Flavor',es:'👅 Sabor (fléi-ver)'},{en:'Ingredient',es:'🧅 Ingrediente (in-grí-di-ent)'},{en:'Spice',es:'🌶️ Especia (spáis)'},{en:'Chef',es:'👨‍🍳 Chef (shéf)'}
                    ]}
                ]},
                { id:'b1-9', name:'Redes Sociales & Medios 🌐', icon:'🌐', questions:[
                    { type:'image_select', emoji:'🔥', word:'Trending', soundsLike:'trén-ding', phonetic:'/ˈtren.dɪŋ/', prompt:'¿Qué contenido es viral/tendencia?', options:['Trending','Follower','Platform','Post'], correct:'Trending', es:'Tendencia / Trending', context:'Trending worldwide on social media (Tendencia mundial en redes sociales)' },
                    { type:'emoji_match', word:'Followers', soundsLike:'fó-lou-ers', phonetic:'/ˈfɑː.loʊ.ɚz/', prompt:'¿Cuál representa Followers?', emojis:['👥','🔥','🌐','📲'], correct:'👥', es:'Seguidores', context:'Gain engaged followers (Ganar seguidores activos)' },
                    { type:'listen_select', word:'Content', soundsLike:'kón-tent', phonetic:'/ˈkɑːn.tent/', prompt:'Escucha el término de publicaciones:', options:[{text:'Content',emoji:'📸'},{text:'Trending',emoji:'🔥'},{text:'Follower',emoji:'👥'},{text:'Viral',emoji:'🚀'}], correct:'Content', es:'Contenido', context:'Create high-quality content (Crear contenido de alta calidad)' },
                    { type:'matching', prompt:'Empareja medios digitales:', pairs:[
                        {en:'Trending',es:'🔥 Tendencia (trén-ding)'},{en:'Followers',es:'👥 Seguidores (fó-lou-ers)'},{en:'Content',es:'📸 Contenido (kón-tent)'},{en:'Viral',es:'🚀 Viral (vái-ral)'},{en:'Platform',es:'🌐 Plataforma (plát-form)'}
                    ]}
                ]},
                { id:'b1-10', name:'Emergencias & Soluciones 🚨', icon:'🚨', questions:[
                    { type:'image_select', emoji:'🚨', word:'Emergency', soundsLike:'i-mér-jen-si', phonetic:'/ɪˈmɝː.dʒən.si/', prompt:'¿Qué situación imprevista es?', options:['Emergency','Solution','Ambulance','Hazard'], correct:'Emergency', es:'Emergencia', context:'Call the emergency number (Llama al número de emergencias)' },
                    { type:'emoji_match', word:'Solution', soundsLike:'so-lú-shan', phonetic:'/səˈluː.ʃən/', prompt:'¿Cuál representa Solution?', emojis:['🧩','🚨','🚑','⚠️'], correct:'🧩', es:'Solución', context:'Find a practical solution (Encontrar una solución práctica)' },
                    { type:'listen_select', word:'Safety', soundsLike:'séif-ti', phonetic:'/ˈseɪf.ti/', prompt:'Escucha la palabra de protección:', options:[{text:'Safety',emoji:'🦺'},{text:'Emergency',emoji:'🚨'},{text:'Hazard',emoji:'⚠️'},{text:'Rescue',emoji:'🚁'}], correct:'Safety', es:'Seguridad', context:'Safety is our top priority (La seguridad es nuestra prioridad)' },
                    { type:'matching', prompt:'Empareja situaciones críticas:', pairs:[
                        {en:'Emergency',es:'🚨 Emergencia (i-mér-jen-si)'},{en:'Solution',es:'🧩 Solución (so-lú-shan)'},{en:'Safety',es:'🦺 Seguridad (séif-ti)'},{en:'Ambulance',es:'🚑 Ambulancia (ám-biu-lans)'},{en:'Hazard',es:'⚠️ Peligro (já-zard)'}
                    ]}
                ]},
                { id:'b1-11', name:'Relaciones & Amistad 🤝', icon:'🤝', questions:[
                    { type:'image_select', emoji:'💎', word:'Trust', soundsLike:'trast', phonetic:'/trʌst/', prompt:'¿Qué valor fundamental es la confianza?', options:['Trust','Support','Friendship','Empathy'], correct:'Trust', es:'Confianza', context:'Trust is the foundation of friendship (La confianza es la base de la amistad)' },
                    { type:'emoji_match', word:'Support', soundsLike:'sa-pórt', phonetic:'/səˈpɔːrt/', prompt:'¿Cuál representa Apoyo (Support)?', emojis:['🤲','💎','🧑‍🤝‍🧑','❤️'], correct:'🤲', es:'Apoyo / Respaldar', context:'Always support your loved ones (Siempre apoya a tus seres queridos)' },
                    { type:'listen_select', word:'Empathy', soundsLike:'ém-pa-zi', phonetic:'/ˈem.pə.θi/', prompt:'Escucha la cualidad de ponerse en el lugar del otro:', options:[{text:'Empathy',emoji:'🧠'},{text:'Trust',emoji:'💎'},{text:'Support',emoji:'🤲'},{text:'Love',emoji:'❤️'}], correct:'Empathy', es:'Empatía', context:'Show deep empathy (Mostrar profunda empatía)' },
                    { type:'matching', prompt:'Empareja valores afectivos B1:', pairs:[
                        {en:'Trust',es:'💎 Confianza (trast)'},{en:'Support',es:'🤲 Apoyo (sa-pórt)'},{en:'Empathy',es:'🧠 Empatía (ém-pa-zi)'},{en:'Friendship',es:'🧑‍🤝‍🧑 Amistad (frénd-ship)'},{en:'Bond',es:'🔗 Vínculo (bónd)'}
                    ]}
                ]},
                { id:'b1-12', name:'Negociación & Acuerdos 📑', icon:'📑', questions:[
                    { type:'image_select', emoji:'📑', word:'Agreement', soundsLike:'a-grí-ment', phonetic:'/əˈɡriː.mənt/', prompt:'¿Qué pacto formal es?', options:['Agreement','Proposal','Strategy','Deal'], correct:'Agreement', es:'Acuerdo / Contrato', context:'Sign the mutual agreement (Firmar el acuerdo mutuo)' },
                    { type:'emoji_match', word:'Proposal', soundsLike:'pro-póu-zal', phonetic:'/prəˈpoʊ.zəl/', prompt:'¿Cuál es Proposal?', emojis:['📊','📑','🤝','💼'], correct:'📊', es:'Propuesta', context:'Review the business proposal (Revisar la propuesta comercial)' },
                    { type:'listen_select', word:'Strategy', soundsLike:'strá-te-ji', phonetic:'/ˈstræt̬.ə.dʒi/', prompt:'Escucha la palabra de planeación:', options:[{text:'Strategy',emoji:'♟️'},{text:'Agreement',emoji:'📑'},{text:'Proposal',emoji:'📊'},{text:'Contract',emoji:'📝'}], correct:'Strategy', es:'Estrategia', context:'Execute our growth strategy (Ejecutar nuestra estrategia de crecimiento)' },
                    { type:'matching', prompt:'Empareja acuerdos y negocios:', pairs:[
                        {en:'Agreement',es:'📑 Acuerdo (a-grí-ment)'},{en:'Proposal',es:'📊 Propuesta (pro-póu-zal)'},{en:'Strategy',es:'♟️ Estrategia (strá-te-ji)'},{en:'Deal',es:'🤝 Trato / Cierre (díl)'},{en:'Terms',es:'⚖️ Términos (térms)'}
                    ]}
                ]}
            ]
        },
        C1: {
            title: "Dominio Avanzado, Retórica & Negocios (C1)",
            desc: "12 Unidades maestras: Negociaciones C-Level, redacción académica, modismos nativos, geopolítica, neurociencia, IA profunda, ética, retórica, venture capital, liderazgo, sátira y filosofía",
            lessons: [
                { id:'c1-1', name:'Negociaciones de Alto Nivel 🤝', icon:'🤝', questions:[
                    { type:'image_select', emoji:'⚖️', word:'Leverage', soundsLike:'lé-ve-rej', phonetic:'/ˈlev.ɚ.ɪdʒ/', prompt:'¿Qué ventaja estratégica representa Leverage?', options:['Leverage','Consensus','Concession','Stakeholder'], correct:'Leverage', es:'Ventaja estratégica / Apalancamiento', context:'Use market dominance as leverage (Usar el dominio del mercado como ventaja)' },
                    { type:'emoji_match', word:'Stakeholder', soundsLike:'stéik-joul-der', phonetic:'/ˈsteɪkˌhoʊl.dɚ/', prompt:'¿Quién es un Stakeholder?', emojis:['👔','⚖️','🤝','🏛️'], correct:'👔', es:'Parte interesada / Accionista', context:'Align with key stakeholders (Alinear con las partes interesadas clave)' },
                    { type:'listen_select', word:'Consensus', soundsLike:'kon-sén-sas', phonetic:'/kənˈsen.səs/', prompt:'Escucha el término de acuerdo unánime:', options:[{text:'Consensus',emoji:'🤝'},{text:'Leverage',emoji:'⚖️'},{text:'Compromise',emoji:'✍️'},{text:'Veto',emoji:'🚫'}], correct:'Consensus', es:'Consenso', context:'Reach a unanimous consensus (Llegar a un consenso unánime)' },
                    { type:'translate', prompt:'We must leverage our position to reach a consensus', answer:['Debemos','aprovechar','nuestra','posición','para','llegar','a','un','consenso'], pool:['Debemos','aprovechar','nuestra','posición','para','llegar','a','un','consenso','perder','dinero'], context:'We must leverage our position to reach a consensus (Debemos aprovechar nuestra posición para llegar a un consenso)' },
                    { type:'matching', prompt:'Empareja términos de negociación C1:', pairs:[
                        {en:'Leverage',es:'⚖️ Ventaja / Apalancamiento (lé-ve-rej)'},{en:'Stakeholder',es:'👔 Parte interesada (stéik-joul-der)'},{en:'Consensus',es:'🤝 Consenso (kon-sén-sas)'},{en:'Concession',es:'✍️ Concesión (kon-sé-shan)'},{en:'Compromise',es:'🤝 Acuerdo mutuo (kóm-pro-mais)'}
                    ]}
                ]},
                { id:'c1-2', name:'Redacción Académica & Ensayos 🎓', icon:'🎓', questions:[
                    { type:'image_select', emoji:'🔬', word:'Empirical', soundsLike:'em-pí-ri-kol', phonetic:'/emˈpɪr.ɪ.kəl/', prompt:'¿Qué evidencia basada en datos reales es Empirical?', options:['Empirical','Paradigm','Furthermore','Consequently'], correct:'Empirical', es:'Empírico / Basado en evidencia', context:'Empirical data supports the hypothesis (Los datos empíricos respaldan la hipótesis)' },
                    { type:'emoji_match', word:'Paradigm', soundsLike:'pá-ra-daim', phonetic:'/ˈpær.ə.daɪm/', prompt:'¿Cuál representa un Paradigm (Paradigma)?', emojis:['🧩','🔬','📚','📊'], correct:'🧩', es:'Paradigma / Modelo', context:'A shift in the scientific paradigm (Un cambio en el paradigma científico)' },
                    { type:'listen_select', word:'Furthermore', soundsLike:'fér-der-mor', phonetic:'/ˈfɝː.ðɚ.mɔːr/', prompt:'Escucha el conector formal de adición:', options:[{text:'Furthermore',emoji:'➕'},{text:'Consequently',emoji:'➡️'},{text:'However',emoji:'🔄'},{text:'Empirical',emoji:'🔬'}], correct:'Furthermore', es:'Además / Es más', context:'Furthermore, the results demonstrate efficacy (Además, los resultados demuestran eficacia)' },
                    { type:'matching', prompt:'Empareja conectores y rigor académico:', pairs:[
                        {en:'Empirical',es:'🔬 Empírico (em-pí-ri-kol)'},{en:'Paradigm',es:'🧩 Paradigma (pá-ra-daim)'},{en:'Furthermore',es:'➕ Además (fér-der-mor)'},{en:'Consequently',es:'➡️ Por consiguiente (kón-se-kuent-li)'},{en:'Hypothesis',es:'💡 Hipótesis (jai-pó-ze-sis)'}
                    ]}
                ]},
                { id:'c1-3', name:'Modismos & Expresiones Nativas 💬', icon:'💬', questions:[
                    { type:'image_select', emoji:'🎯', word:'Piece of cake', soundsLike:'pís of kéik', phonetic:'/piːs əv keɪk/', prompt:'¿Qué modismo nativo significa "muy fácil / pan comido"?', options:['Piece of cake','Bite the bullet','Break a leg','Under the weather'], correct:'Piece of cake', es:'Pan comido / Muy fácil', context:'That exam was a piece of cake (Ese examen fue pan comido)' },
                    { type:'emoji_match', word:'Bite the bullet', soundsLike:'báit de bú-let', phonetic:'/baɪt ðə ˈbʊl.ɪt/', prompt:'¿Qué expresión significa "afrontar algo difícil con valentía"?', emojis:['😬','🎯','🍰','🎭'], correct:'😬', es:'Hacer de tripas corazón / Afrontar lo difícil', context:'I had to bite the bullet and resign (Tuve que hacer de tripas corazón y renunciar)' },
                    { type:'listen_select', word:'Break the ice', soundsLike:'bréik de áis', phonetic:'/breɪk ði aɪs/', prompt:'Escucha el modismo para iniciar una conversación cómoda:', options:[{text:'Break the ice',emoji:'🧊'},{text:'Piece of cake',emoji:'🍰'},{text:'Call it a day',emoji:'🌙'},{text:'Hit the nail',emoji:'🔨'}], correct:'Break the ice', es:'Romper el hielo', context:'Tell a joke to break the ice (Cuenta un chiste para romper el hielo)' },
                    { type:'matching', prompt:'Empareja expresiones idiomáticas avanzadas:', pairs:[
                        {en:'Piece of cake',es:'🍰 Pan comido (muy fácil)'},{en:'Bite the bullet',es:'😬 Afrontar con valor'},{en:'Break the ice',es:'🧊 Romper el hielo'},{en:'Call it a day',es:'🌙 Dar por terminado el día'},{en:'Hit the nail',es:'🔨 Dar en el clavo'}
                    ]}
                ]},
                { id:'c1-4', name:'Geopolítica & Macroeconomía 🏛️', icon:'🏛️', questions:[
                    { type:'image_select', emoji:'📈', word:'Inflation', soundsLike:'in-fléi-shan', phonetic:'/ɪnˈfleɪ.ʃən/', prompt:'¿Qué fenómeno monetario de aumento de precios es?', options:['Inflation','Tariff','Fiscal policy','Geopolitics'], correct:'Inflation', es:'Inflación', context:'Central banks combat rising inflation (Los bancos centrales combaten la creciente inflación)' },
                    { type:'emoji_match', word:'Tariff', soundsLike:'tá-rif', phonetic:'/ˈtær.ɪf/', prompt:'¿Cuál representa un Tariff (Arancel comercial)?', emojis:['🏷️','📈','🏛️','🌐'], correct:'🏷️', es:'Arancel / Impuesto aduanero', context:'Impose tariffs on foreign goods (Imponer aranceles a productos extranjeros)' },
                    { type:'listen_select', word:'Geopolitics', soundsLike:'jio-po-lí-tiks', phonetic:'/ˌdʒiː.oʊˈpɑː.lə.tɪks/', prompt:'Escucha el estudio de las relaciones internacionales:', options:[{text:'Geopolitics',emoji:'🌐'},{text:'Inflation',emoji:'📈'},{text:'Tariff',emoji:'🏷️'},{text:'Economy',emoji:'💵'}], correct:'Geopolitics', es:'Geopolítica', context:'Shifting dynamics in modern geopolitics (Dinámicas cambiantes en la geopolítica moderna)' },
                    { type:'matching', prompt:'Empareja conceptos macroeconómicos:', pairs:[
                        {en:'Inflation',es:'📈 Inflación (in-fléi-shan)'},{en:'Tariff',es:'🏷️ Arancel (tá-rif)'},{en:'Geopolitics',es:'🌐 Geopolítica (jio-po-lí-tiks)'},{en:'Fiscal policy',es:'🏛️ Política fiscal'},{en:'Governance',es:'⚖️ Gobernanza (gó-ver-nans)'}
                    ]}
                ]},
                { id:'c1-5', name:'Psicología & Neurociencia 🧠', icon:'🧠', questions:[
                    { type:'image_select', emoji:'🧠', word:'Cognitive bias', soundsLike:'kóg-ni-tiv bái-as', phonetic:'/ˈkɑːɡ.nə.t̬ɪv ˈbaɪ.əs/', prompt:'¿Qué distorsión en el procesamiento del pensamiento es?', options:['Cognitive bias','Resilience','Subconscious','Perception'], correct:'Cognitive bias', es:'Sesgo cognitivo', context:'Overcome subconscious cognitive bias (Superar el sesgo cognitivo subconsciente)' },
                    { type:'emoji_match', word:'Resilience', soundsLike:'ri-zí-liens', phonetic:'/rɪˈzɪl.jəns/', prompt:'¿Cuál representa Resiliencia (Resilience)?', emojis:['🌱','🧠','🎭','🧘'], correct:'🌱', es:'Resiliencia / Capacidad de superación', context:'Demonstrate emotional resilience in adversity (Demostrar resiliencia emocional ante la adversidad)' },
                    { type:'listen_select', word:'Perception', soundsLike:'per-sép-shan', phonetic:'/pɚˈsep.ʃən/', prompt:'Escucha la palabra de interpretación sensorial:', options:[{text:'Perception',emoji:'👁️'},{text:'Bias',emoji:'🧠'},{text:'Resilience',emoji:'🌱'},{text:'Memory',emoji:'💭'}], correct:'Perception', es:'Percepción', context:'Perception shapes human reality (La percepción moldea la realidad humana)' },
                    { type:'matching', prompt:'Empareja términos de neurociencia y psicología:', pairs:[
                        {en:'Cognitive bias',es:'🧠 Sesgo cognitivo (kóg-ni-tiv bái-as)'},{en:'Resilience',es:'🌱 Resiliencia (ri-zí-liens)'},{en:'Perception',es:'👁️ Percepción (per-sép-shan)'},{en:'Subconscious',es:'💭 Subconsciente (sab-kón-shas)'},{en:'Neuroplasticity',es:'⚡ Neuroplasticidad'}
                    ]}
                ]},
                { id:'c1-6', name:'Inteligencia Artificial & Deep Tech ⚡', icon:'⚡', questions:[
                    { type:'image_select', emoji:'🕸️', word:'Neural Network', soundsLike:'niú-ral nét-uork', phonetic:'/ˈnʊr.əl ˈnet.wɝːk/', prompt:'¿Qué arquitectura computacional biomimética es?', options:['Neural Network','Machine Learning','Automation','Scalability'], correct:'Neural Network', es:'Red Neuronal artificial', context:'Train a deep neural network on massive datasets (Entrenar una red neuronal profunda con conjuntos de datos masivos)' },
                    { type:'emoji_match', word:'Machine Learning', soundsLike:'ma-shín lér-ning', phonetic:'/məˈʃiːn ˌlɝː.nɪŋ/', prompt:'¿Cuál es Machine Learning?', emojis:['🤖','🕸️','💻','⚙️'], correct:'🤖', es:'Aprendizaje Automático', context:'Algorithmic machine learning models (Modelos algorítmicos de aprendizaje automático)' },
                    { type:'listen_select', word:'Scalability', soundsLike:'skei-la-bí-li-ti', phonetic:'/ˌskeɪ.ləˈbɪl.ə.t̬i/', prompt:'Escucha la capacidad de crecer de un sistema:', options:[{text:'Scalability',emoji:'📈'},{text:'Network',emoji:'🕸️'},{text:'Automation',emoji:'⚙️'},{text:'Latency',emoji:'⏱️'}], correct:'Scalability', es:'Escalabilidad', context:'Ensure enterprise cloud scalability (Garantizar la escalabilidad empresarial en la nube)' },
                    { type:'matching', prompt:'Empareja conceptos de Deep Tech:', pairs:[
                        {en:'Neural Network',es:'🕸️ Red Neuronal (niú-ral nét-uork)'},{en:'Machine Learning',es:'🤖 Aprendizaje automático'},{en:'Scalability',es:'📈 Escalabilidad (skei-la-bí-li-ti)'},{en:'Automation',es:'⚙️ Automatización (o-to-méi-shan)'},{en:'Algorithm',es:'🔢 Algoritmo (ál-go-ri-dom)'}
                    ]}
                ]},
                { id:'c1-7', name:'Ética Global & Sostenibilidad 🌱', icon:'🌱', questions:[
                    { type:'image_select', emoji:'👣', word:'Carbon footprint', soundsLike:'kár-bon fút-print', phonetic:'/ˌkɑːr.bən ˈfʊt.prɪnt/', prompt:'¿Qué medida de impacto ambiental es?', options:['Carbon footprint','Bioethics','Accountability','Equity'], correct:'Carbon footprint', es:'Huella de carbono', context:'Reduce industrial carbon footprint (Reducir la huella de carbono industrial)' },
                    { type:'emoji_match', word:'Accountability', soundsLike:'a-kaun-ta-bí-li-ti', phonetic:'/əˌkaʊn.t̬əˈbɪl.ə.t̬i/', prompt:'¿Cuál representa Rendición de Cuentas (Accountability)?', emojis:['⚖️','👣','🌱','🤝'], correct:'⚖️', es:'Rendición de cuentas / Responsabilidad', context:'Demand corporate transparency and accountability (Exigir transparencia y rendición de cuentas corporativa)' },
                    { type:'listen_select', word:'Equity', soundsLike:'é-kui-ti', phonetic:'/ˈek.wə.t̬i/', prompt:'Escucha la palabra de justicia e igualdad distributiva:', options:[{text:'Equity',emoji:'🤝'},{text:'Carbon',emoji:'👣'},{text:'Ethics',emoji:'⚖️'},{text:'Diversity',emoji:'🌍'}], correct:'Equity', es:'Equidad / Justicia distributiva', context:'Strive for social equity and inclusion (Luchar por la equidad social y la inclusión)' },
                    { type:'matching', prompt:'Empareja términos de ética global:', pairs:[
                        {en:'Carbon footprint',es:'👣 Huella de carbono'},{en:'Accountability',es:'⚖️ Rendición de cuentas'},{en:'Equity',es:'🤝 Equidad (é-kui-ti)'},{en:'Bioethics',es:'🧬 Bioética (bái-o-é-ziks)'},{en:'Sustainability',es:'🌱 Sostenibilidad'}
                    ]}
                ]},
                { id:'c1-8', name:'Retórica & Debate Avanzado 🎙️', icon:'🎙️', questions:[
                    { type:'image_select', emoji:'✨', word:'Eloquent', soundsLike:'é-lo-kuent', phonetic:'/ˈel.ə.kwənt/', prompt:'¿Qué cualidad de hablar con gracia y persuasión es?', options:['Eloquent','Persuasive','Fallacy','Discourse'], correct:'Eloquent', es:'Elocuente / Expresivo', context:'An eloquent keynote address (Un discurso principal elocuente)' },
                    { type:'emoji_match', word:'Fallacy', soundsLike:'fá-la-si', phonetic:'/ˈfæl.ə.si/', prompt:'¿Cuál representa un error de lógica (Fallacy)?', emojis:['🚫','✨','🎙️','🗣️'], correct:'🚫', es:'Falacia / Razonamiento engañoso', context:'Disprove the logical fallacy (Refutar la falacia lógica)' },
                    { type:'listen_select', word:'Articulate', soundsLike:'ar-tí-kiu-leit', phonetic:'/ɑːrˈtɪk.jə.lət/', prompt:'Escucha la capacidad de comunicar ideas con máxima claridad:', options:[{text:'Articulate',emoji:'🎙️'},{text:'Eloquent',emoji:'✨'},{text:'Fallacy',emoji:'🚫'},{text:'Rhetoric',emoji:'🗣️'}], correct:'Articulate', es:'Articulado / Claro al hablar', context:'Articulate complex philosophical arguments (Articular argumentos filosóficos complejos)' },
                    { type:'matching', prompt:'Empareja conceptos de oratoria y retórica:', pairs:[
                        {en:'Eloquent',es:'✨ Elocuente (é-lo-kuent)'},{en:'Fallacy',es:'🚫 Falacia (fá-la-si)'},{en:'Articulate',es:'🎙️ Articulado (ar-tí-kiu-leit)'},{en:'Discourse',es:'🗣️ Discurso (dís-kors)'},{en:'Persuasive',es:'🎯 Persuasivo (per-suéi-siv)'}
                    ]}
                ]},
                { id:'c1-9', name:'Estrategia Corporativa & Startups 🚀', icon:'🚀', questions:[
                    { type:'image_select', emoji:'💰', word:'Venture capital', soundsLike:'vén-cher ká-pi-tal', phonetic:'/ˈven.tʃɚ ˌkæp.ə.t̬əl/', prompt:'¿Qué financiamiento de riesgo para startups es?', options:['Venture capital','Disruption','Monetization','Valuation'], correct:'Venture capital', es:'Capital de riesgo / Venture capital', context:'Secure tier-one venture capital funding (Asegurar financiamiento de capital de riesgo de primer nivel)' },
                    { type:'emoji_match', word:'Disruption', soundsLike:'dis-ráp-shan', phonetic:'/dɪsˈrʌp.ʃən/', prompt:'¿Cuál representa Disrupción de mercado (Disruption)?', emojis:['💥','💰','🚀','📈'], correct:'💥', es:'Disrupción innovadora', context:'Cause market disruption with breakthrough tech (Provocar disrupción de mercado con tecnología innovadora)' },
                    { type:'listen_select', word:'Monetization', soundsLike:'mo-ne-ti-zéi-shan', phonetic:'/ˌmɑːn.ə.t̬əˈzeɪ.ʃən/', prompt:'Escucha la estrategia de generar ingresos:', options:[{text:'Monetization',emoji:'💵'},{text:'Disruption',emoji:'💥'},{text:'Venture',emoji:'💰'},{text:'Startup',emoji:'🚀'}], correct:'Monetization', es:'Monetización', context:'Implement sustainable product monetization (Implementar monetización de producto sostenible)' },
                    { type:'matching', prompt:'Empareja vocabulario de startups y finanzas C1:', pairs:[
                        {en:'Venture capital',es:'💰 Capital de riesgo'},{en:'Disruption',es:'💥 Disrupción (dis-ráp-shan)'},{en:'Monetization',es:'💵 Monetización (mo-ne-ti-zéi-shan)'},{en:'Valuation',es:'📊 Valoración (va-liu-éi-shan)'},{en:'Unicorn',es:'🦄 Empresa unicornio'}
                    ]}
                ]},
                { id:'c1-10', name:'Liderazgo & Gestión de Equipos 👑', icon:'👑', questions:[
                    { type:'image_select', emoji:'🌟', word:'Visionary', soundsLike:'ví-zho-ne-ri', phonetic:'/ˈvɪʒ.ən.er.i/', prompt:'¿Qué cualidad de liderazgo con visión de futuro es?', options:['Visionary','Delegation','Mentorship','Empowerment'], correct:'Visionary', es:'Visionario / Con visión de futuro', context:'A visionary leader inspires change (Un líder visionario inspira el cambio)' },
                    { type:'emoji_match', word:'Delegation', soundsLike:'de-le-guéi-shan', phonetic:'/ˌdel.əˈɡeɪ.ʃən/', prompt:'¿Cuál es Delegación de tareas (Delegation)?', emojis:['📋','🌟','👑','🤝'], correct:'📋', es:'Delegación de responsabilidades', context:'Effective delegation empowers managers (La delegación efectiva empodera a los gerentes)' },
                    { type:'listen_select', word:'Empowerment', soundsLike:'em-páu-er-ment', phonetic:'/ɪmˈpaʊ.ɚ.mənt/', prompt:'Escucha el término de empoderamiento humano:', options:[{text:'Empowerment',emoji:'💪'},{text:'Visionary',emoji:'🌟'},{text:'Delegation',emoji:'📋'},{text:'Mentorship',emoji:'🧑‍🏫'}], correct:'Empowerment', es:'Empoderamiento', context:'Fostering team empowerment and autonomy (Fomentar el empoderamiento y la autonomía del equipo)' },
                    { type:'matching', prompt:'Empareja habilidades ejecutivas de liderazgo:', pairs:[
                        {en:'Visionary',es:'🌟 Visionario (ví-zho-ne-ri)'},{en:'Delegation',es:'📋 Delegación (de-le-guéi-shan)'},{en:'Empowerment',es:'💪 Empoderamiento'},{en:'Mentorship',es:'🧑‍🏫 Mentoría (mén-tor-ship)'},{en:'Resilience',es:'🛡️ Resiliencia ejecutiva'}
                    ]}
                ]},
                { id:'c1-11', name:'Literatura, Ironía & Matices 📜', icon:'📜', questions:[
                    { type:'image_select', emoji:'🎭', word:'Nuance', soundsLike:'nú-ans', phonetic:'/ˈnuː.ɑːns/', prompt:'¿Qué sutileza o variación delicada de significado es Nuance?', options:['Nuance','Metaphor','Paradox','Satire'], correct:'Nuance', es:'Matiz / Sutileza de significado', context:'Understand the subtle cultural nuance (Comprender el sutil matiz cultural)' },
                    { type:'emoji_match', word:'Paradox', soundsLike:'pá-ra-doks', phonetic:'/ˈpær.ə.dɑːks/', prompt:'¿Cuál representa una Paradoja (Paradox)?', emojis:['🔄','🎭','📜','💡'], correct:'🔄', es:'Paradoja / Contradicción aparente', context:'The paradox of choice in modern society (La paradoja de la elección en la sociedad moderna)' },
                    { type:'listen_select', word:'Satire', soundsLike:'sá-tai-er', phonetic:'/ˈsæt.aɪr/', prompt:'Escucha el género literario que usa ironía y humor crítico:', options:[{text:'Satire',emoji:'🃏'},{text:'Nuance',emoji:'🎭'},{text:'Paradox',emoji:'🔄'},{text:'Metaphor',emoji:'📖'}], correct:'Satire', es:'Sátira / Crítica irónica', context:'Sharp political satire in journalism (Aguda sátira política en el periodismo)' },
                    { type:'matching', prompt:'Empareja figuras retóricas y análisis literario:', pairs:[
                        {en:'Nuance',es:'🎭 Matiz (nú-ans)'},{en:'Paradox',es:'🔄 Paradoja (pá-ra-doks)'},{en:'Satire',es:'🃏 Sátira (sá-tai-er)'},{en:'Metaphor',es:'📖 Metáfora (mé-ta-for)'},{en:'Subtext',es:'🔍 Subtexto implícito'}
                    ]}
                ]},
                { id:'c1-12', name:'Filosofía & Pensamiento Crítico 💡', icon:'💡', questions:[
                    { type:'image_select', emoji:'🏛️', word:'Epistemology', soundsLike:'e-pis-te-mó-lo-ji', phonetic:'/ɪˌpɪs.təˈmɑː.lə.dʒi/', prompt:'¿Qué rama de la filosofía estudia la naturaleza del conocimiento?', options:['Epistemology','Axiom','Existential','Deduction'], correct:'Epistemology', es:'Epistemología / Teoría del conocimiento', context:'The foundations of modern epistemology (Los fundamentos de la epistemología moderna)' },
                    { type:'emoji_match', word:'Axiom', soundsLike:'ák-si-om', phonetic:'/ˈæk.si.əm/', prompt:'¿Cuál representa un Axioma (Axiom)?', emojis:['📐','🏛️','💡','🔍'], correct:'📐', es:'Axioma / Verdad evidente autoestablecida', context:'An undeniable mathematical axiom (Un axioma matemático innegable)' },
                    { type:'listen_select', word:'Deduction', soundsLike:'di-dák-shan', phonetic:'/dɪˈdʌk.ʃən/', prompt:'Escucha el método de razonamiento lógico de lo general a lo particular:', options:[{text:'Deduction',emoji:'🔍'},{text:'Epistemology',emoji:'🏛️'},{text:'Axiom',emoji:'📐'},{text:'Ethics',emoji:'⚖️'}], correct:'Deduction', es:'Deducción lógica', context:'Logical deduction based on premises (Deducción lógica basada en premisas)' },
                    { type:'matching', prompt:'Empareja conceptos filosóficos fundamentales:', pairs:[
                        {en:'Epistemology',es:'🏛️ Epistemología (e-pis-te-mó-lo-ji)'},{en:'Axiom',es:'📐 Axioma (ák-si-om)'},{en:'Deduction',es:'🔍 Deducción (di-dák-shan)'},{en:'Existential',es:'🌌 Existencial (eg-zis-tén-shal)'},{en:'Dialectic',es:'🗣️ Dialéctica (dai-a-lék-tik)'}
                    ]}
                ]}
            ]
        }
    };

    // ====== MASSIVE EXTENDED AAC COMMUNICATOR DATA (PECS) ======
    const aacDB = {
        needs: [
            { en:'Water', es:'Agua', sounds:'uá-ter', emoji:'💧' },
            { en:'Food', es:'Comida', sounds:'fúd', emoji:'🍕' },
            { en:'Sleep', es:'Dormir', sounds:'slíp', emoji:'😴' },
            { en:'Bathroom', es:'Baño', sounds:'báz-rum', emoji:'🚽' },
            { en:'Help', es:'Ayuda', sounds:'jélp', emoji:'🆘' },
            { en:'Pain', es:'Dolor', sounds:'péin', emoji:'🩹' },
            { en:'Medicine', es:'Medicina', sounds:'mé-di-sin', emoji:'💊' },
            { en:'More', es:'Más', sounds:'mór', emoji:'➕' },
            { en:'Stop', es:'Parar / Alto', sounds:'stóp', emoji:'🛑' },
            { en:'Quiet', es:'Silencio', sounds:'kuái-et', emoji:'🤫' },
            { en:'Hug', es:'Abrazo', sounds:'jág', emoji:'🤗' },
            { en:'Walk', es:'Caminar', sounds:'uók', emoji:'🚶' }
        ],
        feelings: [
            { en:'Happy', es:'Feliz', sounds:'já-pi', emoji:'😊' },
            { en:'Calm', es:'Calma / Tranquilo', sounds:'kám', emoji:'🧘' },
            { en:'Love', es:'Amor', sounds:'láv', emoji:'❤️' },
            { en:'Proud', es:'Orgulloso', sounds:'práud', emoji:'🌟' },
            { en:'Excited', es:'Emocionado', sounds:'ek-sái-tid', emoji:'🎉' },
            { en:'Sad', es:'Triste', sounds:'sád', emoji:'😢' },
            { en:'Tired', es:'Cansado', sounds:'tái-erd', emoji:'🥱' },
            { en:'Angry', es:'Enojado', sounds:'án-gri', emoji:'😡' },
            { en:'Scared', es:'Asustado', sounds:'skéard', emoji:'😨' },
            { en:'Surprised', es:'Sorprendido', sounds:'ser-práist', emoji:'😲' }
        ],
        actions: [
            { en:'Play', es:'Jugar', sounds:'pléi', emoji:'🎮' },
            { en:'Wash', es:'Lavar manos', sounds:'uósh', emoji:'🧼' },
            { en:'Brush', es:'Cepillar dientes', sounds:'brásh', emoji:'🪥' },
            { en:'Eat', es:'Comer', sounds:'ít', emoji:'🍽️' },
            { en:'Drink', es:'Beber', sounds:'drínk', emoji:'🥤' },
            { en:'Run', es:'Correr', sounds:'rán', emoji:'🏃' },
            { en:'Read', es:'Leer', sounds:'ríd', emoji:'📖' },
            { en:'Sing', es:'Cantar', sounds:'sing', emoji:'🎤' },
            { en:'Dance', es:'Bailar', sounds:'dáns', emoji:'💃' },
            { en:'Listen', es:'Escuchar', sounds:'lís-en', emoji:'👂' },
            { en:'Draw', es:'Dibujar', sounds:'dró', emoji:'🎨' },
            { en:'Sleep', es:'Descansar', sounds:'slíp', emoji:'🛏️' }
        ],
        food: [
            { en:'Apple', es:'Manzana', sounds:'áp-ol', emoji:'🍎' },
            { en:'Banana', es:'Plátano', sounds:'ba-ná-na', emoji:'🍌' },
            { en:'Milk', es:'Leche', sounds:'mílk', emoji:'🥛' },
            { en:'Bread', es:'Pan', sounds:'bréd', emoji:'🍞' },
            { en:'Cheese', es:'Queso', sounds:'chís', emoji:'🧀' },
            { en:'Pizza', es:'Pizza', sounds:'pít-sa', emoji:'🍕' },
            { en:'Cookie', es:'Galleta', sounds:'kú-ki', emoji:'🍪' },
            { en:'Juice', es:'Jugo', sounds:'jús', emoji:'🧃' },
            { en:'Chicken', es:'Pollo', sounds:'chí-ken', emoji:'🍗' },
            { en:'Water', es:'Agua', sounds:'uá-ter', emoji:'💧' },
            { en:'Soup', es:'Sopa', sounds:'súp', emoji:'🍲' },
            { en:'Egg', es:'Huevo', sounds:'ég', emoji:'🥚' }
        ],
        places: [
            { en:'House', es:'Casa', sounds:'jáus', emoji:'🏠' },
            { en:'School', es:'Escuela', sounds:'skúl', emoji:'🏫' },
            { en:'Park', es:'Parque', sounds:'párk', emoji:'🏞️' },
            { en:'Bed', es:'Cama', sounds:'béd', emoji:'🛏️' },
            { en:'Bathroom', es:'Baño', sounds:'báz-rum', emoji:'🚽' },
            { en:'Store', es:'Tienda', sounds:'stór', emoji:'🏪' },
            { en:'Hospital', es:'Hospital', sounds:'jós-pi-tal', emoji:'🏥' },
            { en:'Kitchen', es:'Cocina', sounds:'kí-chen', emoji:'🍳' },
            { en:'Beach', es:'Playa', sounds:'bích', emoji:'🏖️' },
            { en:'Car', es:'Carro', sounds:'kár', emoji:'🚗' }
        ],
        social: [
            { en:'Hello', es:'Hola', sounds:'je-lóu', emoji:'👋' },
            { en:'Goodbye', es:'Adiós', sounds:'gud-bái', emoji:'👋' },
            { en:'Please', es:'Por favor', sounds:'plís', emoji:'🙏' },
            { en:'Thank you', es:'Gracias', sounds:'zánk iu', emoji:'✨' },
            { en:'Yes', es:'Sí', sounds:'yés', emoji:'👍' },
            { en:'No', es:'No', sounds:'nóu', emoji:'👎' },
            { en:'Friend', es:'Amigo', sounds:'frénd', emoji:'🧑‍🤝‍🧑' },
            { en:'Good morning', es:'Buenos días', sounds:'gud mór-ning', emoji:'🌅' },
            { en:'Good night', es:'Buenas noches', sounds:'gud náit', emoji:'🌙' },
            { en:'Nice to meet you', es:'Mucho gusto', sounds:'náis tu mít iu', emoji:'🤝' }
        ]
    };

// ====== SOUND EFFECTS ======
    function initAudio() { if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    function playClick() { try { initAudio(); const o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='sine'; o.frequency.setValueAtTime(450,state.audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(850,state.audioCtx.currentTime+0.04); g.gain.setValueAtTime(0.12,state.audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,state.audioCtx.currentTime+0.04); o.connect(g); g.connect(state.audioCtx.destination); o.start(); o.stop(state.audioCtx.currentTime+0.04); } catch(e){} }
    function playPop() { try { initAudio(); const n=state.audioCtx.currentTime,o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='triangle'; o.frequency.setValueAtTime(600,n); o.frequency.exponentialRampToValueAtTime(1200,n+0.08); g.gain.setValueAtTime(0.2,n); g.gain.exponentialRampToValueAtTime(0.001,n+0.08); o.connect(g); g.connect(state.audioCtx.destination); o.start(n); o.stop(n+0.08); } catch(e){} }
    function playSuccess() { try { initAudio(); const n=state.audioCtx.currentTime; [523.25,659.25,783.99,1046.50].forEach((f,i)=>{ const o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='triangle'; o.frequency.setValueAtTime(f,n+i*0.07); g.gain.setValueAtTime(0.18,n+i*0.07); g.gain.exponentialRampToValueAtTime(0.001,n+i*0.07+0.2); o.connect(g); g.connect(state.audioCtx.destination); o.start(n+i*0.07); o.stop(n+i*0.07+0.2); }); } catch(e){} }
    function playError() { try { initAudio(); const n=state.audioCtx.currentTime,o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(220,n); o.frequency.linearRampToValueAtTime(140,n+0.22); g.gain.setValueAtTime(0.18,n); g.gain.exponentialRampToValueAtTime(0.001,n+0.25); o.connect(g); g.connect(state.audioCtx.destination); o.start(n); o.stop(n+0.25); } catch(e){} }
    function playCombo() { try { initAudio(); const n=state.audioCtx.currentTime; [440,554.37,659.25].forEach((f,i)=>{ const o=state.audioCtx.createOscillator(),g=state.audioCtx.createGain(); o.type='sine'; o.frequency.setValueAtTime(f,n+i*0.05); g.gain.setValueAtTime(0.15,n+i*0.05); g.gain.exponentialRampToValueAtTime(0.001,n+i*0.05+0.12); o.connect(g); g.connect(state.audioCtx.destination); o.start(n+i*0.05); o.stop(n+i*0.05+0.12); }); } catch(e){} }

    // ====== SPEECH SYNTHESIS ======
    const mascotAvatar = document.getElementById('mascot-avatar');
    function speak(text, rate=0.85) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=rate;
            if (mascotAvatar) { mascotAvatar.classList.add('mascot-speaking'); u.onend=()=>mascotAvatar.classList.remove('mascot-speaking'); }
            window.speechSynthesis.speak(u);
        }
    }

    function speakEcho(text) {
        speak(text, 0.85);
        setTimeout(() => speak(text, 0.6), 1400);
    }

    // ====== CONFETTI ======
    const confettiCanvas=document.getElementById('confetti-canvas');
    const ctx=(confettiCanvas && typeof confettiCanvas.getContext === 'function') ? confettiCanvas.getContext('2d') : null;
    function resizeCanvas(){if(confettiCanvas){confettiCanvas.width=window.innerWidth;confettiCanvas.height=window.innerHeight;}}
    window.addEventListener('resize',resizeCanvas); resizeCanvas();
    function triggerConfetti(){if(!ctx)return;const ps=[];const colors=['#10B981','#0EA5E9','#F59E0B','#EF4444','#A855F7','#FFC800'];for(let i=0;i<100;i++)ps.push({x:window.innerWidth/2,y:window.innerHeight/2,vx:(Math.random()-0.5)*14,vy:(Math.random()-0.7)*16,size:Math.random()*8+6,color:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*360,rs:(Math.random()-0.5)*10,op:1});(function draw(){ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);let alive=false;ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.4;p.rot+=p.rs;p.op-=0.012;if(p.op>0){alive=true;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.globalAlpha=Math.max(0,p.op);ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore();}});if(alive)requestAnimationFrame(draw);else ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);})();}

    // ====== MESSAGES ======
    const msgs={ok:['¡Excelente! 🌟','¡Genial! ⚡','¡Perfecto! 🎯','¡Correcto! ✨','¡Bravo! 🏆','¡Increíble! 🚀','¡Muy bien! 💪'],combo:['🔥 ¡Racha de fuego!','⚡ ¡Imparable!','💎 ¡Brillante!','🌟 ¡Combo increíble!'],end:['¡Tu inglés mejora cada día!','¡Eres un campeón del aprendizaje!','¡Cada palabra te acerca a la fluidez!','¡Sigue así, vas increíble!']};
    function randMsg(arr){return arr[Math.floor(Math.random()*arr.length)];}

    // ====== DOM ELEMENTS ======
    const $=id=>document.getElementById(id);
    const levelSelectorBtn=$('level-selector-btn'),levelDrawer=$('level-drawer'),currentLevelBadge=$('current-level-badge');
    const levelOpts = document.querySelectorAll('.level-opt');
    const pathTree=$('path-tree'),bannerUnit=$('banner-unit'),bannerTitle=$('banner-title'),bannerDesc=$('banner-desc');
    const lessonView=$('lesson-view'),closeLessonBtn=$('close-lesson-btn'),progressFill=$('lesson-progress-fill'),lessonHeartsCount=$('lesson-hearts-count');
    const promptTitle=$('prompt-title'),promptText=$('prompt-text'),ttsNormal=$('tts-normal-btn'),ttsSlow=$('tts-slow-btn'),ttsEcho=$('tts-echo-btn');
    const modImageSelect=$('mod-image-select'),bigEmoji=$('big-emoji'),imageOptions=$('image-options'),phoneticBadge=$('phonetic-badge'),soundsLikePill=$('sounds-like-pill'),wordContextBox=$('word-context-box'),syllablesClapRow=$('syllables-clap-row'),syllablesText=$('syllables-text'),mouthGuideBox=$('mouth-guide-box');
    const modEmojiMatch=$('mod-emoji-match'),bigWord=$('big-word'),emojiOptions=$('emoji-options'),bigWordPhonetic=$('big-word-phonetic'),bigWordSoundsLike=$('big-word-sounds-like'),bigWordContextBox=$('big-word-context-box'),bigSyllablesClapRow=$('big-syllables-clap-row'),bigSyllablesText=$('big-syllables-text'),bigMouthGuideBox=$('big-mouth-guide-box');
    const modListenSelect=$('mod-listen-select'),listenBigBtn=$('listen-big-btn'),listenNormalBtn=$('listen-normal-btn'),listenSlowBtn=$('listen-slow-btn'),listenEchoBtn=$('listen-echo-btn'),listenOptions=$('listen-options');
    const modTranslate=$('mod-translate'),answerSlot=$('answer-slot-line'),placeholder=$('placeholder-hint'),wordPool=$('word-pool');
    const modMatching=$('mod-matching'),matchingGrid=$('matching-grid');
    const modChoice=$('mod-choice'),choicesGrid=$('choices-grid');
    const checkBtn=$('check-btn'),feedbackSheet=$('feedback-sheet'),feedbackIcon=$('feedback-icon'),feedbackTitleEl=$('feedback-title'),feedbackSubtitle=$('feedback-subtitle'),continueBtn=$('continue-btn');
    const comboCounter=$('combo-counter'),comboNumber=$('combo-number'),qCurrent=$('q-current'),qTotal=$('q-total');
    const hintBtn=$('hint-btn'),charPrompt=$('character-prompt');
    const completionModal=$('completion-modal'),finishBtn=$('finish-lesson-btn'),accuracyVal=$('accuracy-val'),comboMaxVal=$('combo-max-val'),xpRewardVal=$('xp-reward-val'),completionEncourage=$('completion-encourage');
    const mainHeartIcon=$('main-heart-icon'),floatingHeartLoss=$('floating-heart-loss');
    const tutorialOverlay=$('tutorial-overlay'),tutorialText=$('tutorial-text'),tutorialNextBtn=$('tutorial-next-btn'),tutorialDots=$('tutorial-dots'),tutorialMascot=document.querySelector('.tutorial-mascot'),tutorialCloseBtn=$('tutorial-close-btn');
    const dictionaryCategories=$('dictionary-categories');
    
    // AAC DOM
    const aacStrip=$('aac-strip'), aacPlaceholder=$('aac-placeholder'), aacSpeakBtn=$('aac-speak-btn'), aacClearBtn=$('aac-clear-btn');
    const aacCategoryTabs=$('aac-category-tabs'), aacCardsGrid=$('aac-cards-grid');

    // ====== TUTORIAL ======
    const tutSteps=[
        {t:'¡Hola! 👋 Te damos la bienvenida a Lingua Pro inclusivo y adaptado.',m:'🤖'},
        {t:'🧸 Prueba el Nivel K0: Terapia de lenguaje, silabeo con palmas y guía de boca sin vidas.',m:'🧩'},
        {t:'🗣️ Usa la pestaña "Comunicador" para armar frases y hablar tocando pictogramas.',m:'🗣️'},
        {t:'💡 ¡Aprende sin frustración a tu propio ritmo!',m:'🏆'}
    ];
    let tutStep=0;

    function showTutorial(){if(state.tutorialSeen)return;tutorialOverlay.classList.remove('hidden');tutStep=0;renderTutDots();renderTutStep();}
    function dismissTutorial(){tutorialOverlay.classList.add('hidden');state.tutorialSeen=true;localStorage.setItem('lp_tut','1');}
    function renderTutDots(){tutorialDots.innerHTML='';tutSteps.forEach((_,i)=>{const d=document.createElement('span');d.className=`tutorial-dot ${i===0?'active':''}`;tutorialDots.appendChild(d);});}
    function renderTutStep(){tutorialText.textContent=tutSteps[tutStep].t;tutorialMascot.textContent=tutSteps[tutStep].m;tutorialDots.querySelectorAll('.tutorial-dot').forEach((d,i)=>d.classList.toggle('active',i===tutStep));tutorialNextBtn.textContent=tutStep===tutSteps.length-1?'¡A JUGAR! 🚀':'SIGUIENTE →';}
    tutorialNextBtn.addEventListener('click',()=>{playClick();tutStep++;if(tutStep>=tutSteps.length){dismissTutorial();}else renderTutStep();});
    if(tutorialCloseBtn) tutorialCloseBtn.addEventListener('click',()=>{playClick();dismissTutorial();});
    tutorialOverlay.addEventListener('click',(e)=>{if(e.target===tutorialOverlay){dismissTutorial();}});

    // ====== ENCOURAGEMENT ======
    function showToast(msg){const t=$('encouragement-toast'),tx=$('encouragement-text');if(!t||!tx)return;tx.textContent=msg;t.classList.remove('hidden');t.style.animation='none';t.offsetHeight;t.style.animation='';setTimeout(()=>t.classList.add('hidden'),2200);}
    function updateCombo(ok){if(ok){state.comboStreak++;if(state.comboStreak>state.maxCombo)state.maxCombo=state.comboStreak;if(state.comboStreak>=2){comboCounter.classList.remove('hidden');comboNumber.textContent=state.comboStreak;playCombo();if(state.comboStreak>=3)showToast(randMsg(msgs.combo));}}else{state.comboStreak=0;comboCounter.classList.add('hidden');}}

    // ====== LEVEL SELECTOR ======
    levelSelectorBtn.addEventListener('click',()=>{playClick();levelDrawer.classList.toggle('active');});
    levelOpts.forEach(o=>o.addEventListener('click',()=>{
        playClick();
        levelOpts.forEach(x=>x.classList.remove('active'));
        o.classList.add('active');
        state.currentLevel=o.dataset.level;
        currentLevelBadge.textContent=state.currentLevel;
        levelDrawer.classList.remove('active');
        saveProgress();
        renderPath();
        renderDictionary();
        updateStats();
    }));

    // ====== NAV TABS ======
    document.querySelectorAll('.nav-tab').forEach(t=>t.addEventListener('click',()=>{
        playClick();
        const id=t.dataset.target;
        document.querySelectorAll('.nav-tab').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        document.querySelectorAll('.view').forEach(v=>{v.id===id?v.classList.add('active'):v.classList.remove('active');});
        if(id==='dictionary-view') renderDictionary();
        if(id==='aac-view') renderAAC('needs');
    }));

    // ====== AAC COMMUNICATOR LOGIC ======
    function renderAAC(cat='needs') {
        if (!aacCardsGrid) return;
        aacCardsGrid.innerHTML = '';
        const items = aacDB[cat] || aacDB.needs;

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'aac-card';
            card.innerHTML = `
                <div class="aac-card-emoji">${item.emoji}</div>
                <div class="aac-card-en">${item.en}</div>
                <div class="aac-card-sounds">${item.sounds}</div>
                <div class="aac-card-es">${item.es}</div>
            `;
            card.addEventListener('click', () => {
                playPop();
                speak(item.en, 0.85);
                addAACToStrip(item);
            });
            aacCardsGrid.appendChild(card);
        });
    }

    function addAACToStrip(item) {
        state.aacPhrase.push(item);
        if (aacPlaceholder) aacPlaceholder.style.display = 'none';
        
        const chip = document.createElement('div');
        chip.className = 'aac-phrase-chip';
        chip.innerHTML = `<span>${item.emoji}</span> <span>${item.en}</span>`;
        chip.addEventListener('click', () => {
            chip.remove();
            state.aacPhrase = state.aacPhrase.filter(x => x !== item);
            if (state.aacPhrase.length === 0 && aacPlaceholder) aacPlaceholder.style.display = 'inline';
        });
        aacStrip.appendChild(chip);
    }

    if (aacSpeakBtn) {
        aacSpeakBtn.addEventListener('click', () => {
            if (state.aacPhrase.length === 0) {
                alert('Toca los pictogramas abajo para armar tu frase 🧩');
                return;
            }
            playSuccess();
            const phraseText = state.aacPhrase.map(p => p.en).join(' ');
            speak(phraseText, 0.8);
            showToast(`🗣️ "${phraseText}"`);
        });
    }

    if (aacClearBtn) {
        aacClearBtn.addEventListener('click', () => {
            playClick();
            state.aacPhrase = [];
            aacStrip.querySelectorAll('.aac-phrase-chip').forEach(c => c.remove());
            if (aacPlaceholder) aacPlaceholder.style.display = 'inline';
        });
    }

    if (aacCategoryTabs) {
        aacCategoryTabs.querySelectorAll('.aac-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                playClick();
                aacCategoryTabs.querySelectorAll('.aac-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderAAC(btn.dataset.cat);
            });
        });
    }

    // ====== PATH TREE ROADMAP ======
    function renderPath(){
        const d = curriculum[state.currentLevel] || curriculum.A1;
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

        // If all lessons in current level are completed, show next level card
        const currentLvlIdx = levelOrder.indexOf(state.currentLevel);
        if (unlockedCount >= totalLessons && currentLvlIdx + 1 < levelOrder.length) {
            const nextLvlKey = levelOrder[currentLvlIdx + 1];
            const nextCard = document.createElement('div');
            nextCard.className = 'next-level-card';
            nextCard.innerHTML = `
                <div class="next-level-icon">🚀</div>
                <div class="next-level-info">
                    <strong>¡Nivel ${state.currentLevel} Superado!</strong>
                    <span>Continúa tu aprendizaje en el Nivel ${nextLvlKey}</span>
                </div>
                <button class="next-level-btn">IR A NIVEL ${nextLvlKey} ➔</button>
            `;
            const nextBtn = nextCard.querySelector('.next-level-btn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    playSuccess();
                    state.currentLevel = nextLvlKey;
                    state.unlockedIndex[nextLvlKey] = Math.max(state.unlockedIndex[nextLvlKey] || 1, 1);
                    if (currentLevelBadge) currentLevelBadge.textContent = state.currentLevel;
                    levelOpts.forEach(o => o.classList.toggle('active', o.dataset.level === state.currentLevel));
                    saveProgress();
                    renderPath();
                    renderDictionary();
                    updateStats();
                });
            }
            pathTree.appendChild(nextCard);
        }
    }

    // ====== RENDER VISUAL DICTIONARY WITH CONTEXT ======
    function renderDictionary() {
        if (!dictionaryCategories) return;
        dictionaryCategories.innerHTML = '';
        const currentLvlData = curriculum[state.currentLevel] || curriculum.A1;

        currentLvlData.lessons.forEach(l => {
            const block = document.createElement('div');
            block.className = 'dict-category-block';
            
            const title = document.createElement('h3');
            title.className = 'dict-cat-title';
            title.textContent = `${l.icon} ${l.name}`;
            block.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'dict-words-grid';

            l.questions.forEach(q => {
                if (q.word && q.es) {
                    const card = document.createElement('div');
                    card.className = 'dict-word-card';
                    card.innerHTML = `
                        <div class="dict-emoji">${q.emoji || '🔤'}</div>
                        <div class="dict-info">
                            <span class="dict-english">${q.word}</span>
                            <span class="dict-sounds">🗣️ Suena: "${q.soundsLike || ''}"</span>
                            <span class="dict-spanish">🇲🇽 ${q.es}</span>
                            ${q.syllables ? `<span class="dict-context">👏 Silabeo: ${q.syllables}</span>` : ''}
                            ${q.mouth ? `<span class="dict-context">👄 Boca: ${q.mouth}</span>` : ''}
                            ${q.context ? `<span class="dict-context">📌 ${q.context}</span>` : ''}
                        </div>
                        <button class="dict-listen-btn">🔊</button>
                    `;
                    const listenBtn = card.querySelector('.dict-listen-btn');
                    if (listenBtn) listenBtn.onclick = () => speak(q.word, 0.85);
                    grid.appendChild(card);
                }
            });

            if (grid.children.length > 0) {
                block.appendChild(grid);
                dictionaryCategories.appendChild(block);
            }
        });
    }

    // ====== LESSON START ======
    function startLesson(l){
        state.activeLesson = l;
        state.currentQuestionIdx = 0;
        state.correctCount = 0;
        state.hearts = state.currentLevel === 'K0' ? 99 : 5;
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
        if (confirm('¿Salir? Perderás el progreso de esta lección.')) {
            lessonView.classList.remove('active');
            $('path-view').classList.add('active');
            const bottomNav = $('bottom-nav-bar');
            if (bottomNav) bottomNav.style.display = 'flex';
        }
    });

    ttsNormal.addEventListener('click',()=>speak(promptText.textContent,0.85));
    ttsSlow.addEventListener('click',()=>speak(promptText.textContent,0.5));
    if (ttsEcho) ttsEcho.addEventListener('click',()=>speakEcho(promptText.textContent));

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
            if(soundsLikePill) soundsLikePill.textContent=q.soundsLike ? `🗣️ Suena: "${q.soundsLike}"` : '';
            if(phoneticBadge) phoneticBadge.textContent=q.phonetic||'';
            if(wordContextBox) wordContextBox.innerHTML=q.context ? `📌 <em>"${q.context}"</em>` : '';
            
            if (syllablesClapRow) {
                if (q.syllables) {
                    syllablesClapRow.classList.remove('hidden');
                    syllablesText.textContent = q.syllables;
                } else {
                    syllablesClapRow.classList.add('hidden');
                }
            }

            if (mouthGuideBox) {
                if (q.mouth) {
                    mouthGuideBox.classList.remove('hidden');
                    const span = mouthGuideBox.querySelector('span');
                    if (span) span.textContent = q.mouth;
                } else {
                    mouthGuideBox.classList.add('hidden');
                }
            }

            speak(q.word,0.85);
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
            if(bigWordSoundsLike) bigWordSoundsLike.textContent=q.soundsLike ? `🗣️ Suena: "${q.soundsLike}"` : '';
            if(bigWordPhonetic) bigWordPhonetic.textContent=q.phonetic||'';
            if(bigWordContextBox) bigWordContextBox.innerHTML=q.context ? `📌 <em>"${q.context}"</em>` : '';
            
            if (bigSyllablesClapRow) {
                if (q.syllables) {
                    bigSyllablesClapRow.classList.remove('hidden');
                    bigSyllablesText.textContent = q.syllables;
                } else {
                    bigSyllablesClapRow.classList.add('hidden');
                }
            }

            if (bigMouthGuideBox) {
                if (q.mouth) {
                    bigMouthGuideBox.classList.remove('hidden');
                    const span = bigMouthGuideBox.querySelector('span');
                    if (span) span.textContent = q.mouth;
                } else {
                    bigMouthGuideBox.classList.add('hidden');
                }
            }

            speak(q.word,0.85);
            emojiOptions.innerHTML='';
            q.emojis.sort(()=>Math.random()-0.5).forEach(em=>{
                const btn=document.createElement('button');btn.className='emoji-option';btn.textContent=em;
                btn.addEventListener('click',()=>{playClick();emojiOptions.querySelectorAll('.emoji-option').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');state.selectedChoice=em;checkBtn.disabled=false;});
                emojiOptions.appendChild(btn);
            });

        } else if(q.type==='listen_select'){
            promptTitle.textContent=q.prompt;
            modListenSelect.classList.remove('hidden');
            setTimeout(()=>speak(q.word, 0.85), 200);

            if(listenBigBtn) listenBigBtn.onclick=()=>speak(q.word, 0.85);
            if(listenNormalBtn) listenNormalBtn.onclick=()=>speak(q.word, 0.85);
            if(listenSlowBtn) listenSlowBtn.onclick=()=>speak(q.word, 0.5);
            if(listenEchoBtn) listenEchoBtn.onclick=()=>speakEcho(q.word);

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
            promptTitle.textContent='Traduce al español';promptText.textContent=q.prompt;
            modTranslate.classList.remove('hidden');speak(q.prompt,0.85);
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
                    if(c.lang==='en')speak(c.text,0.85);else playClick();
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
            promptTitle.textContent='Pregunta de contexto';promptText.textContent=q.prompt;
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
            feedbackSubtitle.textContent=q.word?`${q.word} (Suena: "${q.soundsLike||''}") = ${q.es||''}`:'¡Respuesta correcta!';
        } else {
            playError();updateCombo(false);
            if (state.currentLevel !== 'K0') {
                triggerHeartLoss();state.hearts=Math.max(0,state.hearts-1);updateStats();
            }
            feedbackSheet.className='feedback-sheet show error';feedbackIcon.textContent='✕';
            feedbackTitleEl.textContent=state.currentLevel==='K0'?'¡Casi! Escucha y repite con calma:':'No te preocupes, la respuesta era:';
            feedbackSubtitle.textContent=q.word?`${q.word} (Suena: "${q.soundsLike||''}")` : (q.correct||'Sigue practicando');
        }
    });

    function triggerHeartLoss(){if(mainHeartIcon&&floatingHeartLoss){mainHeartIcon.classList.add('shake-heart');floatingHeartLoss.classList.add('animate-loss');setTimeout(()=>{mainHeartIcon.classList.remove('shake-heart');floatingHeartLoss.classList.remove('animate-loss');},1200);}}

    continueBtn.addEventListener('click',()=>{
        feedbackSheet.classList.remove('show');state.currentQuestionIdx++;
        if(state.currentQuestionIdx<state.activeLesson.questions.length && (state.hearts>0 || state.currentLevel==='K0')) loadQ();
        else finishLesson();
    });

    function finishLesson(){
        const total = state.activeLesson.questions.length;
        const acc = Math.round((state.correctCount / total) * 100);
        const bonus = state.maxCombo >= 3 ? 25 : 15;
        accuracyVal.textContent = `${acc}%`;
        comboMaxVal.textContent = `🔥 ${state.maxCombo}`;
        xpRewardVal.textContent = `+${bonus}`;
        completionEncourage.textContent = state.currentLevel==='K0'?'¡Excelente trabajo! Has aprendido nuevas palabras y sonidos 🌟':randMsg(msgs.end);

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
        renderDictionary();
        updateStats();
    });

    // ====== SHOP ======
    $('buy-hearts-btn').addEventListener('click',()=>{if(state.gems>=50){state.gems-=50;state.hearts=5;updateStats();playSuccess();alert('¡5 ❤️ recargadas!');}else alert('Necesitas 50 💎');});
    $('buy-freeze-btn').addEventListener('click',()=>{if(state.gems>=100){state.gems-=100;updateStats();playSuccess();alert('🛡️ Escudo activado');}else alert('Necesitas 100 💎');});
    $('reveal-srs-btn').addEventListener('click',()=>{playClick();$('srs-translation').classList.remove('hidden');});
    $('srs-tts-btn').addEventListener('click',()=>speak('Apple',0.85));

    function updateStats(){
        $('user-streak').textContent=state.streak;$('user-gems').textContent=state.gems;
        const heartsDisplay = state.currentLevel === 'K0' ? '∞' : state.hearts;
        $('user-hearts').textContent=heartsDisplay;
        if (lessonHeartsCount) lessonHeartsCount.textContent=heartsDisplay;
        $('prof-streak').textContent=state.streak;$('prof-xp').textContent=`${state.xp} XP`;$('prof-gems').textContent=state.gems;
    }

    renderPath();renderDictionary();renderAAC('needs');updateStats();showTutorial();
});
