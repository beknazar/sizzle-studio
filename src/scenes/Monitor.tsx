import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPEKO, FONT, TYPE } from '../theme';
import { SceneShell, Kicker, ramp, hexA } from '../kit';

const PTS = [88, 91, 90, 93, 92, 94, 91, 89, 84, 72, 68];
const W = 1000;
const H = 300;

export const Monitor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const coords = PTS.map((v, i) => ({
    x: (i / (PTS.length - 1)) * W,
    y: interpolate(v, [55, 100], [H * 0.9, H * 0.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  }));
  const path = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const dashLen = coords.reduce((s, p, i) => (i === 0 ? 0 : s + Math.hypot(p.x - coords[i - 1].x, p.y - coords[i - 1].y)), 0);
  const draw = ramp(frame, 12, 78);
  const alert = spring({ frame: frame - 86, fps, config: { damping: 12, stiffness: 150 } });
  const calls = Math.round(interpolate(frame, [12, 90], [0, 1284], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <SceneShell tint="dark" glow={SPEKO.mint}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 1200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <Kicker text="Monitor" delay={2} />
              <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: TYPE.h1, color: SPEKO.ink0, marginTop: 14, letterSpacing: -1 }}>
                Every live call, scored.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 56, color: SPEKO.mint }}>{calls.toLocaleString()}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 20, color: SPEKO.ink2, letterSpacing: 2 }}>calls scored today</div>
            </div>
          </div>
          <div style={{ position: 'relative', marginTop: 40 }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
              <path
                d={path}
                fill="none"
                stroke={SPEKO.mint}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dashLen}
                strokeDashoffset={dashLen * (1 - draw)}
                style={{ filter: `drop-shadow(0 0 12px ${hexA(SPEKO.mint, 0.6)})` }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                right: 30,
                top: 150,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 22px',
                borderRadius: 12,
                background: hexA(SPEKO.warn, 0.13),
                border: `1px solid ${hexA(SPEKO.warn, 0.6)}`,
                opacity: alert,
                transform: `scale(${interpolate(alert, [0, 1], [0.8, 1])})`,
              }}
            >
              <span style={{ fontSize: 24 }}>⚠</span>
              <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 24, color: SPEKO.warn }}>quality drop flagged</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
