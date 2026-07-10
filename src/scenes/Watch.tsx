import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, SubTabs, Panel, Badge, EvalTrendChart, ramp, blurIn, hexA, useT } from '../kit';

const TREND = [88, 91, 90, 93, 95, 96, 94, 92, 88, 84, 89, 95, 97];
const DIP_FRAC = 9 / (TREND.length - 1); // chart drawn up to the 84 dip, then held
const FEED: [string, 'pass' | 'fail'][] = [
  ['Books appointment · 1m 42s', 'pass'],
  ['Handles reschedule · 2m 08s', 'pass'],
  ['Verifies caller ID · 0m 51s', 'fail'],
  ['Reads back details · 1m 12s', 'pass'],
];

/* Suggested-fix choreography, synced to VO landmarks (294-frame scene, b-track):
   f8-60 chart draws to the dip · f133 warn alert ("the second a model slips?")
   f184 SUGGESTED FIX panel ("flags it... with the better stack") · f252-285 recovery tail (after the user ships the fix) */
const ALERT_AT = 133;
const FIX_AT = 184;
const RECOVER_A = 252;
const RECOVER_B = 285;

export const Watch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useT();

  // two-phase chart draw: to the dip, hold while the fix ships, then the recovery tail
  const chartP = ramp(frame, 8, 60) * DIP_FRAC + ramp(frame, RECOVER_A, RECOVER_B) * (1 - DIP_FRAC);

  // pass-rate counter follows the story: 96 -> 84 (warn) -> 97 (after the fix ships)
  const up = interpolate(spring({ frame: frame - 10, fps, config: { damping: 22, stiffness: 55 } }), [0, 1], [0, 96]);
  const dip = interpolate(ramp(frame, ALERT_AT - 6, ALERT_AT + 6), [0, 1], [0, 12]);
  const rec = interpolate(ramp(frame, RECOVER_A + 8, RECOVER_B), [0, 1], [0, 13]);
  const rate = Math.round(Math.min(96, up) - dip + rec);
  const dipped = frame >= ALERT_AT + 2 && frame < RECOVER_A + 26;
  const scored = Math.round(interpolate(spring({ frame: frame - 10, fps, config: { damping: 22, stiffness: 55 } }), [0, 1], [0, 1284]));

  const alert = spring({ frame: frame - ALERT_AT, fps, config: { damping: 13, stiffness: 150 } });
  const alertDim = 1 - 0.6 * ramp(frame, RECOVER_A + 20, RECOVER_A + 36);
  const fix = spring({ frame: frame - FIX_AT, fps, config: { damping: 14, stiffness: 140 } });
  const swapOp = ramp(frame, FIX_AT + 12, FIX_AT + 24);
  const recovered = spring({ frame: frame - (RECOVER_A + 22), fps, config: { damping: 12, stiffness: 180 } });

  return (
    <Stage3D v={{ enterRotY: -15, ryBase: -1.5 }}>
        <AppWindow title="Dental Clinic Agent" crumb="Evals" delay={2} w={1400}>
          <SubTabs tabs={['Reliability', 'Coverage', 'Monitoring', 'Alerts', 'Test Sets']} active={2} />
          <div style={{ display: 'flex', gap: 22 }}>
            {/* chart + header */}
            <Panel delay={12} style={{ flex: 1.7, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: FONT.sans, fontSize: TYPE.body, fontWeight: 600, color: t.ink }}>Monitoring</div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 13, color: t.ink3, marginTop: 2 }}>Production calls scored against your eval criteria</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 30, fontWeight: 600, color: dipped ? t.warn : t.mint }}>{rate}%</div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink3 }}>{scored.toLocaleString()} scored</div>
                </div>
              </div>
              <EvalTrendChart data={TREND} delay={8} w={840} h={240} progress={chartP} />
            </Panel>
            {/* feed + alert + suggested fix */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Panel delay={20} style={{ padding: 18, flex: 1 }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: t.ink3, marginBottom: 12 }}>Recent</div>
                {FEED.map(([label, k], i) => (
                  <div key={i} style={{ ...blurIn(frame, 16 + i * 6, 10), display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < FEED.length - 1 ? `1px solid ${t.line}` : 'none' }}>
                    <span style={{ fontFamily: FONT.sans, fontSize: 14, color: t.ink2 }}>{label}</span>
                    <Badge kind={k} />
                  </div>
                ))}
              </Panel>
              {/* ALERT firing, dims once the rate recovers */}
              <div style={{ opacity: alert * alertDim, transform: `translateY(${interpolate(alert, [0, 1], [16, 0])}px)`, background: hexA(t.warn, 0.1), border: `1px solid ${hexA(t.warn, 0.5)}`, borderRadius: t.radius, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }}>⚠</span>
                <div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 600, color: t.warn }}>Alert · pass rate dipped</div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink2, marginTop: 3 }}>&lt; 90% over last 20 calls</div>
                </div>
              </div>
              {/* SUGGESTED FIX: Speko flags a better stack, the user ships it, rate recovers */}
              <div style={{ opacity: fix, transform: `translateY(${interpolate(fix, [0, 1], [16, 0])}px)`, background: hexA(t.mint, 0.09), border: `1px solid ${hexA(t.mint, 0.55)}`, borderRadius: t.radius, padding: '12px 16px', boxShadow: `0 0 0 3px ${hexA(t.mint, 0.06)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: t.mint, boxShadow: `0 0 8px ${hexA(t.mint, 0.8)}` }} />
                    <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: t.mint }}>Suggested fix</span>
                  </span>
                  <span style={{ transform: `scale(${recovered})`, display: 'inline-flex' }}>
                    <Badge kind="pass">Fix shipped · recovered</Badge>
                  </span>
                </div>
                <div style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 600, color: t.ink, marginTop: 8 }}>Re-pick ready: better stack from live benchmarks</div>
                <div style={{ opacity: swapOp, fontFamily: FONT.mono, fontSize: 12, color: t.ink2, marginTop: 5 }}>
                  tts&nbsp;&nbsp;sonic-3.5 <span style={{ color: t.mint }}>-&gt;</span> gemini-3.1-flash
                </div>
              </div>
            </div>
          </div>
        </AppWindow>
    </Stage3D>
  );
};
