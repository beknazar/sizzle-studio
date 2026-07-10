import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PAPER } from '../theme';
import { Paper, Safe, ramp, hexA } from '../kit';

const W = 520;
const H = 80;
// mostly flat pulse-line with one dip that self-corrects
const PATH = `M0,${H / 2} L170,${H / 2} L200,${H / 2} L220,${H - 8} L248,10 L276,${H / 2} L350,${H / 2} L${W},${H / 2}`;
const LEN = 1200;

export const Stillness: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, 4, 30);
  const fade = 1 - ramp(frame, 44, 62); // clears to empty, held still to the end
  return (
    <Paper drift={false}>
      <Safe>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: fade, overflow: 'visible' }}>
          <path d={`M0,${H / 2} L${W},${H / 2}`} stroke={PAPER.hair} strokeWidth={1} fill="none" />
          <path
            d={PATH}
            stroke={PAPER.mint}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={LEN}
            strokeDashoffset={LEN * (1 - draw)}
            style={{ filter: `drop-shadow(0 0 6px ${hexA(PAPER.mint, 0.5)})` }}
          />
        </svg>
      </Safe>
    </Paper>
  );
};
