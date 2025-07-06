import { getStaticFiles, staticFile } from 'remotion';

export interface AutoDetectedFiles {
  videos: string[];
  audio: string | undefined;
  subtitles: string | undefined;
}

/**
 * Detecta automáticamente archivos de video, audio y subtítulos en las carpetas public
 */
export const autoDetectFiles = (): AutoDetectedFiles => {
  const staticFiles = getStaticFiles();
/*   console.log("STATIC FILES:", staticFiles);
 */  
  // Detectar videos en la carpeta videos/
  const videoFiles = staticFiles
    .filter(file => {
      const src = file.name.toLowerCase();
      return src.startsWith('videos/') && 
             (src.endsWith('.mp4') || src.endsWith('.mov') || src.endsWith('.avi') || src.endsWith('.webm'));
    })
    .map(file => file.name)
    .sort(); // Ordenar alfabéticamente para tener un orden consistente
    
  // Detectar archivo de audio en la carpeta audio/
  const audioFile = staticFiles.find(file => {
    const src = file.name.toLowerCase();
    return src.startsWith('audio/') && 
           (src.endsWith('.mp3') || src.endsWith('.wav') || src.endsWith('.m4a') || src.endsWith('.aac'));
  });

  // Detectar archivo de subtítulos en la carpeta audio/
  const subtitlesFile = staticFiles.find(file => {
    const src = file.name.toLowerCase();
    return src.startsWith('audio/') && 
           (src.endsWith('.json') || src.endsWith('.srt') || src.endsWith('.vtt'));
  });
  console.log("Detected files:", {
    videos: videoFiles,
    audio: audioFile ? audioFile.name : undefined,
    subtitles: subtitlesFile ? subtitlesFile.name : undefined,
  });
  
  return {
    videos: videoFiles.map(src => staticFile(src)),
    audio: audioFile ? staticFile(audioFile.name) : undefined,
    subtitles: subtitlesFile ? staticFile(subtitlesFile.name) : undefined,
  };
};

/**
 * Obtiene archivos con patrones específicos para mayor control
 */
export const autoDetectFilesWithPatterns = (patterns?: {
  videoPattern?: RegExp;
  audioPattern?: RegExp;
  subtitlesPattern?: RegExp;
}): AutoDetectedFiles => {
  const staticFiles = getStaticFiles();
  
  const defaultPatterns = {
    videoPattern: /^videos\/.*\.(mp4|mov|avi|webm)$/i,
    audioPattern: /^audio\/.*\.(mp3|wav|m4a|aac)$/i,
    subtitlesPattern: /^audio\/.*\.(json|srt|vtt)$/i,
  };
  
  const finalPatterns = { ...defaultPatterns, ...patterns };
  
  // Detectar videos
  const videoFiles = staticFiles
    .filter(file => finalPatterns.videoPattern.test(file.src))
    .map(file => file.src)
    .sort();

  // Detectar audio (tomar el primero que coincida)
  const audioFile = staticFiles.find(file => finalPatterns.audioPattern.test(file.src));

  // Detectar subtítulos (tomar el primero que coincida)
  const subtitlesFile = staticFiles.find(file => finalPatterns.subtitlesPattern.test(file.src));

  return {
    videos: videoFiles.map(src => staticFile(src)),
    audio: audioFile ? staticFile(audioFile.src) : undefined,
    subtitles: subtitlesFile ? staticFile(subtitlesFile.src) : undefined,
  };
};

/**
 * Hook personalizado para usar en componentes React
 */
export const useAutoDetectedFiles = (patterns?: {
  videoPattern?: RegExp;
  audioPattern?: RegExp;
  subtitlesPattern?: RegExp;
}) => {
  return autoDetectFilesWithPatterns(patterns);
};
