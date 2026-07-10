# AGENTS.md

Instructions for AI coding agents working in this repo. The deep manual is `.claude/skills/sizzle/SKILL.md` (auto-activates in Claude Code); this file carries the same core rules for every agent ecosystem.

## What this repo is

A Remotion project that renders a ~44s 4K launch video as code: product UI rebuilt as React scenes (never screenshots), dark app windows floating in 3D on a white canvas, with an AI voiceover. Sample output: https://www.youtube.com/watch?v=8evHjtjEZWQ

Your most common job: the user describes THEIR product and asks for a launch video. Turn this film into theirs.

## The make-it-yours workflow

1. Learn the product from whatever the user gives you (landing page, README, description). If you have nothing, ask.
2. Write a narration script in `narration-script.txt` (~80-110 words for a ~45s film), using inline audio tags for emotion. One beat per scene.
3. Build scenes from the design kit in `src/kit.tsx` (Stage3D floating-window rig, AppWindow chrome, SceneMotion, charts, badges, theme tokens). One scene per file in `src/scenes/`.
4. Set scene timings in `src/scene-timings.json` ([startFrame, endFrame] at 30fps).
5. Run `bun run voice` to regenerate narration + captions (needs `SPEKO_API_KEY`).
6. Point the `<Audio>` tracks in `src/SpekoSizzle.tsx` at the new audio and re-time (see below). Skipping this leaves the old Speko voiceover playing under the new scenes.
7. Render: `bun run render:preview` to check, then `bun run render:both` for the 4K masters.

Scenes are independent files, so you can build and iterate several scenes with parallel subagents, then integrate timings in one pass.

## Hard rules

- Bun only. Never npm/yarn/pnpm. `bun install`, `bun run <script>`.
- Deterministic animation only: `useCurrentFrame()` + `interpolate`/`spring`. CSS animations do not render deterministically.
- PNG frames for masters: `remotion.config.ts` pins PNG frames (kills banding). Masters render with `--scale=2 --crf=15`. Do not change this.
- Real data only in benchmark-style scenes: use the user's own real numbers, cite sources on-card. If you do not have real numbers, ask for them or cut the scene. Never invent numbers.
- Product UI is always coded React, never screenshots.
- The look: white canvas, dark app windows floating in 3D, soft rounded corners (radius 9/18), soft shadows, mint accent, Inter + JetBrains Mono. No grid/grain/vignette behind windows (reads as pixelation).
- Every scene must look right in BOTH compositions (dark and light) - scenes read theme tokens from React context, so check both before calling a scene done.

## Style for anything you write

Narration scripts, on-screen copy, commit messages, docs: plain ASCII punctuation only (regular hyphens, straight quotes), no emoji.

## Commands

```bash
bun install
bun run dev            # Remotion Studio - live scrubbing
bun run typecheck      # tsc --noEmit (keep this green)
bun run compositions   # list compositions (SpekoSizzle, SpekoSizzleLight)
bun run render         # 4K dark master -> out/sizzle.mp4
bun run render:light   # 4K light master -> out/sizzle-light.mp4
bun run render:both    # both masters
bun run render:preview # fast 1080p preview -> out/preview.mp4
bun run voice          # regenerate narration + captions (needs SPEKO_API_KEY)
bun run voices         # audition one line across voices/providers -> voice-samples/
```

## Voice pipeline

`bun run voice` (gen-audio.mjs) reads `narration-script.txt` and:

1. Synthesizes narration via Speko `POST /v1/synthesize` (api.speko.dev), pinned to ElevenLabs `eleven_v3` - the most expressive TTS model available through the API; renders inline audio tags as emotion.
2. Gets word-level caption timings via Speko streaming transcription (falls back to even distribution across the measured duration if streaming fails).

Output: `public/narration.wav` + `public/captions.json` ({durationSec, audioFile, words:[{text,start,end}]}).

| Env var | Default | Purpose |
|---|---|---|
| `SPEKO_API_KEY` | (required) | Get one at https://platform.speko.dev -> API keys; free minutes included. See `.env.example`. |
| `VOICE_ID` | `bIHbv24MWmeRgasZH58o` | "Will", calm American male. Any voice id from `GET /v1/voices`. |
| `TTS_PROVIDER` | `elevenlabs` | Provider pin. |
| `TTS_MODEL` | `eleven_v3` | Model pin. |
| `SCRIPT_PATH` | `narration-script.txt` | Narration script file. |
| `OUT_AUDIO` / `OUT_CAP` | `public/narration.wav` / `public/captions.json` | Output overrides. |
| `KEYWORDS` | `Speko` | Comma-separated caption spelling boosts. When rebranding, set to the user's brand name so captions spell it right. |
| `SPEKO_API_BASE` | `https://api.speko.dev` | API base URL. |

`bun run voices` samples ElevenLabs, Cartesia, Inworld, and OpenAI voices through the same endpoint into `voice-samples/`.

### Audio tags (canonical list)

Only these are supported; anything else is stripped automatically and never read aloud:

`[happy] [sad] [angry] [excited] [calm] [nervous] [whispers] [laughs] [sighs]`

### After regenerating audio (important)

The committed film ships with its final, hand-timed audio files (`narration-a.mp3`, `narration-b.wav`, `agent-line.mp3`). `bun run voice` writes `narration.wav` for the NEW version. After regenerating:

1. Point the `<Audio>` tracks in `src/SpekoSizzle.tsx` at the new file (usually simplify to one narration track).
2. Re-time `src/scene-timings.json` using the word timestamps in `public/captions.json`.

Skipping either step leaves the old Speko voiceover playing under the new scenes.

## Scene architecture

- Two compositions from one source: `SpekoSizzle` (dark windows) and `SpekoSizzleLight` (light), theme swapped via React context (`useT()` from `src/kit.tsx`; tokens in `src/theme.ts`).
- The active cut (Speko sample film): Problem (hook text) -> Benchmark (leaderboard UI) -> Create (describe an agent, evals auto-generated) -> StackPick + Coval (eval results table) -> Monitor/Watch (pass-rate trend, alert fires) -> Resolution (logo + tagline).
- Files in `src/scenes/` not referenced in `src/scene-timings.json` are kept experiments, not in the cut. Reuse their patterns freely.
- Music: `public/music.mp3` is an original generated ambient bed at 15% volume; swap the file to change it.
