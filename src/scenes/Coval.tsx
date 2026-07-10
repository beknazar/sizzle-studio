import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, SubTabs, Badge, ramp, windowed, blurIn, hexA, useT } from '../kit';

type R = { name: string; pass: boolean; turns: number; p95: string; score: string };
const ROWS: R[] = [
  { name: 'Caller books a new appointment', pass: true, turns: 6, p95: '480 ms', score: '0.98' },
  { name: 'Caller reschedules an existing visit', pass: true, turns: 8, p95: '520 ms', score: '0.95' },
  { name: 'Caller asks for opening hours', pass: true, turns: 3, p95: '410 ms', score: '0.99' },
  { name: 'Declines an off-topic request', pass: true, turns: 4, p95: '430 ms', score: '0.97' },
  { name: 'Verifies the caller before sharing details', pass: false, turns: 5, p95: '610 ms', score: '0.62' },
];
const HEAD = ['Scenario', 'Result', 'Turns', 'p95 latency', 'Score'];

// agent-line.mp3 plays over scene-relative frames -6..140 (see SpekoSizzle.tsx)
const CALL_END = 148;

// small corner chip the big overlay collapses into
const CallChip: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const op = windowed(frame, 140, 152, 200, 220);
  const pulse = interpolate(Math.sin(frame / 5), [-1, 1], [0.45, 1]);
  return (
    <div style={{ opacity: op, display: 'flex', alignItems: 'center', gap: 12, background: t.bg2, border: `1px solid ${hexA(t.mint, 0.45)}`, borderRadius: 999, padding: '8px 16px', boxShadow: `0 0 0 3px ${hexA(t.mint, 0.07)}` }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: t.mint, opacity: pulse, boxShadow: `0 0 10px ${hexA(t.mint, pulse)}` }} />
      <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: t.ink2 }}>test call · scored</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 18 }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const h = frame < CALL_END ? 4 + 12 * Math.abs(Math.sin(frame / 3.1 + i * 1.7)) : 3;
          return <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: t.mint, opacity: 0.85 }} />;
        })}
      </span>
    </div>
  );
};

// the wow beat: a big in-window body for the agent's voice while it speaks
const CallOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const op = windowed(frame, 0, 8, 140, 160);
  const exit = ramp(frame, 140, 160);
  const pulse = interpolate(Math.sin(frame / 5), [-1, 1], [0.45, 1]);
  const live = frame < CALL_END;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, opacity: op, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 34, background: hexA(t.bg1, 0.94), borderRadius: t.radius, transform: `translateY(${-40 * exit}px) scale(${1 - 0.15 * exit})` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: t.mint, opacity: pulse, boxShadow: `0 0 14px ${hexA(t.mint, pulse)}` }} />
        <span style={{ fontFamily: FONT.sans, fontSize: TYPE.h2, fontWeight: 600, color: t.ink, letterSpacing: -0.5 }}>Brightsmile Dental</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: t.mint, marginLeft: 6 }}>live test call</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 110 }}>
        {Array.from({ length: 48 }).map((_, i) => {
          const env = 0.35 + 0.65 * Math.abs(Math.sin(frame / 17 + i * 0.37));
          const h = live ? 10 + 100 * env * Math.abs(Math.sin(frame / 3.1 + i * 1.7)) : 6;
          return <span key={i} style={{ width: 6, height: h, borderRadius: 3, background: t.mint, opacity: 0.9 }} />;
        })}
      </div>
    </div>
  );
};

export const Coval: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useT();
  // counter reveal waits for the test call to finish — VO: "every scenario scored"
  const passed = Math.round(interpolate(spring({ frame: frame - 262, fps, config: { damping: 22, stiffness: 55 } }), [0, 1], [0, 18]));
  const countOp = ramp(frame, 258, 274);
  return (
    <Stage3D v={{ enterX: -240, ryBase: 2.2 }}>
      <AppWindow title="Dental Clinic Agent" crumb="Evals" delay={2} w={1360}>
        <SubTabs tabs={['Reliability', 'Coverage', 'Monitoring', 'Alerts', 'Test Sets']} active={4} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: FONT.sans, fontSize: TYPE.body, fontWeight: 600, color: t.ink }}>Scenario results</div>
            <div style={{ fontFamily: FONT.sans, fontSize: 13, color: t.ink3, marginTop: 3 }}>Auto-generated from your use case · tested end-to-end</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CallChip />
            <span style={{ opacity: countOp, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 26, fontWeight: 600, color: t.mint }}>{passed}/20</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 13, color: t.ink3 }}>passed</span>
            </span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
        <CallOverlay />
        <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.9fr 0.7fr 1fr 0.7fr', columnGap: 20 }}>
          {HEAD.map((h) => <div key={h} style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: t.ink3, paddingBottom: 10, borderBottom: `1px solid ${t.line}` }}>{h}</div>)}
          {ROWS.map((r, i) => {
            const st = blurIn(frame, 30 + i * 12, 10);
            const cell = (child: React.ReactNode, mono = true) => <div style={{ ...st, padding: '14px 0', borderBottom: `1px solid ${t.line}`, fontFamily: mono ? FONT.mono : FONT.sans, fontSize: 15, color: t.ink2, display: 'flex', alignItems: 'center' }}>{child}</div>;
            return (
              <React.Fragment key={i}>
                {cell(<span style={{ color: t.ink, fontWeight: 500 }}>{r.name}</span>, false)}
                {cell(<Badge kind={r.pass ? 'pass' : 'fail'}>{r.pass ? 'Pass' : 'Fail'}</Badge>)}
                {cell(<span>{r.turns}</span>)}
                {cell(<span>{r.p95}</span>)}
                {cell(<span style={{ color: r.pass ? t.ink : t.bad }}>{r.score}</span>)}
              </React.Fragment>
            );
          })}
        </div>
        </div>
      </AppWindow>
    </Stage3D>
  );
};
