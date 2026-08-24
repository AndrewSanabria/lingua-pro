#!/usr/bin/env python3
"""Expand Lingua Pro lessons with more exercises and write curriculum.js"""
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads(Path("/tmp/lingua-data.json").read_text())

# extra: word, es, emoji, sounds, ipa, syllables, mouth, context, blank_sentence, distractors
EXTRAS = {
    "k0-1": [
        ["Pig", "Cerdo", "🐷", "pig", "/pɪɡ/", "PIG (1 palma)", "Junta los labios: P-ig 👄", "The pink pig says oink (El cerdo rosa hace oink)", "The ___ says oink.", ["Cow", "Cat", "Dog"]],
        ["Frog", "Rana", "🐸", "frog", "/frɑːɡ/", "FROG (1 palma)", "Dientes en el labio: F-rog 🐰", "The green frog jumps (La rana verde salta)", "The green ___ jumps.", ["Duck", "Sheep", "Cat"]],
        ["Horse", "Caballo", "🐴", "jórs", "/hɔːrs/", "JÓRS (1 palma)", "Soplo suave: J-ors 💨", "The horse runs fast (El caballo corre rápido)", "The ___ runs fast.", ["Cow", "Dog", "Pig"]],
        ["Bee", "Abeja", "🐝", "bí", "/biː/", "BÍ (1 palma)", "Labios juntos: B-ee 👄", "The bee says bzzz (La abeja hace bzzz)", "The ___ says bzzz.", ["Cat", "Duck", "Frog"]],
    ],
    "k0-2": [
        ["Hungry", "Hambre", "😋", "ján-gri", "/ˈhʌŋ.ɡri/", "JÁN-GRI (2 palmas)", "Soplo suave: Ján-gri 💨", "I am hungry (Tengo hambre)", "I am ___.", ["Sleep", "Help", "Pain"]],
        ["Thirsty", "Sed", "🥤", "zérs-ti", "/ˈθɝː.sti/", "ZÉRS-TI (2 palmas)", "Lengua entre dientes: Zers-ti 👅", "I am thirsty (Tengo sed)", "I am ___.", ["Hungry", "Sleep", "Help"]],
        ["More", "Más", "➕", "mór", "/mɔːr/", "MÓR (1 palma)", "Junta labios: M-or 👄", "I want more please (Quiero más por favor)", "I want ___ please.", ["Stop", "Help", "Water"]],
        ["Stop", "Alto", "🛑", "stóp", "/stɑːp/", "STÓP (1 palma)", "Lengua arriba: St-op 👅", "Please stop (Por favor alto)", "Please ___.", ["Help", "More", "Play"]],
    ],
    "k0-3": [
        ["Elephant", "Elefante", "🐘", "é-le-fant", "/ˈel.ɪ.fənt/", "É-LE-FANT (3 palmas)", "Boca abierta: É-le-fant 👄", "A big elephant (Un elefante grande)", "A big ___.", ["Banana", "Baby", "Tomato"]],
        ["Watermelon", "Sandía", "🍉", "uó-ter-me-lon", "/ˈwɔː.tɚˌmel.ən/", "UÓ-TER-ME-LON (4 palmas)", "Redondea labios: Uó-ter 👄", "Sweet watermelon (Sandía dulce)", "Sweet ___.", ["Apple", "Banana", "Tomato"]],
        ["Umbrella", "Paraguas", "☂️", "am-bré-la", "/ʌmˈbrel.ə/", "AM-BRÉ-LA (3 palmas)", "Labios juntos: Am-bré-la 👄", "Open the umbrella (Abre el paraguas)", "Open the ___.", ["Banana", "Baby", "Apple"]],
        ["Computer", "Computadora", "💻", "kom-piú-ter", "/kəmˈpjuː.tɚ/", "KOM-PIÚ-TER (3 palmas)", "Explosión suave: Kom-piú-ter 👄", "A small computer (Una computadora pequeña)", "A small ___.", ["Banana", "Tomato", "Baby"]],
    ],
    "k0-4": [
        ["Sad", "Triste", "😢", "sád", "/sæd/", "SÁD (1 palma)", "Sonrisa invertida: S-ad 👄", "I feel sad (Me siento triste)", "I feel ___.", ["Happy", "Calm", "Love"]],
        ["Angry", "Enojado", "😡", "án-gri", "/ˈæŋ.ɡri/", "ÁN-GRI (2 palmas)", "Boca abierta: Án-gri 👄", "I feel angry (Me siento enojado)", "I feel ___.", ["Happy", "Sad", "Calm"]],
        ["Scared", "Asustado", "😨", "skéard", "/skerd/", "SKÉARD (1 palma)", "Sonido de S: S-cared 🐍", "I feel scared (Me siento asustado)", "I feel ___.", ["Happy", "Proud", "Calm"]],
        ["Tired", "Cansado", "🥱", "tái-erd", "/ˈtaɪ.ɚd/", "TÁI-ERD (2 palmas)", "Lengua arriba: Tái-erd 👅", "I am tired (Estoy cansado)", "I am ___.", ["Happy", "Love", "Proud"]],
    ],
    "k0-5": [
        ["Map", "Mapa", "🗺️", "map", "/mæp/", "MAP (1 palma)", "Junta labios: M-ap 👄", "Look at the map (Mira el mapa)", "Look at the ___.", ["Milk", "Moon", "Hat"]],
        ["Bat", "Murciélago", "🦇", "bat", "/bæt/", "BAT (1 palma)", "Explosión: B-at 👄", "A small bat (Un murciélago pequeño)", "A small ___.", ["Ball", "Hat", "Pen"]],
        ["Cap", "Gorra", "🧢", "kap", "/kæp/", "KAP (1 palma)", "Explosión suave: K-ap 👄", "A blue cap (Una gorra azul)", "A blue ___.", ["Hat", "Pen", "Ball"]],
        ["Pan", "Sartén", "🍳", "pan", "/pæn/", "PAN (1 palma)", "Explosión: P-an 👄", "A cooking pan (Una sartén)", "A cooking ___.", ["Pen", "Hat", "Milk"]],
    ],
    "k0-6": [
        ["Eat", "Comer", "🍽️", "ít", "/iːt/", "ÍT (1 palma)", "Boca sonriente: Í-t 👄", "Time to eat (Hora de comer)", "Time to ___.", ["Wash", "Play", "Sleep"]],
        ["Drink", "Beber", "🥤", "drínk", "/drɪŋk/", "DRÍNK (1 palma)", "Lengua arriba: Dr-ink 👅", "Drink water (Bebe agua)", "___ water.", ["Eat", "Wash", "Play"]],
        ["School", "Escuela", "🏫", "skúl", "/skuːl/", "SKÚL (1 palma)", "Sonido S: S-kul 🐍", "Go to school (Ve a la escuela)", "Go to ___.", ["Bed", "Park", "Home"]],
        ["Home", "Casa", "🏠", "jóum", "/hoʊm/", "JÓUM (1 palma)", "Soplo: J-ome 💨", "I go home (Voy a casa)", "I go ___.", ["School", "Bed", "Park"]],
    ],
    "k0-7": [
        ["Mouth", "Boca", "👄", "máuz", "/maʊθ/", "MÁUZ (1 palma)", "Junta labios: M-outh 👄", "Open your mouth (Abre tu boca)", "Open your ___.", ["Hand", "Eye", "Ear"]],
        ["Head", "Cabeza", "🤕", "jéd", "/hed/", "JÉD (1 palma)", "Soplo: J-ead 💨", "Touch your head (Toca tu cabeza)", "Touch your ___.", ["Hand", "Foot", "Nose"]],
        ["Leg", "Pierna", "🦵", "leg", "/leɡ/", "LEG (1 palma)", "Lengua arriba: L-eg 👅", "Move your leg (Mueve tu pierna)", "Move your ___.", ["Hand", "Foot", "Eye"]],
        ["Hair", "Cabello", "💇", "jér", "/her/", "JÉR (1 palma)", "Soplo: J-air 💨", "Brush your hair (Cepilla tu cabello)", "Brush your ___.", ["Hand", "Nose", "Ear"]],
    ],
    "k0-8": [
        ["Triangle", "Triángulo", "🔺", "trái-an-gol", "/ˈtraɪ.æŋ.ɡəl/", "TRÁI-AN-GOL (3 palmas)", "Lengua arriba: Trái 👅", "A red triangle (Un triángulo rojo)", "A red ___.", ["Circle", "Star", "Square"]],
        ["Moon", "Luna", "🌙", "mún", "/muːn/", "MÚN (1 palma)", "Junta labios: M-oon 👄", "The bright moon (La luna brillante)", "The bright ___.", ["Sun", "Star", "Heart"]],
        ["Cloud", "Nube", "☁️", "kláud", "/klaʊd/", "KLÁUD (1 palma)", "Explosión: Cl-oud 👄", "A white cloud (Una nube blanca)", "A white ___.", ["Sun", "Star", "Moon"]],
        ["Diamond", "Diamante", "💎", "dái-mond", "/ˈdaɪ.mənd/", "DÁI-MOND (2 palmas)", "Lengua arriba: Dái-mond 👅", "A shiny diamond (Un diamante brillante)", "A shiny ___.", ["Star", "Heart", "Circle"]],
    ],
    "k0-9": [
        ["Banana", "Plátano", "🍌", "ba-ná-na", "/bəˈnæn.ə/", "BA-NÁ-NA (3 palmas)", "Labios: Ba-na-na 👄", "A yellow banana (Un plátano amarillo)", "A yellow ___.", ["Apple", "Cookie", "Bread"]],
        ["Milk", "Leche", "🥛", "mílk", "/mɪlk/", "MÍLK (1 palma)", "Junta labios: M-ilk 👄", "Drink cold milk (Bebe leche fría)", "Drink cold ___.", ["Juice", "Water", "Soup"]],
        ["Soup", "Sopa", "🍲", "súp", "/suːp/", "SÚP (1 palma)", "Sonido S: S-oup 🐍", "Hot soup please (Sopa caliente por favor)", "Hot ___ please.", ["Juice", "Bread", "Cheese"]],
        ["Egg", "Huevo", "🥚", "eg", "/eɡ/", "EG (1 palma)", "Boca abierta: E-gg 👄", "A breakfast egg (Un huevo de desayuno)", "A breakfast ___.", ["Bread", "Cheese", "Cookie"]],
    ],
    "k0-10": [
        ["Grandma", "Abuela", "👵", "gránd-ma", "/ˈɡræn.mɑː/", "GRÁND-MA (2 palmas)", "Lengua atrás: Grand-ma 👅", "I love grandma (Amo a la abuela)", "I love ___.", ["Mom", "Dad", "Sister"]],
        ["Grandpa", "Abuelo", "👴", "gránd-pa", "/ˈɡræn.pɑː/", "GRÁND-PA (2 palmas)", "Lengua atrás: Grand-pa 👅", "I hug grandpa (Abrazo al abuelo)", "I hug ___.", ["Dad", "Mom", "Brother"]],
        ["Friend", "Amigo", "😊", "frend", "/frend/", "FREND (1 palma)", "Dientes en labio: Fr-end 🐰", "My best friend (Mi mejor amigo)", "My best ___.", ["Mom", "Dad", "Baby"]],
        ["Home", "Hogar", "🏠", "jóum", "/hoʊm/", "JÓUM (1 palma)", "Soplo: J-ome 💨", "Family at home (Familia en casa)", "Family at ___.", ["School", "Park", "Car"]],
    ],
    "a1-1": [
        ["Lion", "León", "🦁", "lái-on", "/ˈlaɪ.ən/", "LÁI-ON (2 palmas)", "Lengua arriba: Lái-on 👅", "The lion is big (El león es grande)", "The ___ is big.", ["Cat", "Dog", "Bird"]],
        ["Rabbit", "Conejo", "🐰", "rá-bit", "/ˈræb.ɪt/", "RÁ-BIT (2 palmas)", "Lengua vibrante: Rá-bit 👅", "A white rabbit (Un conejo blanco)", "A white ___.", ["Cat", "Bear", "Fish"]],
        ["Horse", "Caballo", "🐴", "jórs", "/hɔːrs/", "JÓRS (1 palma)", "Soplo: J-orse 💨", "The horse is fast (El caballo es rápido)", "The ___ is fast.", ["Dog", "Cat", "Bird"]],
        ["Frog", "Rana", "🐸", "frog", "/frɑːɡ/", "FROG (1 palma)", "Dientes en labio: F-rog 🐰", "The frog can jump (La rana puede saltar)", "The ___ can jump.", ["Fish", "Bird", "Cat"]],
    ],
    "a1-2": [
        ["Orange", "Naranja", "🟠", "ó-renj", "/ˈɔːr.ɪndʒ/", "Ó-RENJ (2 palmas)", "Boca redonda: Ó-renj 👄", "An orange balloon (Un globo naranja)", "An ___ balloon.", ["Red", "Blue", "Green"]],
        ["Pink", "Rosa", "🩷", "pink", "/pɪŋk/", "PINK (1 palma)", "Explosión: P-ink 👄", "A pink flower (Una flor rosa)", "A ___ flower.", ["Red", "Blue", "White"]],
        ["Brown", "Café", "🤎", "bráun", "/braʊn/", "BRÁUN (1 palma)", "Labios juntos: Br-own 👄", "Brown chocolate (Chocolate café)", "___ chocolate.", ["Black", "White", "Red"]],
        ["Purple", "Morado", "🟣", "pér-pol", "/ˈpɝː.pəl/", "PÉR-POL (2 palmas)", "Explosión: Pér-pol 👄", "A purple grape (Una uva morada)", "A ___ grape.", ["Blue", "Red", "Green"]],
    ],
    "a1-3": [
        ["Strawberry", "Fresa", "🍓", "stró-be-ri", "/ˈstrɔː.ber.i/", "STRÓ-BE-RI (3 palmas)", "Lengua arriba: Stró 👅", "A sweet strawberry (Una fresa dulce)", "A sweet ___.", ["Apple", "Banana", "Grape"]],
        ["Carrot", "Zanahoria", "🥕", "ká-rot", "/ˈker.ət/", "KÁ-ROT (2 palmas)", "Explosión: Ká-rot 👄", "An orange carrot (Una zanahoria naranja)", "An orange ___.", ["Tomato", "Apple", "Grape"]],
        ["Lemon", "Limón", "🍋", "lé-mon", "/ˈlem.ən/", "LÉ-MON (2 palmas)", "Lengua arriba: Lé-mon 👅", "A sour lemon (Un limón ácido)", "A sour ___.", ["Orange", "Apple", "Banana"]],
        ["Potato", "Papa", "🥔", "po-téi-to", "/pəˈteɪ.toʊ/", "PO-TÉI-TO (3 palmas)", "Explosión: Po-téi-to 👄", "A cooked potato (Una papa cocida)", "A cooked ___.", ["Tomato", "Banana", "Apple"]],
    ],
    "a1-4": [
        ["Juice", "Jugo", "🧃", "yús", "/dʒuːs/", "YÚS (1 palma)", "Sonido Y: Y-uce 👄", "Orange juice please (Jugo de naranja por favor)", "Orange ___ please.", ["Water", "Milk", "Pizza"]],
        ["Egg", "Huevo", "🥚", "eg", "/eɡ/", "EG (1 palma)", "Boca abierta: E-gg 👄", "I eat an egg (Como un huevo)", "I eat an ___.", ["Bread", "Cheese", "Pizza"]],
        ["Chicken", "Pollo", "🍗", "chí-ken", "/ˈtʃɪk.ɪn/", "CHÍ-KEN (2 palmas)", "Aire: Chí-ken 💨", "Grilled chicken (Pollo a la parrilla)", "Grilled ___.", ["Pizza", "Bread", "Cheese"]],
        ["Coffee", "Café", "☕", "kó-fi", "/ˈkɑː.fi/", "KÓ-FI (2 palmas)", "Explosión: Kó-fi 👄", "A cup of coffee (Una taza de café)", "A cup of ___.", ["Milk", "Water", "Juice"]],
    ],
    "a1-5": [
        ["Mouth", "Boca", "👄", "máuz", "/maʊθ/", "MÁUZ (1 palma)", "Junta labios: M-outh 👄", "Open your mouth (Abre la boca)", "Open your ___.", ["Eye", "Ear", "Nose"]],
        ["Head", "Cabeza", "🗣️", "jéd", "/hed/", "JÉD (1 palma)", "Soplo: J-ead 💨", "My head hurts (Me duele la cabeza)", "My ___ hurts.", ["Hand", "Foot", "Eye"]],
        ["Leg", "Pierna", "🦵", "leg", "/leɡ/", "LEG (1 palma)", "Lengua: L-eg 👅", "My left leg (Mi pierna izquierda)", "My left ___.", ["Hand", "Foot", "Arm"]],
        ["Arm", "Brazo", "💪", "arm", "/ɑːrm/", "ARM (1 palma)", "Boca abierta: Ar-m 👄", "Raise your arm (Levanta el brazo)", "Raise your ___.", ["Hand", "Leg", "Head"]],
    ],
    "a1-6": [
        ["Brother", "Hermano", "👦", "bró-zer", "/ˈbrʌð.ɚ/", "BRÓ-ZER (2 palmas)", "Labios: Bró-zer 👄", "My little brother (Mi hermano menor)", "My little ___.", ["Mother", "Father", "Sister"]],
        ["Sister", "Hermana", "👧", "sís-ter", "/ˈsɪs.tɚ/", "SÍS-TER (2 palmas)", "Sonido S: Sís-ter 🐍", "My big sister (Mi hermana mayor)", "My big ___.", ["Mother", "Father", "Brother"]],
        ["Kitchen", "Cocina", "🍳", "kí-chen", "/ˈkɪtʃ.ən/", "KÍ-CHEN (2 palmas)", "Explosión: Kí-chen 👄", "Cook in the kitchen (Cocina en la cocina)", "Cook in the ___.", ["House", "Bed", "Garden"]],
        ["Garden", "Jardín", "🏡", "gár-den", "/ˈɡɑːr.dən/", "GÁR-DEN (2 palmas)", "Garganta suave: Gár-den 👄", "Flowers in the garden (Flores en el jardín)", "Flowers in the ___.", ["House", "Kitchen", "Bed"]],
    ],
    "a1-7": [
        ["Four", "Cuatro", "4️⃣", "for", "/fɔːr/", "FOR (1 palma)", "Dientes en labio: F-our 🐰", "I have four books (Tengo cuatro libros)", "I have ___ books.", ["One", "Two", "Three"]],
        ["Five", "Cinco", "5️⃣", "fáiv", "/faɪv/", "FÁIV (1 palma)", "Dientes en labio: F-ive 🐰", "Five red apples (Cinco manzanas rojas)", "___ red apples.", ["One", "Two", "Three"]],
        ["Morning", "Mañana", "🌅", "mór-ning", "/ˈmɔːr.nɪŋ/", "MÓR-NING (2 palmas)", "Junta labios: Mór-ning 👄", "Good morning (Buenos días)", "Good ___.", ["Night", "Day", "Sun"]],
        ["Week", "Semana", "📅", "uík", "/wiːk/", "UÍK (1 palma)", "Redondea: Uík 👄", "Seven days in a week (Siete días en una semana)", "Seven days in a ___.", ["Day", "Night", "Year"]],
    ],
    "a1-8": [
        ["Sorry", "Perdón", "🙇", "sá-ri", "/ˈsɑː.ri/", "SÁ-RI (2 palmas)", "Sonido S: Sá-ri 🐍", "I am sorry (Lo siento)", "I am ___.", ["Hello", "Please", "Yes"]],
        ["Welcome", "Bienvenido", "🤗", "uél-kom", "/ˈwel.kəm/", "UÉL-KOM (2 palmas)", "Redondea: Uél-kom 👄", "You are welcome (De nada / bienvenido)", "You are ___.", ["Hello", "Please", "Yes"]],
        ["Excuse me", "Disculpe", "🙋", "eks-kiús mi", "/ɪkˈskjuːz mi/", "EKS-KIÚS MI (3 palmas)", "Explosión: Eks-kiús 👄", "Excuse me, please (Disculpe, por favor)", "___, please.", ["Hello", "Thanks", "Yes"]],
        ["Goodbye", "Adiós", "👋", "gud-bái", "/ˌɡʊdˈbaɪ/", "GUD-BÁI (2 palmas)", "Garganta: Gud-bái 👄", "Goodbye my friend (Adiós mi amigo)", "___ my friend.", ["Hello", "Please", "Yes"]],
    ],
    "a1-9": [
        ["Coat", "Abrigo", "🧥", "kóut", "/koʊt/", "KÓUT (1 palma)", "Explosión: K-oat 👄", "Wear a warm coat (Usa un abrigo abrigado)", "Wear a warm ___.", ["Shirt", "Hat", "Shoes"]],
        ["Dress", "Vestido", "👗", "dres", "/dres/", "DRES (1 palma)", "Lengua: Dr-ess 👅", "A blue dress (Un vestido azul)", "A blue ___.", ["Shirt", "Pants", "Hat"]],
        ["Socks", "Calcetines", "🧦", "soks", "/sɑːks/", "SOKS (1 palma)", "Sonido S: S-ocks 🐍", "Clean white socks (Calcetines blancos limpios)", "Clean white ___.", ["Shoes", "Pants", "Hat"]],
        ["Jacket", "Chaqueta", "🧥", "já-ket", "/ˈdʒæk.ɪt/", "JÁ-KET (2 palmas)", "Sonido Y: Já-ket 👄", "A winter jacket (Una chaqueta de invierno)", "A winter ___.", ["Shirt", "Hat", "Coat"]],
    ],
    "a1-10": [
        ["Bike", "Bicicleta", "🚲", "báik", "/baɪk/", "BÁIK (1 palma)", "Labios: B-ike 👄", "Ride a bike (Monta bicicleta)", "Ride a ___.", ["Car", "Bus", "Train"]],
        ["Boat", "Barco", "⛵", "bóut", "/boʊt/", "BÓUT (1 palma)", "Labios: B-oat 👄", "A small boat (Un barco pequeño)", "A small ___.", ["Car", "Plane", "Bus"]],
        ["Taxi", "Taxi", "🚕", "ták-si", "/ˈtæk.si/", "TÁK-SI (2 palmas)", "Lengua: Ták-si 👅", "Take a taxi (Toma un taxi)", "Take a ___.", ["Bus", "Car", "Train"]],
        ["Walk", "Caminar", "🚶", "uók", "/wɔːk/", "UÓK (1 palma)", "Redondea: Uók 👄", "I walk to school (Camino a la escuela)", "I ___ to school.", ["Car", "Bus", "Train"]],
    ],
    "a1-11": [
        ["Cloud", "Nube", "☁️", "kláud", "/klaʊd/", "KLÁUD (1 palma)", "Explosión: Cl-oud 👄", "A white cloud (Una nube blanca)", "A white ___.", ["Sun", "Rain", "Snow"]],
        ["Wind", "Viento", "💨", "uind", "/wɪnd/", "UIND (1 palma)", "Redondea: Uind 👄", "The wind is strong (El viento es fuerte)", "The ___ is strong.", ["Rain", "Sun", "Snow"]],
        ["Flower", "Flor", "🌸", "fláu-er", "/ˈflaʊ.ɚ/", "FLÁU-ER (2 palmas)", "Dientes en labio: Fl-ower 🐰", "A pink flower (Una flor rosa)", "A pink ___.", ["Tree", "Sun", "Rain"]],
        ["Hot", "Caliente", "🥵", "jot", "/hɑːt/", "JOT (1 palma)", "Soplo: H-ot 💨", "The sun is hot (El sol está caliente)", "The sun is ___.", ["Cold", "Rain", "Snow"]],
    ],
    "a1-12": [
        ["Angry", "Enojado", "😡", "án-gri", "/ˈæŋ.ɡri/", "ÁN-GRI (2 palmas)", "Boca: Án-gri 👄", "He is angry (Él está enojado)", "He is ___.", ["Happy", "Sad", "Tired"]],
        ["Scared", "Asustado", "😨", "skéard", "/skerd/", "SKÉARD (1 palma)", "Sonido S: S-cared 🐍", "The child is scared (El niño está asustado)", "The child is ___.", ["Happy", "Sad", "Hot"]],
        ["Hungry", "Hambriento", "😋", "ján-gri", "/ˈhʌŋ.ɡri/", "JÁN-GRI (2 palmas)", "Soplo: Ján-gri 💨", "I am hungry (Tengo hambre)", "I am ___.", ["Tired", "Hot", "Cold"]],
        ["Cold", "Frío", "🥶", "kóuld", "/koʊld/", "KÓULD (1 palma)", "Explosión: C-old 👄", "I feel cold (Siento frío)", "I feel ___.", ["Hot", "Happy", "Sad"]],
    ],
    "a2-1": [
        ["Work", "Trabajar", "💼", "uórk", "/wɝːk/", "UÓRK (1 palma)", "Redondea: Uórk 👄", "I work every day (Trabajo todos los días)", "I ___ every day.", ["Sleep", "Shower", "Breakfast"]],
        ["Sleep", "Dormir", "😴", "slíp", "/sliːp/", "SLÍP (1 palma)", "Sonido S: S-leep 🐍", "I sleep at night (Duermo en la noche)", "I ___ at night.", ["Wake up", "Work", "Shower"]],
        ["Dinner", "Cena", "🍽️", "dí-ner", "/ˈdɪn.ɚ/", "DÍ-NER (2 palmas)", "Lengua: Dí-ner 👅", "We eat dinner together (Cenamos juntos)", "We eat ___ together.", ["Breakfast", "Shower", "Work"]],
        ["Brush", "Cepillar", "🪥", "brash", "/brʌʃ/", "BRASH (1 palma)", "Labios: Br-ush 👄", "Brush your teeth (Cepilla tus dientes)", "___ your teeth.", ["Wash", "Eat", "Sleep"]],
    ],
    "a2-2": [
        ["Desk", "Escritorio", "🖥️", "desk", "/desk/", "DESK (1 palma)", "Lengua: D-esk 👅", "Sit at your desk (Siéntate en tu escritorio)", "Sit at your ___.", ["Book", "Pencil", "Teacher"]],
        ["Pencil", "Lápiz", "✏️", "pén-sil", "/ˈpen.səl/", "PÉN-SIL (2 palmas)", "Explosión: Pén-sil 👄", "Write with a pencil (Escribe con un lápiz)", "Write with a ___.", ["Book", "Computer", "Desk"]],
        ["Student", "Estudiante", "🧑‍🎓", "stú-dent", "/ˈstuː.dənt/", "STÚ-DENT (2 palmas)", "Sonido S: Stú-dent 🐍", "I am a student (Soy estudiante)", "I am a ___.", ["Teacher", "Book", "Desk"]],
        ["Homework", "Tarea", "📝", "jóum-uork", "/ˈhoʊm.wɝːk/", "JÓUM-UORK (2 palmas)", "Soplo: Jóum-uork 💨", "Do your homework (Haz tu tarea)", "Do your ___.", ["Book", "Computer", "Desk"]],
    ],
    "a2-3": [
        ["Store", "Tienda", "🏪", "stor", "/stɔːr/", "STOR (1 palma)", "Sonido S: St-ore 🐍", "Buy food at the store (Compra comida en la tienda)", "Buy food at the ___.", ["Park", "Bank", "Hospital"]],
        ["Street", "Calle", "🛣️", "strít", "/striːt/", "STRÍT (1 palma)", "Lengua: Str-eet 👅", "Cross the street (Cruza la calle)", "Cross the ___.", ["Park", "Bank", "Store"]],
        ["Library", "Biblioteca", "📚", "lái-bre-ri", "/ˈlaɪ.brer.i/", "LÁI-BRE-RI (3 palmas)", "Lengua: Lái-bre-ri 👅", "Read at the library (Lee en la biblioteca)", "Read at the ___.", ["Park", "Bank", "Store"]],
        ["Museum", "Museo", "🏛️", "miu-zí-om", "/mjuˈziː.əm/", "MIU-ZÍ-OM (3 palmas)", "Junta labios: Miu-zí-om 👄", "Visit the museum (Visita el museo)", "Visit the ___.", ["Park", "Hospital", "Bank"]],
    ],
    "a2-4": [
        ["Pay", "Pagar", "💳", "péi", "/peɪ/", "PÉI (1 palma)", "Explosión: P-ay 👄", "Pay with a card (Paga con tarjeta)", "___ with a card.", ["Buy", "Money", "Price"]],
        ["Cheap", "Barato", "🏷️", "chip", "/tʃiːp/", "CHIP (1 palma)", "Aire: Ch-eap 💨", "This shirt is cheap (Esta camisa es barata)", "This shirt is ___.", ["Price", "Money", "Buy"]],
        ["Expensive", "Caro", "💎", "eks-pén-siv", "/ɪkˈspen.sɪv/", "EKS-PÉN-SIV (3 palmas)", "Explosión: Eks-pén-siv 👄", "The phone is expensive (El teléfono es caro)", "The phone is ___.", ["Cheap", "Price", "Buy"]],
        ["Cash", "Efectivo", "💵", "kash", "/kæʃ/", "KASH (1 palma)", "Explosión: C-ash 👄", "I pay in cash (Pago en efectivo)", "I pay in ___.", ["Card", "Price", "Buy"]],
    ],
    "a2-5": [
        ["Fork", "Tenedor", "🍴", "fork", "/fɔːrk/", "FORK (1 palma)", "Dientes en labio: F-ork 🐰", "Use a fork (Usa un tenedor)", "Use a ___.", ["Menu", "Bill", "Order"]],
        ["Order", "Pedir", "🧾", "ór-der", "/ˈɔːr.dɚ/", "ÓR-DER (2 palmas)", "Boca redonda: Ór-der 👄", "I want to order (Quiero pedir)", "I want to ___.", ["Menu", "Bill", "Fork"]],
        ["Waiter", "Mesero", "🧑‍🍳", "uéi-ter", "/ˈweɪ.tɚ/", "UÉI-TER (2 palmas)", "Redondea: Uéi-ter 👄", "Ask the waiter (Pregunta al mesero)", "Ask the ___.", ["Menu", "Chef", "Bill"]],
        ["Hungry", "Hambriento", "😋", "ján-gri", "/ˈhʌŋ.ɡri/", "JÁN-GRI (2 palmas)", "Soplo: Ján-gri 💨", "I am very hungry (Tengo mucha hambre)", "I am very ___.", ["Delicious", "Menu", "Bill"]],
    ],
    "a2-6": [
        ["Tennis", "Tenis", "🎾", "té-nis", "/ˈten.ɪs/", "TÉ-NIS (2 palmas)", "Lengua: Té-nis 👅", "Play tennis today (Juega tenis hoy)", "Play ___ today.", ["Soccer", "Run", "Swim"]],
        ["Gym", "Gimnasio", "🏋️", "yim", "/dʒɪm/", "YIM (1 palma)", "Sonido Y: Y-im 👄", "I go to the gym (Voy al gimnasio)", "I go to the ___.", ["Park", "Pool", "School"]],
        ["Team", "Equipo", "👥", "tím", "/tiːm/", "TÍM (1 palma)", "Lengua: T-eam 👅", "We are a team (Somos un equipo)", "We are a ___.", ["Soccer", "Gym", "Run"]],
        ["Win", "Ganar", "🏆", "uin", "/wɪn/", "UIN (1 palma)", "Redondea: Uin 👄", "We can win (Podemos ganar)", "We can ___.", ["Run", "Play", "Swim"]],
    ],
    "a2-7": [
        ["Ticket", "Boleto", "🎫", "tí-ket", "/ˈtɪk.ɪt/", "TÍ-KET (2 palmas)", "Lengua: Tí-ket 👅", "Buy a plane ticket (Compra un boleto de avión)", "Buy a plane ___.", ["Passport", "Hotel", "Luggage"]],
        ["Flight", "Vuelo", "🛫", "fláit", "/flaɪt/", "FLÁIT (1 palma)", "Dientes en labio: Fl-ight 🐰", "My flight is late (Mi vuelo está tarde)", "My ___ is late.", ["Hotel", "Luggage", "Passport"]],
        ["Airport", "Aeropuerto", "🛫", "ér-port", "/ˈer.pɔːrt/", "ÉR-PORT (2 palmas)", "Boca abierta: Ér-port 👄", "Arrive at the airport (Llega al aeropuerto)", "Arrive at the ___.", ["Hotel", "Station", "Park"]],
        ["Map", "Mapa", "🗺️", "map", "/mæp/", "MAP (1 palma)", "Junta labios: M-ap 👄", "Read the city map (Lee el mapa de la ciudad)", "Read the city ___.", ["Ticket", "Passport", "Hotel"]],
    ],
    "a2-8": [
        ["Fever", "Fiebre", "🤒", "fí-ver", "/ˈfiː.vɚ/", "FÍ-VER (2 palmas)", "Dientes en labio: Fí-ver 🐰", "I have a fever (Tengo fiebre)", "I have a ___.", ["Doctor", "Medicine", "Healthy"]],
        ["Dentist", "Dentista", "🦷", "dén-tist", "/ˈden.tɪst/", "DÉN-TIST (2 palmas)", "Lengua: Dén-tist 👅", "Visit the dentist (Visita al dentista)", "Visit the ___.", ["Doctor", "Hospital", "Nurse"]],
        ["Nurse", "Enfermero", "🧑‍⚕️", "ners", "/nɝːs/", "NERS (1 palma)", "Lengua en paladar: N-urse 👅", "The nurse is kind (El enfermero es amable)", "The ___ is kind.", ["Doctor", "Dentist", "Patient"]],
        ["Pain", "Dolor", "🩹", "péin", "/peɪn/", "PÉIN (1 palma)", "Explosión: P-ain 👄", "I feel pain here (Siento dolor aquí)", "I feel ___ here.", ["Fever", "Medicine", "Healthy"]],
    ],
    "a2-9": [
        ["Paint", "Pintar", "🎨", "péint", "/peɪnt/", "PÉINT (1 palma)", "Explosión: P-aint 👄", "I like to paint (Me gusta pintar)", "I like to ___.", ["Sing", "Dance", "Read"]],
        ["Read", "Leer", "📖", "ríd", "/riːd/", "RÍD (1 palma)", "Lengua vibrante: R-ead 👅", "Read a good book (Lee un buen libro)", "___ a good book.", ["Sing", "Dance", "Paint"]],
        ["Movie", "Película", "🎬", "mú-vi", "/ˈmuː.vi/", "MÚ-VI (2 palmas)", "Junta labios: Mú-vi 👄", "Watch a movie (Mira una película)", "Watch a ___.", ["Song", "Book", "Game"]],
        ["Hobby", "Pasatiempo", "🎯", "jó-bi", "/ˈhɑː.bi/", "JÓ-BI (2 palmas)", "Soplo: Jó-bi 💨", "Music is my hobby (La música es mi pasatiempo)", "Music is my ___.", ["Guitar", "Dance", "Sing"]],
    ],
    "a2-10": [
        ["Battery", "Batería", "🔋", "bá-te-ri", "/ˈbæt.ɚ.i/", "BÁ-TE-RI (3 palmas)", "Labios: Bá-te-ri 👄", "Charge the battery (Carga la batería)", "Charge the ___.", ["Phone", "Screen", "Message"]],
        ["Screen", "Pantalla", "📱", "skrín", "/skriːn/", "SKRÍN (1 palma)", "Sonido S: Skr-een 🐍", "Touch the screen (Toca la pantalla)", "Touch the ___.", ["Phone", "Battery", "Message"]],
        ["Email", "Correo", "📧", "í-meil", "/ˈiː.meɪl/", "Í-MEIL (2 palmas)", "Boca: Í-meil 👄", "Send an email (Envía un correo)", "Send an ___.", ["Message", "Phone", "Photo"]],
        ["Photo", "Foto", "📷", "fó-to", "/ˈfoʊ.toʊ/", "FÓ-TO (2 palmas)", "Dientes en labio: Fó-to 🐰", "Take a photo (Toma una foto)", "Take a ___.", ["Message", "Video", "Call"]],
    ],
    "a2-11": [
        ["Forest", "Bosque", "🌲", "fó-rest", "/ˈfɔːr.ɪst/", "FÓ-REST (2 palmas)", "Dientes en labio: Fó-rest 🐰", "Walk in the forest (Camina en el bosque)", "Walk in the ___.", ["Garden", "River", "Farm"]],
        ["Farm", "Granja", "🚜", "farm", "/fɑːrm/", "FARM (1 palma)", "Dientes en labio: F-arm 🐰", "Animals on the farm (Animales en la granja)", "Animals on the ___.", ["Garden", "River", "Forest"]],
        ["Dog", "Perro", "🐕", "dog", "/dɔːɡ/", "DOG (1 palma)", "Lengua: D-og 👅", "My dog is friendly (Mi perro es amigable)", "My ___ is friendly.", ["Horse", "Cat", "Bird"]],
        ["Lake", "Lago", "🏞️", "leik", "/leɪk/", "LEIK (1 palma)", "Lengua: L-ake 👅", "Swim in the lake (Nada en el lago)", "Swim in the ___.", ["River", "Garden", "Farm"]],
    ],
    "a2-12": [
        ["Near", "Cerca", "📍", "níar", "/nɪr/", "NÍAR (1 palma)", "Lengua: N-ear 👅", "The park is near (El parque está cerca)", "The park is ___.", ["Left", "Right", "Far"]],
        ["Far", "Lejos", "🔭", "far", "/fɑːr/", "FAR (1 palma)", "Dientes en labio: F-ar 🐰", "The school is far (La escuela está lejos)", "The school is ___.", ["Near", "Left", "Right"]],
        ["North", "Norte", "🧭", "north", "/nɔːrθ/", "NORTH (1 palma)", "Lengua entre dientes: Nor-th 👅", "Go north now (Ve al norte ahora)", "Go ___ now.", ["Left", "Right", "Straight"]],
        ["Map", "Mapa", "🗺️", "map", "/mæp/", "MAP (1 palma)", "Junta labios: M-ap 👄", "Follow the map (Sigue el mapa)", "Follow the ___.", ["Left", "Right", "Street"]],
    ],
    "b1-1": [
        ["Interview", "Entrevista", "🤝", "ín-ter-viu", "/ˈɪn.tɚ.vjuː/", "ÍN-TER-VIU (3 palmas)", "Boca: Ín-ter-viu 👄", "I have a job interview (Tengo una entrevista de trabajo)", "I have a job ___.", ["Resume", "Salary", "Skills"]],
        ["Experience", "Experiencia", "📈", "eks-pí-riens", "/ɪkˈspɪr.i.əns/", "EKS-PÍ-RIENS (3 palmas)", "Explosión: Eks-pí-riens 👄", "I have work experience (Tengo experiencia laboral)", "I have work ___.", ["Skills", "Salary", "Resume"]],
        ["Applicant", "Candidato", "🧑‍💼", "á-pli-kant", "/ˈæp.lɪ.kənt/", "Á-PLI-KANT (3 palmas)", "Boca: Á-pli-kant 👄", "Each applicant must wait (Cada candidato debe esperar)", "Each ___ must wait.", ["Resume", "Boss", "Salary"]],
        ["Deadline", "Fecha límite", "⏰", "ded-lain", "/ˈded.laɪn/", "DED-LAIN (2 palmas)", "Lengua: Ded-lain 👅", "Meet the deadline (Cumple la fecha límite)", "Meet the ___.", ["Salary", "Interview", "Skills"]],
    ],
    "b1-2": [
        ["Career", "Carrera", "💼", "ka-ríer", "/kəˈrɪr/", "KA-RÍER (2 palmas)", "Explosión: Ka-ríer 👄", "Build a long career (Construye una carrera larga)", "Build a long ___.", ["Goal", "Dream", "Graduate"]],
        ["Dream", "Sueño", "✨", "drim", "/driːm/", "DRIM (1 palma)", "Lengua: Dr-eam 👅", "Follow your dream (Sigue tu sueño)", "Follow your ___.", ["Goal", "Career", "Plan"]],
        ["Plan", "Plan", "🗓️", "plan", "/plæn/", "PLAN (1 palma)", "Explosión: P-lan 👄", "Make a clear plan (Haz un plan claro)", "Make a clear ___.", ["Goal", "Dream", "Career"]],
        ["Future", "Futuro", "🔮", "fiú-cher", "/ˈfjuː.tʃɚ/", "FIÚ-CHER (2 palmas)", "Dientes en labio: Fiú-cher 🐰", "Think about the future (Piensa en el futuro)", "Think about the ___.", ["Goal", "Past", "Dream"]],
    ],
    "b1-3": [
        ["Device", "Dispositivo", "📱", "di-váis", "/dɪˈvaɪs/", "DI-VÁIS (2 palmas)", "Lengua: Di-váis 👅", "Charge your device (Carga tu dispositivo)", "Charge your ___.", ["Software", "Network", "Robot"]],
        ["Network", "Red", "🌐", "nét-uork", "/ˈnet.wɝːk/", "NÉT-UORK (2 palmas)", "Lengua: Nét-uork 👅", "A fast network (Una red rápida)", "A fast ___.", ["Software", "Device", "Data"]],
        ["Data", "Datos", "📊", "déi-ta", "/ˈdeɪ.tə/", "DÉI-TA (2 palmas)", "Lengua: Déi-ta 👅", "Protect your data (Protege tus datos)", "Protect your ___.", ["Software", "Network", "Device"]],
        ["Robot", "Robot", "🤖", "ró-bot", "/ˈroʊ.bɑːt/", "RÓ-BOT (2 palmas)", "Lengua vibrante: Ró-bot 👅", "The robot can learn (El robot puede aprender)", "The ___ can learn.", ["Software", "Human", "Device"]],
    ],
    "b1-4": [
        ["Pollution", "Contaminación", "🏭", "po-lú-shan", "/pəˈluː.ʃən/", "PO-LÚ-SHAN (3 palmas)", "Explosión: Po-lú-shan 👄", "Air pollution is rising (La contaminación del aire aumenta)", "Air ___ is rising.", ["Climate", "Energy", "Recycle"]],
        ["Energy", "Energía", "⚡", "é-ner-ji", "/ˈen.ɚ.dʒi/", "É-NER-JI (3 palmas)", "Boca: É-ner-ji 👄", "Use clean energy (Usa energía limpia)", "Use clean ___.", ["Climate", "Recycle", "Protect"]],
        ["Forest", "Bosque", "🌳", "fó-rest", "/ˈfɔːr.ɪst/", "FÓ-REST (2 palmas)", "Dientes en labio: Fó-rest 🐰", "Protect the forest (Protege el bosque)", "Protect the ___.", ["Climate", "Ocean", "City"]],
        ["Waste", "Basura", "🗑️", "uéist", "/weɪst/", "UÉIST (1 palma)", "Redondea: Uéist 👄", "Reduce plastic waste (Reduce la basura plástica)", "Reduce plastic ___.", ["Energy", "Climate", "Recycle"]],
    ],
    "b1-5": [
        ["Argument", "Argumento", "📢", "ár-guiu-ment", "/ˈɑːr.ɡjə.mənt/", "ÁR-GUIU-MENT (3 palmas)", "Boca: Ár-guiu-ment 👄", "Give a clear argument (Da un argumento claro)", "Give a clear ___.", ["Agree", "Believe", "Opinion"]],
        ["Believe", "Creer", "💭", "bi-lív", "/bɪˈliːv/", "BI-LÍV (2 palmas)", "Labios: Bi-lív 👄", "I believe in you (Creo en ti)", "I ___ in you.", ["Agree", "Disagree", "Argue"]],
        ["Opinion", "Opinión", "🗣️", "o-pín-ion", "/əˈpɪn.jən/", "O-PÍN-ION (3 palmas)", "Boca redonda: O-pín-ion 👄", "Share your opinion (Comparte tu opinión)", "Share your ___.", ["Agree", "Fact", "Debate"]],
        ["Respect", "Respeto", "🙏", "ris-pékt", "/rɪˈspekt/", "RIS-PÉKT (2 palmas)", "Lengua: Ris-pékt 👅", "Debate with respect (Debate con respeto)", "Debate with ___.", ["Agree", "Anger", "Believe"]],
    ],
    "b1-6": [
        ["Actor", "Actor", "🌟", "ák-tor", "/ˈæk.tɚ/", "ÁK-TOR (2 palmas)", "Boca: Ák-tor 👄", "A famous actor (Un actor famoso)", "A famous ___.", ["Director", "Artist", "Writer"]],
        ["Cinema", "Cine", "🍿", "sí-ne-ma", "/ˈsɪn.ə.mə/", "SÍ-NE-MA (3 palmas)", "Sonido S: Sí-ne-ma 🐍", "Go to the cinema (Ve al cine)", "Go to the ___.", ["Theater", "Museum", "Park"]],
        ["Painting", "Pintura", "🖼️", "péin-ting", "/ˈpeɪn.tɪŋ/", "PÉIN-TING (2 palmas)", "Explosión: Péin-ting 👄", "A beautiful painting (Una pintura hermosa)", "A beautiful ___.", ["Movie", "Song", "Book"]],
        ["Stage", "Escenario", "🎭", "stéidj", "/steɪdʒ/", "STÉIDJ (1 palma)", "Sonido S: St-age 🐍", "Actors on the stage (Actores en el escenario)", "Actors on the ___.", ["Cinema", "Screen", "Museum"]],
    ],
    "b1-7": [
        ["Adventure", "Aventura", "🎒", "ad-vén-cher", "/ədˈven.tʃɚ/", "AD-VÉN-CHER (3 palmas)", "Boca: Ad-vén-cher 👄", "A great adventure (Una gran aventura)", "A great ___.", ["Journey", "Mountain", "Camp"]],
        ["Camp", "Acampar", "⛺", "kamp", "/kæmp/", "KAMP (1 palma)", "Explosión: C-amp 👄", "We camp near the lake (Acampamos cerca del lago)", "We ___ near the lake.", ["Explore", "Climb", "Sail"]],
        ["Island", "Isla", "🏝️", "ái-land", "/ˈaɪ.lənd/", "ÁI-LAND (2 palmas)", "Boca: Ái-land 👄", "A tropical island (Una isla tropical)", "A tropical ___.", ["Mountain", "Desert", "Forest"]],
        ["Guide", "Guía", "🧭", "gáid", "/ɡaɪd/", "GÁID (1 palma)", "Garganta: G-uide 👄", "Follow the guide (Sigue a la guía)", "Follow the ___.", ["Map", "Path", "Hotel"]],
    ],
    "b1-8": [
        ["Spice", "Especia", "🌶️", "spáis", "/spaɪs/", "SPÁIS (1 palma)", "Sonido S: Sp-ice 🐍", "Add a hot spice (Añade una especia picante)", "Add a hot ___.", ["Recipe", "Chef", "Flavor"]],
        ["Chef", "Chef", "👨‍🍳", "shef", "/ʃef/", "SHEF (1 palma)", "Silencio Sh: Sh-ef 🤫", "The chef is famous (El chef es famoso)", "The ___ is famous.", ["Recipe", "Waiter", "Guest"]],
        ["Bake", "Hornear", "🍞", "béik", "/beɪk/", "BÉIK (1 palma)", "Labios: B-ake 👄", "Bake fresh bread (Hornea pan fresco)", "___ fresh bread.", ["Cook", "Boil", "Mix"]],
        ["Dessert", "Postre", "🍰", "di-zért", "/dɪˈzɝːt/", "DI-ZÉRT (2 palmas)", "Lengua: Di-zért 👅", "Cake for dessert (Pastel de postre)", "Cake for ___.", ["Recipe", "Spice", "Soup"]],
    ],
    "b1-9": [
        ["Viral", "Viral", "🚀", "vái-ral", "/ˈvaɪ.rəl/", "VÁI-RAL (2 palmas)", "Dientes en labio: Vái-ral 🐰", "The video went viral (El video se volvió viral)", "The video went ___.", ["Trending", "Content", "Post"]],
        ["Platform", "Plataforma", "🌐", "plát-form", "/ˈplæt.fɔːrm/", "PLÁT-FORM (2 palmas)", "Explosión: Plát-form 👄", "Post on the platform (Publica en la plataforma)", "Post on the ___.", ["Content", "Camera", "Phone"]],
        ["Comment", "Comentario", "💬", "kó-ment", "/ˈkɑː.ment/", "KÓ-MENT (2 palmas)", "Explosión: Kó-ment 👄", "Write a kind comment (Escribe un comentario amable)", "Write a kind ___.", ["Followers", "Content", "Share"]],
        ["Share", "Compartir", "📤", "sher", "/ʃer/", "SHER (1 palma)", "Silencio Sh: Sh-are 🤫", "Share the photo (Comparte la foto)", "___ the photo.", ["Like", "Save", "Edit"]],
    ],
    "b1-10": [
        ["Ambulance", "Ambulancia", "🚑", "ám-biu-lans", "/ˈæm.bjə.ləns/", "ÁM-BIU-LANS (3 palmas)", "Boca: Ám-biu-lans 👄", "Call an ambulance (Llama una ambulancia)", "Call an ___.", ["Emergency", "Hospital", "Police"]],
        ["Hazard", "Peligro", "⚠️", "já-zard", "/ˈhæz.ɚd/", "JÁ-ZARD (2 palmas)", "Soplo: Já-zard 💨", "A fire hazard (Un peligro de incendio)", "A fire ___.", ["Safety", "Help", "Alarm"]],
        ["Rescue", "Rescate", "🚁", "rés-kiu", "/ˈres.kjuː/", "RÉS-KIU (2 palmas)", "Lengua: Rés-kiu 👅", "A rescue team arrived (Llegó un equipo de rescate)", "A ___ team arrived.", ["Emergency", "Safety", "Police"]],
        ["Alarm", "Alarma", "🔔", "a-lárm", "/əˈlɑːrm/", "A-LÁRM (2 palmas)", "Boca: A-lárm 👄", "The alarm is loud (La alarma es fuerte)", "The ___ is loud.", ["Emergency", "Phone", "Door"]],
    ],
    "b1-11": [
        ["Friendship", "Amistad", "🧑‍🤝‍🧑", "frénd-ship", "/ˈfrend.ʃɪp/", "FRÉND-SHIP (2 palmas)", "Dientes en labio: Frénd-ship 🐰", "A true friendship (Una amistad verdadera)", "A true ___.", ["Trust", "Love", "Family"]],
        ["Bond", "Vínculo", "🔗", "bond", "/bɑːnd/", "BOND (1 palma)", "Labios: B-ond 👄", "A strong family bond (Un vínculo familiar fuerte)", "A strong family ___.", ["Trust", "Support", "Team"]],
        ["Kindness", "Amabilidad", "💛", "káind-nes", "/ˈkaɪnd.nəs/", "KÁIND-NES (2 palmas)", "Explosión: Káind-nes 👄", "Show kindness every day (Muestra amabilidad cada día)", "Show ___ every day.", ["Trust", "Anger", "Pride"]],
        ["Listen", "Escuchar", "👂", "lí-sen", "/ˈlɪs.ən/", "LÍ-SEN (2 palmas)", "Lengua: Lí-sen 👅", "Listen to your friend (Escucha a tu amigo)", "___ to your friend.", ["Talk", "Help", "Trust"]],
    ],
    "b1-12": [
        ["Deal", "Trato", "🤝", "dil", "/diːl/", "DIL (1 palma)", "Lengua: D-eal 👅", "Close the deal today (Cierra el trato hoy)", "Close the ___ today.", ["Agreement", "Proposal", "Price"]],
        ["Terms", "Términos", "⚖️", "terms", "/tɝːmz/", "TERMS (1 palma)", "Lengua: T-erms 👅", "Read the contract terms (Lee los términos del contrato)", "Read the contract ___.", ["Deal", "Price", "Date"]],
        ["Negotiate", "Negociar", "🗣️", "ne-gó-shieit", "/nɪˈɡoʊ.ʃi.eɪt/", "NE-GÓ-SHIEIT (3 palmas)", "Lengua: Ne-gó-shieit 👅", "We need to negotiate (Necesitamos negociar)", "We need to ___.", ["Sign", "Wait", "Leave"]],
        ["Contract", "Contrato", "📝", "kón-trakt", "/ˈkɑːn.trækt/", "KÓN-TRAKT (2 palmas)", "Explosión: Kón-trakt 👄", "Sign the contract (Firma el contrato)", "Sign the ___.", ["Proposal", "Email", "Agenda"]],
    ],
    "c1-1": [
        ["Concession", "Concesión", "✍️", "kon-sé-shan", "/kənˈseʃ.ən/", "KON-SÉ-SHAN (3 palmas)", "Explosión: Kon-sé-shan 👄", "Offer a small concession (Ofrece una pequeña concesión)", "Offer a small ___.", ["Leverage", "Consensus", "Veto"]],
        ["Compromise", "Acuerdo mutuo", "🤝", "kóm-pro-mais", "/ˈkɑːm.prə.maɪz/", "KÓM-PRO-MAIS (3 palmas)", "Explosión: Kóm-pro-mais 👄", "Reach a fair compromise (Llegar a un acuerdo justo)", "Reach a fair ___.", ["Conflict", "Delay", "Veto"]],
        ["Mandate", "Mandato", "📜", "mán-deit", "/ˈmæn.deɪt/", "MÁN-DEIT (2 palmas)", "Junta labios: Mán-deit 👄", "A clear political mandate (Un mandato político claro)", "A clear political ___.", ["Consensus", "Delay", "Doubt"]],
        ["Deadline", "Fecha límite", "⏳", "ded-lain", "/ˈded.laɪn/", "DED-LAIN (2 palmas)", "Lengua: Ded-lain 👅", "The negotiation deadline (La fecha límite de la negociación)", "The negotiation ___.", ["Agenda", "Salary", "Office"]],
    ],
    "c1-2": [
        ["Consequently", "Por consiguiente", "➡️", "kón-se-kuent-li", "/ˈkɑːn.sɪ.kwənt.li/", "KÓN-SE-KUENT-LI (4 palmas)", "Explosión: Kón-se-kuent-li 👄", "Consequently, the theory holds (Por consiguiente, la teoría se sostiene)", "___, the theory holds.", ["However", "Although", "Unless"]],
        ["Hypothesis", "Hipótesis", "💡", "jai-pó-ze-sis", "/haɪˈpɑː.θə.sɪs/", "JAI-PÓ-ZE-SIS (4 palmas)", "Soplo: Jai-pó-ze-sis 💨", "Test the hypothesis (Pon a prueba la hipótesis)", "Test the ___.", ["Paradigm", "Essay", "Citation"]],
        ["Citation", "Cita", "📎", "sai-téi-shan", "/saɪˈteɪ.ʃən/", "SAI-TÉI-SHAN (3 palmas)", "Sonido S: Sai-téi-shan 🐍", "Add a citation (Añade una cita)", "Add a ___.", ["Title", "Margin", "Draft"]],
        ["Abstract", "Resumen", "🧾", "áb-strakt", "/ˈæb.strækt/", "ÁB-STRAKT (2 palmas)", "Boca: Áb-strakt 👄", "Write the paper abstract (Escribe el resumen del artículo)", "Write the paper ___.", ["Appendix", "Footnote", "Cover"]],
    ],
    "c1-3": [
        ["Call it a day", "Dar por terminado el día", "🌙", "kol it a déi", "/kɔːl ɪt ə deɪ/", "KOL IT A DÉI (4 palmas)", "Explosión: Call it a day 👄", "Let's call it a day (Demos por terminado el día)", "Let's ___.", ["Break the ice", "Piece of cake", "Hit the nail"]],
        ["Hit the nail", "Dar en el clavo", "🔨", "jit de néil", "/hɪt ðə neɪl/", "JIT DE NÉIL (3 palmas)", "Soplo: Hit the nail 💨", "You hit the nail on the head (Diste en el clavo)", "You ___ on the head.", ["Break the ice", "Piece of cake", "Call it a day"]],
        ["Under the weather", "Sentirse mal", "🤧", "án-der de ué-der", "/ˌʌn.dɚ ðə ˈweð.ɚ/", "ÁN-DER DE UÉ-DER (5 palmas)", "Boca: Under the weather 👄", "I feel under the weather (Me siento mal)", "I feel ___.", ["Piece of cake", "Break the ice", "Call it a day"]],
        ["Break a leg", "Mucha suerte", "🎭", "bréik a leg", "/breɪk ə leɡ/", "BRÉIK A LEG (3 palmas)", "Labios: Break a leg 👄", "Break a leg tonight (Mucha suerte esta noche)", "___ tonight.", ["Call it a day", "Piece of cake", "Bite the bullet"]],
    ],
    "c1-4": [
        ["Fiscal policy", "Política fiscal", "🏛️", "fís-kal pó-li-si", "/ˈfɪs.kəl ˈpɑː.lə.si/", "FÍS-KAL PÓ-LI-SI (5 palmas)", "Dientes en labio: Fís-kal 🐰", "Tighten fiscal policy (Endurecer la política fiscal)", "Tighten ___.", ["Inflation", "Tariff", "Trade"]],
        ["Governance", "Gobernanza", "⚖️", "gó-ver-nans", "/ˈɡʌv.ɚ.nəns/", "GÓ-VER-NANS (3 palmas)", "Garganta: Gó-ver-nans 👄", "Improve public governance (Mejorar la gobernanza pública)", "Improve public ___.", ["Inflation", "Election", "Market"]],
        ["Sanctions", "Sanciones", "🚫", "sánk-shans", "/ˈsæŋk.ʃənz/", "SÁNK-SHANS (2 palmas)", "Sonido S: Sánk-shans 🐍", "Impose economic sanctions (Imponer sanciones económicas)", "Impose economic ___.", ["Tariff", "Treaty", "Summit"]],
        ["Treaty", "Tratado", "📜", "trí-ti", "/ˈtriː.ti/", "TRÍ-TI (2 palmas)", "Lengua: Trí-ti 👅", "Sign a peace treaty (Firmar un tratado de paz)", "Sign a peace ___.", ["Tariff", "Conflict", "Vote"]],
    ],
    "c1-5": [
        ["Subconscious", "Subconsciente", "💭", "sab-kón-shas", "/ˌsʌbˈkɑːn.ʃəs/", "SAB-KÓN-SHAS (3 palmas)", "Sonido S: Sab-kón-shas 🐍", "A subconscious reaction (Una reacción subconsciente)", "A ___ reaction.", ["Memory", "Logic", "Speech"]],
        ["Neuroplasticity", "Neuroplasticidad", "⚡", "nú-ro-plas-tí-si-ti", "/ˌnʊr.oʊ.plæsˈtɪs.ə.ti/", "NÚ-RO-PLAS-TÍ-SI-TI (6 palmas)", "Lengua: Nú-ro-plas-tí-si-ti 👅", "Train neuroplasticity daily (Entrena la neuroplasticidad a diario)", "Train ___ daily.", ["Bias", "Habit", "Sleep"]],
        ["Attention", "Atención", "🎯", "a-tén-shan", "/əˈten.ʃən/", "A-TÉN-SHAN (3 palmas)", "Boca: A-tén-shan 👄", "Focus your attention (Enfoca tu atención)", "Focus your ___.", ["Memory", "Sleep", "Noise"]],
        ["Memory", "Memoria", "🧠", "mé-mo-ri", "/ˈmem.ɚ.i/", "MÉ-MO-RI (3 palmas)", "Junta labios: Mé-mo-ri 👄", "Long-term memory (Memoria a largo plazo)", "Long-term ___.", ["Bias", "Habit", "Mood"]],
    ],
    "c1-6": [
        ["Automation", "Automatización", "⚙️", "o-to-méi-shan", "/ˌɔː.t̬əˈmeɪ.ʃən/", "O-TO-MÉI-SHAN (4 palmas)", "Boca redonda: O-to-méi-shan 👄", "Factory automation (Automatización de fábrica)", "Factory ___.", ["Algorithm", "Robot", "Cloud"]],
        ["Algorithm", "Algoritmo", "🔢", "ál-go-ri-dom", "/ˈæl.ɡə.rɪ.ðəm/", "ÁL-GO-RI-DOM (4 palmas)", "Boca: Ál-go-ri-dom 👄", "Train the algorithm (Entrena el algoritmo)", "Train the ___.", ["Network", "Cable", "Screen"]],
        ["Latency", "Latencia", "⏱️", "léi-ten-si", "/ˈleɪ.tən.si/", "LÉI-TEN-SI (3 palmas)", "Lengua: Léi-ten-si 👅", "Reduce network latency (Reduce la latencia de red)", "Reduce network ___.", ["Storage", "Color", "Battery"]],
        ["Dataset", "Conjunto de datos", "🗃️", "déi-ta-set", "/ˈdeɪ.tə.set/", "DÉI-TA-SET (3 palmas)", "Lengua: Déi-ta-set 👅", "Label the dataset (Etiqueta el conjunto de datos)", "Label the ___.", ["Model", "Server", "Cable"]],
    ],
    "c1-7": [
        ["Bioethics", "Bioética", "🧬", "bái-o-é-ziks", "/ˌbaɪ.oʊˈeθ.ɪks/", "BÁI-O-É-ZIKS (4 palmas)", "Labios: Bái-o-é-ziks 👄", "A bioethics committee (Un comité de bioética)", "A ___ committee.", ["Equity", "Clinic", "Budget"]],
        ["Sustainability", "Sostenibilidad", "🌱", "sos-tei-na-bí-li-ti", "/səˌsteɪ.nəˈbɪl.ə.ti/", "SOS-TEI-NA-BÍ-LI-TI (6 palmas)", "Sonido S: Sos-tei-na-bí-li-ti 🐍", "Long-term sustainability (Sostenibilidad a largo plazo)", "Long-term ___.", ["Profit", "Speed", "Luxury"]],
        ["Inclusion", "Inclusión", "🤲", "in-klú-zhan", "/ɪnˈkluː.ʒən/", "IN-KLÚ-ZHAN (3 palmas)", "Boca: In-klú-zhan 👄", "Workplace inclusion (Inclusión laboral)", "Workplace ___.", ["Exclusion", "Silence", "Delay"]],
        ["Transparency", "Transparencia", "🪟", "trans-pá-ren-si", "/trænsˈper.ən.si/", "TRANS-PÁ-REN-SI (4 palmas)", "Lengua: Trans-pá-ren-si 👅", "Demand transparency (Exige transparencia)", "Demand ___.", ["Secrecy", "Speed", "Luck"]],
    ],
    "c1-8": [
        ["Discourse", "Discurso", "🗣️", "dís-kors", "/ˈdɪs.kɔːrs/", "DÍS-KORS (2 palmas)", "Lengua: Dís-kors 👅", "Public political discourse (Discurso político público)", "Public political ___.", ["Fallacy", "Silence", "Noise"]],
        ["Persuasive", "Persuasivo", "🎯", "per-suéi-siv", "/pɚˈsweɪ.sɪv/", "PER-SUÉI-SIV (3 palmas)", "Explosión: Per-suéi-siv 👄", "A persuasive argument (Un argumento persuasivo)", "A ___ argument.", ["Weak", "Silent", "Random"]],
        ["Rhetoric", "Retórica", "📜", "ré-to-rik", "/ˈret.ɚ.ɪk/", "RÉ-TO-RIK (3 palmas)", "Lengua: Ré-to-rik 👅", "Classical rhetoric (Retórica clásica)", "Classical ___.", ["Grammar", "Silence", "Noise"]],
        ["Rebuttal", "Refutación", "🛡️", "ri-bó-tal", "/rɪˈbʌt.əl/", "RI-BÓ-TAL (3 palmas)", "Lengua: Ri-bó-tal 👅", "Prepare a rebuttal (Prepara una refutación)", "Prepare a ___.", ["Greeting", "Pause", "Title"]],
    ],
    "c1-9": [
        ["Valuation", "Valoración", "📊", "va-liu-éi-shan", "/ˌvæl.juˈeɪ.ʃən/", "VA-LIU-ÉI-SHAN (4 palmas)", "Dientes en labio: Va-liu-éi-shan 🐰", "A high company valuation (Una alta valoración de la empresa)", "A high company ___.", ["Logo", "Office", "Slogan"]],
        ["Unicorn", "Unicornio (startup)", "🦄", "iú-ni-korn", "/ˈjuː.nɪ.kɔːrn/", "IÚ-NI-KORN (3 palmas)", "Boca: Iú-ni-korn 👄", "A tech unicorn (Un unicornio tecnológico)", "A tech ___.", ["Cafe", "Hobby", "Draft"]],
        ["Runway", "Pista de caja", "🛬", "rán-uei", "/ˈrʌn.weɪ/", "RÁN-UEI (2 palmas)", "Lengua: Rán-uei 👅", "Twelve months of runway (Doce meses de pista de caja)", "Twelve months of ___.", ["Office", "Pitch", "Brand"]],
        ["Pitch", "Presentación", "🎤", "pich", "/pɪtʃ/", "PICH (1 palma)", "Explosión: P-itch 👄", "Deliver the pitch (Haz la presentación)", "Deliver the ___.", ["Lunch", "Nap", "Queue"]],
    ],
    "c1-10": [
        ["Mentorship", "Mentoría", "🧑‍🏫", "mén-tor-ship", "/ˈmen.tɚ.ʃɪp/", "MÉN-TOR-SHIP (3 palmas)", "Junta labios: Mén-tor-ship 👄", "Offer mentorship (Ofrece mentoría)", "Offer ___.", ["Salary", "Vacation", "Parking"]],
        ["Resilience", "Resiliencia", "🛡️", "ri-zí-liens", "/rɪˈzɪl.jəns/", "RI-ZÍ-LIENS (3 palmas)", "Lengua: Ri-zí-liens 👅", "Lead with resilience (Lidera con resiliencia)", "Lead with ___.", ["Fear", "Delay", "Ego"]],
        ["Feedback", "Retroalimentación", "🔁", "fíd-bak", "/ˈfiːd.bæk/", "FÍD-BAK (2 palmas)", "Dientes en labio: Fíd-bak 🐰", "Give honest feedback (Da retroalimentación honesta)", "Give honest ___.", ["Orders", "Silence", "Luck"]],
        ["Accountability", "Rendición de cuentas", "📋", "a-kaun-ta-bí-li-ti", "/əˌkaʊn.t̬əˈbɪl.ə.t̬i/", "A-KAUN-TA-BÍ-LI-TI (6 palmas)", "Boca: A-kaun-ta-bí-li-ti 👄", "Leadership accountability (Rendición de cuentas del liderazgo)", "Leadership ___.", ["Excuse", "Delay", "Luck"]],
    ],
    "c1-11": [
        ["Metaphor", "Metáfora", "📖", "mé-ta-for", "/ˈmet.ə.fɔːr/", "MÉ-TA-FOR (3 palmas)", "Junta labios: Mé-ta-for 👄", "A vivid metaphor (Una metáfora vivida)", "A vivid ___.", ["Comma", "Title", "Margin"]],
        ["Subtext", "Subtexto", "🔍", "sáb-tekst", "/ˈsʌb.tekst/", "SÁB-TEKST (2 palmas)", "Sonido S: Sáb-tekst 🐍", "Read the subtext (Lee el subtexto)", "Read the ___.", ["Cover", "Font", "Index"]],
        ["Irony", "Ironía", "🙃", "ái-ro-ni", "/ˈaɪ.rə.ni/", "ÁI-RO-NI (3 palmas)", "Boca: Ái-ro-ni 👄", "Sharp literary irony (Aguda ironía literaria)", "Sharp literary ___.", ["Plot", "Cover", "Page"]],
        ["Allegory", "Alegoría", "🪞", "á-le-go-ri", "/ˈæl.ə.ɡɔːr.i/", "Á-LE-GO-RI (4 palmas)", "Boca: Á-le-go-ri 👄", "A political allegory (Una alegoría política)", "A political ___.", ["Diary", "Recipe", "Map"]],
    ],
    "c1-12": [
        ["Existential", "Existencial", "🌌", "eg-zis-tén-shal", "/ˌeɡ.zɪˈsten.ʃəl/", "EG-ZIS-TÉN-SHAL (4 palmas)", "Boca: Eg-zis-tén-shal 👄", "An existential question (Una pregunta existencial)", "An ___ question.", ["Simple", "Tiny", "Local"]],
        ["Dialectic", "Dialéctica", "🗣️", "dai-a-lék-tik", "/ˌdaɪ.əˈlek.tɪk/", "DAI-A-LÉK-TIK (4 palmas)", "Lengua: Dai-a-lék-tik 👅", "Hegelian dialectic (Dialéctica hegeliana)", "Hegelian ___.", ["Recipe", "Hobby", "Sport"]],
        ["Premise", "Premisa", "🧱", "pré-mis", "/ˈprem.ɪs/", "PRÉ-MIS (2 palmas)", "Explosión: Pré-mis 👄", "A false premise (Una premisa falsa)", "A false ___.", ["Title", "Cover", "Index"]],
        ["Skepticism", "Escepticismo", "🤨", "skép-ti-si-zom", "/ˈskep.tɪ.sɪ.zəm/", "SKÉP-TI-SI-ZOM (4 palmas)", "Sonido S: Skép-ti-si-zom 🐍", "Healthy skepticism (Escepticismo sano)", "Healthy ___.", ["Faith", "Luck", "Silence"]],
    ],
}

