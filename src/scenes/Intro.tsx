import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SPEKO, FONT, TYPE } from '../theme';
import { SceneShell, FlowLines, SpekoLogo, Wordmark, ramp, windowed } from '../kit';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const introOp = windowed(frame, 8, 26, 44, 58);
  const lockOp = ramp(frame, 52, 70);
  return (
    <SceneShell tint="light" stars={false} glow={SPEKO.mint}>
      <FlowLines tint="light" opacity={interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {introOp > 0.01 && (
          <div
            style={{
              position: 'absolute',
              fontFamily: FONT.display,
              fontWeight: 300,
              fontSize: TYPE.hero,
              letterSpacing: -1,
              color: SPEKO.lInk0,
              opacity: introOp,
              transform: `translateY(${(1 - introOp) * 14}px)`,
            }}
          >
            Introducing
          </div>
        )}
        {lockOp > 0.01 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              gap: 34,
              opacity: lockOp,
              transform: `translateY(${interpolate(lockOp, [0, 1], [16, 0])}px)`,
            }}
          >
            <SpekoLogo size={132} />
            <Wordmark size={128} color={SPEKO.lInk0} delay={54} />
          </div>
        )}
      </AbsoluteFill>
    </SceneShell>
  );
};
