import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { PAPER, FONT, TYPE, SHADOW_SOFT } from '../theme';
import { Paper, Safe, ramp, blurIn, hexA } from '../kit';

const W = 1200;
const H = 300;
const DATA = [97, 98, 97, 99, 98, 97, 96, 88, 84, 91, 97, 98, 99];
const clampE = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const pts = DATA.map((v, i) => ({ x: (i / (DATA.length - 1)) * W, y: interpolate(v, [80, 100], [H - 30, 40], clampE) }));

// Catmull-Rom -> cubic bezier for a smooth line
const smooth = () => {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
};
const PATH = smooth();
const PLEN = pts.reduce((s, p, i) => (i ? s + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0) * 1.05;

const Tile: React.FC<{ label: string; value: string; delay: number }> = ({ label, value, delay }) => {
  const frame = useCurrentFrame();
  const st = blurIn(frame, delay, 12);
  return (
    <div style={{ ...st, width: 210, background: PAPER.bgCore, border: `1px solid ${PAPER.hair}`, borderRadius: 16, boxShadow: SHADOW_SOFT, padding: '16px 20px' }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: PAPER.inkFaint }}>{label}</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 500, color: PAPER.ink, marginTop: 6 }}>{value}</div>
    </div>
  );
};

export const Monitoring: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const draw = ramp(frame, 15, 72);
  // pulse-dot position along the polyline at draw fraction
  const fpos = draw * (pts.length - 1);
  const lo = Math.floor(fpos), hi = Math.min(lo + 1, pts.length - 1), t = fpos - lo;
  const dot = { x: pts[lo].x + (pts[hi].x - pts[lo].x) * t, y: pts[lo].y + (pts[hi].y - pts[lo].y) * t };
  const breathe = 1.15 + 0.15 * Math.sin(frame / 9);

  const calls = Math.round(interpolate(spring({ frame: frame - 10, fps, config: { damping: 22, stiffness: 55 } }), [0, 1], [0, 12847]));
  const p95 = Math.round(interpolate(spring({ frame: frame - 14, fps, config: { damping: 22, stiffness: 55 } }), [0, 1], [0, 412]));
  // pass rate corroborates the chart: settles 98.6, dips to 84, recovers
  const passBase = interpolate(spring({ frame: frame - 12, fps, config: { damping: 22, stiffness: 55 } }), [0, 1], [0, 98.6]);
  const pass = frame < 66 ? passBase : frame < 100 ? interpolate(frame, [66, 74], [98.6, 84], clampE) : interpolate(frame, [100, 110], [84, 98.6], clampE);

  const alertA = spring({ frame: frame - 64, fps, config: { damping: 12, stiffness: 150 } });
  const alertAOut = 1 - ramp(frame, 96, 104);
  const alertB = ramp(frame, 100, 111);

  const chip = (bg: string, fg: string, dot2: string, text: string, op: number, rise: number) => (
    <div style={{ position: 'absolute', left: 780, top: 60, transform: `translateY(${rise}px) scale(${op < 1 ? 0.9 + 0.1 * op : 1})`, opacity: op, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 999, background: bg, border: `1px solid ${fg}` }}>
      <div style={{ width: 9, height: 9, borderRadius: 999, background: dot2 }} />
      <span style={{ fontFamily: FONT.mono, fontSize: 15, color: fg }}>{text}</span>
    </div>
  );

  return (
    <Paper>
      <Safe style={{ width: W }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44 }}>
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: PAPER.inkFaint, opacity: ramp(frame, 2, 12) }}>Monitor</div>
            <div style={{ marginTop: 14 }}><BlurHead /></div>
          </div>
          <div style={{ display: 'flex', gap: 22 }}>
            <Tile label="Calls scored" value={calls.toLocaleString()} delay={10} />
            <Tile label="Pass rate" value={`${pass.toFixed(1)}%`} delay={16} />
            <Tile label="P95 latency" value={`${p95} ms`} delay={22} />
          </div>
        </div>

        <div style={{ position: 'relative', width: W }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={hexA(PAPER.mint, 0.22)} />
                <stop offset="100%" stopColor={hexA(PAPER.mint, 0)} />
              </linearGradient>
              <clipPath id="reveal"><rect x="0" y="0" width={W * draw} height={H} /></clipPath>
            </defs>
            <line x1="0" y1={H - 30} x2={W} y2={H - 30} stroke={PAPER.hair} strokeWidth={1} />
            <line x1="0" y1="150" x2={W} y2="150" stroke={PAPER.hair} strokeWidth={1} strokeDasharray="2 9" />
            <g clipPath="url(#reveal)">
              <path d={`${PATH} L${W},${H - 30} L0,${H - 30} Z`} fill="url(#area)" />
            </g>
            <path d={PATH} fill="none" stroke={PAPER.mintDeep} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={PLEN} strokeDashoffset={PLEN * (1 - draw)} />
            {/* leading pulse dot */}
            <circle cx={dot.x} cy={dot.y} r={draw >= 1 ? 5 * breathe : 5} fill={PAPER.mint} />
            {draw >= 1 && <circle cx={dot.x} cy={dot.y} r={10 * breathe} fill={hexA(PAPER.mint, 0.18)} />}
          </svg>

          {alertAOut > 0.01 && chip(hexA(PAPER.fail, 0.12), PAPER.fail, PAPER.fail, 'PASS RATE DIP · 84%', alertA * alertAOut, 0)}
          {alertB > 0.01 && chip(hexA(PAPER.mint, 0.14), PAPER.mintDeep, PAPER.mint, 'AUTO-REROUTED · recovered', alertB, interpolate(alertB, [0, 1], [2, 0]))}

          <div style={{ position: 'absolute', left: 0, top: H + 10, fontFamily: FONT.mono, fontSize: 13, color: PAPER.inkFaint, opacity: ramp(frame, 30, 44) }}>representative live data</div>
        </div>
      </Safe>
    </Paper>
  );
};

const BlurHead: React.FC = () => {
  const frame = useCurrentFrame();
  const words = 'Live, and watching itself.'.split(' ');
  return (
    <div style={{ display: 'flex', gap: '0 12px', fontFamily: FONT.display, fontWeight: 300, fontSize: TYPE.h2, color: PAPER.ink, letterSpacing: -0.8 }}>
      {words.map((w, i) => {
        const st = blurIn(frame, 6 + i * 5, 12);
        return <span key={i} style={st}>{w}</span>;
      })}
    </div>
  );
};