AAC_EXTRA = {
    "needs": [
        {"en": "Hungry", "es": "Hambre", "sounds": "ján-gri", "emoji": "😋"},
        {"en": "Thirsty", "es": "Sed", "sounds": "zérs-ti", "emoji": "🥤"},
        {"en": "Hot", "es": "Calor", "sounds": "jot", "emoji": "🥵"},
        {"en": "Cold", "es": "Frío", "sounds": "kóuld", "emoji": "🥶"},
    ],
    "feelings": [
        {"en": "Brave", "es": "Valiente", "sounds": "bréiv", "emoji": "🦸"},
        {"en": "Confused", "es": "Confundido", "sounds": "kon-fiúzd", "emoji": "😕"},
        {"en": "Sick", "es": "Enfermo", "sounds": "sik", "emoji": "🤒"},
        {"en": "Okay", "es": "Estoy bien", "sounds": "ou-kéi", "emoji": "👍"},
    ],
    "actions": [
        {"en": "Wait", "es": "Esperar", "sounds": "uéit", "emoji": "⏳"},
        {"en": "Come", "es": "Venir", "sounds": "kam", "emoji": "👋"},
        {"en": "Look", "es": "Mirar", "sounds": "luk", "emoji": "👀"},
        {"en": "Help me", "es": "Ayúdame", "sounds": "jelp mi", "emoji": "🆘"},
    ],
    "food": [
        {"en": "Rice", "es": "Arroz", "sounds": "ráis", "emoji": "🍚"},
        {"en": "Fruit", "es": "Fruta", "sounds": "frut", "emoji": "🍇"},
        {"en": "Snack", "es": "Botana", "sounds": "snak", "emoji": "🥨"},
        {"en": "Breakfast", "es": "Desayuno", "sounds": "brék-fast", "emoji": "🥞"},
    ],
    "places": [
        {"en": "Park", "es": "Parque", "sounds": "park", "emoji": "🏞️"},
        {"en": "Store", "es": "Tienda", "sounds": "stor", "emoji": "🏪"},
        {"en": "Doctor", "es": "Doctor", "sounds": "dók-tor", "emoji": "🩺"},
        {"en": "Playground", "es": "Juegos", "sounds": "pléi-gráund", "emoji": "🛝"},
    ],
    "social": [
        {"en": "Sorry", "es": "Perdón", "sounds": "sá-ri", "emoji": "🙇"},
        {"en": "Help", "es": "Ayuda", "sounds": "jelp", "emoji": "🆘"},
        {"en": "I want", "es": "Yo quiero", "sounds": "ái uánt", "emoji": "🙋"},
        {"en": "Look", "es": "Mira", "sounds": "luk", "emoji": "👀"},
    ],
}


