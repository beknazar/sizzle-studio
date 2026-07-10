import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PAPER, FONT, TYPE } from '../theme';
import { Paper, Safe, StackCard, ramp } from '../kit';

export const Lock: React.FC = () => {
  const frame = useCurrentFrame();
  const kickerOp = ramp(frame, 2, 14);
  return (
    <Paper drift={false}>
      <Safe>
        <div style={{ opacity: kickerOp, fontFamily: FONT.mono, fontSize: TYPE.small, letterSpacing: 3, textTransform: 'uppercase', color: PAPER.mintDeep, marginBottom: 28 }}>
          the winning stack
        </div>
        <StackCard
          rows={[
            ['STT', 'Deepgram Nova-2'],
            ['LLM', 'GPT-4.1'],
            ['TTS', 'Cartesia Sonic'],
          ]}
          lockFrame={12}
        />
      </Safe>
    </Paper>
  );
};
