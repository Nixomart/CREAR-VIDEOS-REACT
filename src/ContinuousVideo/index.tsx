import React from 'react'
import { AbsoluteFill, OffthreadVideo, useCurrentFrame, interpolate, Sequence } from 'remotion'

export const ContinuousVideo: React.FC<{
  src: string[];
  transitionDuration?: number;
}> = ({ src, transitionDuration = 15 }) => {
  const frame = useCurrentFrame();

  // Simplified approach: let each video play its natural duration
  // with overlapping transitions
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
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
                src={videoSrc}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  )
}
