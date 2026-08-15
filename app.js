document.addEventListener('DOMContentLoaded', () => {
    const levelOrder = ['A1', 'A2', 'B1', 'C1'];

    const state = {
        currentLevel: 'A1', streak: 1, gems: 50, hearts: 5, xp: 0,
        activeLesson: null, currentQuestionIdx: 0, correctCount: 0,
        selectedChips: [], audioCtx: null, firstMatchCard: null,
        matchedPairsCount: 0, comboStreak: 0, maxCombo: 0, hintsUsed: 0,
        selectedChoice: null, nextLevelToSwitch: null,
        tutorialSeen: localStorage.getItem('lp_tut') === '1',
        unlockedIndex: { A1: 1, A2: 1, B1: 1, C1: 1 }
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
                state.unlockedIndex = { A1: 1, A2: 1, B1: 1, C1: 1 };
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

    // ====== MASSIVE COMPREHENSIVE CURRICULUM WITH REPETITION & CONTEXT ======
    const curriculum = {
        A1: {
            title: "Vocabulario Inicial (A1)",
            desc: "12 Unidades de vocabulario esencial con repetición espaciada, contexto y audio",
            lessons: [
                { id:'a1-1', name:'Animales 🐾', icon:'🐱', questions:[
                    { type:'image_select', emoji:'🐱', word:'Cat', soundsLike:'kat', phonetic:'/kæt/', prompt:'¿Qué animal es este?', options:['Cat','Dog','Bird','Fish'], correct:'Cat', es:'Gato', context:'The cat is sleeping (El gato está durmiendo)' },
                    { type:'emoji_match', word:'Dog', soundsLike:'dog', phonetic:'/dɔːɡ/', prompt:'¿Cuál es el emoji de Dog?', emojis:['🐶','🐱','🐴','🐰'], correct:'🐶', es:'Perro', context:'My dog is friendly (Mi perro es amigable)' },
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
                    { type:'image_select', emoji:'🔴', word:'Red', soundsLike:'réd', phonetic:'/red/', prompt:'¿Qué color es este?', options:['Red','Blue','Green','Yellow'], correct:'Red', es:'Rojo', context:'A red apple (Una manzana roja)' },
                    { type:'emoji_match', word:'Blue', soundsLike:'blú', phonetic:'/bluː/', prompt:'¿Cuál es el color Blue?', emojis:['🔵','🔴','🟢','🟡'], correct:'🔵', es:'Azul', context:'The sky is blue (El cielo es azul)' },
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
                    { type:'translate', prompt:'My eyes and ears', answer:['Mis','ojos','y','orejas'], pool:['Mis','ojos','y','orejas','manos','pies','la','nariz'], context:'My eyes and ears (Mis ojos y orejas)' },
                    { type:'listen_select', word:'Foot', soundsLike:'fút', phonetic:'/fʊt/', prompt:'Escucha y selecciona el emoji:', options:[{text:'Foot',emoji:'🦶'},{text:'Hand',emoji:'🖐️'},{text:'Eye',emoji:'👁️'},{text:'Ear',emoji:'👂'}], correct:'Foot', es:'Pie', context:'Left foot (Pie izquierdo)' },
                    { type:'matching', prompt:'Empareja las partes del cuerpo:', pairs:[
                        {en:'Eye',es:'👁️ Ojo (ái)'},{en:'Ear',es:'👂 Oreja (íar)'},{en:'Nose',es:'👃 Nariz (nóus)'},{en:'Hand',es:'🖐️ Mano (jánd)'},{en:'Foot',es:'🦶 Pie (fút)'}
                    ]}
                ]},
                { id:'a1-6', name:'La Familia 👨‍👩‍👧', icon:'👨‍👩‍👧', questions:[
                    { type:'image_select', emoji:'👩', word:'Mother', soundsLike:'má-der', phonetic:'/ˈmʌð.ər/', prompt:'¿Quién es?', options:['Mother','Father','Sister','Brother'], correct:'Mother', es:'Madre', context:'My mother is kind (Mi madre es bondadosa)' },
                    { type:'image_select', emoji:'👨', word:'Father', soundsLike:'fá-der', phonetic:'/ˈfɑː.ðər/', prompt:'¿Quién es?', options:['Father','Mother','Grandpa','Baby'], correct:'Father', es:'Padre', context:'My father is strong (Mi padre es fuerte)' },
                    { type:'listen_select', word:'Baby', soundsLike:'béi-bi', phonetic:'/ˈbeɪ.bi/', prompt:'Escucha la palabra de la familia:', options:[{text:'Baby',emoji:'👶'},{text:'Sister',emoji:'👧'},{text:'Brother',emoji:'👦'},{text:'Mother',emoji:'👩'}], correct:'Baby', es:'Bebé', context:'The baby sleeps (El bebé duerme)' },
                    { type:'emoji_match', word:'Sister', soundsLike:'sís-ter', phonetic:'/ˈsɪs.tər/', prompt:'¿Cuál es el emoji de Sister?', emojis:['👧','👦','👩','👨'], correct:'👧', es:'Hermana', context:'My older sister (Mi hermana mayor)' },
                    { type:'translate', prompt:'My father and mother', answer:['Mi','padre','y','madre'], pool:['Mi','padre','y','madre','hermano','hermana','bebé','el'], context:'My father and mother (Mi padre y madre)' },
                    { type:'listen_select', word:'Brother', soundsLike:'bró-der', phonetic:'/ˈbrʌð.ər/', prompt:'Escucha y selecciona:', options:[{text:'Brother',emoji:'👦'},{text:'Sister',emoji:'👧'},{text:'Baby',emoji:'👶'},{text:'Father',emoji:'👨'}], correct:'Brother', es:'Hermano', context:'My little brother (Mi hermanito)' },
                    { type:'matching', prompt:'Empareja los miembros de la familia:', pairs:[
                        {en:'Mother',es:'👩 Madre (má-der)'},{en:'Father',es:'👨 Padre (fá-der)'},{en:'Sister',es:'👧 Hermana (sís-ter)'},{en:'Brother',es:'👦 Hermano (bró-der)'},{en:'Baby',es:'👶 Bebé (béi-bi)'}
                    ]}
                ]},
                { id:'a1-7', name:'Ropa & Vestimenta 👕', icon:'👕', questions:[
                    { type:'image_select', emoji:'👕', word:'Shirt', soundsLike:'shért', phonetic:'/ʃɜːrt/', prompt:'¿Qué prenda es?', options:['Shirt','Pants','Shoes','Hat'], correct:'Shirt', es:'Camisa', context:'A clean blue shirt (Una camisa azul limpia)' },
                    { type:'emoji_match', word:'Shoes', soundsLike:'shús', phonetic:'/ʃuːz/', prompt:'Selecciona el emoji de Shoes:', emojis:['👟','👕','🧢','👗'], correct:'👟', es:'Zapatos', context:'Comfortable running shoes (Zapatos cómodos para correr)' },
                    { type:'listen_select', word:'Hat', soundsLike:'ját', phonetic:'/hæt/', prompt:'Escucha y elige la prenda:', options:[{text:'Hat',emoji:'🧢'},{text:'Shirt',emoji:'👕'},{text:'Shoes',emoji:'👟'},{text:'Jacket',emoji:'🧥'}], correct:'Hat', es:'Sombrero', context:'Wear a warm hat (Usa un sombrero abrigado)' },
                    { type:'image_select', emoji:'👗', word:'Dress', soundsLike:'drés', phonetic:'/dres/', prompt:'¿Qué prenda es?', options:['Dress','Shirt','Socks','Hat'], correct:'Dress', es:'Vestido', context:'A pretty red dress (Un vestido rojo bonito)' },
                    { type:'translate', prompt:'My shirt and shoes', answer:['Mi','camisa','y','zapatos'], pool:['Mi','camisa','y','zapatos','vestido','sombrero','calcetines'], context:'My shirt and shoes (Mi camisa y zapatos)' },
                    { type:'listen_select', word:'Socks', soundsLike:'sóks', phonetic:'/sɑːks/', prompt:'Escucha la palabra:', options:[{text:'Socks',emoji:'🧦'},{text:'Shoes',emoji:'👟'},{text:'Shirt',emoji:'👕'},{text:'Dress',emoji:'👗'}], correct:'Socks', es:'Calcetines', context:'Warm white socks (Calcetines blancos abrigados)' },
                    { type:'matching', prompt:'Empareja la ropa:', pairs:[
                        {en:'Shirt',es:'👕 Camisa (shért)'},{en:'Shoes',es:'👟 Zapatos (shús)'},{en:'Hat',es:'🧢 Sombrero (ját)'},{en:'Dress',es:'👗 Vestido (drés)'},{en:'Socks',es:'🧦 Calcetines (sóks)'}
                    ]}
                ]},
                { id:'a1-8', name:'Casa & Objetos 🏠', icon:'📱', questions:[
                    { type:'image_select', emoji:'📱', word:'Phone', soundsLike:'fóun', phonetic:'/foʊn/', prompt:'¿Qué objeto es este?', options:['Phone','Book','Car','Key'], correct:'Phone', es:'Teléfono', context:'My smart phone (Mi teléfono inteligente)' },
                    { type:'image_select', emoji:'📚', word:'Book', soundsLike:'búk', phonetic:'/bʊk/', prompt:'¿Qué objeto es este?', options:['Book','Phone','Chair','Table'], correct:'Book', es:'Libro', context:'Read a good book (Lee un buen libro)' },
                    { type:'listen_select', word:'Key', soundsLike:'kí', phonetic:'/kiː/', prompt:'Escucha y elige el objeto:', options:[{text:'Key',emoji:'🔑'},{text:'Door',emoji:'🚪'},{text:'Phone',emoji:'📱'},{text:'Bed',emoji:'🛏️'}], correct:'Key', es:'Llave', context:'Key to the house (Llave de la casa)' },
                    { type:'emoji_match', word:'House', soundsLike:'jáus', phonetic:'/haʊs/', prompt:'¿Cuál es el emoji de House?', emojis:['🏠','🚪','🪑','📚'], correct:'🏠', es:'Casa', context:'A big white house (Una gran casa blanca)' },
                    { type:'translate', prompt:'Open the door please', answer:['Abre','la','puerta','por','favor'], pool:['Abre','la','puerta','por','favor','casa','llave','libro'], context:'Open the door please (Abre la puerta por favor)' },
                    { type:'listen_select', word:'Door', soundsLike:'dór', phonetic:'/dɔːr/', prompt:'Escucha la palabra:', options:[{text:'Door',emoji:'🚪'},{text:'House',emoji:'🏠'},{text:'Key',emoji:'🔑'},{text:'Book',emoji:'📚'}], correct:'Door', es:'Puerta', context:'Front door of the house (Puerta principal de la casa)' },
                    { type:'matching', prompt:'Empareja los objetos de casa:', pairs:[
                        {en:'Phone',es:'📱 Teléfono (fóun)'},{en:'Book',es:'📚 Libro (búk)'},{en:'Key',es:'🔑 Llave (kí)'},{en:'House',es:'🏠 Casa (jáus)'},{en:'Door',es:'🚪 Puerta (dór)'}
                    ]}
                ]},
                { id:'a1-9', name:'Naturaleza & Clima 🌿', icon:'☀️', questions:[
                    { type:'image_select', emoji:'☀️', word:'Sun', soundsLike:'sán', phonetic:'/sʌn/', prompt:'¿Qué elemento es?', options:['Sun','Moon','Star','Rain'], correct:'Sun', es:'Sol', context:'The sun is bright (El sol es brillante)' },
                    { type:'emoji_match', word:'Moon', soundsLike:'mún', phonetic:'/muːn/', prompt:'¿Cuál es el emoji de Moon?', emojis:['🌙','☀️','⭐','🌧️'], correct:'🌙', es:'Luna', context:'The moon at night (La luna de noche)' },
                    { type:'listen_select', word:'Star', soundsLike:'stár', phonetic:'/stɑːr/', prompt:'Escucha la palabra:', options:[{text:'Star',emoji:'⭐'},{text:'Sun',emoji:'☀️'},{text:'Moon',emoji:'🌙'},{text:'Tree',emoji:'🌳'}], correct:'Star', es:'Estrella', context:'Shining bright star (Estrella brillante)' },
                    { type:'image_select', emoji:'🌳', word:'Tree', soundsLike:'trí', phonetic:'/triː/', prompt:'¿Qué es esto?', options:['Tree','Flower','Fire','Rain'], correct:'Tree', es:'Árbol', context:'A tall green tree (Un árbol verde alto)' },
                    { type:'translate', prompt:'The sun and moon', answer:['El','sol','y','la','luna'], pool:['El','sol','y','la','luna','estrella','árbol','lluvia'], context:'The sun and moon (El sol y la luna)' },
                    { type:'listen_select', word:'Rain', soundsLike:'réin', phonetic:'/reɪn/', prompt:'Escucha y selecciona:', options:[{text:'Rain',emoji:'🌧️'},{text:'Sun',emoji:'☀️'},{text:'Star',emoji:'⭐'},{text:'Tree',emoji:'🌳'}], correct:'Rain', es:'Lluvia', context:'Cold rain falling (Lluvia fría cayendo)' },
                    { type:'matching', prompt:'Empareja la naturaleza:', pairs:[
                        {en:'Sun',es:'☀️ Sol (sán)'},{en:'Moon',es:'🌙 Luna (mún)'},{en:'Star',es:'⭐ Estrella (stár)'},{en:'Tree',es:'🌳 Árbol (trí)'},{en:'Rain',es:'🌧️ Lluvia (réin)'}
                    ]}
                ]},
                { id:'a1-10', name:'Transporte 🚗', icon:'🚗', questions:[
                    { type:'image_select', emoji:'🚗', word:'Car', soundsLike:'kár', phonetic:'/kɑːr/', prompt:'¿Qué vehículo es este?', options:['Car','Bus','Train','Airplane'], correct:'Car', es:'Carro', context:'A fast red car (Un carro rojo rápido)' },
                    { type:'emoji_match', word:'Bus', soundsLike:'bás', phonetic:'/bʌs/', prompt:'Selecciona el emoji de Bus:', emojis:['🚌','🚗','🚂','✈️'], correct:'🚌', es:'Autobús', context:'Yellow school bus (Autobús escolar amarillo)' },
                    { type:'listen_select', word:'Airplane', soundsLike:'ér-plein', phonetic:'/ˈer.pleɪn/', prompt:'Escucha y elige el transporte:', options:[{text:'Airplane',emoji:'✈️'},{text:'Boat',emoji:'🛥️'},{text:'Car',emoji:'🚗'},{text:'Bus',emoji:'🚌'}], correct:'Airplane', es:'Avión', context:'Airplane in the sky (Avión en el cielo)' },
                    { type:'image_select', emoji:'🚲', word:'Bicycle', soundsLike:'bái-si-kol', phonetic:'/ˈbaɪ.sə.kəl/', prompt:'¿Qué vehículo es?', options:['Bicycle','Car','Bus','Train'], correct:'Bicycle', es:'Bicicleta', context:'Ride a bicycle in the park (Montar bicicleta en el parque)' },
                    { type:'translate', prompt:'I drive my car', answer:['Yo','conduzco','mi','carro'], pool:['Yo','conduzco','mi','carro','autobús','bicicleta','avión'], context:'I drive my car (Yo conduzco mi carro)' },
                    { type:'listen_select', word:'Train', soundsLike:'tréin', phonetic:'/treɪn/', prompt:'Escucha la palabra:', options:[{text:'Train',emoji:'🚂'},{text:'Bus',emoji:'🚌'},{text:'Car',emoji:'🚗'},{text:'Airplane',emoji:'✈️'}], correct:'Train', es:'Tren', context:'Fast electric train (Tren eléctrico rápido)' },
                    { type:'matching', prompt:'Empareja los medios de transporte:', pairs:[
                        {en:'Car',es:'🚗 Carro (kár)'},{en:'Bus',es:'🚌 Autobús (bás)'},{en:'Train',es:'🚂 Tren (tréin)'},{en:'Airplane',es:'✈️ Avión (ér-plein)'},{en:'Bicycle',es:'🚲 Bicicleta (bái-si-kol)'}
                    ]}
                ]},
                { id:'a1-11', name:'Saludos & Cortesía 👋', icon:'👋', questions:[
                    { type:'image_select', emoji:'👋', word:'Hello', soundsLike:'je-lóu', phonetic:'/həˈloʊ/', prompt:'¿Cómo se saluda?', options:['Hello','Goodbye','Please','Thanks'], correct:'Hello', es:'Hola', context:'Hello, nice to meet you (Hola, gusto en conocerte)' },
                    { type:'emoji_match', word:'Goodbye', soundsLike:'gud-bái', phonetic:'/ˌɡʊdˈbaɪ/', prompt:'¿Cuál es Goodbye (Adiós)?', emojis:['👋','🤝','🙏','😄'], correct:'👋', es:'Adiós', context:'Goodbye, see you tomorrow (Adiós, nos vemos mañana)' },
                    { type:'listen_select', word:'Please', soundsLike:'plís', phonetic:'/pliːz/', prompt:'Escucha la palabra de cortesía:', options:[{text:'Please',emoji:'🙏'},{text:'Thanks',emoji:'✨'},{text:'Hello',emoji:'👋'},{text:'Yes',emoji:'👍'}], correct:'Please', es:'Por favor', context:'Help me please (Ayúdame por favor)' },
                    { type:'translate', prompt:'Hello and thank you', answer:['Hola','y','gracias'], pool:['Hola','y','gracias','por','favor','adiós','sí'], context:'Hello and thank you (Hola y gracias)' },
                    { type:'matching', prompt:'Empareja saludos y cortesía:', pairs:[
                        {en:'Hello',es:'👋 Hola (je-lóu)'},{en:'Goodbye',es:'👋 Adiós (gud-bái)'},{en:'Please',es:'🙏 Por favor (plís)'},{en:'Thank you',es:'✨ Gracias (zánk iu)'},{en:'Welcome',es:'🤝 Bienvenido (uél-kom)'}
                    ]}
                ]},
                { id:'a1-12', name:'Tiempo & Días ⏰', icon:'⏰', questions:[
                    { type:'image_select', emoji:'⏰', word:'Time', soundsLike:'táim', phonetic:'/taɪm/', prompt:'¿Qué concepto es?', options:['Time','Day','Night','Today'], correct:'Time', es:'Tiempo / Hora', context:'What time is it? (¿Qué hora es?)' },
                    { type:'emoji_match', word:'Day', soundsLike:'déi', phonetic:'/deɪ/', prompt:'¿Cuál representa Day (Día)?', emojis:['☀️','🌙','⏰','⭐'], correct:'☀️', es:'Día', context:'Have a nice day (Que tengas un buen día)' },
                    { type:'listen_select', word:'Night', soundsLike:'náit', phonetic:'/naɪt/', prompt:'Escucha la palabra:', options:[{text:'Night',emoji:'🌙'},{text:'Day',emoji:'☀️'},{text:'Time',emoji:'⏰'},{text:'Week',emoji:'📅'}], correct:'Night', es:'Noche', context:'Good night sleep well (Buenas noches duerme bien)' },
                    { type:'translate', prompt:'Good day and good night', answer:['Buen','día','y','buenas','noches'], pool:['Buen','día','y','buenas','noches','tarde','hora','hoy'], context:'Good day and good night (Buen día y buenas noches)' },
                    { type:'matching', prompt:'Empareja expresiones de tiempo:', pairs:[
                        {en:'Time',es:'⏰ Tiempo (táim)'},{en:'Day',es:'☀️ Día (déi)'},{en:'Night',es:'🌙 Noche (náit)'},{en:'Today',es:'📅 Hoy (tu-déi)'},{en:'Tomorrow',es:'🌅 Mañana (tu-mó-rou)'}
                    ]}
                ]}
            ]
        },
        A2: {
            title: "Vocabulario Fundamental (A2)",
            desc: "10 Unidades de verbos de acción, emociones, lugares, números, oficios y comida",
            lessons: [
                { id:'a2-1', name:'Verbos de Acción 🏃', icon:'🏃', questions:[
                    { type:'image_select', emoji:'🏃', word:'Run', soundsLike:'rán', phonetic:'/rʌn/', prompt:'¿Qué acción es esta?', options:['Run','Walk','Sleep','Eat'], correct:'Run', es:'Correr', context:'Run fast in the park (Corre rápido en el parque)' },
                    { type:'emoji_match', word:'Eat', soundsLike:'ít', phonetic:'/iːt/', prompt:'Selecciona el emoji de Eat:', emojis:['🍕','🏃','😴','📖'], correct:'🍕', es:'Comer', context:'Eat healthy food (Come comida saludable)' },
                    { type:'listen_select', word:'Sleep', soundsLike:'slíp', phonetic:'/sliːp/', prompt:'Escucha y selecciona la acción:', options:[{text:'Sleep',emoji:'😴'},{text:'Run',emoji:'🏃'},{text:'Read',emoji:'📖'},{text:'Jump',emoji:'🤸'}], correct:'Sleep', es:'Dormir', context:'Sleep eight hours (Duerme ocho horas)' },
                    { type:'translate', prompt:'I run and I eat', answer:['Yo','corro','y','yo','como'], pool:['Yo','corro','y','yo','como','duermo','bebo','camino'], context:'I run and I eat (Yo corro y yo como)' },
                    { type:'matching', prompt:'Empareja los verbos de acción:', pairs:[
                        {en:'Run',es:'🏃 Correr (rán)'},{en:'Eat',es:'🍕 Comer (ít)'},{en:'Drink',es:'💧 Beber (drínk)'},{en:'Sleep',es:'😴 Dormir (slíp)'},{en:'Read',es:'📖 Leer (ríd)'}
                    ]}
                ]},
                { id:'a2-2', name:'Emociones & Sentimientos 😊', icon:'😊', questions:[
                    { type:'image_select', emoji:'😊', word:'Happy', soundsLike:'já-pi', phonetic:'/ˈhæp.i/', prompt:'¿Qué emoción es esta?', options:['Happy','Sad','Angry','Tired'], correct:'Happy', es:'Feliz', context:'I am very happy today (Estoy muy feliz hoy)' },
                    { type:'emoji_match', word:'Sad', soundsLike:'sád', phonetic:'/sæd/', prompt:'¿Cuál es el emoji de Sad?', emojis:['😢','😊','😡','😴'], correct:'😢', es:'Triste', context:'Don’t be sad (No estés triste)' },
                    { type:'listen_select', word:'Angry', soundsLike:'án-gri', phonetic:'/ˈæŋ.ɡri/', prompt:'Escucha y selecciona la emoción:', options:[{text:'Angry',emoji:'😡'},{text:'Happy',emoji:'😊'},{text:'Tired',emoji:'😴'},{text:'Scared',emoji:'😱'}], correct:'Angry', es:'Enojado', context:'He is angry (Él está enojado)' },
                    { type:'translate', prompt:'I am happy not sad', answer:['Estoy','feliz','no','triste'], pool:['Estoy','feliz','no','triste','enojado','cansado','él'], context:'I am happy not sad (Estoy feliz no triste)' },
                    { type:'matching', prompt:'Empareja las emociones:', pairs:[
                        {en:'Happy',es:'😊 Feliz (já-pi)'},{en:'Sad',es:'😢 Triste (sád)'},{en:'Angry',es:'😡 Enojado (án-gri)'},{en:'Tired',es:'😴 Cansado (táierd)'},{en:'Scared',es:'😱 Asustado (skérd)'}
                    ]}
                ]},
                { id:'a2-3', name:'Lugares de la Ciudad 🏖️', icon:'🏖️', questions:[
                    { type:'image_select', emoji:'🏫', word:'School', soundsLike:'skúl', phonetic:'/skuːl/', prompt:'¿Qué lugar es este?', options:['School','Hospital','Park','Beach'], correct:'School', es:'Escuela', context:'Children go to school (Los niños van a la escuela)' },
                    { type:'listen_select', word:'Beach', soundsLike:'bích', phonetic:'/biːtʃ/', prompt:'Escucha y elige el lugar:', options:[{text:'Beach',emoji:'🏖️'},{text:'Park',emoji:'🏞️'},{text:'School',emoji:'🏫'},{text:'Hotel',emoji:'🏨'}], correct:'Beach', es:'Playa', context:'Sunny day at the beach (Día soleado en la playa)' },
                    { type:'image_select', emoji:'🏥', word:'Hospital', soundsLike:'jós-pi-tal', phonetic:'/ˈhɑː.spɪ.t̬əl/', prompt:'¿Qué lugar es este?', options:['Hospital','Park','Store','School'], correct:'Hospital', es:'Hospital', context:'Doctor at the hospital (Doctor en el hospital)' },
                    { type:'matching', prompt:'Empareja los lugares:', pairs:[
                        {en:'School',es:'🏫 Escuela (skúl)'},{en:'Hospital',es:'🏥 Hospital (jós-pi-tal)'},{en:'Park',es:'🏞️ Parque (párk)'},{en:'Beach',es:'🏖️ Playa (bích)'},{en:'Store',es:'🏪 Tienda (stór)'}
                    ]}
                ]},
                { id:'a2-4', name:'Números & Cantidades 🔢', icon:'🔢', questions:[
                    { type:'image_select', emoji:'1️⃣', word:'One', soundsLike:'uán', phonetic:'/wʌn/', prompt:'¿Qué número es?', options:['One','Two','Three','Four'], correct:'One', es:'Uno', context:'One apple (Una manzana)' },
                    { type:'emoji_match', word:'Two', soundsLike:'tú', phonetic:'/tuː/', prompt:'¿Cuál es el número Two?', emojis:['2️⃣','1️⃣','3️⃣','4️⃣'], correct:'2️⃣', es:'Dos', context:'Two dogs (Dos perros)' },
                    { type:'listen_select', word:'Three', soundsLike:'zrí', phonetic:'/θriː/', prompt:'Escucha el número:', options:[{text:'Three',emoji:'3️⃣'},{text:'Five',emoji:'5️⃣'},{text:'Four',emoji:'4️⃣'},{text:'Two',emoji:'2️⃣'}], correct:'Three', es:'Tres', context:'Three green trees (Tres árboles verdes)' },
                    { type:'matching', prompt:'Empareja los números:', pairs:[
                        {en:'One',es:'1️⃣ Uno (uán)'},{en:'Two',es:'2️⃣ Dos (tú)'},{en:'Three',es:'3️⃣ Tres (zrí)'},{en:'Four',es:'4️⃣ Cuatro (fór)'},{en:'Five',es:'5️⃣ Cinco (fáiv)'}
                    ]}
                ]},
                { id:'a2-5', name:'Adjetivos & Opuestos 🌟', icon:'🌟', questions:[
                    { type:'image_select', emoji:'🐘', word:'Big', soundsLike:'bíg', phonetic:'/bɪɡ/', prompt:'¿Qué cualidad es?', options:['Big','Small','Fast','Cold'], correct:'Big', es:'Grande', context:'A big elephant (Un elefante grande)' },
                    { type:'emoji_match', word:'Small', soundsLike:'smól', phonetic:'/smɔːl/', prompt:'¿Cuál representa Small?', emojis:['🐜','🐘','🔥','❄️'], correct:'🐜', es:'Pequeño', context:'A small ant (Una hormiga pequeña)' },
                    { type:'listen_select', word:'Hot', soundsLike:'jót', phonetic:'/hɑːt/', prompt:'Escucha y selecciona la cualidad:', options:[{text:'Hot',emoji:'🔥'},{text:'Cold',emoji:'❄️'},{text:'Fast',emoji:'⚡'},{text:'Slow',emoji:'🐢'}], correct:'Hot', es:'Caliente', context:'Hot cup of coffee (Taza de café caliente)' },
                    { type:'matching', prompt:'Empareja los adjetivos opuestos:', pairs:[
                        {en:'Big',es:'Grande (bíg)'},{en:'Small',es:'Pequeño (smól)'},{en:'Hot',es:'Caliente (jót)'},{en:'Cold',es:'Frío (kóuld)'},{en:'Fast',es:'Rápido (fást)'}
                    ]}
                ]},
                { id:'a2-6', name:'Verbos Cotidianos 🍳', icon:'🍳', questions:[
                    { type:'image_select', emoji:'🍳', word:'Cook', soundsLike:'kúk', phonetic:'/kʊk/', prompt:'¿Qué acción es esta?', options:['Cook','Wash','Clean','Open'], correct:'Cook', es:'Cocinar', context:'I cook delicious dinner (Cocino una cena deliciosa)' },
                    { type:'emoji_match', word:'Wash', soundsLike:'uósh', phonetic:'/wɑːʃ/', prompt:'¿Cuál es el emoji de Wash (Lavar)?', emojis:['🧼','🍳','🧹','🚪'], correct:'🧼', es:'Lavar', context:'Wash your hands (Lava tus manos)' },
                    { type:'listen_select', word:'Clean', soundsLike:'klín', phonetic:'/kliːn/', prompt:'Escucha y selecciona la acción:', options:[{text:'Clean',emoji:'🧹'},{text:'Cook',emoji:'🍳'},{text:'Wash',emoji:'🧼'},{text:'Sleep',emoji:'😴'}], correct:'Clean', es:'Limpiar', context:'Clean my bedroom (Limpiar mi habitación)' },
                    { type:'translate', prompt:'I wash and clean', answer:['Yo','lavo','y','limpio'], pool:['Yo','lavo','y','limpio','cocino','abro','cierro'], context:'I wash and clean (Yo lavo y limpio)' },
                    { type:'matching', prompt:'Empareja verbos cotidianos:', pairs:[
                        {en:'Cook',es:'🍳 Cocinar (kúk)'},{en:'Wash',es:'🧼 Lavar (uósh)'},{en:'Clean',es:'🧹 Limpiar (klín)'},{en:'Open',es:'🚪 Abrir (óupen)'},{en:'Close',es:'🔒 Cerrar (klóus)'}
                    ]}
                ]},
                { id:'a2-7', name:'Animales Salvajes 🦁', icon:'🦁', questions:[
                    { type:'image_select', emoji:'🦁', word:'Lion', soundsLike:'láion', phonetic:'/ˈlaɪ.ən/', prompt:'¿Qué animal salvaje es?', options:['Lion','Tiger','Elephant','Monkey'], correct:'Lion', es:'León', context:'King lion of the jungle (El león rey de la selva)' },
                    { type:'emoji_match', word:'Elephant', soundsLike:'él-e-fant', phonetic:'/ˈel.ə.fənt/', prompt:'¿Cuál es el Elephant?', emojis:['🐘','🦁','🐅','🐒'], correct:'🐘', es:'Elefante', context:'Giant grey elephant (Elefante gris gigante)' },
                    { type:'listen_select', word:'Monkey', soundsLike:'món-ki', phonetic:'/ˈmʌŋ.ki/', prompt:'Escucha la palabra:', options:[{text:'Monkey',emoji:'🐒'},{text:'Lion',emoji:'🦁'},{text:'Tiger',emoji:'🐅'},{text:'Bear',emoji:'🐻'}], correct:'Monkey', es:'Mono', context:'A playful monkey (Un mono juguetón)' },
                    { type:'matching', prompt:'Empareja animales salvajes:', pairs:[
                        {en:'Lion',es:'🦁 León (láion)'},{en:'Elephant',es:'🐘 Elefante (él-e-fant)'},{en:'Monkey',es:'🐒 Mono (món-ki)'},{en:'Tiger',es:'🐅 Tigre (tái-guer)'},{en:'Snake',es:'🐍 Serpiente (snéik)'}
                    ]}
                ]},
                { id:'a2-8', name:'Comida en Restaurante 🍽️', icon:'🍽️', questions:[
                    { type:'image_select', emoji:'🍗', word:'Chicken', soundsLike:'chí-ken', phonetic:'/ˈtʃɪk.ɪn/', prompt:'¿Qué comida es?', options:['Chicken','Meat','Rice','Soup'], correct:'Chicken', es:'Pollo', context:'Roasted chicken with salad (Pollo asado con ensalada)' },
                    { type:'emoji_match', word:'Rice', soundsLike:'ráis', phonetic:'/raɪs/', prompt:'¿Cuál es el Rice (Arroz)?', emojis:['🍚','🍗','🥩','🍲'], correct:'🍚', es:'Arroz', context:'White steamed rice (Arroz blanco al vapor)' },
                    { type:'listen_select', word:'Soup', soundsLike:'súp', phonetic:'/suːp/', prompt:'Escucha la palabra de comida:', options:[{text:'Soup',emoji:'🍲'},{text:'Salad',emoji:'🥗'},{text:'Chicken',emoji:'🍗'},{text:'Rice',emoji:'🍚'}], correct:'Soup', es:'Sopa', context:'Warm vegetable soup (Sopa caliente de verduras)' },
                    { type:'matching', prompt:'Empareja comidas de restaurante:', pairs:[
                        {en:'Chicken',es:'🍗 Pollo (chí-ken)'},{en:'Meat',es:'🥩 Carne (mít)'},{en:'Rice',es:'🍚 Arroz (ráis)'},{en:'Soup',es:'🍲 Sopa (súp)'},{en:'Salad',es:'🥗 Ensalada (sá-lad)'}
                    ]}
                ]},
                { id:'a2-9', name:'Profesiones & Oficios 👨‍⚕️', icon:'👨‍⚕️', questions:[
                    { type:'image_select', emoji:'👨‍⚕️', word:'Doctor', soundsLike:'dók-tor', phonetic:'/ˈdɑːk.tɚ/', prompt:'¿Qué profesión es esta?', options:['Doctor','Teacher','Police','Nurse'], correct:'Doctor', es:'Doctor', context:'The doctor helps patients (El doctor ayuda a los pacientes)' },
                    { type:'emoji_match', word:'Teacher', soundsLike:'tí-cher', phonetic:'/ˈtiː.tʃɚ/', prompt:'¿Cuál es Teacher (Profesor)?', emojis:['👩‍🏫','👨‍⚕️','👮','👨‍🍳'], correct:'👩‍🏫', es:'Profesor', context:'Our English teacher (Nuestro profesor de inglés)' },
                    { type:'listen_select', word:'Police', soundsLike:'po-lís', phonetic:'/pəˈliːs/', prompt:'Escucha la profesión:', options:[{text:'Police',emoji:'👮'},{text:'Doctor',emoji:'👨‍⚕️'},{text:'Teacher',emoji:'👩‍🏫'},{text:'Nurse',emoji:'👩‍⚕️'}], correct:'Police', es:'Policía', context:'Police officer on duty (Oficial de policía en servicio)' },
                    { type:'matching', prompt:'Empareja las profesiones:', pairs:[
                        {en:'Doctor',es:'👨‍⚕️ Doctor (dók-tor)'},{en:'Teacher',es:'👩‍🏫 Profesor (tí-cher)'},{en:'Police',es:'👮 Policía (po-lís)'},{en:'Nurse',es:'👩‍⚕️ Enfermero (nérs)'},{en:'Chef',es:'👨‍🍳 Chef / Cocinero (shéf)'}
                    ]}
                ]},
                { id:'a2-10', name:'Tiempo Libre & Deportes ⚽', icon:'⚽', questions:[
                    { type:'image_select', emoji:'⚽', word:'Soccer', soundsLike:'só-ker', phonetic:'/ˈsɑː.kɚ/', prompt:'¿Qué deporte es este?', options:['Soccer','Music','Dance','Game'], correct:'Soccer', es:'Fútbol', context:'Play soccer with friends (Jugar fútbol con amigos)' },
                    { type:'emoji_match', word:'Music', soundsLike:'miú-zik', phonetic:'/ˈmjuː.zɪk/', prompt:'¿Cuál es Music (Música)?', emojis:['🎵','⚽','🎮','💃'], correct:'🎵', es:'Música', context:'Listen to good music (Escuchar buena música)' },
                    { type:'listen_select', word:'Dance', soundsLike:'dáns', phonetic:'/dæns/', prompt:'Escucha la acción de tiempo libre:', options:[{text:'Dance',emoji:'💃'},{text:'Sing',emoji:'🎤'},{text:'Play',emoji:'🎮'},{text:'Music',emoji:'🎵'}], correct:'Dance', es:'Bailar', context:'Dance to the rhythm (Bailar al ritmo)' },
                    { type:'matching', prompt:'Empareja pasatiempos y deportes:', pairs:[
                        {en:'Soccer',es:'⚽ Fútbol (só-ker)'},{en:'Music',es:'🎵 Música (miú-zik)'},{en:'Dance',es:'💃 Bailar (dáns)'},{en:'Sing',es:'🎤 Cantar (síng)'},{en:'Game',es:'🎮 Juego (guéim)'}
                    ]}
                ]}
            ]
        },
        B1: {
            title: "Situaciones Reales (B1)",
            desc: "6 Unidades de viajes, oficina, hoteles, supermercado, salud y restaurantes",
            lessons: [
                { id:'b1-1', name:'Viajes & Aeropuerto ✈️', icon:'✈️', questions:[
                    { type:'image_select', emoji:'🛂', word:'Passport', soundsLike:'pás-port', phonetic:'/ˈpæs.pɔːrt/', prompt:'¿Qué documento es?', options:['Passport','Ticket','Money','Hotel'], correct:'Passport', es:'Pasaporte', context:'Show your passport at security (Muestra tu pasaporte en seguridad)' },
                    { type:'emoji_match', word:'Luggage', soundsLike:'lá-guij', phonetic:'/ˈlʌɡ.ɪdʒ/', prompt:'¿Cuál es Luggage?', emojis:['🧳','🎫','✈️','🏨'], correct:'🧳', es:'Equipaje', context:'Heavy luggage bags (Maletas de equipaje pesado)' },
                    { type:'listen_select', word:'Ticket', soundsLike:'tí-ket', phonetic:'/ˈtɪk.ɪt/', prompt:'Escucha la palabra:', options:[{text:'Ticket',emoji:'🎫'},{text:'Passport',emoji:'🛂'},{text:'Money',emoji:'💵'},{text:'Hotel',emoji:'🏨'}], correct:'Ticket', es:'Boleto', context:'Boarding ticket (Boleto de abordar)' },
                    { type:'translate', prompt:'I need my passport and ticket', answer:['Necesito','mi','pasaporte','y','boleto'], pool:['Necesito','mi','pasaporte','y','boleto','maleta','hotel'], context:'I need my passport and ticket (Necesito mi pasaporte y boleto)' },
                    { type:'matching', prompt:'Empareja términos de viaje:', pairs:[
                        {en:'Passport',es:'🛂 Pasaporte (pás-port)'},{en:'Ticket',es:'🎫 Boleto (tí-ket)'},{en:'Luggage',es:'🧳 Equipaje (lá-guij)'},{en:'Airport',es:'✈️ Aeropuerto (ér-port)'},{en:'Hotel',es:'🏨 Hotel (jo-tél)'}
                    ]}
                ]},
                { id:'b1-2', name:'Oficina & Negocios 💼', icon:'💼', questions:[
                    { type:'image_select', emoji:'💻', word:'Computer', soundsLike:'kom-piú-ter', phonetic:'/kəmˈpjuː.t̬ɚ/', prompt:'¿Qué equipo es?', options:['Computer','Phone','Desk','Paper'], correct:'Computer', es:'Computadora', context:'Work on my computer (Trabajar en mi computadora)' },
                    { type:'listen_select', word:'Meeting', soundsLike:'mí-ting', phonetic:'/ˈmiː.tɪŋ/', prompt:'Escucha la palabra:', options:[{text:'Meeting',emoji:'👥'},{text:'Email',emoji:'📧'},{text:'Office',emoji:'🏢'},{text:'Boss',emoji:'👔'}], correct:'Meeting', es:'Reunión', context:'Schedule an important meeting (Programar una reunión importante)' },
                    { type:'matching', prompt:'Empareja palabras de oficina:', pairs:[
                        {en:'Computer',es:'💻 Computadora (kom-piú-ter)'},{en:'Email',es:'📧 Correo (í-meil)'},{en:'Meeting',es:'👥 Reunión (mí-ting)'},{en:'Office',es:'🏢 Oficina (ó-fis)'},{en:'Boss',es:'👔 Jefe (bós)'}
                    ]}
                ]},
                { id:'b1-3', name:'En el Hotel 🏨', icon:'🏨', questions:[
                    { type:'image_select', emoji:'🏨', word:'Hotel', soundsLike:'jo-tél', phonetic:'/hoʊˈtel/', prompt:'¿Qué establecimiento es?', options:['Hotel','Airport','Office','School'], correct:'Hotel', es:'Hotel', context:'Book a nice hotel room (Reservar una buena habitación de hotel)' },
                    { type:'emoji_match', word:'Keycard', soundsLike:'kí-kard', phonetic:'/ˈkiː.kɑːrd/', prompt:'¿Cuál es la tarjeta Keycard?', emojis:['💳','🏨','🛏️','🔑'], correct:'💳', es:'Tarjeta Llave', context:'Your room keycard (Tu tarjeta llave de habitación)' },
                    { type:'listen_select', word:'Bed', soundsLike:'béd', phonetic:'/bed/', prompt:'Escucha la palabra:', options:[{text:'Bed',emoji:'🛏️'},{text:'Door',emoji:'🚪'},{text:'Hotel',emoji:'🏨'},{text:'Keycard',emoji:'💳'}], correct:'Bed', es:'Cama', context:'Comfortable king bed (Cama king cómoda)' },
                    { type:'matching', prompt:'Empareja términos de hotel:', pairs:[
                        {en:'Hotel',es:'🏨 Hotel (jo-tél)'},{en:'Room',es:'🚪 Habitación (rúm)'},{en:'Keycard',es:'💳 Tarjeta Llave (kí-kard)'},{en:'Bed',es:'🛏️ Cama (béd)'},{en:'Reception',es:'🛎️ Recepción (re-sép-shon)'}
                    ]}
                ]},
                { id:'b1-4', name:'Supermercado & Compras 🛒', icon:'🛒', questions:[
                    { type:'image_select', emoji:'🛒', word:'Cart', soundsLike:'kárt', phonetic:'/kɑːrt/', prompt:'¿Qué objeto de compras es?', options:['Cart','Bag','Cash','Card'], correct:'Cart', es:'Carrito', context:'Fill the shopping cart (Llenar el carrito de compras)' },
                    { type:'emoji_match', word:'Cash', soundsLike:'kásh', phonetic:'/kæʃ/', prompt:'¿Cuál representa Cash (Efectivo)?', emojis:['💵','🛒','💳','🧾'], correct:'💵', es:'Efectivo', context:'Pay with cash (Pagar con efectivo)' },
                    { type:'listen_select', word:'Discount', soundsLike:'dís-kaunt', phonetic:'/ˈdɪs.kaʊnt/', prompt:'Escucha la palabra de compras:', options:[{text:'Discount',emoji:'🏷️'},{text:'Cash',emoji:'💵'},{text:'Receipt',emoji:'🧾'},{text:'Cart',emoji:'🛒'}], correct:'Discount', es:'Descuento', context:'Special discount today (Descuento especial hoy)' },
                    { type:'matching', prompt:'Empareja términos de compras:', pairs:[
                        {en:'Cart',es:'🛒 Carrito (kárt)'},{en:'Cash',es:'💵 Efectivo (kásh)'},{en:'Receipt',es:'🧾 Recibo (ri-sít)'},{en:'Discount',es:'🏷️ Descuento (dís-kaunt)'},{en:'Price',es:'💲 Precio (práis)'}
                    ]}
                ]},
                { id:'b1-5', name:'Salud & Farmacia 🏥', icon:'🏥', questions:[
                    { type:'image_select', emoji:'💊', word:'Medicine', soundsLike:'méd-i-sin', phonetic:'/ˈmed.ə.sɪn/', prompt:'¿Qué producto médico es?', options:['Medicine','Bandage','Doctor','Water'], correct:'Medicine', es:'Medicina', context:'Take your daily medicine (Toma tu medicina diaria)' },
                    { type:'listen_select', word:'Emergency', soundsLike:'i-mér-jen-si', phonetic:'/ɪˈmɝː.dʒən.si/', prompt:'Escucha la palabra:', options:[{text:'Emergency',emoji:'🚨'},{text:'Medicine',emoji:'💊'},{text:'Hospital',emoji:'🏥'},{text:'Doctor',emoji:'👨‍⚕️'}], correct:'Emergency', es:'Emergencia', context:'Call emergency service (Llamar al servicio de emergencias)' },
                    { type:'matching', prompt:'Empareja términos de salud:', pairs:[
                        {en:'Medicine',es:'💊 Medicina (méd-i-sin)'},{en:'Emergency',es:'🚨 Emergencia (i-mér-jen-si)'},{en:'Hospital',es:'🏥 Hospital (jós-pi-tal)'},{en:'Doctor',es:'👨‍⚕️ Doctor (dók-tor)'},{en:'Pain',es:'🤕 Dolor (péin)'}
                    ]}
                ]},
                { id:'b1-6', name:'Restaurante & Cuentas 🍽️', icon:'🍽️', questions:[
                    { type:'image_select', emoji:'📜', word:'Menu', soundsLike:'mé-niu', phonetic:'/ˈmen.juː/', prompt:'¿Qué documento del restaurante es?', options:['Menu','Bill','Tip','Water'], correct:'Menu', es:'Menú', context:'Look at the dinner menu (Mira el menú de la cena)' },
                    { type:'listen_select', word:'Bill', soundsLike:'bíl', phonetic:'/bɪl/', prompt:'Escucha la palabra:', options:[{text:'Bill',emoji:'🧾'},{text:'Menu',emoji:'📜'},{text:'Tip',emoji:'🪙'},{text:'Table',emoji:'🪑'}], correct:'Bill', es:'Cuenta', context:'Can I have the bill please? (¿Me da la cuenta por favor?)' },
                    { type:'matching', prompt:'Empareja palabras de restaurante:', pairs:[
                        {en:'Menu',es:'📜 Menú (mé-niu)'},{en:'Bill',es:'🧾 Cuenta (bíl)'},{en:'Tip',es:'🪙 Propina (típ)'},{en:'Waiter',es:'🤵 Mesero (uéi-ter)'},{en:'Order',es:'🍽️ Orden (ór-der)'}
                    ]}
                ]}
            ]
        },
        C1: {
            title: "Fluidez & Modismos (C1)",
            desc: "4 Unidades de modismos nativos, phrasal verbs y debate avanzado",
            lessons: [
                { id:'c1-1', name:'Native Idioms 🚀', icon:'🚀', questions:[
                    { type:'choice', prompt:'¿Qué significa "Break a leg"?', options:['¡Buena suerte!','Rómpete una pierna','Cálmate','Llegas tarde'], correct:'¡Buena suerte!', es:'¡Buena suerte!', context:'Break a leg in your presentation (¡Buena suerte en tu presentación!)' },
                    { type:'choice', prompt:'¿Qué significa "Piece of cake"?', options:['Muy fácil','Un pastel','Muy caro','Imposible'], correct:'Muy fácil', es:'Muy fácil', context:'The test was a piece of cake (El examen fue muy fácil)' },
                    { type:'matching', prompt:'Empareja modismos nativos:', pairs:[
                        {en:'Break a leg',es:'¡Buena suerte! (bréik a lég)'},{en:'Piece of cake',es:'Muy fácil (pís of kéik)'},{en:'Under the weather',es:'Enfermo (án-der de ué-der)'},{en:'Time flies',es:'El tiempo vuela (táim fláis)'},{en:'Hit the books',es:'Estudiar (jít de búks)'}
                    ]}
                ]},
                { id:'c1-2', name:'Expresiones Nativas 🎯', icon:'🎯', questions:[
                    { type:'choice', prompt:'¿Qué significa "Hit the road"?', options:['Ponerse en marcha / Salir','Golpear el camino','Manejar rápido','Perderse'], correct:'Ponerse en marcha / Salir', es:'Salir de viaje', context:'Let’s hit the road now (Pongámonos en marcha ahora)' },
                    { type:'choice', prompt:'¿Qué significa "Call it a day"?', options:['Dar por terminado el día','Llamar a un amigo','Empezar el día','Celebrar'], correct:'Dar por terminado el día', es:'Terminar por hoy', context:'It is late, let’s call it a day (Es tarde, terminemos por hoy)' },
                    { type:'matching', prompt:'Empareja expresiones nativas:', pairs:[
                        {en:'Hit the road',es:'Ponerse en marcha (jít de róud)'},{en:'Call it a day',es:'Terminar por hoy (kól it a déi)'},{en:'No way',es:'¡De ninguna manera! (nóu uéi)'},{en:'So far so good',es:'Hasta ahora todo bien (sóu far sóu gud)'},{en:'Never mind',es:'No importa (né-ver máind)'}
                    ]}
                ]},
                { id:'c1-3', name:'Conectores de Debate 🔗', icon:'🔗', questions:[
                    { type:'choice', prompt:'¿Qué significa el conector "Furthermore"?', options:['Además / Asimismo','Sin embargo','Por lo tanto','Por el contrario'], correct:'Además / Asimismo', es:'Además', context:'Furthermore, the results are positive (Asimismo, los resultados son positivos)' },
                    { type:'choice', prompt:'¿Qué significa "However"?', options:['Sin embargo','Por qué','Siempre','Nunca'], correct:'Sin embargo', es:'Sin embargo', context:'However, we need more time (Sin embargo, necesitamos más tiempo)' },
                    { type:'matching', prompt:'Empareja conectores avanzados:', pairs:[
                        {en:'Furthermore',es:'Asimismo / Además (fér-der-mor)'},{en:'However',es:'Sin embargo (jau-é-ver)'},{en:'Therefore',es:'Por lo tanto (dér-for)'},{en:'In conclusion',es:'En conclusión (in kon-klú-shon)'},{en:'On the other hand',es:'Por otro lado (on di ó-der jánd)'}
                    ]}
                ]},
                { id:'c1-4', name:'Phrasal Verbs Clave ⚡', icon:'⚡', questions:[
                    { type:'choice', prompt:'¿Qué significa el phrasal verb "Give up"?', options:['Rendirse','Regalar algo','Subir','Aumentar'], correct:'Rendirse', es:'Rendirse', context:'Never give up on your dreams (Nunca te rindas en tus sueños)' },
                    { type:'choice', prompt:'¿Qué significa "Find out"?', options:['Descubrir / Enterarse','Buscar afuera','Perder','Salir'], correct:'Descubrir / Enterarse', es:'Descubrir', context:'I need to find out the truth (Necesito descubrir la verdad)' },
                    { type:'matching', prompt:'Empareja los phrasal verbs:', pairs:[
                        {en:'Give up',es:'Rendirse (guív áp)'},{en:'Find out',es:'Descubrir (fáind áut)'},{en:'Look after',es:'Cuidar a alguien (lúk áf-ter)'},{en:'Turn down',es:'Rechazar / Bajar volumen (térn dáun)'},{en:'Carry on',es:'Continuar (ká-ri on)'}
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

    // ====== DOM ELEMENTS ======
    const $=id=>document.getElementById(id);
    const levelSelectorBtn=$('level-selector-btn'),levelDrawer=$('level-drawer'),currentLevelBadge=$('current-level-badge');
    const levelOpts = document.querySelectorAll('.level-opt');
    const pathTree=$('path-tree'),bannerUnit=$('banner-unit'),bannerTitle=$('banner-title'),bannerDesc=$('banner-desc');
    const lessonView=$('lesson-view'),closeLessonBtn=$('close-lesson-btn'),progressFill=$('lesson-progress-fill'),lessonHeartsCount=$('lesson-hearts-count');
    const promptTitle=$('prompt-title'),promptText=$('prompt-text'),ttsNormal=$('tts-normal-btn'),ttsSlow=$('tts-slow-btn');
    const modImageSelect=$('mod-image-select'),bigEmoji=$('big-emoji'),imageOptions=$('image-options'),phoneticBadge=$('phonetic-badge'),soundsLikePill=$('sounds-like-pill'),wordContextBox=$('word-context-box');
    const modEmojiMatch=$('mod-emoji-match'),bigWord=$('big-word'),emojiOptions=$('emoji-options'),bigWordPhonetic=$('big-word-phonetic'),bigWordSoundsLike=$('big-word-sounds-like'),bigWordContextBox=$('big-word-context-box');
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
    const dictionaryCategories=$('dictionary-categories');

    // ====== TUTORIAL ======
    const tutSteps=[
        {t:'¡Hola! 👋 Te enseñaremos palabras en inglés con imágenes, pronunciación y frases de contexto.',m:'🤖'},
        {t:'🗣️ Fíjate en "Suena: kat" para pronunciar como un nativo.',m:'🎧'},
        {t:'📌 Lee la frase de contexto para saber exactamente cómo usar la palabra.',m:'📚'},
        {t:'💡 ¡Acumula combos 🔥 respondiendo bien seguido!',m:'🏆'}
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
    }));

    // ====== NAV TABS ======
    document.querySelectorAll('.nav-tab').forEach(t=>t.addEventListener('click',()=>{
        playClick();
        const id=t.dataset.target;
        document.querySelectorAll('.nav-tab').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        document.querySelectorAll('.view').forEach(v=>{v.id===id?v.classList.add('active'):v.classList.remove('active');});
        if(id==='dictionary-view')renderDictionary();
    }));

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
            nextCard.querySelector('.next-level-btn').addEventListener('click', () => {
                playSuccess();
                state.currentLevel = nextLvlKey;
                state.unlockedIndex[nextLvlKey] = Math.max(state.unlockedIndex[nextLvlKey] || 1, 1);
                if (currentLevelBadge) currentLevelBadge.textContent = state.currentLevel;
                levelOpts.forEach(o => o.classList.toggle('active', o.dataset.level === state.currentLevel));
                saveProgress();
                renderPath();
                renderDictionary();
            });
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
                            ${q.context ? `<span class="dict-context">📌 ${q.context}</span>` : ''}
                        </div>
                        <button class="dict-listen-btn">🔊</button>
                    `;
                    card.querySelector('.dict-listen-btn').onclick = () => speak(q.word, 0.85);
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
            if(soundsLikePill) soundsLikePill.textContent=q.soundsLike ? `🗣️ Suena: "${q.soundsLike}"` : '';
            if(phoneticBadge) phoneticBadge.textContent=q.phonetic||'';
            if(wordContextBox) wordContextBox.innerHTML=q.context ? `📌 <em>"${q.context}"</em>` : '';
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
            if(bigWordSoundsLike) bigWordSoundsLike.textContent=q.soundsLike ? `🗣️ Suena: "${q.soundsLike}"` : '';
            if(bigWordPhonetic) bigWordPhonetic.textContent=q.phonetic||'';
            if(bigWordContextBox) bigWordContextBox.innerHTML=q.context ? `📌 <em>"${q.context}"</em>` : '';
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
            promptTitle.textContent='Traduce al español';promptText.textContent=q.prompt;
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
            playError();updateCombo(false);triggerHeartLoss();state.hearts=Math.max(0,state.hearts-1);updateStats();
            feedbackSheet.className='feedback-sheet show error';feedbackIcon.textContent='✕';
            feedbackTitleEl.textContent='No te preocupes, la respuesta era:';
            feedbackSubtitle.textContent=q.word?`${q.word} (Suena: "${q.soundsLike||''}")` : (q.correct||'Sigue practicando');
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
        renderDictionary();
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

    renderPath();renderDictionary();updateStats();showTutorial();
});
