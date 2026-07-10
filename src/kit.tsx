import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import './fonts';
import { APP, CANVAS, FONT, TYPE, EASE, THEMES, type Tokens } from './theme';

// Active app theme (dark default; light for the 2nd version). Window scenes read via useT().
export const ThemeCtx = createContext<Tokens>(THEMES.dark);
export const useT = () => useContext(ThemeCtx);

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ramp = (f: number, a: number, b: number, curve = EASE.out) =>
  interpolate(f, [a, b], [0, 1], { ...CLAMP, easing: Easing.bezier(...curve) });
export const windowed = (f: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(f, a, b), 1 - ramp(f, c, d, EASE.in));
export const hexA = (hex: string, al: number) => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${al})`;
};
export const blurIn = (f: number, delay: number, dur = 14) => {
  const p = ramp(f, delay, delay + dur);
  const blur = interpolate(f, [delay, delay + dur * 0.7], [8, 0], { ...CLAMP, easing: Easing.bezier(...EASE.out) });
  return { opacity: p, transform: `translateY(${(1 - p) * 12}px)`, filter: `blur(${blur}px)` };
};

/* ---------- App background (dark, soft glow + grain dither — no grid, no banding) ---------- */
const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>"
  );

export const BgApp: React.FC<{ children?: React.ReactNode; drift?: boolean }> = ({ children, drift = true }) => {
  const frame = useCurrentFrame();
  const scale = drift ? interpolate(frame, [0, 200], [1.015, 1.0], { ...CLAMP, easing: Easing.bezier(...EASE.inOut) }) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: CANVAS.bg }}>
      {/* clean white canvas — soft lighter center, no grid/grain/vignette (kills banding + 'pixelation') */}
      <AbsoluteFill style={{ background: `radial-gradient(120% 100% at 50% 32%, ${CANVAS.bgCore} 0%, ${CANVAS.bg} 55%, ${CANVAS.bgEdge} 100%)` }} />
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '50% 42%' }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Center: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 1360 }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ width: w }}>{children}</div>
  </AbsoluteFill>
);

/* ---------- App window frame (chrome + title) ---------- */
export const AppWindow: React.FC<{ title: string; crumb?: string; children: React.ReactNode; delay?: number; w?: number }> = ({ title, crumb, children, delay = 0, w = 1400 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const st = blurIn(frame, delay, 16);
  return (
    <div style={{ ...st, position: 'relative', width: w, background: t.bg1, border: `1px solid ${t.line2}`, borderRadius: t.radiusLg, boxShadow: `0 30px 70px rgba(20,30,26,0.22), 0 8px 22px rgba(20,30,26,0.12)`, overflow: 'hidden' }}>
      <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', borderBottom: `1px solid ${t.line}`, background: t.bg }}>
        <SpekoMark size={22} />
        <span style={{ fontFamily: FONT.sans, fontSize: TYPE.small, color: t.ink2 }}>{title}</span>
        {crumb && <><span style={{ color: t.ink4 }}>/</span><span style={{ fontFamily: FONT.sans, fontSize: TYPE.small, color: t.ink, fontWeight: 600 }}>{crumb}</span></>}
      </div>
      <div style={{ padding: 30 }}>{children}</div>
    </div>
  );
};

export const SubTabs: React.FC<{ tabs: string[]; active: number }> = ({ tabs, active }) => {
  const t = useT();
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${t.line}`, marginBottom: 26 }}>
      {tabs.map((tab, i) => (
        <div key={tab} style={{ fontFamily: FONT.sans, fontSize: TYPE.label, fontWeight: i === active ? 600 : 400, color: i === active ? t.ink : t.ink3, padding: '10px 16px', borderBottom: `2px solid ${i === active ? t.mint : 'transparent'}`, marginBottom: -1 }}>{tab}</div>
      ))}
    </div>
  );
};

export const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; delay?: number }> = ({ children, style, delay }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const st = delay != null ? blurIn(frame, delay, 14) : {};
  return <div style={{ ...st, background: t.bg2, border: `1px solid ${t.line}`, borderRadius: t.radius, ...style }}>{children}</div>;
};