def item_from_q(q):
    word = q.get("word")
    if not word:
        return None
    return {
        "word": word,
        "es": q.get("es", word),
        "emoji": q.get("emoji") or (q.get("emojis") or ["🔤"])[0],
        "soundsLike": q.get("soundsLike", ""),
        "phonetic": q.get("phonetic", ""),
        "syllables": q.get("syllables", ""),
        "mouth": q.get("mouth", ""),
        "context": q.get("context", ""),
    }


def clap_count(syllables, sounds):
    text = syllables or sounds or ""
    parts = [p for p in text.replace("—", "-").split("-") if p.strip()]
    n = max(1, len(parts)) if "-" in text else 1
    if "palmas" in text.lower():
        import re
        m = re.search(r"(\d+)\s*palma", text.lower())
        if m:
            n = int(m.group(1))
    return n


def make_fill_blank(it, distractors):
    blank = it.get("blank")
    if not blank:
        ctx = it.get("context") or ""
        en = ctx.split("(")[0].strip()
        if it["word"] and it["word"].lower() in en.lower():
            import re
            blank = re.sub(re.escape(it["word"]), "___", en, count=1, flags=re.I)
        else:
            blank = f"This is a ___."
    opts = [it["word"]] + [d for d in distractors if d != it["word"]][:3]
    while len(opts) < 4:
        opts.append(["Yes", "No", "Please", "Hello"][len(opts) % 4])
    return {
        "type": "fill_blank",
        "word": it["word"],
        "emoji": it["emoji"],
        "soundsLike": it["soundsLike"],
        "phonetic": it["phonetic"],
        "prompt": "Completa la frase en inglés",
        "sentence": blank,
        "es": it["es"],
        "context": it.get("context", ""),
        "options": opts[:4],
        "correct": it["word"],
        "syllables": it.get("syllables", ""),
        "mouth": it.get("mouth", ""),
    }


