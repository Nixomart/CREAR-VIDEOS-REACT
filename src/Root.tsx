import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { ContinuousVideo } from "./ContinuousVideo";
import { continuousVideoSchema } from "./ContinuousVideo/schema";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ContinuousVideo"
        component={ContinuousVideo}
        schema={continuousVideoSchema}
        width={1080}
        height={1920}
        durationInFrames={1800} // Aproximadamente 60 segundos a 30fps para todos los videos
        fps={30}
        defaultProps={{
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
          audioSrc: staticFile("audio/tts_1751823872736.mp3"), // Comentado temporalmente por problemas de formato
          subtitlesJsonSrc: staticFile("audio/converted_tts_1751823872736.json"),
          transitionDuration: 15, // Duración de la transición en frames (0.5 segundos a 30fps)
        }}
      />
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
    </>
  );
};
