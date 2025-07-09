import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Page } from "./Page";
import { TikTokPage } from "@remotion/captions";
import { SubtitleStyle } from "./index";

const SubtitlePage: React.FC<{ 
  readonly page: TikTokPage;
  readonly subtitleStyle: SubtitleStyle;
}> = ({ page, subtitleStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <Page enterProgress={enter} page={page} subtitleStyle={subtitleStyle} />
    </AbsoluteFill>
  );
};

export default SubtitlePage;
