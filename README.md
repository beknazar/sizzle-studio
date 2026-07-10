# sizzle-studio

Your launch video is a React repo. This is the real source of Speko's launch film - 4K, coded UI (no screenshots), AI voiceover. Clone it, point an AI agent at it, get yours.

[![Speko launch video](https://img.youtube.com/vi/8evHjtjEZWQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=8evHjtjEZWQ)

## Render the sample (no API key)

```bash
bun install
bun run dev      # scrub it live in Remotion Studio
bun run render   # 4K master -> out/sizzle.mp4
```

## Make yours

Open the repo in Claude Code or Codex and paste:

```text
Here is my product: <your landing page, README, or a description>.
Turn this repo into MY launch video: script, scenes, voiceover, render a preview.
```

The agent instructions (`AGENTS.md`, `.claude/skills/sizzle`) handle the rest: it writes the narration, rebuilds the scenes as your UI, and renders 4K dark + light masters.

## Voiceover

One key powers the TTS (ElevenLabs eleven_v3 with emotion tags like `[excited]`) and the word-timed captions:

```bash
SPEKO_API_KEY=sk_live_... bun run voice
```

Get a key at [platform.speko.dev](https://platform.speko.dev) - free minutes included, no card. `bun run voices` auditions ElevenLabs, Cartesia, Inworld, and OpenAI voices on one line.

MIT. By the [Speko](https://speko.ai) team.
