# Lingua Pro

App estática para aprender inglés (español → inglés), de **K0 (niños / terapia de lenguaje)** hasta **C1**.

Sin backend: abre `index.html` o sirve la carpeta. El progreso vive en `localStorage` de cada perfil.

## Cómo correrla

```bash
cd lingua-pro
python3 -m http.server 8080
```

Luego abre [http://localhost:8080](http://localhost:8080).

También puedes abrir `index.html` directo en el navegador.

## Qué hay en v16

- **58 unidades** y **812 ejercicios** (antes ~284). Cada lección ronda 12–14 ítems.
- Tipos: mira y elige, escucha, imagen, completa la frase, significado, silabeo con palmas (K0), arma la frase, empareja.
- **No avanzas si fallas**: hace falta 60% (K0 sí avanza, sin vidas).
- **Repaso real**: las palabras fallidas vuelven con intervalos (otra vez / bien / fácil).
- **Racha diaria** y **escudo** que sí protege un día perdido.
- **Vidas** que se guardan entre lecciones; la tienda las recarga de verdad.
- Tablero **PECS / CAA** para armar frases y oírlas.
- Multi-perfil local (nombre, avatar, avance separado).

## Estructura

| Archivo | Rol |
|---|---|
| `index.html` | Shell de vistas e iconos SVG |
| `styles.css` | UI didáctica (tablero claro sobre marco oscuro) |
| `app.js` | Motor: lecciones, SRS, racha, perfiles |
| `curriculum.js` | Contenido (generado) |
| `scripts/expand-curriculum.py` | Regenera el currículo |
| `assets/mascot.jpg` | Mascota |

## Niveles

| Nivel | Unidades | Enfoque |
|---|---|---|
| K0 | 10 | Pictogramas, silabeo, guía de boca, vidas infinitas |
| A1 | 12 | Vocabulario esencial |
| A2 | 12 | Vida cotidiana |
| B1 | 12 | Situaciones reales |
| C1 | 12 | Modismos, debate, ideas complejas |

## Notas

- El audio usa la voz del sistema (`SpeechSynthesis`, `en-US`). Cambia según el dispositivo.
- K0 es apoyo visual y rítmico, no un protocolo clínico certificado.
- C1 evalúa reconocimiento y contexto, no producción oral libre.
