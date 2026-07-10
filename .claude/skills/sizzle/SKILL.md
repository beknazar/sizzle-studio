---
name: sizzle
description: >-
  Build and iterate launch/sizzle videos in Remotion with this repo's design
  kit - coded product UI (not screenshots) as app windows floating in 3D on a
  white canvas, with a Speko-generated voiceover. Use when the user wants to
  create a launch video for THEIR product from this template, or re-cut,
  re-time, re-skin, re-voice, or add scenes to an existing film. Auto-activates
  inside this repo.
---

# sizzle - build launch films in Remotion

This skill is the operating manual for the sizzle-studio Remotion project. It
encodes the design kit, the scene architecture, the real-data rules, and the
Speko voice pipeline so you (the agent) can build a new product's launch film
on request without re-deriving any of it.

## The #1 job: "make it mine"

When a user asks for THEIR product's launch video:

1. **Gather context.** Ask for (or read) their landing page, README, or product
   description. Extract: the pain, 3-5 product moments you can show as UI, the
   closing tagline. Do not invent metrics - ask for real ones or omit.
2. **Write the script** in `narration-script.txt` (~80-110 words for a ~45s
   film). Use only the supported audio tags (below). One beat per scene.
3. **Build the scenes.** Copy the closest existing `src/scenes/*.tsx`, rebuild
   the body as their product's UI with the kit primitives. Update `SCENES` in
   `src/SpekoSizzle.tsx` and `src/scene-timings.json`.
4. **Generate the voice:** `bun run voice` (needs `SPEKO_API_KEY`). Read the
   generated `public/captions.json` word timings and set scene boundaries so
   visuals land on the matching words.
5. **Wire the audio.** Point the `<Audio>` tracks in `src/SpekoSizzle.tsx` at
   `narration.wav` (the committed film ships with its own final audio files -
   replace them for a new film).
6. **Render:** `bun run render:preview` to check, `bun run render:both` for 4K
   dark + light masters.

Scenes are independent files - when building 3+ new scenes, build them with
parallel subagents, then integrate timings in one pass.

## The look (non-negotiable defaults)

- **White canvas, dark app windows floating in 3D.** Never full-frame
  screenshots - every product surface is coded UI. Windows tilt, parallax,
  and push in.
- **Soft rounded corners** (radius 9 / 18), soft shadows. Sharp corners read
  cheap at video scale.
- **Flat white background.** No grid, grain, vignette, or dark gradients -
  they read as pixelation on compressed video.
