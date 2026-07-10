import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { APP, FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, SubTabs, Panel, Badge, ramp, blurIn, hexA } from '../kit';

const CHECKS: [string, number][] = [
  ['Task success', 0.95],
  ['Instruction adherence', 0.92],
  ['Safety & refusals', 1.0],
  ['Latency budget', 0.88],
];

const CheckRow: React.FC<{ label: string; frac: number; delay: number }> = ({ label, frac, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 60 } });
  const pct = Math.round(frac * 100 * g);
  return (
    <div style={{ ...blurIn(frame, delay, 12) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 15, color: APP.ink2 }}>{label}</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 15, color: APP.ink }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: hexA('#000', 0.35), overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${frac * 100 * g}%`, background: frac >= 0.9 ? APP.mint : APP.warn, borderRadius: 999 }} />
      </div>
    </div>
  );
};

export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage3D>
        <AppWindow title="Dental Clinic Agent" crumb="Evals" delay={2} w={1200}>
          <SubTabs tabs={['Reliability', 'Coverage', 'Monitoring', 'Alerts', 'Test Sets']} active={0} />
          <Panel delay={14} style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
              <div>
                <div style={{ fontFamily: FONT.sans, fontSize: TYPE.body, fontWeight: 600, color: APP.ink }}>Reliability gate</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 13, color: APP.ink3, marginTop: 3 }}>Ran before launch · 18 / 20 scenarios passed</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 40, fontWeight: 600, color: APP.mint }}>92%</span>
                <Badge kind="pass" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 44, rowGap: 22 }}>
              {CHECKS.map(([l, f], i) => <CheckRow key={l} label={l} frac={f} delay={26 + i * 8} />)}
            </div>
          </Panel>
        </AppWindow>
    </Stage3D>
  );
};
