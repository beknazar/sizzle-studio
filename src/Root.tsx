import React from 'react';
import { Composition } from 'remotion';
import { SpekoSizzle, TOTAL_FRAMES } from './SpekoSizzle';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SpekoSizzle"
        component={SpekoSizzle}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ mode: 'dark' as const }}
      />
      <Composition
        id="SpekoSizzleLight"
        component={SpekoSizzle}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ mode: 'light' as const }}
      />
    </>
  );
};
