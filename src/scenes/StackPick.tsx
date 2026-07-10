import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, ramp, blurIn, hexA, useT } from '../kit';

// Picks mirror the #1s already shown publicly in the Benchmark scene — no new claims.
const LAYERS = [
  { tag: 'STT', prov: 'OpenAI', model: 'gpt-4o-transcribe', why: '#1 accuracy' },
  { tag: 'LLM', prov: 'Cerebras', model: 'gpt-oss-120b', why: '#1 speed' },
  { tag: 'TTS', prov: 'Google', model: 'gemini-3.1-flash-tts', why: '#1 quality' },
];
const TTS_FAST = { tag: 'TTS', prov: 'Cartesia', model: 'sonic-3.5', why: 're-picked' };
const PRIORITIES = ['Balanced', 'Fastest', 'Cheapest', 'Most natural'];
const FLIP = 84; // frame the priority flips Balanced -> Fastest

export const StackPick: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useT();
  const flipped = frame >= FLIP + 6;
  // overlapping crossfade — content never dips below 0.25 opacity
  const swapOut = ramp(frame, FLIP + 2, FLIP + 10);
  const swapIn = ramp(frame, FLIP + 6, FLIP + 14);
  const badge = spring({ frame: frame - (FLIP + 8), fps, config: { damping: 12, stiffness: 180 } });
  const flash = ramp(frame, FLIP + 6, FLIP + 26);

  return (
    <Stage3D v={{ enterX: -200, ryBase: 2.0 }}>
      <AppWindow title="Speko" crumb="New agent" delay={2} w={1300}>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ ...blurIn(frame, 4, 10), display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 2, color: t.mint, textTransform: 'uppercase' }}>Recommended stack</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, color: t.ink3 }}>picked from live benchmarks</span>
          </div>
          <div style={{ ...blurIn(frame, 8, 10), fontFamily: FONT.sans, fontSize: TYPE.body, fontWeight: 600, color: t.ink, marginBottom: 18 }}>
            not the same defaults everyone ships
          </div>

          {/* layer cards */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            {LAYERS.map((l, i) => {
              const sp = spring({ frame: frame - (10 + i * 6), fps, config: { damping: 14, stiffness: 120 } });
              const st: React.CSSProperties = { opacity: Math.min(1, sp * 1.2), transform: `translateY(${(1 - sp) * 24}px) scale(${0.97 + 0.03 * sp})` };
              const isTTS = l.tag === 'TTS';
              const show = isTTS && flipped ? TTS_FAST : l;
              const contentOp = isTTS ? Math.max(0.25, flipped ? swapIn : 1 - swapOut) : 1;
              const border = isTTS && flipped ? hexA(t.mint, 0.65 * (1 - flash) + 0.35) : t.line;
              return (
                <div key={l.tag} style={{ ...st, flex: 1, background: t.bg2, border: `1px solid ${border}`, borderRadius: t.radius, padding: '16px 18px', position: 'relative' }}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 2, color: t.ink3, marginBottom: 10 }}>{l.tag}</div>
                  <div style={{ opacity: contentOp }}>
                    <div style={{ fontFamily: FONT.sans, fontSize: 19, fontWeight: 600, color: t.ink }}>{show.prov}</div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 13, color: t.ink2, marginTop: 3 }}>{show.model}</div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.mint, marginTop: 8 }}>{show.why}</div>
                  </div>
                  {isTTS && flipped && (
                    <span style={{ position: 'absolute', top: 14, right: 14, transform: `scale(${badge})`, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, color: t.mint, background: hexA(t.mint, 0.16), border: `1px solid ${hexA(t.mint, 0.5)}`, padding: '3px 8px', borderRadius: 999 }}>
                      emotional
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* priority chips — flip re-picks the stack live */}
          <div style={{ ...blurIn(frame, 34, 10), display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: t.ink3, marginRight: 4 }}>Optimize for</span>
            {PRIORITIES.map((p) => {
              const active = flipped ? p === 'Fastest' : p === 'Balanced';
              return (
                <span key={p} style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: active ? 600 : 400, color: active ? t.onMint : t.ink2, background: active ? t.mint : t.bg2, border: `1px solid ${active ? t.mint : t.line}`, padding: '7px 14px', borderRadius: 999, transition: 'none' }}>
                  {p}
                </span>
              );
            })}
            <span style={{ fontFamily: FONT.mono, fontSize: 11, color: t.mint, marginLeft: 6, opacity: flipped ? ramp(frame, FLIP + 10, FLIP + 20) : 0 }}>re-picked live</span>
          </div>
        </div>
      </AppWindow>
    </Stage3D>
  );
};
