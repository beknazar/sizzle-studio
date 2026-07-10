import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, Caret, ramp, blurIn, hexA, useT } from '../kit';

const TYPED = 'a receptionist for a dental clinic that books appointments';

export const Create: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const chars = Math.round(interpolate(frame, [12, 50], [0, TYPED.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const genOp = ramp(frame, 52, 62);
  const dot = Math.floor(frame / 6) % 3; // generating dots

  return (
    <Stage3D v={{ enterX: 240, ryBase: -2.2 }}>
      <AppWindow title="Speko" crumb="New agent" delay={2} w={1240}>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ ...blurIn(frame, 4, 10), display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.mono, fontSize: 12, letterSpacing: 2, color: t.mint, textTransform: 'uppercase', marginBottom: 14 }}>✦ New agent</div>
          <div style={{ ...blurIn(frame, 6, 10), fontFamily: FONT.sans, fontSize: TYPE.body, fontWeight: 600, color: t.ink, marginBottom: 14 }}>What should your voice agent do?</div>
          {/* talk field */}
          <div style={{ ...blurIn(frame, 8, 10), background: t.bg2, border: `1px solid ${frame >= 50 && frame < 58 ? t.mint : frame > 10 ? hexA(t.mint, 0.4) : t.line}`, borderRadius: t.radius, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: frame > 10 && frame < 50 ? `0 0 0 3px ${hexA(t.mint, 0.06 + 0.08 * Math.abs(Math.sin(frame / 9)))}` : frame >= 50 ? `0 0 0 3px ${hexA(t.mint, frame < 58 ? 0.18 : 0.09)}` : 'none' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 16, color: t.mint }}>›</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 18, color: t.ink }}>{TYPED.slice(0, chars)}{chars < TYPED.length ? <Caret /> : ''}</span>
          </div>

          {/* benchmark hand-off into the pick beat */}
          <div style={{ opacity: genOp, marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: t.ink3 }}>
              Benchmarking your use case{'.'.repeat(dot + 1)}
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, color: t.mint }}>picking your stack</span>
          </div>
        </div>
      </AppWindow>
    </Stage3D>
  );
};
