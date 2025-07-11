import { Composition } from "remotion";
import { ContinuousVideo } from "./ContinuousVideo";
import { continuousVideoSchema } from "./ContinuousVideo/schema";
import { calculateContinuousVideoMetadata } from "./ContinuousVideo/calculateMetadata";
import { MemeVideo, memeVideoSchema, calculateMemeVideoMetadata } from "./MemeVideo";
import { autoDetectMemeFiles } from "./utils/autoDetectFiles";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  // Auto-detectar archivos de meme
  const memeFiles = autoDetectMemeFiles();
  
  return (
    <>
      {/* Composición para videos de meme */}
      {memeFiles.videoSrc && memeFiles.dataSrc && (
        <Composition
          id="MemeVideo"
          component={MemeVideo}
          schema={memeVideoSchema}
          calculateMetadata={calculateMemeVideoMetadata}
          width={1080}
          height={1920}
          durationInFrames={900} // Duración por defecto, se calculará dinámicamente
          fps={30}
          defaultProps={{
            videoSrc: memeFiles.videoSrc,
            dataSrc: memeFiles.dataSrc,
          }}
        />
      )}
    
      <Composition
        id="ContinuousVideo"
        component={ContinuousVideo}
        schema={continuousVideoSchema}
        calculateMetadata={calculateContinuousVideoMetadata}
        width={1080}
        height={1920}
        durationInFrames={1800} // Duración por defecto, se calculará dinámicamente
        fps={30}
        defaultProps={{
          // Con autoDetect: true, no necesitamos especificar archivos manualmente
          // Los archivos se detectarán automáticamente de public/videos y public/audio
          autoDetect: true,
          transitionDuration: 15, // Duración de la transición en frames (0.5 segundos a 30fps)
          
          // Opcional: Si quieres especificar archivos manualmente, descomenta las siguientes líneas:
          /*
          src: [
            staticFile("videos/01_bee_flying_slow_motion_1751823874243.mp4"),
            staticFile("videos/02_macro_shot_bee_on_flower_1751823879540.mp4"),
            staticFile("videos/03_bee_collecting_pollen_close_up_1751823884337.mp4"),
            staticFile("videos/04_pollen_sticking_to_bee_fur_1751823888819.mp4"),
            staticFile("videos/05_bee_flying_between_flowers_1751823893926.mp4"),
            staticFile("videos/06_colorful_fruits_and_vegetables_market_1751823898735.mp4"),
            staticFile("videos/07_montage_of_different_foods_1751823904321.mp4"),
            staticFile("videos/08_wide_shot_wild_flower_field_1751823908198.mp4"),
            staticFile("videos/09_bird_eating_berries_from_bush_1751823914125.mp4"),
            staticFile("videos/10_drone_shot_forest_canopy_sunrise_1751823930084.mp4"),
            staticFile("videos/11_person_watching_bee_respectfully_1751823938591.mp4"),
          ],
          audioSrc: staticFile("audio/tts_1751823872736.mp3"),
          subtitlesJsonSrc: staticFile("audio/converted_tts_1751823872736.json"),
          */
        }}
      />
      {/* <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      /> */}
    </>
  );
};
