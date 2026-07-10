# sizzle-studio

Your launch video is a React repo.

This is the actual source of Speko's launch video: a ~44s 4K film where the product UI is rebuilt as coded React scenes (no screenshots), dark app windows floating in 3D on a white canvas, with an AI voiceover. Built on [Remotion](https://remotion.dev).

**Watch the rendered output:**

[![Speko launch video](https://img.youtube.com/vi/8evHjtjEZWQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=8evHjtjEZWQ)

## Quick start (no API key needed)

Narration, captions, and music are committed, so a fresh clone renders the full sample video out of the box.

```bash
bun install
bun run dev            # Remotion Studio - scrub the film live
bun run render         # 4K dark master -> out/sizzle.mp4
```

More targets:

```bash
bun run render:light   # 4K light master -> out/sizzle-light.mp4
bun run render:both    # both masters, back to back
bun run render:preview # fast 1080p preview
```

4K = `--scale=2` on a 1920x1080 comp. `remotion.config.ts` pins PNG frames (kills banding). Two compositions render from one source: `SpekoSizzle` (dark windows) and `SpekoSizzleLight` (light), theme swapped via React context.

## Make it yours

The point of this repo: clone it, open it in an AI coding agent, and ask for YOUR product's launch video. `CLAUDE.md`, `AGENTS.md`, and `.claude/skills/sizzle` encode the design kit and workflow so the agent does it well.

1. Open the repo in Claude Code or Codex.
2. Get a Speko API key at [platform.speko.dev](https://platform.speko.dev) (free minutes included, no card) and `export SPEKO_API_KEY=sk_live_...`
3. Paste a prompt like:

```text
Here is my product: <paste your landing page copy, README, or a description>.
Turn this repo into MY launch video: write the narration script, rebuild the
scenes as my product's UI, regenerate the voiceover with bun run voice, wire
the new audio, re-time the scenes, and render a preview.
```

The agent writes a narration script with audio tags, builds scenes from the design kit (`src/kit.tsx`), sets timings, generates the voice, and renders the masters. Scenes are independent files (`src/scenes/*.tsx`), so agents can build several in parallel.

## Voiceover

`bun run voice` regenerates the narration and word-level captions from `narration-script.txt` through the [Speko](https://speko.ai) API (a voice AI platform that routes across TTS/STT/LLM providers):

1. TTS via `POST /v1/synthesize`, pinned to ElevenLabs `eleven_v3` - supports inline audio tags like `[excited]` and `[whispers]` that render as emotion.
2. Word timings via Speko streaming transcription -> `public/captions.json`.

One env var does both:

```bash
SPEKO_API_KEY=sk_live_... bun run voice
```

Get a key at [platform.speko.dev](https://platform.speko.dev) -> API keys. New accounts include free minutes, no card.

Audition one line across many voices and providers (ElevenLabs, Cartesia, Inworld, OpenAI):

```bash
bun run voices         # writes samples to voice-samples/
```

Default voice is "Will" (calm American male). Override with `VOICE_ID=... bun run voice`. Also: `TTS_PROVIDER`, `TTS_MODEL`, `SCRIPT_PATH`, `KEYWORDS`.

Supported audio tags (anything else is stripped automatically, never read aloud):
`[happy] [sad] [angry] [excited] [calm] [nervous] [whispers] [laughs] [sighs]`

Note: the committed film ships with its final, hand-timed audio. `bun run voice` writes `public/narration.wav` for YOUR version - point the `<Audio>` tracks in `src/SpekoSizzle.tsx` at it and re-time the scenes (the agent does this when asked).

## Scenes

Problem -> Benchmark -> Create -> StackPick + Coval -> Monitor -> Resolution. Timings live in `src/scene-timings.json` (`[startFrame, endFrame]` at 30fps). Files in `src/scenes/` not referenced there are kept experiments.

## License

MIT. Made public by the [Speko](https://speko.ai) team.