def make_choice(it, other_es):
    opts = [it["es"]] + [e for e in other_es if e != it["es"]][:3]
    while len(opts) < 4:
        opts.append(["Casa", "Agua", "Libro", "Tiempo"][len(opts) % 4])
    return {
        "type": "choice",
        "word": it["word"],
        "emoji": it["emoji"],
        "soundsLike": it["soundsLike"],
        "phonetic": it["phonetic"],
        "prompt": f'¿Qué significa "{it["word"]}"?',
        "options": opts[:4],
        "correct": it["es"],
        "es": it["es"],
        "context": it.get("context", ""),
        "syllables": it.get("syllables", ""),
        "mouth": it.get("mouth", ""),
    }


def make_clap(it):
    n = clap_count(it.get("syllables"), it.get("soundsLike"))
    return {
        "type": "clap_count",
        "word": it["word"],
        "emoji": it["emoji"],
        "soundsLike": it["soundsLike"],
        "phonetic": it["phonetic"],
        "prompt": "¿Cuántas palmas tiene esta palabra?",
        "syllables": it.get("syllables") or it["word"].upper(),
        "mouth": it.get("mouth", ""),
        "es": it["es"],
        "context": it.get("context", ""),
        "correct": n,
        "options": sorted(set([1, 2, 3, 4, n]))[:4] if n <= 4 else [2, 3, 4, n],
    }


