import React from 'react'
import { AbsoluteFill, OffthreadVideo, useCurrentFrame, interpolate, Sequence } from 'remotion'

export const ContinuousVideo: React.FC<{
  src: string[];
  videoDuration?: number;
  transitionDuration?: number;
}> = ({ src, videoDuration = 90, transitionDuration = 15 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {src.map((videoSrc, index) => {
        const startFrame = index * (videoDuration - transitionDuration);
        const endFrame = startFrame + videoDuration;
        
        // Calculate fade in and fade out
        const fadeInStart = startFrame;
        const fadeInEnd = startFrame + transitionDuration;
        const fadeOutStart = endFrame - transitionDuration;
        const fadeOutEnd = endFrame;
        
        let opacity = 1;
        
        if (frame >= fadeInStart && frame <= fadeInEnd) {
          // Fade in
          opacity = interpolate(frame, [fadeInStart, fadeInEnd], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
        } else if (frame >= fadeOutStart && frame <= fadeOutEnd) {
          // Fade out
          opacity = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
        } else if (frame < fadeInStart || frame > fadeOutEnd) {
          // Outside video range
          opacity = 0;
        }

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={videoDuration}
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
                src={videoSrc}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  )
}
