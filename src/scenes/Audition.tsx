import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { PAPER, FONT, TYPE } from '../theme';
import { Paper, Waveform, ramp, blurIn } from '../kit';

const PROVIDERS = [
  'Deepgram', 'OpenAI', 'AssemblyAI', 'GPT-4.1', 'Gemini Flash', 'Cartesia Sonic',
  'ElevenLabs', 'Rime', 'PlayHT', 'Groq', 'Azure', 'Whisper',
];

const Row: React.FC<{ name: string; delay: number; i: number }> = ({ name, delay, i }) => {
  const frame = useCurrentFrame();
  const st = blurIn(frame, delay, 12);
  return (
    <div style={{ ...st, display: 'flex', alignItems: 'center', gap: 22, height: 30 }}>
      <span style={{ fontFamily: FONT.mono, fontSize: TYPE.small - 3, color: PAPER.inkFaint, width: 150, textAlign: 'right' }}>{name}</span>
      <Waveform bars={40} height={22} progress={1} mono seed={i * 1.7} barW={2} gap={2} />
    </div>
  );
};

export const Audition: React.FC = () => {
  const frame = useCurrentFrame();
  const countOp = ramp(frame, 8, 24);
  return (
    <Paper drift={false}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ opacity: countOp, fontFamily: FONT.mono, fontSize: TYPE.small, letterSpacing: 3, textTransform: 'uppercase', color: PAPER.mintDeep, marginBottom: 26 }}>
          18 providers · one sentence
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PROVIDERS.map((p, i) => (
            <Row key={p} name={p} i={i} delay={14 + Math.min(i * 5, 55)} />
          ))}
        </div>
      </div>
    </Paper>
  );
};