def extra_to_item(row):
    word, es, emoji, sounds, ipa, syllables, mouth, context, blank, distractors = row
    return {
        "word": word,
        "es": es,
        "emoji": emoji,
        "soundsLike": sounds,
        "phonetic": ipa,
        "syllables": syllables,
        "mouth": mouth,
        "context": context,
        "blank": blank,
        "distractors": distractors,
    }


def expand_lesson(lesson, level):
    qs = deepcopy(lesson["questions"])
    catalog = []
    seen = set()
    for q in qs:
        it = item_from_q(q)
        if it and it["word"] not in seen:
            catalog.append(it)
            seen.add(it["word"])
        if q.get("type") == "matching":
            for p in q.get("pairs", []):
                en = p.get("en")
                if en and en not in seen:
                    es_txt = p.get("es", en)
                    emoji = "🔤"
                    for ch in es_txt:
                        if ord(ch) > 127:
                            emoji = ch
                            break
                    catalog.append({
                        "word": en,
                        "es": es_txt,
                        "emoji": emoji,
                        "soundsLike": "",
                        "phonetic": "",
                        "syllables": "",
                        "mouth": "",
                        "context": f"{en} ({es_txt})",
                    })
                    seen.add(en)

    extras = [extra_to_item(r) for r in EXTRAS.get(lesson["id"], [])]
    for it in extras:
        if it["word"] not in seen:
            catalog.append(it)
            seen.add(it["word"])

    all_words = [c["word"] for c in catalog]
    all_es = [c["es"] for c in catalog]

    def distract(it):
        d = it.get("distractors") or [w for w in all_words if w != it["word"]]
        return d[:3]

    added = []
    for it in extras:
        d = distract(it)
        added.append({
            "type": "image_select",
            "emoji": it["emoji"],
            "word": it["word"],
            "soundsLike": it["soundsLike"],
            "phonetic": it["phonetic"],
            "prompt": f'¿Qué es esto? Elige "{it["word"]}"',
            "options": [it["word"]] + d,
            "correct": it["word"],
            "es": it["es"],
            "context": it["context"],
            "syllables": it["syllables"],
            "mouth": it["mouth"],
        })
        added.append({
            "type": "listen_select",
            "word": it["word"],
            "soundsLike": it["soundsLike"],
            "phonetic": it["phonetic"],
            "prompt": "Escucha y elige la palabra correcta",
            "options": [{"text": it["word"], "emoji": it["emoji"]}] + [
                {"text": catalog[i % len(catalog)]["word"], "emoji": catalog[i % len(catalog)]["emoji"]}
                for i in range(len(catalog))
                if catalog[i]["word"] != it["word"]
            ][:3],
            "correct": it["word"],
            "es": it["es"],
            "context": it["context"],
            "syllables": it["syllables"],
            "mouth": it["mouth"],
        })
        added.append({
            "type": "emoji_match",
            "word": it["word"],
            "soundsLike": it["soundsLike"],
            "phonetic": it["phonetic"],
            "prompt": f'¿Cuál imagen es "{it["word"]}"?',
            "emojis": [it["emoji"]] + [c["emoji"] for c in catalog if c["word"] != it["word"]][:3],
            "correct": it["emoji"],
            "es": it["es"],
            "context": it["context"],
            "syllables": it["syllables"],
            "mouth": it["mouth"],
        })

    fill_src = extras[:2] + catalog[:2]
    seen_fill = set()
    for it in fill_src:
        if it["word"] in seen_fill:
            continue
        seen_fill.add(it["word"])
        added.append(make_fill_blank(it, distract(it)))
        if len(seen_fill) >= 3:
            break

    if catalog:
        added.append(make_choice(catalog[0], all_es[1:]))
        if len(catalog) > 2:
            added.append(make_choice(catalog[1], all_es[2:] + all_es[:1]))

    if level == "K0":
        for it in (extras[:2] or catalog[:2]):
            added.append(make_clap(it))

    # Rebuild matching with up to 6 pairs from catalog
    pairs = []
    for it in catalog[:6]:
        pairs.append({"en": it["word"], "es": f"{it['emoji']} {it['es']}"})
    matching = [q for q in qs if q.get("type") == "matching"]
    others = [q for q in qs if q.get("type") != "matching"]
    if pairs:
        prompt = matching[0]["prompt"] if matching else "Empareja cada palabra con su significado"
        others.append({"type": "matching", "prompt": prompt, "pairs": pairs})

    # Pedagogical order: see, listen, match image, complete, choose, clap, translate, matching
    order = ["image_select", "listen_select", "emoji_match", "fill_blank", "choice", "clap_count", "translate", "matching"]
    combined = others + added
    combined.sort(key=lambda q: order.index(q.get("type", "matching")) if q.get("type") in order else 99)

    # Dedup nearly-identical image_select of same word
    final = []
    seen_key = set()
    for q in combined:
        key = (q.get("type"), q.get("word") or q.get("prompt"), q.get("correct"))
        if key in seen_key and q.get("type") != "matching":
            continue
        seen_key.add(key)
        final.append(q)

    # Keep lessons substantial but not endless: 12-14
    if len(final) > 14:
        # Always keep matching last
        match = [q for q in final if q["type"] == "matching"]
        core = [q for q in final if q["type"] != "matching"][:13]
        final = core + match[:1]

    lesson = deepcopy(lesson)
    lesson["questions"] = final
    lesson["wordCount"] = len(catalog)
    lesson["goal"] = f"Aprenderás {len(catalog)} palabras: " + ", ".join(c["word"] for c in catalog[:8])
    return lesson


