import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { APP, FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, Caret, ramp, blurIn, hexA } from '../kit';

const TYPED = 'a receptionist for a dental clinic that books appointments';

export const Build: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = Math.round(interpolate(frame, [34, 96], [0, TYPED.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Stage3D>
        <AppWindow title="Speko" crumb="New agent" delay={2} w={1300}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 40px 60px' }}>
            <div style={{ ...blurIn(frame, 8, 12), display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.mono, fontSize: 13, letterSpacing: 2, color: APP.mint, textTransform: 'uppercase' }}>✦ New agent</div>
            <div style={{ ...blurIn(frame, 16, 14), fontFamily: FONT.sans, fontSize: TYPE.h2, fontWeight: 600, color: APP.ink, marginTop: 16, letterSpacing: -0.5 }}>What should your voice agent do?</div>
            <div style={{ ...blurIn(frame, 24, 14), fontFamily: FONT.sans, fontSize: TYPE.small, color: APP.ink3, marginTop: 10, maxWidth: 560, lineHeight: 1.5 }}>
              Say it, type it, or drop a call transcript. Speko picks a starting voice, stack, and tools.
            </div>
            {/* talk field */}
            <div style={{ ...blurIn(frame, 30, 14), width: 720, marginTop: 34, background: APP.bg2, border: `1px solid ${frame > 34 ? hexA(APP.mint, 0.4) : APP.line}`, borderRadius: APP.radius, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', boxShadow: frame > 34 ? `0 0 0 3px ${hexA(APP.mint, 0.1)}` : 'none' }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 18, color: APP.mint }}>›</span>
              <span style={{ fontFamily: FONT.sans, fontSize: 20, color: APP.ink }}>{TYPED.slice(0, chars)}{chars < TYPED.length ? <Caret /> : ''}</span>
            </div>
            {/* actions */}
            <div style={{ ...blurIn(frame, 108, 12), display: 'flex', alignItems: 'center', gap: 24, marginTop: 30, width: 720 }}>
              <span style={{ fontFamily: FONT.sans, fontSize: 15, color: APP.ink3 }}>Start from a template</span>
              <span style={{ fontFamily: FONT.sans, fontSize: 15, color: APP.ink3 }}>Configure manually</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: APP.mint, color: APP.onMint, fontFamily: FONT.sans, fontSize: 16, fontWeight: 600, padding: '12px 22px', borderRadius: APP.radius }}>🚀 Build agent</div>
            </div>
          </div>
        </AppWindow>
    </Stage3D>
  );
};
