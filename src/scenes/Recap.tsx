import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPEKO } from '../theme';
import { jakarta, mono } from '../fonts';
import { hexA } from '../components';

const PILLARS = ['Create', 'Benchmark', 'Eval', 'Deploy', 'Monitor'];

const Pill: React.FC<{ n: number; label: string; delay: number }> = ({ n, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 150 } });
  return (
    <div
      style={{
        width: 240,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          background: SPEKO.bg2,
          border: `1px solid ${hexA(SPEKO.mint, 0.5)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 40,
          color: SPEKO.mint,
          boxShadow: `0 0 30px ${hexA(SPEKO.mint, 0.15)}`,
        }}
      >
        {n}
      </div>
      <span style={{ fontFamily: jakarta, fontWeight: 700, fontSize: 34, color: SPEKO.ink0 }}>{label}</span>
    </div>
  );
};

export const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const lineW = interpolate(frame, [8, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', gap: 70, alignItems: 'flex-start' }}>
        {/* connecting line behind top row */}
        <div
          style={{
            position: 'absolute',
            top: 48,
            left: 120,
            height: 2,
            width: `calc((100% - 240px) * ${lineW})`,
            background: `linear-gradient(90deg, ${hexA(SPEKO.mint, 0.6)}, ${hexA(SPEKO.mint, 0.15)})`,
          }}
        />
        {PILLARS.map((p, i) => (
          <Pill key={p} n={i + 1} label={p} delay={6 + i * 22} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
