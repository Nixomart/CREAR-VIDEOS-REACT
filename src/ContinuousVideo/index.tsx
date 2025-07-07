import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { 
  AbsoluteFill, 
  OffthreadVideo, 
  useCurrentFrame, 
  interpolate, 
  Sequence, 
  Audio,
  useVideoConfig,
  delayRender,
  continueRender,
  cancelRender,
  getStaticFiles,
  watchStaticFile
} from 'remotion'
import { getVideoMetadata } from '@remotion/media-utils'
import { Caption, createTikTokStyleCaptions } from '@remotion/captions'
import { loadFont } from '../load-font'
import SubtitlePage from '../CaptionedVideo/SubtitlePage'
import { ContinuousVideoProps } from './schema'
import { autoDetectFiles } from '../utils/autoDetectFiles'

const getFileExists = (file: string) => {
  const files = getStaticFiles();
  const fileExists = files.find((f) => {
    return f.src === file;
  });
  return Boolean(fileExists);
};

// Tipo para los datos originales del JSON
interface OriginalSubtitle {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number;
}

// Función para convertir el formato del JSON al formato Caption
const convertToCaption = (data: OriginalSubtitle[]): Caption[] => {
  return data.map(item => ({
    text: item.text,
    startMs: item.startMs,
    endMs: item.endMs,
    timestampMs: item.timestampMs,
    confidence: item.confidence
  }));
};