- **Mint accent** (#7cf2c8 on dark, #0fae7e on white), Inter + JetBrains Mono.
  Re-skin per brand via `src/theme.ts` - everything inherits from the tokens.
- Calm, confident pacing. Ease curves, not linear. Nothing bounces.

## Hard rules

1. **bun / bunx only.** Never npm/npx.
2. **Animate with useCurrentFrame() + interpolate/spring/Easing only.** No CSS
   animations, transitions, or keyframes - they do not render
   deterministically frame-by-frame.
3. **Real data only.** Any number shown on screen must be real and sourced
   (cite on-card). Never invent benchmark figures, user counts, or metrics.
4. **PNG frames, --scale=2, --crf=15** for masters. Set in
   `remotion.config.ts` / package scripts - do not switch to jpeg frames.
5. **Supported audio tags only** in narration. The API strips anything else
   (never read aloud, but the emotion is lost).

## Project map

```
src/
  theme.ts            tokens: THEMES.dark / THEMES.light / CANVAS, FONT, TYPE, EASE, FPS
  fonts.ts            @remotion/google-fonts Inter + JetBrains Mono (imported for side effect)
  kit.tsx             the design kit - every reusable primitive (below)
  SpekoSizzle.tsx     the film: SCENES array + <Series> + <Audio> tracks + theme provider
  Root.tsx            two <Composition>s: SpekoSizzle (dark) + SpekoSizzleLight (light)
  scene-timings.json  { scene: [startFrame, endFrame] } at 30fps - the single timing source
  scenes/*.tsx        one file per scene (7 in the cut; the rest are kept experiments)
gen-audio.mjs         narration -> public/narration.wav + captions.json (via Speko)
gen-voice-samples.mjs audition one line across voices AND providers -> voice-samples/
narration-script.txt  the VO script with inline [tags]
.env.example          SPEKO_API_KEY (get one at https://platform.speko.dev)
public/               committed film audio (narration-a/b.mp3, agent-line.mp3, music.mp3)
```

## The design kit (src/kit.tsx)

Import these; do not reinvent them.

- **ThemeCtx / useT()** - active theme tokens. Every window scene calls
  `const t = useT()` and reads colors/radii from `t` so it renders correctly
  in both dark and light comps. (Text-on-white scenes use `CANVAS` directly.)
- **Stage3D** - the floating-window rig. `perspective: 2200`, continuous
  yaw/pitch/float, spring entrance. Pass a `v` variant so each scene enters
  differently: `{ ryBase, shiftX, shiftY, enterX, enterRotY, camPan }`.
  Example: `<Stage3D v={{ enterX: 240, ryBase: -2.2 }}>`.
- **SceneMotion** - per-scene cinematic wrapper (rise + blur-in on enter, slow
  push-in, blur + fade on exit). `SpekoSizzle.tsx` already wraps each scene.
- **AppWindow** - window chrome (mark, title, breadcrumb, body padding, soft
  shadow, rounded corners). `<AppWindow title="Acme" crumb="Dashboard" w={1520}>`.
- **SubTabs / Panel / Badge / StatBar** - in-window UI: tab bars with accent
  underline, bordered panels, pass/fail/live pills, animated stat bars.
- **EvalTrendChart** - area chart with catmull-rom smoothing and an animated
  draw-on stroke + moving head dot.
- **SpekoMark / Wordmark / Kicker / Caret** - brand mark, wordmark, mono
  uppercase kicker, blinking caret. Swap for the user's brand in new films.
- **Shimmer / FocusRing** - periodic glass sweep; spotlight that moves from
  one target rect to another (`from` -> `to`).
- **Helpers** - `ramp(f,a,b,curve)` eased 0->1, `windowed(f,a,b,c,d)` fade
  in/out, `blurIn(f,delay,dur)` entrance style, `hexA(hex,alpha)`.

## Voice pipeline (Speko)

One key powers both narration and caption timings. Get it at
https://platform.speko.dev -> API keys (free minutes included, no card).

```bash
export SPEKO_API_KEY=sk_live_...
bun run voice     # narration-script.txt -> public/narration.wav + captions.json
bun run voices    # audition one line across ElevenLabs / Cartesia / Inworld / OpenAI voices
```

- `gen-audio.mjs` synthesizes via Speko `/v1/synthesize`, pinned to ElevenLabs
  `eleven_v3` (the most expressive model available through the API - inline
  audio tags render as emotion). It then gets word-level timings back through
  Speko's streaming transcription and writes them to `public/captions.json`
  as `{durationSec, audioFile, words: [{text, start, end}]}`.
- **Supported tags:** [happy] [sad] [angry] [excited] [calm] [nervous]
  [whispers] [laughs] [sighs]. Anything else is stripped server-side.
- Overrides: `VOICE_ID` (default Will, calm American male), `TTS_PROVIDER`,
  `TTS_MODEL`, `SCRIPT_PATH`, `OUT_AUDIO`, `OUT_CAP`, `KEYWORDS` (comma-
  separated brand names for caption spelling).
- After regenerating, check `captions.json` `durationSec` against the total in
  `scene-timings.json` and re-time scenes so visuals line up with the VO.

## Common tasks (recipes)

**Render masters (4K):** `bun install && bun run render:both` -> `out/*.mp4`.
Works with no API key - the committed film audio renders out of the box.

**Change the script / voice:** edit `narration-script.txt` -> `bun run voice`
-> re-time -> re-render. Audition voices first with `bun run voices`.

**Re-time a scene:** edit its `[start, end]` in `src/scene-timings.json`.
Total frames = max end value; composition duration follows automatically.

**Re-skin:** edit `THEMES.dark` / `THEMES.light` / `CANVAS` in `src/theme.ts`.

**Add a scene:**
1. Copy an existing `scenes/*.tsx`. Give it `const t = useT()` and build the
   UI from `t`.
2. Wrap the window in `<Stage3D v={{ /* pick a distinct entrance */ }}>`.
3. Import it in `SpekoSizzle.tsx` and add `['MyScene', MyScene]` to `SCENES`.
4. Add `"MyScene": [start, end]` to `scene-timings.json`.

## Gotchas

- Fonts silently fall back to serif if the `fonts.ts` side-effect import at
  the top of `kit.tsx` is removed. Keep that import.
- Two-plus `<Audio>` tracks: music at `volume={0.15}`, narration at
  `volume={0.9}`, both bounded so nothing tails past the film.
- The committed film uses split narration files (narration-a/b.mp3) with
  hand-tuned frame offsets in `SpekoSizzle.tsx`. A regenerated film normally
  uses the single `narration.wav` - simplify the audio tracks when you rewire.
- `public/music.mp3` is an original generated ambient bed. Swap the file to
  change the music; keep the 15% volume discipline.