export const Badge: React.FC<{ kind: 'pass' | 'fail' | 'inc' | 'live'; children?: React.ReactNode }> = ({ kind, children }) => {
  const t = useT();
  const c = kind === 'pass' || kind === 'live' ? t.mint : kind === 'fail' ? t.bad : t.ink3;
  return (
    <span style={{ fontFamily: FONT.mono, fontSize: TYPE.micro, fontWeight: 600, color: c, background: hexA(c, 0.13), border: `1px solid ${hexA(c, 0.4)}`, borderRadius: t.radius, padding: '3px 9px', whiteSpace: 'nowrap' }}>
      {children ?? (kind === 'pass' ? 'Passed' : kind === 'fail' ? 'Failed' : kind === 'live' ? '● live' : 'Inconclusive')}
    </span>
  );
};

export const StatBar: React.FC<{ frac: number; tone: 'info' | 'warn' | 'mint'; delay: number }> = ({ frac, tone, delay }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const g = spring({ frame: frame - delay, fps: 30, config: { damping: 22, stiffness: 60 } });
  const c = tone === 'info' ? t.info : tone === 'warn' ? t.warn : t.mint;
  return (
    <div style={{ height: 4, borderRadius: 999, background: hexA(t.ink, 0.12), overflow: 'hidden', marginTop: 7 }}>
      <div style={{ height: '100%', width: `${Math.max(6, frac * 100) * g}%`, background: hexA(c, 0.75), borderRadius: 999 }} />
    </div>
  );
};

export const SpekoMark: React.FC<{ size: number }> = ({ size }) => {
  const s = size / 48;
  const B: [number, number][] = [[14, 7], [21, 7], [28, 7], [35, 7], [7, 14], [14, 21], [21, 21], [28, 21], [35, 28], [7, 35], [14, 35], [21, 35], [28, 35]];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <rect width={48} height={48} rx={10} fill={APP.mint} />
      {B.map(([x, y], i) => <rect key={i} x={x} y={y} width={6} height={6} fill={APP.onMint} />)}
    </svg>
  );
};

export const Wordmark: React.FC<{ size: number; delay?: number; color?: string }> = ({ size, delay = 0, color = APP.ink }) => {
  const frame = useCurrentFrame();
  const st = blurIn(frame, delay);
  return <span style={{ ...st, fontFamily: FONT.sans, fontWeight: 700, fontSize: size, letterSpacing: -size * 0.02, color }}>Speko</span>;
};

export const Kicker: React.FC<{ text: string; delay?: number; color?: string }> = ({ text, delay = 0, color = APP.mint }) => {
  const frame = useCurrentFrame();
  return <div style={{ fontFamily: FONT.mono, fontSize: TYPE.small, letterSpacing: 3, textTransform: 'uppercase', color, opacity: ramp(frame, delay, delay + 12) }}>{text}</div>;
};

export const Caret: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useT();
  return <span style={{ opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0, color: t.mint }}>▋</span>;
};

/* ---------- EvalTrendChart recreation (pass-rate area, animated draw-on) ---------- */
export const EvalTrendChart: React.FC<{ data: number[]; delay: number; w?: number; h?: number; progress?: number }> = ({ data, delay, w = 900, h = 240, progress }) => {
  const frame = useCurrentFrame();
  const th = useT();
  const draw = progress !== undefined ? Math.max(0, Math.min(1, progress)) : ramp(frame, delay, delay + 55);
  const y = (v: number) => interpolate(v, [0, 100], [h - 22, 14], CLAMP);
  const x = (i: number) => 44 + (i / (data.length - 1)) * (w - 56);
  const pts = data.map((v, i) => ({ x: x(i), y: y(v) }));
  // catmull-rom -> cubic
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)},${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)},${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  const len = pts.reduce((s, p, i) => (i ? s + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0) * 1.05;
  const headFrac = draw * (data.length - 1);
  const hi = Math.min(Math.ceil(headFrac), data.length - 1), lo = Math.max(0, hi - 1), t = headFrac - lo;
  const head = { x: pts[lo].x + (pts[hi].x - pts[lo].x) * t, y: pts[lo].y + (pts[hi].y - pts[lo].y) * t };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="eval-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hexA(th.mint, 0.24)} />
          <stop offset="100%" stopColor={hexA(th.mint, 0)} />
        </linearGradient>
        <clipPath id="eval-rev"><rect x="0" y="0" width={44 + (w - 56) * draw + 6} height={h} /></clipPath>
      </defs>
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={44} y1={y(v)} x2={w} y2={y(v)} stroke={th.line} strokeOpacity={0.7} strokeWidth={1} />
          <text x={0} y={y(v) + 3} fill={th.ink3} fontSize={12} fontFamily={FONT.mono}>{v}%</text>
        </g>
      ))}
      <g clipPath="url(#eval-rev)">
        <path d={`${d} L${pts[pts.length - 1].x},${h - 22} L${pts[0].x},${h - 22} Z`} fill="url(#eval-fill)" />
      </g>
      <path d={d} fill="none" stroke={th.mint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <circle cx={head.x} cy={head.y} r={4} fill={th.mint} stroke={th.bg1} strokeWidth={1.5} />
    </svg>
  );
};

