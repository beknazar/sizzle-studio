import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { PAPER, FONT, TYPE } from '../theme';
import { Paper, Safe, Waveform, ramp, hexA } from '../kit';

export const LiveCall: React.FC = () => {
  const frame = useCurrentFrame();
  const chipOp = ramp(frame, 6, 20);
  const pulse = interpolate(Math.sin(frame / 7), [-1, 1], [0.45, 1]);
  const progress = ramp(frame, 10, 44);
  return (
    <Paper drift={false}>
      <Safe>
        <div style={{ opacity: chipOp, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 999, background: PAPER.bgCore, border: `1px solid ${PAPER.hair}`, boxShadow: '0 6px 20px rgba(30,50,45,.05)', marginBottom: 40 }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: PAPER.mint, opacity: pulse, boxShadow: `0 0 12px ${hexA(PAPER.mint, pulse)}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: TYPE.small, letterSpacing: 2, color: PAPER.inkSoft }}>live</span>
        </div>
        <Waveform bars={52} height={96} progress={progress} live={frame > 44} seed={5.5} />
        <div style={{ opacity: ramp(frame, 60, 76), fontFamily: FONT.mono, fontSize: TYPE.small - 2, color: PAPER.inkFaint, marginTop: 30, letterSpacing: 1 }}>
          1,284 calls scored today
        </div>
      </Safe>
    </Paper>
  );
};
