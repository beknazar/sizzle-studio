import React from 'react';
import { AbsoluteFill, Audio, Sequence, Series, staticFile } from 'remotion';
import timings from './scene-timings.json';
import { CANVAS, THEMES } from './theme';
import { BgApp, SceneMotion, ThemeCtx } from './kit';
import { Problem } from './scenes/Problem';
import { Benchmark } from './scenes/Benchmark';
import { Create } from './scenes/Create';
import { StackPick } from './scenes/StackPick';
import { Coval } from './scenes/Coval';
import { Watch } from './scenes/Watch';
import { Resolution } from './scenes/Resolution';

const T = timings as unknown as Record<string, [number, number]>;
const dur = (k: string) => T[k][1] - T[k][0];
export const TOTAL_FRAMES = Object.values(T).reduce((m, [, z]) => Math.max(m, z), 0);

const SCENES: [string, React.FC][] = [
  ['Problem', Problem], ['Benchmark', Benchmark], ['Create', Create], ['StackPick', StackPick], ['Coval', Coval], ['Monitor', Watch], ['Resolution', Resolution],
];

// Audio layout (30fps, 1.2x-tempo VO):
//   narration-a.mp3  frames    0-568  (VO 1-4: churn -> re-evaluates -> describe -> picks your stack)
//   agent-line.mp3   frames  614-760  (the agent's own voice on its self-test call, over Coval)
//   narration-b.wav  frames 766-1398  (VO 5-7: reveal -> suggested fix -> closer)
const AGENT_FROM = 614;
const NARR_B_FROM = 766;

export const SpekoSizzle: React.FC<{ mode?: 'dark' | 'light' }> = ({ mode = 'dark' }) => {
  return (
    <ThemeCtx.Provider value={THEMES[mode]}>
      <AbsoluteFill style={{ backgroundColor: CANVAS.bg }}>
        {/* one continuous white canvas behind everything — window scenes theme via context */}
        <BgApp />
        <Series>
          {SCENES.map(([key, Comp]) => (
            <Series.Sequence key={key} durationInFrames={dur(key)}>
              <SceneMotion dur={dur(key)}>
                <Comp />
              </SceneMotion>
            </Series.Sequence>
          ))}
        </Series>

        <Audio src={staticFile('music.mp3')} volume={0.15} endAt={TOTAL_FRAMES} />
        <Audio src={staticFile('narration-a.mp3')} volume={0.9} />
        <Sequence from={AGENT_FROM}>
          <Audio src={staticFile('agent-line.mp3')} volume={0.9} />
        </Sequence>
        <Sequence from={NARR_B_FROM}>
          <Audio src={staticFile('narration-b.wav')} volume={0.9} />
        </Sequence>
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
