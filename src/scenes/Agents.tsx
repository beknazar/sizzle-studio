import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SPEKO, FONT, TYPE } from '../theme';
import { SceneShell, Orb, ramp, hexA } from '../kit';

const ROWS = [
  { name: 'Call Router', palette: SPEKO.orbs.amber, active: false },
  { name: 'Sales Qualifier', palette: SPEKO.orbs.teal, active: true },
  { name: 'Service Dispatch', palette: SPEKO.orbs.violet, active: false },
] as const;

const Row: React.FC<{
  name: string;
  palette: readonly [string, string, string];
  active: boolean;
  delay: number;
  seed: number;
}> = ({ name, palette, active, delay, seed }) => {
  const frame = useCurrentFrame();
  const op = ramp(frame, delay, delay + 16);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        width: active ? 1160 : 1040,
        padding: active ? '26px 40px' : '20px 40px',
        borderRadius: 999,
        background: active
          ? `linear-gradient(180deg, ${hexA('#161b20', 0.9)}, ${hexA('#0b0e11', 0.9)})`
          : hexA('#0e1216', 0.6),
        border: `1px solid ${active ? hexA('#ffffff', 0.12) : hexA('#ffffff', 0.05)}`,
        boxShadow: active ? `0 30px 70px rgba(0,0,0,0.55)` : 'none',
        opacity: op,
        transform: `translateX(${interpolate(op, [0, 1], [40, 0])}px)`,
      }}
    >
      <Orb size={active ? 96 : 74} palette={palette} seed={seed} delay={delay + 2} />
      <span
        style={{
          fontFamily: FONT.display,
          fontWeight: active ? 700 : 500,
          fontSize: active ? TYPE.h2 : TYPE.lead,
          color: active ? SPEKO.ink0 : SPEKO.ink1,
        }}
      >
        {name}
      </span>
      <span style={{ marginLeft: 'auto', color: SPEKO.ink2, fontSize: 30, letterSpacing: 3 }}>⋯</span>
    </div>
  );
};

export const Agents: React.FC = () => {
  return (
    <SceneShell tint="dark" glow={SPEKO.orbs.teal[1]}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {ROWS.map((r, i) => (
            <Row key={r.name} name={r.name} palette={r.palette} active={r.active} delay={10 + i * 16} seed={i + 3} />
          ))}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
