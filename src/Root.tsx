import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { ContinuousVideo } from "./ContinuousVideo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ContinuousVideo"
        component={ContinuousVideo}
        schema={undefined} // This schema defines the properties for the composition
        width={1080}
        height={1920}
        durationInFrames={300} // Aproximadamente 10 segundos a 30fps
        fps={30}
        defaultProps={{
          src: [
            staticFile("videos/01_bee_flying_slow_motion_1751823874243.mp4"),
            staticFile("videos/02_macro_shot_bee_on_flower_1751823879540.mp4"),
            staticFile("videos/03_bee_collecting_pollen_close_up_1751823884337.mp4"),
            staticFile("videos/04_pollen_sticking_to_bee_fur_1751823888819.mp4"),
          ],
          videoDuration: 90, // Duración de cada video en frames (3 segundos a 30fps)
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
