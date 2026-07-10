import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { PAPER, FONT, TYPE, SHADOW_SOFT } from '../theme';
import { Paper, ramp, blurIn, hexA } from '../kit';

const PLATES = [
  { tag: 'STT', name: 'ElevenLabs Scribe', micro: '4.9% WER' },
  { tag: 'LLM', name: 'GPT-4.1', micro: '175 ms' },
  { tag: 'TTS', name: 'Cartesia Sonic', micro: '$0.009/min' },
];
const GAP = 380;

export const WinningStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerOp = ramp(frame, 2, 14);
  const spine = ramp(frame, 24, 36); // draws L->R
  const lock = spring({ frame: frame - 34, fps, config: { damping: 15, stiffness: 150 } }); // the one overshoot
  const shadow = ramp(frame, 34, 48);

  return (
    <Paper drift={false}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', color: PAPER.mintDeep, opacity: kickerOp, marginBottom: 70 }}>
          the winning stack
        </div>

        <div
          style={{
            position: 'relative',
            width: GAP * 2 + 300,
            height: 220,
            transform: `translateY(${interpolate(lock, [0, 1], [10, 0])}px) scale(${interpolate(lock, [0, 1], [0.985, 1])})`,
          }}
        >
          {/* plates */}
          {PLATES.map((p, i) => {
            const st = blurIn(frame, 6 + i * 5, 14);
            const cx = (i - 1) * GAP;
            return (
              <div key={i} style={{ ...st, position: 'absolute', left: '50%', top: 0, transform: `translateX(calc(-50% + ${cx}px))`, textAlign: 'center', width: 300 }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: 3, color: PAPER.mintDeep, marginBottom: 12 }}>{p.tag}</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 30, letterSpacing: -0.6, color: PAPER.ink }}>{p.name}</div>
              </div>
            );
          })}

          {/* mint spine + nodes */}
          <div style={{ position: 'absolute', left: '50%', top: 150, width: GAP * 2, transform: 'translateX(-50%)' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 3, width: `${spine * 100}%`, background: PAPER.mint, borderRadius: 3, boxShadow: `0 0 ${8 * shadow}px ${hexA(PAPER.mint, 0.4 * shadow)}` }} />
            {PLATES.map((_, i) => {
              const nodeAt = i / 2; // 0, .5, 1
              const on = spine >= nodeAt - 0.02;
              const ns = spring({ frame: frame - (24 + nodeAt * 12), fps, config: { damping: 12, stiffness: 200 } });
              return (
                <div key={i} style={{ position: 'absolute', left: `${nodeAt * 100}%`, top: 1.5, width: 12, height: 12, borderRadius: 999, background: PAPER.mint, transform: `translate(-50%,-50%) scale(${on ? ns : 0})` }} />
              );
            })}
          </div>

          {/* micro-captions */}
          {PLATES.map((p, i) => {
            const cx = (i - 1) * GAP;
            return (
              <div key={i} style={{ position: 'absolute', left: '50%', top: 172, transform: `translateX(calc(-50% + ${cx}px))`, width: 300, textAlign: 'center', fontFamily: FONT.mono, fontSize: 15, color: PAPER.inkFaint, opacity: ramp(frame, 40, 54) }}>
                {p.micro}
              </div>
            );
          })}
        </div>
      </div>
    </Paper>
  );
};