// How many captions should be displayed at a time?
const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const ContinuousVideo: React.FC<ContinuousVideoProps> = ({ 
  src: propSrc, 
  transitionDuration = 15, 
  audioSrc: propAudioSrc, 
  subtitlesJsonSrc: propSubtitlesJsonSrc,
  autoDetect = true
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());
  const [audioError] = useState<string | null>(null);
  const [videoDurations, setVideoDurations] = useState<number[]>([]);
  const [metadataHandle] = useState(() => delayRender());

  // Auto-detectar archivos si autoDetect está habilitado y no se proporcionan manualmente
  const detectedFiles = useMemo(() => {
    if (autoDetect) {
      return autoDetectFiles();
    }
    return { videos: [], audio: undefined, subtitles: undefined };
  }, [autoDetect]);

  // Usar archivos proporcionados o auto-detectados
  const src = propSrc && propSrc.length > 0 ? propSrc : detectedFiles.videos;
  const audioSrc = propAudioSrc || detectedFiles.audio;
  const subtitlesJsonSrc = propSubtitlesJsonSrc || detectedFiles.subtitles;
  const fetchSubtitles = useCallback(async () => {
    if (!subtitlesJsonSrc) {
      continueRender(handle);
      return;
    }
    
    try {
      await loadFont();
      const res = await fetch(subtitlesJsonSrc);
      const originalData = (await res.json()) as OriginalSubtitle[];
      const convertedData = convertToCaption(originalData);
      setSubtitles(convertedData);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [handle, subtitlesJsonSrc]);

  // Función para obtener metadatos de todos los videos
  const fetchVideoMetadata = useCallback(async () => {
    try {
      const durations: number[] = [];
      
      for (const videoSrc of src) {
        try {
          const metadata = await getVideoMetadata(videoSrc);
          const durationInFrames = Math.round(metadata.durationInSeconds * fps);
          console.log(`📹 Video: ${videoSrc}`);
          console.log(`⏱️  Real Duration: ${metadata.durationInSeconds} seconds`);
          console.log(`🎬 Real Frames: ${durationInFrames} frames`);
          console.log(`➕ + Transition: ${transitionDuration} frames`);
          console.log(`🎯 Total Frames: ${durationInFrames + transitionDuration} frames`);
          console.log(`🔢 FPS: ${fps}`);
          console.log('---');
          
          durations.push(durationInFrames + transitionDuration); // Añadir transición para que coincida con el audio
        } catch (error) {
          console.warn(`Error getting metadata for ${videoSrc}:`, error);
          // Usar duración por defecto si no se puede obtener metadata
          durations.push(120 + transitionDuration); // 4 segundos + transición como fallback
        }
      }
      
      console.log('📊 All video durations (frames):', durations);
      setVideoDurations(durations);
      continueRender(metadataHandle);
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      // Usar duraciones por defecto
      setVideoDurations(src.map(() => 120 + transitionDuration));
      continueRender(metadataHandle);
    }
  }, [src, fps, metadataHandle, transitionDuration]);

  useEffect(() => {
    fetchSubtitles();

    if (subtitlesJsonSrc) {
      const c = watchStaticFile(subtitlesJsonSrc, () => {
        fetchSubtitles();
      });

      return () => {
        c.cancel();
      };
    }
  }, [fetchSubtitles, subtitlesJsonSrc]);

  // Efecto para cargar metadatos de videos
  useEffect(() => {
    fetchVideoMetadata();
  }, [fetchVideoMetadata]);

  // Calcular frames de inicio acumulativos basados en duraciones reales
  const videoStartFrames = useMemo(() => {
    if (videoDurations.length === 0) return [];
    
    const startFrames: number[] = [0]; // El primer video siempre empieza en 0
    
    for (let i = 1; i < videoDurations.length; i++) {
      // El siguiente video empieza donde termina el anterior, PERO con superposición para transición
      // La superposición NO debe acortar el video anterior, solo crear overlap
      const previousStart = startFrames[i - 1];
      const previousDuration = videoDurations[i - 1];
      const previousEnd = previousStart + previousDuration;
      
      // El nuevo video empieza antes de que termine el anterior para crear transición
      const nextVideoStart = previousEnd - transitionDuration;
      startFrames.push(nextVideoStart);
    }
    
    // Calcular duración total de la composición
    const lastVideoIndex = videoDurations.length - 1;
    const lastVideoStart = startFrames[lastVideoIndex];
    const lastVideoDuration = videoDurations[lastVideoIndex];
    const totalCompositionDuration = lastVideoStart + lastVideoDuration;
    
    console.log('🎬 Video timing analysis:');
    console.log('- Video start frames:', startFrames);
    console.log('- Video durations (includes transition):', videoDurations);
    console.log('- Total composition duration (frames):', totalCompositionDuration);
    console.log('- Total composition duration (seconds):', (totalCompositionDuration / fps).toFixed(2));
    
    // Mostrar detalles de cada video
    startFrames.forEach((startFrame, index) => {
      const duration = videoDurations[index];
      const realDuration = duration - transitionDuration;
      const endFrame = startFrame + duration;
      const durationSeconds = (duration / fps).toFixed(2);
      const realDurationSeconds = (realDuration / fps).toFixed(2);
      const startSeconds = (startFrame / fps).toFixed(2);
      const endSeconds = (endFrame / fps).toFixed(2);
      console.log(`Video ${index + 1}: ${startSeconds}s-${endSeconds}s (${realDurationSeconds}s+${(transitionDuration/fps).toFixed(2)}s=${durationSeconds}s) [${startFrame}-${endFrame} frames]`);
    });
    
    return startFrames;
  }, [videoDurations, transitionDuration, fps]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Mostrar información de auto-detección si está habilitada */}
     {/*  {autoDetect && videoDurations.length > 0 && (
        <AbsoluteFill
          style={{
            height: "auto",
            width: "100%",
            backgroundColor: "rgba(0, 100, 0, 0.9)",
            fontSize: 12,
            padding: 8,
            top: 0,
            fontFamily: "monospace",
            color: "white",
            textAlign: "left",
            zIndex: 1000,
            opacity: frame < 180 ? 1 : 0, // Mostrar los primeros 6 segundos
            transition: "opacity 0.5s",
          }}
        >
          📁 Videos: {src.length}, Audio: {audioSrc ? '✅' : '❌'}, Subs: {subtitlesJsonSrc ? '✅' : '❌'} | Frame: {frame}<br/>
          {videoDurations.map((duration, i) => {
            const startFrame = videoStartFrames[i] || 0;
            const endFrame = startFrame + duration;
            const isActive = frame >= startFrame && frame <= endFrame;
            const durationSec = (duration / fps).toFixed(1);
            const realDurationSec = ((duration - transitionDuration) / fps).toFixed(1);
            return (
              <span key={i} style={{ color: isActive ? '#00ff00' : '#cccccc', fontSize: 11 }}>
                V{i + 1}: {startFrame}-{endFrame} ({realDurationSec}s+{(transitionDuration/fps).toFixed(1)}s={durationSec}s) {isActive ? '▶️' : ''}<br/>
              </span>
            );
          })}
        </AbsoluteFill>
      )} */}

      {/* Mostrar indicador de carga si los metadatos no están listos */}
      {videoDurations.length === 0 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            fontSize: 24,
            fontFamily: "sans-serif",
            color: "white",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          Loading video metadata...
        </AbsoluteFill>
      )}

      {/* Audio de fondo con manejo de errores */}
      {audioSrc && getFileExists(audioSrc) && (
        <Audio 
          src={audioSrc}
          /* onError={(e) => {
            console.warn('Error loading audio:', e);
            setAudioError('Failed to load audio file');
          }} */
        />
      )}
      
      {/* Mostrar error de audio si existe */}
      {audioError && (
        <AbsoluteFill
          style={{
            height: "auto",
            width: "100%",
            backgroundColor: "rgba(255, 0, 0, 0.7)",
            fontSize: 20,
            padding: 20,
            top: 0,
            fontFamily: "sans-serif",
            color: "white",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          Audio Error: {audioError}
        </AbsoluteFill>
      )}
      
      {/* Mostrar advertencia si el archivo de audio no existe */}
      {audioSrc && !getFileExists(audioSrc) && (
        <AbsoluteFill
          style={{
            height: "auto",
            width: "100%",
            backgroundColor: "rgba(255, 165, 0, 0.7)",
            fontSize: 20,
            padding: 20,
            top: 0,
            fontFamily: "sans-serif",
            color: "white",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          Audio file not found: {audioSrc}
        </AbsoluteFill>
      )}
      
      {/* Videos con transiciones */}
      {src.map((videoSrc, index) => {
        // Si aún no tenemos las duraciones, no renderizar
        if (videoDurations.length === 0 || videoStartFrames.length === 0) {
          return null;
        }

        const startFrame = videoStartFrames[index] || 0;
        const videoDuration = videoDurations[index] || 120;
        
        // Calculate fade transitions
        let opacity = 1;
        
        // Solo aplicar fade in para videos después del primero
        if (index > 0) {
          const fadeInStart = startFrame;
          const fadeInEnd = startFrame + transitionDuration;
          
          if (frame >= fadeInStart && frame <= fadeInEnd) {
            opacity = interpolate(frame, [fadeInStart, fadeInEnd], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
          }
        }
        
        // Solo aplicar fade out para videos que NO son el último
        if (index < src.length - 1) {
          const videoEnd = startFrame + videoDuration;
          const fadeOutStart = videoEnd - transitionDuration;
          const fadeOutEnd = videoEnd;
          
          if (frame >= fadeOutStart && frame <= fadeOutEnd) {
            opacity = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
          }
        }

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={videoDuration} // El video mantiene su duración COMPLETA
          >
            <AbsoluteFill
              style={{
                opacity,
              }}
            >
              <OffthreadVideo
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
                muted
                src={videoSrc}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      
      {/* Subtítulos estilo TikTok */}
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS,
        );
        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <SubtitlePage key={index} page={page} />
          </Sequence>
        );
      })}
      
      {/* Mostrar mensaje si no hay archivo de subtítulos */}
      {subtitlesJsonSrc && !getFileExists(subtitlesJsonSrc) && (
        <AbsoluteFill
          style={{
            height: "auto",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            fontSize: 30,
            padding: 30,
            top: undefined,
            bottom: 100,
            fontFamily: "sans-serif",
            color: "white",
            textAlign: "center",
          }}
        >
          No caption file found. Check the subtitles file path.
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
