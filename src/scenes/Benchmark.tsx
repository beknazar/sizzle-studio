import React from 'react';
import { useCurrentFrame } from 'remotion';
import { APP, FONT, TYPE } from '../theme';
import { Stage3D, AppWindow, StatBar, ramp, windowed, blurIn, hexA, useT } from '../kit';

type Row = { prov: string; model: string; m1: string; m2: string; frac: number; best?: boolean };
type Cat = { abbr: string; caption: string; tone: 'mint' | 'info' | 'warn'; cite: string; rows: Row[] };

// STT = Speko's own gateway benchmark (FLEURS). TTS/S2S/LLM = Artificial Analysis (cited per card).
const CATS: Cat[] = [
  {
    abbr: 'STT', caption: 'Word error rate · latency', tone: 'mint', cite: 'Speko gateway · FLEURS',
    rows: [
      { prov: 'OpenAI', model: 'GPT-4o Transcribe', m1: '2.4%', m2: '1084 ms', frac: 0.96, best: true },
      { prov: 'Alibaba', model: 'Qwen3-ASR', m1: '2.6%', m2: '2195 ms', frac: 0.92 },
      { prov: 'ElevenLabs', model: 'Scribe v2', m1: '2.9%', m2: '1353 ms', frac: 0.88 },
    ],
  },
  {
    abbr: 'TTS', caption: 'Quality Elo · latency', tone: 'mint', cite: 'Artificial Analysis',
    rows: [
      { prov: 'Google', model: 'Gemini 3.1 Flash TTS', m1: '1217', m2: '~200 ms', frac: 0.98, best: true },
      { prov: 'Cartesia', model: 'Sonic 3.5', m1: '1211', m2: '40 ms', frac: 0.97 },
      { prov: 'ElevenLabs', model: 'Eleven v3', m1: '1105', m2: '~300 ms', frac: 0.88 },
    ],
  },
  {
    abbr: 'S2S', caption: 'Time to first audio · reasoning', tone: 'info', cite: 'Artificial Analysis',
    rows: [
      { prov: 'OpenAI', model: 'GPT-Realtime-2', m1: '1.14 s', m2: '97%', frac: 0.97, best: true },
      { prov: 'Amazon', model: 'Nova 2.0 Sonic', m1: '1.14 s', m2: '88%', frac: 0.88 },
      { prov: 'Google', model: 'Gemini 3.1 Flash Live', m1: '2.98 s', m2: '97%', frac: 0.9 },
    ],
  },
  {
    abbr: 'LLM', caption: 'Latency · cost / min', tone: 'warn', cite: 'Speko gateway · en',
    rows: [
      { prov: 'Cerebras', model: 'gpt-oss-120b', m1: '285 ms', m2: '$0.0004', frac: 1.0, best: true },
      { prov: 'Groq', model: 'gpt-oss-120b', m1: '296 ms', m2: '$0.0001', frac: 0.96 },
      { prov: 'OpenAI', model: 'gpt-4.1', m1: '591 ms', m2: '$0.0052', frac: 0.48 },
    ],
  },
];

const CatCard: React.FC<{ cat: Cat; delay: number }> = ({ cat, delay }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const st = blurIn(frame, delay, 14);
  return (
    <div style={{ ...st, background: t.bg2, border: `1px solid ${t.line}`, borderRadius: t.radius, padding: '18px 20px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700, letterSpacing: 2, color: t.mint }}>{cat.abbr}</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink3 }}>{cat.caption}</span>
      </div>
      {cat.rows.map((r, i) => {
        const rs = blurIn(frame, delay + 4 + i * 4, 10);
        return (
          <div key={i} style={{ ...rs, display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i > 0 ? `1px solid ${t.line}` : 'none' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, color: r.best ? t.mint : t.ink4, width: 12 }}>{r.best ? '★' : i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: r.best ? 600 : 500, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.prov}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.model}</div>
            </div>
            <div style={{ width: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 600, color: r.best ? t.mint : t.ink }}>{r.m1}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 11, color: t.ink3 }}>{r.m2}</span>
              </div>
              <div style={{ transform: `scaleX(${1 + 0.015 * Math.sin(frame / 40 + i)})`, transformOrigin: 'left' }}>
                <StatBar frac={r.frac} tone={cat.tone} delay={delay + 8 + i * 4} />
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.5, color: t.ink4, marginTop: 12, textAlign: 'right', opacity: ramp(frame, delay + 20, delay + 32) }}>
        source · {cat.cite}
      </div>
    </div>
  );
};

export const Benchmark: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useT();
  return (
    <Stage3D v={{ camPan: -34, ryBase: 1.4 }}>
      <AppWindow title="Speko" crumb="Benchmarks" delay={2} w={1520}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: FONT.sans, fontSize: TYPE.h2, fontWeight: 600, color: t.ink }}>Benchmarks</div>
            <div style={{ fontFamily: FONT.sans, fontSize: TYPE.small, color: t.ink3, marginTop: 3 }}>Every model, measured the same way — through the Speko gateway.</div>
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 12, color: t.ink3, opacity: Math.min(1, ramp(frame, 30, 44) * (0.75 + 0.25 * windowed(frame, 64, 72, 84, 96)) + 0.25 * windowed(frame, 64, 72, 84, 96)), transform: `scale(${1 + 0.05 * windowed(frame, 64, 72, 84, 96)})`, transformOrigin: 'right' }}>4 categories · 18+ providers · updated weekly</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {CATS.map((c, i) => <CatCard key={c.abbr} cat={c} delay={8 + i * 6} />)}
        </div>
      </AppWindow>
    </Stage3D>
  );
};
