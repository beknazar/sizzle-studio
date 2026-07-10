import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { PAPER, FONT, TYPE } from '../theme';
import { Paper, Safe, Caret, ramp } from '../kit';

const SENTENCE = 'a friendly clinic receptionist that books appointments';

export const Intent: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = Math.round(interpolate(frame, [14, 74], [0, SENTENCE.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const op = ramp(frame, 6, 20);
  return (
    <Paper>
      <Safe>
        <div style={{ opacity: op, fontFamily: FONT.display, fontWeight: 300, fontSize: TYPE.lead, color: PAPER.ink, letterSpacing: -0.4, textAlign: 'center', maxWidth: 900 }}>
          <span style={{ color: PAPER.inkFaint }}>“</span>
          {SENTENCE.slice(0, chars)}
          <Caret />
          <span style={{ color: PAPER.inkFaint }}>{chars >= SENTENCE.length ? '”' : ''}</span>
        </div>
      </Safe>
    </Paper>
  );
};