/* ---------- 3D floating stage: perspective + continuous parallax + varied entrance ---------- */
type StageVariant = {
  ryBase?: number; // resting yaw sign/magnitude (breaks "always flat-on")
  shiftX?: number; // window off-center px
  shiftY?: number;
  enterX?: number; // slide-in direction px
  enterRotY?: number; // rotate-in
  camPan?: number; // extra x drift over the scene (camera glide)
};
export const Stage3D: React.FC<{ children: React.ReactNode; delay?: number; v?: StageVariant }> = ({ children, delay = 0, v = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 68 } });
  const ry = (v.ryBase ?? 0) + Math.sin(frame / 95) * 2.2 + 0.3 * Math.sin(frame / 55);
  const rx = 3.2 + Math.sin(frame / 120) * 1.1;
  const floatY = Math.sin(frame / 70) * 6;
  const enterRX = interpolate(inS, [0, 1], [11, 0]);
  const enterZ = interpolate(inS, [0, 1], [-280, 0]);
  const enterX = interpolate(inS, [0, 1], [v.enterX ?? 0, 0]);
  const enterRotY = interpolate(inS, [0, 1], [v.enterRotY ?? 0, 0]);
  const pan = interpolate(frame, [delay, delay + 200], [0, v.camPan ?? 0], { ...CLAMP, easing: Easing.bezier(...EASE.inOut) });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: 2200 }}>
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate(${(v.shiftX ?? 0) + enterX + pan}px, ${(v.shiftY ?? 0) + floatY}px) translateZ(${enterZ}px) rotateX(${rx + enterRX}deg) rotateY(${ry + enterRotY}deg)`,
          opacity: inS,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Per-scene cinematic motion: enter (rise+blur+fade), continuous push-in, exit ---------- */
export const SceneMotion: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, 14);
  const exit = 1 - ramp(frame, dur - 15, dur - 2, EASE.in);
  const push = interpolate(frame, [0, dur], [1.0, 1.06], { ...CLAMP, easing: Easing.bezier(...EASE.inOut) });
  const y = interpolate(enter, [0, 1], [26, 0]);
  const blurInV = interpolate(frame, [0, 12], [9, 0], CLAMP);
  const blurOutV = interpolate(frame, [dur - 12, dur], [0, 7], CLAMP);
  return (
    <AbsoluteFill style={{ opacity: Math.min(enter, exit), transform: `translateY(${y}px) scale(${push})`, filter: `blur(${blurInV + blurOutV}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Glass shimmer sweep (periodic life) ---------- */
export const Shimmer: React.FC<{ delay?: number; period?: number }> = ({ delay = 0, period = 150 }) => {
  const frame = useCurrentFrame();
  const p = (((frame - delay) % period) + period) % period / period;
  const x = interpolate(p, [0, 1], [-40, 140]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: -40, bottom: -40, left: `${x}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.05), transparent)', transform: 'skewX(-12deg)' }} />
    </div>
  );
};

/* ---------- Moving focus highlight (choreographed spotlight on a target) ---------- */
export const FocusRing: React.FC<{ from: [number, number, number, number]; to?: [number, number, number, number]; a: number; b: number; hold?: number }> = ({ from, to, a, b, hold = 40 }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, a, a + 8);
  const leave = 1 - ramp(frame, b, b + 10);
  const op = Math.min(appear, leave);
  const move = to ? ramp(frame, a + hold, a + hold + 16, EASE.inOut) : 0;
  const t = (i: number) => (to ? from[i] + (to[i] - from[i]) * move : from[i]);
  return (
    <div style={{ position: 'absolute', left: t(0), top: t(1), width: t(2), height: t(3), border: `2px solid ${hexA(APP.mint, 0.9)}`, borderRadius: APP.radius + 2, boxShadow: `0 0 24px ${hexA(APP.mint, 0.35)}, inset 0 0 20px ${hexA(APP.mint, 0.08)}`, opacity: op, pointerEvents: 'none' }} />
  );
};
