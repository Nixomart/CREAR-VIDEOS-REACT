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
import { Caption, createTikTokStyleCaptions } from '@remotion/captions'
import { loadFont } from '../load-font'
import SubtitlePage from '../CaptionedVideo/SubtitlePage'
import { ContinuousVideoProps } from './schema'

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
  src, 
  transitionDuration = 15, 
  audioSrc, 
  subtitlesJsonSrc 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [handle] = useState(() => delayRender());
  const [audioError, setAudioError] = useState<string | null>(null);

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

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
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
        // Calculate start frame with overlap for transitions
        const startFrame = index === 0 ? 0 : index * 120 - (index * transitionDuration);
        
        // Calculate fade transitions
        const fadeInStart = startFrame;
        const fadeInEnd = startFrame + (index === 0 ? 0 : transitionDuration);
        
        let opacity = 1;
        
        // Only apply fade in for videos after the first one
        if (index > 0 && frame >= fadeInStart && frame <= fadeInEnd) {
          opacity = interpolate(frame, [fadeInStart, fadeInEnd], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
        }
        
        // Apply fade out for all videos except the last one
        // We'll calculate this based on when the next video should start fading in
        if (index < src.length - 1) {
          const nextVideoStart = (index + 1) === 0 ? 0 : (index + 1) * 120 - ((index + 1) * transitionDuration);
          const fadeOutStart = nextVideoStart;
          const fadeOutEnd = nextVideoStart + transitionDuration;
          
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
