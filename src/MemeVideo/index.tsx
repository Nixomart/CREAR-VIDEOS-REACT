import { useCallback, useEffect, useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  cancelRender,
  continueRender,
  delayRender,
  OffthreadVideo,
  watchStaticFile,
} from "remotion";
import { z } from "zod";
import { getVideoMetadata } from "@remotion/media-utils";
import { loadFont } from "../load-font";
import { MemeText } from "./MemeText";

export type MemeCaption = {
  text: string;
};

export type MemeData = {
  title: string;
  captions: MemeCaption[];
};

export const memeVideoSchema = z.object({
  videoSrc: z.string(),
  dataSrc: z.string(),
});

export const calculateMemeVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof memeVideoSchema>
> = async ({ props }) => {
  const fps = 30;
  const metadata = await getVideoMetadata(props.videoSrc);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
  };
};

export const MemeVideo: React.FC<{
  videoSrc: string;
  dataSrc: string;
}> = ({ videoSrc, dataSrc }) => {
  const [memeData, setMemeData] = useState<MemeData | null>(null);
  const [handle] = useState(() => delayRender());

  const fetchMemeData = useCallback(async () => {
    try {
      await loadFont();
      const res = await fetch(dataSrc);
      const data = (await res.json()) as MemeData;
      setMemeData(data);
      continueRender(handle);
    } catch (e) {
      console.error("Error fetching meme data:", e);
      cancelRender(e);
    }
  }, [handle, dataSrc]);

  useEffect(() => {
    fetchMemeData();

    const c = watchStaticFile(dataSrc, () => {
      fetchMemeData();
    });

    return () => {
      c.cancel();
    };
  }, [fetchMemeData, dataSrc]);

  if (!memeData) {
    return null;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Video de fondo */}
      <AbsoluteFill>
        <OffthreadVideo
          style={{
            objectFit: "cover",
          }}
          src={videoSrc}
        />
      </AbsoluteFill>
      
      {/* Overlay de texto */}
      <MemeText captions={memeData.captions} />
    </AbsoluteFill>
  );
};
