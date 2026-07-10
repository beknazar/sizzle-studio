import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { PAPER, FONT } from '../theme';
import { Paper, ramp, hexA } from '../kit';

// deterministic RNG so the scatter is stable per render
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Item = {
  label: string;
  value: string; // raw floating text
  plane: 0 | 1 | 2; // 0 near, 1 mid, 2 far
  win?: { row: number; k: string; num: string; unit: string; by: string };
};

const LOSERS: [string, string, 0 | 1 | 2][] = [
  ['WhisperX', '8.9%', 2], ['Deepgram', '320ms', 2], ['Rev.ai', '410ms', 2], ['Azure', '7.1%', 2],
  ['Gladia', '6.8%', 2], ['Speechmatics', '380ms', 2], ['—', '$0.019/min', 2], ['—', '$0.024/min', 2], ['NVIDIA', '7.4%', 2],
  ['Groq', '210ms', 1], ['OpenAI', '5.4%', 1], ['Cartesia', '190ms', 1], ['Fireworks', '240ms', 1],
  ['PlayHT', '6.2%', 1], ['Alibaba', '5.8%', 1], ['—', '$0.011/min', 1], ['—', '$0.014/min', 1],
  ['Whisper-lg', '5.1%', 0], ['Rime', '205ms', 0], ['Nova-2', '5.6%', 0],
];

const WINNERS: Item[] = [
  { label: 'scribe_v2', value: '4.9%', plane: 0, win: { row: 0, k: 'WER', num: '4.9', unit: '%', by: 'scribe_v2' } },
  { label: 'gpt-4.1', value: '175ms', plane: 0, win: { row: 1, k: 'LATENCY', num: '175', unit: ' ms', by: 'gpt-4.1' } },
  { label: 'Sonic-3.5', value: '$0.009', plane: 0, win: { row: 2, k: 'COST', num: '$0.009', unit: ' /min', by: 'sonic-3.5' } },
];

const ITEMS: Item[] = [...LOSERS.map(([label, value, plane]) => ({ label, value, plane })), ...WINNERS];

const CX = 960;
const CY = 540;
const PLANE = [
  { scale: 1.0, op: 0.85, blur: 0.4, amp: 20, rMin: 90, rMax: 300 },
  { scale: 0.82, op: 0.5, blur: 2, amp: 12, rMin: 230, rMax: 430 },
  { scale: 0.62, op: 0.28, blur: 5, amp: 6, rMin: 380, rMax: 600 },
];

// precompute stable drift anchor per item
const ANCHORS = ITEMS.map((it, i) => {
  const rnd = mulberry32(i * 7 + 13);
  const ang = rnd() * Math.PI * 2;
  const p = PLANE[it.plane];
  const rad = p.rMin + rnd() * (p.rMax - p.rMin);
  return { x: CX + Math.cos(ang) * rad, y: CY + Math.sin(ang) * rad * 0.6, ang };
});

const clampE = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) } as const;

export const FloatingNumbers: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = ramp(frame, 78, 108); // rack-focus 0..1

  return (
    <Paper>
      {/* floating field */}
      {ITEMS.map((it, i) => {
        const p = PLANE[it.plane];
        const a = ANCHORS[i];
        const enter = ramp(frame, i * 4, i * 4 + 16);
        const drift = { x: Math.sin(frame / 40 + i) * p.amp, y: Math.cos(frame / 46 + i * 1.3) * p.amp };

        if (it.win) {
          // winner: migrate to centered stack row
          const rowY = CY + (it.win.row - 1) * 150;
          const x = interpolate(focus, [0, 1], [a.x + drift.x, CX], clampE);
          const y = interpolate(focus, [0, 1], [a.y + drift.y, rowY], clampE);
          const labelOp = ramp(frame, 108, 122);
          const mint = ramp(frame, 122, 134);
          const byOp = ramp(frame, 134, 150);
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: enter, textAlign: 'center', whiteSpace: 'nowrap' }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: 3, color: PAPER.inkSoft, opacity: labelOp, marginBottom: 4 }}>{it.win.k}</div>
              <div style={{ fontFamily: FONT.display, fontWeight: 400, fontSize: interpolate(focus, [0, 1], [44, 66], clampE), letterSpacing: -1, lineHeight: 1 }}>
                <span style={{ color: `rgb(${Math.round(interpolate(mint, [0, 1], [20, 52]))},${Math.round(interpolate(mint, [0, 1], [26, 211]))},${Math.round(interpolate(mint, [0, 1], [24, 158]))})` }}>{it.win.num}</span>
                <span style={{ color: PAPER.ink }}>{it.win.unit}</span>
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 13, color: PAPER.inkFaint, opacity: byOp, marginTop: 6 }}>{it.win.by}</div>
            </div>
          );
        }

        // loser: defocus + sink + drift outward, fade
        const lb = interpolate(focus, [0, 1], [p.blur, p.blur + 9], clampE);
        const lop = interpolate(focus, [0, 1], [p.op, 0], clampE);
        const lx = a.x + drift.x + (a.x - CX) * 0.18 * focus;
        const ly = a.y + drift.y + 46 * focus;
        return (
          <div key={i} style={{ position: 'absolute', left: lx, top: ly, transform: `translate(-50%,-50%) scale(${p.scale * (1 - 0.08 * focus)})`, opacity: enter * lop, filter: `blur(${lb}px)`, textAlign: 'center', whiteSpace: 'nowrap' }}>
            {it.label !== '—' && <div style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1, color: PAPER.inkFaint, marginBottom: 2 }}>{it.label}</div>}
            <div style={{ fontFamily: FONT.mono, fontSize: 40, color: PAPER.inkSoft }}>{it.value}</div>
          </div>
        );
      })}

      {/* baselines under winner rows */}
      {[0, 1, 2].map((r) => {
        const w = ramp(frame, 112 + r * 3, 128 + r * 3);
        return <div key={r} style={{ position: 'absolute', left: CX - 130, top: CY + (r - 1) * 150 + 52, width: 260 * w, height: 1, background: PAPER.hair }} />;
      })}
    </Paper>
  );
};
