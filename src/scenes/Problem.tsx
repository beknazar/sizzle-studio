import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { APP, CANVAS, FONT, TYPE } from '../theme';
import { ramp, blurIn, hexA, Caret } from '../kit';

const MODELS: [string, boolean][] = [
  ['Deepgram nova-3', false], ['GPT-4.1', false], ['Cartesia Sonic', false], ['ElevenLabs Scribe', false],
  ['Gemini Flash', true], ['Groq', false], ['Cartesia Ink', true], ['Whisper-lg', false],
  ['AssemblyAI', false], ['Rime', false], ['PlayHT', false], ['Sonic-3.5', true],
  ['Azure', false], ['Fireworks', true], ['nova-3 Medical', true], ['scribe_v2', false],
];
const POS = MODELS.map((_, i) => ({ x: ((i % 4) - 1.5) * 310 + (((i * 37) % 13) - 6) * 4, y: (Math.floor(i / 4) - 1.5) * 96 + (((i * 53) % 11) - 5) * 2 }));

const KICKER = 'every week. a new model.';

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const recede = ramp(frame, 100, 124);
  const qOp = ramp(frame, 108, 128);
  const kChars = Math.round(interpolate(frame, [10, 58], [0, KICKER.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* kicker headline above the chip wall */}
        <div style={{ position: 'absolute', left: '50%', top: '17%', transform: 'translateX(-50%)', opacity: 1 - recede, filter: `blur(${4 * recede}px)`, fontFamily: FONT.mono, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: CANVAS.ink3, whiteSpace: 'nowrap' }}>
          {KICKER.slice(0, kChars)}{kChars > 0 && kChars < KICKER.length ? <Caret /> : ''}
        </div>
        {MODELS.map(([name, isNew], i) => {
          const st = blurIn(frame, 2 + i * 3, 10);
          return (
            <div key={i} style={{ position: 'absolute', left: '50%', top: '46%', transform: `translate(calc(-50% + ${POS[i].x}px), calc(-50% + ${POS[i].y}px))`, opacity: (st.opacity as number) * (1 - recede), filter: `blur(${6 * recede}px)`, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 15px', borderRadius: APP.radius, background: CANVAS.bgCore, border: `1px solid ${CANVAS.line}`, boxShadow: '0 4px 14px rgba(20,30,26,0.05)', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 17, color: CANVAS.ink2 }}>{name}</span>
              {isNew && <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, color: CANVAS.mint, background: hexA(APP.mint, 0.18), padding: '2px 6px', borderRadius: APP.radius }}>NEW</span>}
            </div>
          );
        })}
        <div style={{ position: 'absolute', textAlign: 'center', opacity: qOp, transform: `translateY(${(1 - qOp) * 16}px)` }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 400, fontSize: TYPE.h1, color: CANVAS.ink, letterSpacing: -0.8 }}>
            Which one do you <span style={{ fontWeight: 700, color: CANVAS.mint }}>pick?</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
