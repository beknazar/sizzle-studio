import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SPEKO, FONT, TYPE } from '../theme';
import { SceneShell, Kicker, ramp, hexA } from '../kit';

const ROWS: [string, boolean][] = [
  ['Books an appointment', true],
  ['Handles a reschedule', true],
  ['Verifies caller identity', false],
  ['Reads back the details', true],
];

const Row: React.FC<{ name: string; pass: boolean; delay: number }> = ({ name, pass, delay }) => {
  const frame = useCurrentFrame();
  const op = ramp(frame, delay, delay + 12);
  const c = pass ? SPEKO.pass : SPEKO.fail;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 26px',
        borderRadius: 14,
        background: hexA('#0e1216', 0.7),
        border: `1px solid ${hexA('#ffffff', 0.06)}`,
        opacity: op,
        transform: `translateX(${interpolate(op, [0, 1], [30, 0])}px)`,
      }}
    >
      <span style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: TYPE.body, color: SPEKO.ink0 }}>{name}</span>
      <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 20, color: c, background: hexA(c, 0.13), border: `1px solid ${hexA(c, 0.5)}`, padding: '6px 14px', borderRadius: 999 }}>
        {pass ? '✓ PASS' : '✕ FAIL'}
      </span>
    </div>
  );
};

export const Eval: React.FC = () => {
  const frame = useCurrentFrame();
  const passed = Math.round(interpolate(frame, [16, 80], [0, 18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const scoreOp = ramp(frame, 16, 30);
  return (
    <SceneShell tint="dark" glow={SPEKO.mint}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 56, alignItems: 'center', width: 1360 }}>
          <div style={{ flex: 1.4 }}>
            <Kicker text="Eval" delay={2} />
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: TYPE.h2, color: SPEKO.ink0, margin: '14px 0 20px', letterSpacing: -0.5 }}>
              Every scenario, before a single call.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ROWS.map(([n, p], i) => (
                <Row key={n} name={n} pass={p} delay={12 + i * 10} />
              ))}
            </div>
          </div>
          <div style={{ flex: 0.7, textAlign: 'center', opacity: scoreOp }}>
            <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 130, color: SPEKO.mint, lineHeight: 1 }}>
              {passed}
              <span style={{ fontSize: 54, color: SPEKO.ink2 }}>/20</span>
            </div>
            <div style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: SPEKO.ink1, marginTop: 6 }}>
              scenarios passed
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
