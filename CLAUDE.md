# CLAUDE.md

Read `AGENTS.md` for the full workflow and rules. The deep manual is the sizzle skill at `.claude/skills/sizzle/SKILL.md` (auto-activates).

Critical rules:

- Bun only (`bun install`, `bun run dev|render|voice`). Never npm/yarn/pnpm.
- Animate only with `useCurrentFrame()` + `interpolate`/`spring`. CSS animations do not render deterministically.
- Real data only in benchmark-style scenes; never invent numbers.

After `bun run voice`, point the `<Audio>` tracks in `src/SpekoSizzle.tsx` at the new narration and re-time `src/scene-timings.json` from `public/captions.json`.
