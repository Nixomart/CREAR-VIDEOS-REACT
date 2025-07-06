import { z } from "zod";

export const continuousVideoSchema = z.object({
  src: z.array(z.string()).min(1, "At least one video source is required"),
  audioSrc: z.string().optional(),
  subtitlesJsonSrc: z.string().optional(),
  transitionDuration: z.number().int().positive().default(15),
});

export type ContinuousVideoProps = z.infer<typeof continuousVideoSchema>;
