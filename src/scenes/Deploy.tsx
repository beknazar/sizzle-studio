import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPEKO, FONT, TYPE } from '../theme';
import { SceneShell, Kicker, ramp, hexA } from '../kit';

const Card: React.FC<{ tag: string; name: string; delay: number }> = ({ tag, name, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
  return (
    <div
      style={{
        width: 320,
        background: `linear-gradient(180deg, ${hexA('#141a20', 0.85)}, ${hexA('#0b0e11', 0.85)})`,
        border: `1px solid ${hexA('#ffffff', 0.08)}`,
        borderRadius: 20,
        padding: '26px 24px',
        textAlign: 'center',
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px) scale(${interpolate(s, [0, 1], [0.88, 1])})`,
      }}
    >
      <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: SPEKO.mint, textTransform: 'uppercase' }}>{tag}</div>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: TYPE.h2 - 4, color: SPEKO.ink0, marginTop: 10 }}>{name}</div>
    </div>
  );
};

const Plus: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  return <div style={{ fontFamily: FONT.mono, fontSize: 46, color: SPEKO.ink2, opacity: ramp(frame, delay, delay + 8) }}>+</div>;
};

export const Deploy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const live = spring({ frame: frame - 128, fps, config: { damping: 12, stiffness: 140 } });
  const pulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.55, 1]);
  return (
    <SceneShell tint="dark" glow={SPEKO.mint}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Kicker text="Deploy" delay={4} />
          <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: TYPE.h1, color: SPEKO.ink0, margin: '16px 0 40px', letterSpacing: -1 }}>
            The winning stack, in one click.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'center' }}>
            <Card tag="STT" name="Deepgram Nova-2" delay={14} />
            <Plus delay={34} />
            <Card tag="LLM" name="GPT-4.1" delay={44} />
            <Plus delay={64} />
            <Card tag="TTS" name="Cartesia Sonic" delay={74} />
          </div>
          <div
            style={{
              marginTop: 46,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 38px',
              borderRadius: 999,
              background: SPEKO.mint,
              opacity: live,
              transform: `scale(${interpolate(live, [0, 1], [0.7, 1])})`,
              boxShadow: `0 0 50px ${hexA(SPEKO.mint, 0.5)}`,
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 999, background: '#051712', opacity: pulse }} />
            <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 32, color: '#051712', letterSpacing: 3 }}>LIVE</span>
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