def main():
    cur = deepcopy(DATA["curriculum"])
    aac = deepcopy(DATA["aacDB"])
    stats = {}
    total_q = 0
    for lvl, block in cur.items():
        new_lessons = [expand_lesson(l, lvl) for l in block["lessons"]]
        block["lessons"] = new_lessons
        nq = sum(len(l["questions"]) for l in new_lessons)
        stats[lvl] = {"lessons": len(new_lessons), "questions": nq}
        total_q += nq
        # Update titles to real counts
        n = len(new_lessons)
        if lvl == "K0":
            block["title"] = "Terapia de Lenguaje & Estimulación 🧸"
            block["desc"] = f"{n} unidades con pictogramas, silabeo y guía de boca. Sin vidas: se aprende sin miedo."
        elif lvl == "A1":
            block["title"] = "Vocabulario Esencial"
            block["desc"] = f"{n} unidades: animales, colores, comida, cuerpo, familia y más. Escucha, mira y arma frases."
        elif lvl == "A2":
            block["title"] = "Vida Cotidiana"
            block["desc"] = f"{n} unidades: rutinas, ciudad, compras, viajes y salud. Frases para el día a día."
        elif lvl == "B1":
            block["title"] = "Situaciones Reales"
            block["desc"] = f"{n} unidades: trabajo, opiniones, viajes, medios y acuerdos. Conversación con contexto."
        elif lvl == "C1":
            block["title"] = "Fluidez & Ideas Complejas"
            block["desc"] = f"{n} unidades: modismos, debate, negocios y pensamiento crítico."

    for cat, items in AAC_EXTRA.items():
        have = {i["en"] for i in aac.get(cat, [])}
        for it in items:
            if it["en"] not in have:
                aac.setdefault(cat, []).append(it)

    payload = {
        "version": "16.0",
        "levelOrder": ["K0", "A1", "A2", "B1", "C1"],
        "levels": {
            "K0": {"short": "Niños", "color": "#FF7EB6", "icon": "teddy"},
            "A1": {"short": "Base", "color": "#2EC4B6", "icon": "seed"},
            "A2": {"short": "Diario", "color": "#4C7DFF", "icon": "city"},
            "B1": {"short": "Real", "color": "#F5C14A", "icon": "chat"},
            "C1": {"short": "Fluidez", "color": "#A78BFA", "icon": "spark"},
        },
        "curriculum": cur,
        "aacDB": aac,
    }
    out = ROOT / "curriculum.js"
    out.write_text(
        "/* Lingua Pro curriculum v16 — generated, do not edit by hand */\n"
        "window.LinguaData = "
        + json.dumps(payload, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print("wrote", out, "bytes", out.stat().st_size)
    print("stats", stats, "totalQ", total_q)


if __name__ == "__main__":
    main()
