import React from 'react';
import { useCurrentFrame } from 'remotion';
import { APP, FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, StatBar, Badge, ramp, blurIn, hexA } from '../kit';

const LEADERS = [
  { kind: 'FASTEST', prov: 'Deepgram', model: 'nova-3', val: '366 ms', tone: APP.info },
  { kind: 'MOST ACCURATE', prov: 'Cartesia Ink', model: 'ink-2', val: '3.6% WER', tone: APP.mint },
  { kind: 'BEST VALUE', prov: 'Cartesia Ink', model: 'ink-2', val: '$0.004/min', tone: APP.warn },
];
const ROWS: { prov: string; model: string; star?: string; lat: string; latF: number; cost: string; costF: number; wer: string; werF: number }[] = [
  { prov: 'Cartesia Ink', model: 'ink-2', star: '★ Most accurate', lat: '412 ms', latF: 0.95, cost: '$0.004', costF: 0.35, wer: '3.6%', werF: 0.36 },
  { prov: 'Deepgram', model: 'nova-3', star: '★ Fastest', lat: '366 ms', latF: 0.78, cost: '$0.0065', costF: 0.62, wer: '7.8%', werF: 0.78 },
  { prov: 'ElevenLabs Scribe', model: 'scribe_v2', lat: '421 ms', latF: 0.99, cost: '$0.0065', costF: 0.62, wer: '3.6%', werF: 0.36 },
];

const LeaderCard: React.FC<{ l: typeof LEADERS[0]; delay: number }> = ({ l, delay }) => {
  const frame = useCurrentFrame();
  const st = blurIn(frame, delay, 14);
  return (
    <div style={{ ...st, flex: 1, background: APP.bg2, border: `1px solid ${APP.line}`, borderRadius: APP.radius, padding: '18px 20px' }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 2, color: APP.ink3 }}>{l.kind}</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 20, fontWeight: 600, color: APP.ink, marginTop: 10 }}>{l.prov}</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 13, color: APP.ink3 }}>{l.model}</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 26, fontWeight: 600, color: l.tone, marginTop: 8 }}>{l.val}</div>
    </div>
  );
};

const HEAD = ['Provider', 'Model', 'Latency', 'Cost / min', 'Quality'];

export const Pick: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage3D>
        <AppWindow title="Speko" crumb="Models" delay={2} w={1400}>
          <div style={{ fontFamily: FONT.sans, fontSize: TYPE.h2, fontWeight: 600, color: APP.ink }}>Models</div>
          <div style={{ fontFamily: FONT.sans, fontSize: TYPE.small, color: APP.ink3, marginTop: 4, marginBottom: 22 }}>Every model, benchmarked on your use case — ranked and picked for you.</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 26 }}>
            {LEADERS.map((l, i) => <LeaderCard key={l.kind} l={l} delay={18 + i * 8} />)}
          </div>
          {/* table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1fr 1fr 1fr', rowGap: 0, columnGap: 24, fontFamily: FONT.sans }}>
            {HEAD.map((h) => <div key={h} style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: APP.ink3, paddingBottom: 12, borderBottom: `1px solid ${APP.line}` }}>{h}</div>)}
            {ROWS.map((r, ri) => {
              const st = blurIn(frame, 52 + ri * 10, 12);
              const cell = (child: React.ReactNode) => <div style={{ ...st, padding: '16px 0', borderBottom: `1px solid ${APP.line}`, alignSelf: 'center' }}>{child}</div>;
              return (
                <React.Fragment key={ri}>
                  {cell(<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 17, color: APP.ink, fontWeight: 500 }}>{r.prov}</span><Badge kind="live">Live</Badge></span>)}
                  {cell(<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontFamily: FONT.mono, fontSize: 15, color: APP.ink2 }}>{r.model}</span>{r.star && <span style={{ fontFamily: FONT.mono, fontSize: 11, color: APP.mint }}>{r.star}</span>}</span>)}
                  {cell(<><span style={{ fontFamily: FONT.mono, fontSize: 15, color: APP.ink }}>{r.lat}</span><StatBar frac={r.latF} tone="info" delay={62 + ri * 10} /></>)}
                  {cell(<><span style={{ fontFamily: FONT.mono, fontSize: 15, color: APP.ink }}>{r.cost}</span><StatBar frac={r.costF} tone="warn" delay={62 + ri * 10} /></>)}
                  {cell(<><span style={{ fontFamily: FONT.mono, fontSize: 15, color: APP.ink }}>{r.wer} WER</span><StatBar frac={r.werF} tone="mint" delay={62 + ri * 10} /></>)}
                </React.Fragment>
              );
            })}
          </div>
        </AppWindow>
    </Stage3D>
  );
};
