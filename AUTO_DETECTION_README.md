# Auto-detección de Archivos para ContinuousVideo

## 🎯 ¿Qué hace la auto-detección?

La función de auto-detección busca automáticamente archivos en las carpetas `public/videos` y `public/audio` para crear tu composición sin tener que especificar manualmente cada archivo.

## 📁 Estructura de carpetas esperada

```
public/
├── videos/
│   ├── 01_video.mp4
│   ├── 02_video.mp4
│   ├── 03_video.mp4
│   └── ... (más videos)
└── audio/
    ├── audio_track.mp3 (o .wav, .m4a, .aac)
    └── subtitles.json (o .srt, .vtt)
```

## 🔧 Cómo usar

### Opción 1: Auto-detección completa (Recomendado)
```tsx
// En Root.tsx
defaultProps={{
  autoDetect: true,
  transitionDuration: 15,
}}
```

### Opción 2: Auto-detección con override manual
```tsx
// En Root.tsx
defaultProps={{
  autoDetect: true,
  audioSrc: staticFile("audio/mi_audio_especifico.mp3"), // Override manual
  transitionDuration: 15,
}}
```

### Opción 3: Manual completo (desactivar auto-detección)
```tsx
// En Root.tsx
defaultProps={{
  autoDetect: false,
  src: [
    staticFile("videos/video1.mp4"),
    staticFile("videos/video2.mp4"),
  ],
  audioSrc: staticFile("audio/audio.mp3"),
  subtitlesJsonSrc: staticFile("audio/subtitles.json"),
  transitionDuration: 15,
}}
```

## 🎬 Formatos de video soportados

- `.mp4` (recomendado)
- `.mov`
- `.avi`
- `.webm`

## 🎵 Formatos de audio soportados

- `.mp3` (recomendado)
- `.wav`
- `.m4a`
- `.aac`

## 📝 Formatos de subtítulos soportados

- `.json` (formato Remotion/Whisper)
- `.srt`
- `.vtt`

## 🔄 Orden de los videos

Los videos se ordenan alfabéticamente por nombre de archivo. Para controlar el orden, usa prefijos numéricos:

```
01_intro.mp4
02_main_content.mp4
03_conclusion.mp4
```

## 🎯 Prioridad de archivos

1. **Videos**: Se toman TODOS los videos encontrados en `videos/`
2. **Audio**: Se toma el PRIMER archivo de audio encontrado en `audio/`
3. **Subtítulos**: Se toma el PRIMER archivo de subtítulos encontrado en `audio/`

## 🛠️ Personalización avanzada

Si necesitas más control sobre qué archivos se detectan, puedes usar patrones personalizados:

```tsx
import { autoDetectFilesWithPatterns } from '../utils/autoDetectFiles';

// Ejemplo: Solo videos que empiecen con "scene_"
const customFiles = autoDetectFilesWithPatterns({
  videoPattern: /^videos\/scene_.*\.(mp4|mov)$/i,
  audioPattern: /^audio\/background_.*\.(mp3|wav)$/i,
});
```

## 🔍 Debug y troubleshooting

El componente muestra información de debug en los primeros 3 segundos:
- 🎬 Número de videos detectados
- 🎵 Si se encontró audio
- 📝 Si se encontraron subtítulos

Si no ves los archivos esperados:
1. Verifica que estén en las carpetas correctas (`public/videos`, `public/audio`)
2. Verifica que tengan las extensiones soportadas
3. Reinicia el servidor de desarrollo (`npm run dev`)

## 💡 Ventajas de la auto-detección

- ✅ **Menos código**: No necesitas listar cada archivo manualmente
- ✅ **Dinámico**: Agrega nuevos videos simplemente colocándolos en la carpeta
- ✅ **Menos errores**: No más paths incorrectos o archivos faltantes
- ✅ **Flexible**: Puedes combinar auto-detección con overrides manuales
