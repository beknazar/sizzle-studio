import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { CANVAS, FONT, TYPE } from '../theme';
import { SpekoMark, Wordmark, ramp } from '../kit';

const MINT_WORDS = ['Speko', 'picks', 'the', 'models.'];
const MINT_FROM = 40; // scene-relative start of the word-by-word reveal (VO: "Speko picks the models...")

export const Resolution: React.FC = () => {
  const frame = useCurrentFrame();
  const lock = ramp(frame, 4, 22);
  const l1 = ramp(frame, 10, 26); // "You write the logic." — VO ends ~f35
  const subOp = ramp(frame, 100, 118); // "and keeps them the best." — VO ends ~f132
  const uw = ramp(frame, 105, 125) * 420;
  const urlOp = ramp(frame, 135, 155);
  const push = interpolate(frame, [0, 216], [0.96, 1]); // continuous build across the whole card
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transform: `scale(${push})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: lock, transform: `scale(${interpolate(lock, [0, 1], [0.9, 1])})` }}>
          <SpekoMark size={72} />
          <Wordmark size={72} delay={8} color={CANVAS.ink} />
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: TYPE.h1, color: CANVAS.ink2, marginTop: 36, letterSpacing: -0.8, display: 'flex', gap: 16, alignItems: 'baseline' }}>
          <span style={{ opacity: l1, transform: `translateY(${(1 - l1) * 14}px)`, display: 'inline-block' }}>You write the logic.</span>
          <span style={{ display: 'inline-flex', gap: 14 }}>
            {MINT_WORDS.map((w, i) => {
              const wp = ramp(frame, MINT_FROM + i * 4, MINT_FROM + i * 4 + 12);
              return (
                <span key={i} style={{ opacity: wp, transform: `translateY(${(1 - wp) * 10}px)`, display: 'inline-block', fontWeight: 700, color: CANVAS.mint }}>{w}</span>
              );
            })}
          </span>
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: TYPE.body, color: CANVAS.ink3, marginTop: 20, opacity: subOp, transform: `translateY(${(1 - subOp) * 10}px)` }}>
          and keeps them the best.
        </div>
        <div style={{ width: uw, height: 3, background: CANVAS.mint, borderRadius: 3, marginTop: 24 }} />
        <div style={{ fontFamily: FONT.mono, fontSize: 20, letterSpacing: 4, color: CANVAS.ink3, marginTop: 26, opacity: urlOp }}>speko.ai</div>
      </div>
    </AbsoluteFill>
  );
};
