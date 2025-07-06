import { getVideoMetadata } from '@remotion/media-utils';
import { ContinuousVideoProps } from './schema';
import { autoDetectFiles } from '../utils/autoDetectFiles';

export const calculateContinuousVideoMetadata = async ({ props }: { props: ContinuousVideoProps }) => {
  const { src: propSrc, transitionDuration = 15, autoDetect = true } = props;
  
  try {
    // Determinar qué archivos usar (proporcionados o auto-detectados)
    let videosToUse: string[] = [];
    
    if (autoDetect && (!propSrc || propSrc.length === 0)) {
      const detectedFiles = autoDetectFiles();
      videosToUse = detectedFiles.videos;
    } else {
      videosToUse = propSrc || [];
    }
    
    if (videosToUse.length === 0) {
      console.warn('No videos found for metadata calculation');
      return {
        durationInFrames: 1800, // 60 segundos por defecto
        fps: 30,
        width: 1080,
        height: 1920,
      };
    }
    
    const durations: number[] = [];
    const fps = 30; // Asumimos 30fps como default
    
    for (const videoSrc of videosToUse) {
      try {
        const metadata = await getVideoMetadata(videoSrc);
        const durationInFrames = Math.round(metadata.durationInSeconds * fps);
        // Agregar duración de transición para que coincida con el audio
        durations.push(durationInFrames + transitionDuration);
      } catch (error) {
        console.warn(`Error getting metadata for ${videoSrc}:`, error);
        // Usar duración por defecto si no se puede obtener metadata
        durations.push(120 + transitionDuration); // 4 segundos + transición como fallback
      }
    }
    
    // Calcular duración total: PERO ahora restamos las superposiciones correctamente
    // ya que cada video YA incluye la duración de transición
    const totalDuration = durations.reduce((total, duration, index) => {
      if (index === 0) {
        // El primer video se reproduce completo (incluyendo su transición)
        return duration;
      }
      // Los siguientes videos se superponen, restamos SOLO una transición
      // porque cada video ya tiene su transición incluida
      return total + duration - transitionDuration;
    }, 0);
    
    console.log('📊 Metadata calculation:');
    console.log('- Video durations + transition (frames):', durations);
    console.log('- Video durations + transition (seconds):', durations.map(d => (d / fps).toFixed(2)));
    console.log('- Transition duration (frames):', transitionDuration);
    console.log('- Total composition duration (frames):', totalDuration);
    console.log('- Total composition duration (seconds):', (totalDuration / fps).toFixed(2));
    
    return {
      durationInFrames: Math.max(totalDuration, 300), // Mínimo 10 segundos
      fps,
      width: 1080,
      height: 1920,
    };
  } catch (error) {
    console.error('Error calculating metadata:', error);
    // Fallback a valores por defecto
    return {
      durationInFrames: 1800, // 60 segundos a 30fps
      fps: 30,
      width: 1080,
      height: 1920,
    };
  }
};
