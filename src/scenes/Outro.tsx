import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SPEKO, FONT, TYPE } from '../theme';
import { SceneShell, FlowLines, SpekoLogo, Wordmark, ramp, windowed } from '../kit';

const Line: React.FC<{ text: string; op: number; accent?: boolean }> = ({ text, op, accent }) => (
  <div
    style={{
      fontFamily: FONT.display,
      fontWeight: 700,
      fontSize: TYPE.hero,
      color: accent ? SPEKO.mint : SPEKO.ink0,
      letterSpacing: -1.5,
      opacity: op,
      transform: `translateY(${(1 - op) * 20}px)`,
    }}
  >
    {text}
  </div>
);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = windowed(frame, 6, 20, 150, 164);
  const l2 = windowed(frame, 34, 48, 150, 164);
  const l3 = windowed(frame, 64, 78, 150, 164);

  const lockOp = ramp(frame, 168, 188);
  const tagOp = ramp(frame, 210, 230);
  const urlOp = ramp(frame, 248, 266);
  const flowOp = interpolate(frame, [168, 200], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <SceneShell tint="dark" glow={SPEKO.mint}>
      {lockOp > 0.01 && <FlowLines tint="dark" opacity={flowOp} />}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {frame < 166 && (
          <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Line text="One API." op={l1} />
            <Line text="Every provider." op={l2} />
            <Line text="The best one." op={l3} accent />
          </div>
        )}
        {lockOp > 0.01 && (
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, opacity: lockOp, transform: `scale(${interpolate(lockOp, [0, 1], [0.86, 1])})` }}>
              <SpekoLogo size={132} />
              <Wordmark size={128} color={SPEKO.ink0} delay={172} />
            </div>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: TYPE.h2 - 4, color: SPEKO.ink1, marginTop: 34, opacity: tagOp, transform: `translateY(${(1 - tagOp) * 14}px)` }}>
              Benchmark everything. Ship the best. <span style={{ color: SPEKO.mint }}>Guess nothing.</span>
            </div>
            <div style={{ fontFamily: FONT.mono, fontSize: 24, letterSpacing: 4, color: SPEKO.ink2, marginTop: 22, opacity: urlOp }}>
              speko.ai
            </div>
          </div>
        )}
      </AbsoluteFill>
    </SceneShell>
  );
};
