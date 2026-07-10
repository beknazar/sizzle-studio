import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Paper, Safe, Waveform, ramp } from '../kit';

export const Sound: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = ramp(frame, 6, 40); // draws in L->R
  const settled = frame > 42;
  return (
    <Paper>
      <Safe>
        <Waveform bars={46} height={92} progress={progress} live={settled} seed={2.1} />
      </Safe>
    </Paper>
  );
};
