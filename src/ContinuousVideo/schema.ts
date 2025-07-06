import { z } from "zod";

export const continuousVideoSchema = z.object({
  src: z.array(z.string()).min(1, "At least one video source is required").optional(),
  audioSrc: z.string().optional(),
  subtitlesJsonSrc: z.string().optional(),
  transitionDuration: z.number().int().positive().default(15),
  autoDetect: z.boolean().default(true), // Nueva opción para auto-detección
});

export type ContinuousVideoProps = z.infer<typeof continuousVideoSchema>;
