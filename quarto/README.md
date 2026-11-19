# Superconductividad: cuando los electrones bailan juntos

Charla de divulgación para visitas de institutos (14–18 años) al ICMM-CSIC: 10–15 min de
charla (presupuesto de las notas: 13:30) y después las demostraciones del efecto Meissner
(imán levitando y tren levitante, con YBCO, imanes de neodimio y nitrógeno líquido). La
última diapositiva («Ahora, en directo») se queda en pantalla durante las demostraciones.

Contenido a partir de `../Visitas-Superconductividad-2026.pptx`.

## Tema: `_extensions/divulga` (Divulgación ICMM-CSIC)

Tema propio de esta charla, con la imagen institucional del CSIC: Gill Sans (tipografía de
la marca; si el ordenador no la tiene, Cabin, OFL, incrustada), Copperplate en las etiquetas
pequeñas (la letra de las siglas CSIC), rojo CSIC `#B01220` y el negro y gris del logo,
esquinas rectas y separadores de parte en rojo a sangre. Reutiliza el plugin del tema QUDYMA
(antetítulos, logo, KaTeX sin conexión) y su juego de componentes, pero no depende de él.
Los colores siguen expuestos como `--qd-*`, que es lo que leen las figuras animadas.

## Construir y presentar

```bash
sh build.sh                 # talk-standalone.html (un solo archivo, sin conexión) + talk.html
quarto preview talk.qmd     # vista previa en directo
```

Presentar `talk-standalone.html` en Chrome o Firefox: `F` pantalla completa, `S` notas del
ponente (desde `file://` el navegador puede bloquear la ventana; usar entonces
`quarto preview`), `B` pantalla en negro.

## Figuras animadas (`assets/js/w_super.js`)

Todas son dibujos ilustrativos, salvo la carrera de la temperatura crítica.

| Diapositiva | Widget | Qué hace |
|---|---|---|
| 1911 | `rt` | R(T) del mercurio: lo esperado (gris) y lo medido, con caída a cero en 4,2 K |
| Dos superpoderes | `ring`, `meissner` | Corriente persistente en un anillo; líneas de campo expulsadas (botones Caliente/Frío) |
| Resistencia | `scatter` | Electrones chocando con iones que vibran; deslizador de temperatura |
| Pegamento | `glue` | Estela positiva de un electrón que atrae a otro (3 pasos) |
| Coreografía | `dance` | Metal normal frente a superconductor |
| Carrera por T<sub>c</sub> | `tc` | Récords de T<sub>c</sub> por familia y año (valores bibliográficos; hidruros a alta presión, huecos) |
| Tipo II | `vortex` | Vórtices anclados que atraviesan el superconductor |

## Imágenes

- Del PowerPoint original: Onnes, levitación, discoteca, baile, nevera cuántica, vórtices
  (Isabel Guillamón, UAM), iconos, fotos del grupo.
- Wikimedia Commons (crédito en la diapositiva): resonancia (KasugaHuang, CC BY-SA 3.0),
  túnel del LHC (Muriel, CC BY-SA 2.0), SCMaglev L0 (Hisagi, CC BY-SA 4.0), cable AmpaCity
  de Nexans (The wub, CC BY-SA 4.0).
- `assets/private/`: logos CSIC/ICMM, edificio del ICMM y mapa (de la charla del ICTP),
  avatares.
- Dibujos propios: `assets/img/title_art.svg`, `part1–3.svg`.
