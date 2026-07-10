// Audition voices ACROSS providers with one line of script — all through
// Speko's /v1/synthesize. Writes voice-samples/<name>.wav|mp3; listen and pick.
// Usage: SPEKO_API_KEY=sk_live_... bun run voices
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.SPEKO_API_KEY;
if (!KEY) throw new Error('SPEKO_API_KEY not set — get one at https://platform.speko.dev');
const BASE = (process.env.SPEKO_API_BASE || 'https://api.speko.dev').replace(/\/$/, '');

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'voice-samples');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// Inline tags render as emotion on eleven_v3; other models strip them server-side.
const TEXT =
  "[calm] Every week, another voice model drops. Which one do you pick? [excited] Benchmark them all — and ship the winner.";

// A cross-provider shortlist. Full catalog: GET /v1/voices (same key).
const CANDIDATES = [
  { name: 'elevenlabs-Will-m-calm', provider: 'elevenlabs', model: 'eleven_v3', voice: 'bIHbv24MWmeRgasZH58o' },
  { name: 'elevenlabs-Sarah-f-soft', provider: 'elevenlabs', model: 'eleven_v3', voice: 'EXAVITQu4vr4xnSDxMaL' },
  { name: 'elevenlabs-Brian-m-deep', provider: 'elevenlabs', model: 'eleven_v3', voice: 'nPczCjzI2devNBz1zQrb' },
  { name: 'cartesia-Katie-f', provider: 'cartesia', voice: 'f786b574-daa5-4673-aa0c-cbe3e8534c02' },
  { name: 'cartesia-Jameson-m', provider: 'cartesia', voice: 'a5136bf9-224c-4d76-b823-52bd5efcffcc' },
  { name: 'inworld-Ashley-f-warm', provider: 'inworld', voice: 'Ashley' },
  { name: 'inworld-Edward-m', provider: 'inworld', voice: 'Edward' },
  { name: 'openai-Fable-narrator', provider: 'openai-tts', model: 'gpt-4o-mini-tts', voice: 'fable' },
];

const ok = [];
for (const c of CANDIDATES) {
  try {
    const res = await fetch(`${BASE}/v1/synthesize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: TEXT,
        intent: { language: 'en-US' },
        voice: c.voice,
        ...(c.model ? { model: c.model } : {}),
        constraints: { allowedProviders: { tts: [c.provider] } },
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) { console.log(`${c.name}: FAIL ${res.status}`); continue; }
    const format = res.headers.get('x-speko-audio-format') || res.headers.get('content-type') || '';
    const body = Buffer.from(await res.arrayBuffer());
    const m = /audio\/pcm;\s*rate=(\d+)/i.exec(format);
    const ext = m || /wav/i.test(format) ? '.wav' : /mpeg|mp3/i.test(format) ? '.mp3' : '.bin';
    const file = path.join(outDir, c.name + ext);
    fs.writeFileSync(file, m ? pcmToWav(body, Number(m[1])) : body);
    ok.push(c.name);
    console.log(`${c.name}: ${(body.length / 1024).toFixed(0)}KB (${res.headers.get('x-speko-model')})`);
  } catch (e) { console.log(`${c.name}: ERR ${e.message}`); }
}
console.log('OK:', ok.join(', '));

function pcmToWav(pcm, rate) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
