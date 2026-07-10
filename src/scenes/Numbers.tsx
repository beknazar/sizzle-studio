import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PAPER, FONT, TYPE } from '../theme';
import { Paper, Safe, Metric, ramp } from '../kit';

export const Numbers: React.FC = () => {
  const frame = useCurrentFrame();
  const kickerOp = ramp(frame, 4, 18);
  return (
    <Paper>
      <Safe>
        <div style={{ opacity: kickerOp, fontFamily: FONT.mono, fontSize: TYPE.small, letterSpacing: 3, textTransform: 'uppercase', color: PAPER.inkFaint, marginBottom: 40 }}>
          on your use case
        </div>
        <div style={{ display: 'flex', gap: 90, alignItems: 'flex-start' }}>
          <Metric label="Word error rate" value="4.1%" delay={20} />
          <div style={{ width: 1, height: 70, background: PAPER.hair }} />
          <Metric label="Latency" value="312 ms" delay={40} />
          <div style={{ width: 1, height: 70, background: PAPER.hair }} />
          <Metric label="Cost" value="$0.006 / min" delay={60} />
        </div>
      </Safe>
    </Paper>
  );
};
