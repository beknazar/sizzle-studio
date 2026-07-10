// Voiceover generator — everything runs through Speko (https://api.speko.dev):
//   1) POST /v1/synthesize        → the narration audio (pinned to ElevenLabs
//      eleven_v3 so inline audio tags like [excited] render as emotion)
//   2) WS  /v1/transcribe/stream  → word-level timings for captions.json
//      (falls back to even distribution across the measured duration)
//
// One key does both. Get one at https://platform.speko.dev (free minutes included).
//
// Usage:  SPEKO_API_KEY=sk_live_... bun run voice
// Env:    VOICE_ID    ElevenLabs voice id     (default: Will — calm American male)
//         TTS_MODEL   model to pin            (default: eleven_v3)
//         TTS_PROVIDER provider to pin        (default: elevenlabs)
//         SCRIPT_PATH / OUT_AUDIO / OUT_CAP   file overrides
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.SPEKO_API_KEY;
if (!KEY) throw new Error('SPEKO_API_KEY not set — get one at https://platform.speko.dev');
const BASE = (process.env.SPEKO_API_BASE || 'https://api.speko.dev').replace(/\/$/, '');

const PROVIDER = process.env.TTS_PROVIDER || 'elevenlabs';
const MODEL = process.env.TTS_MODEL || 'eleven_v3'; // inline audio tags ([excited], [whispers], …)
const VOICE_ID = process.env.VOICE_ID || 'bIHbv24MWmeRgasZH58o'; // Will — calm, young American male

const here = path.dirname(fileURLToPath(import.meta.url));
const script = fs.readFileSync(path.resolve(here, process.env.SCRIPT_PATH || 'narration-script.txt'), 'utf8').trim();
const outAudio = path.resolve(here, process.env.OUT_AUDIO || 'public/narration.wav');
const capPath = path.resolve(here, process.env.OUT_CAP || 'public/captions.json');

// ---------- 1) synthesize ----------
const res = await fetch(`${BASE}/v1/synthesize`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: script,
    intent: { language: 'en-US' },
    voice: VOICE_ID,
    model: MODEL,
    constraints: { allowedProviders: { tts: [PROVIDER] } },
  }),
  signal: AbortSignal.timeout(180_000),
});
if (!res.ok) throw new Error(`synthesize ${res.status}: ${(await res.text()).slice(0, 300)}`);

const format = res.headers.get('x-speko-audio-format') || res.headers.get('content-type') || '';
const body = Buffer.from(await res.arrayBuffer());
console.log(
  `synthesize ok — provider=${res.headers.get('x-speko-provider')} model=${res.headers.get('x-speko-model')}` +
  ` format=${format} failovers=${res.headers.get('x-speko-failover-count')}`
);

// Raw PCM (ElevenLabs lane) gets a WAV header; already-containered audio (mp3 etc.) is written as-is.
const withExt = (p, ext) => (/\.[a-z0-9]+$/i.test(p) ? p.replace(/\.[a-z0-9]+$/i, ext) : p + ext);
let audioPath = outAudio;
let wav;
let durationSec;
const pcmRate = /audio\/pcm;\s*rate=(\d+)/i.exec(format);
if (pcmRate) {
  const rate = Number(pcmRate[1]);
  wav = pcmToWav(body, rate);
  durationSec = body.length / 2 / rate; // 16-bit mono
  audioPath = withExt(outAudio, '.wav');
  fs.writeFileSync(audioPath, wav);
} else if (/wav/i.test(format)) {
  wav = body; // already a WAV container — usable for the STT timing pass
  const rate = body.readUInt32LE(24) || 24_000;
  durationSec = Math.max(0, body.length - 44) / 2 / rate;
  audioPath = withExt(outAudio, '.wav');
  fs.writeFileSync(audioPath, body);
} else {
  audioPath = withExt(outAudio, /mpeg|mp3/i.test(format) ? '.mp3' : '.bin');
  fs.writeFileSync(audioPath, body);
  wav = null; // can't cheaply derive PCM; timing falls back to the estimate
}

// ---------- 2) word timings via Speko streaming transcription ----------
let words = null;
if (wav) {
  try {
    words = await transcribeForTimings(wav);
    console.log(`timings ok — ${words.length} words via Speko streaming STT`);
  } catch (e) {
    console.log(`timings fallback (streaming STT failed: ${e.message})`);
  }
}
if (words && words.length) durationSec = Math.max(durationSec ?? 0, words[words.length - 1].end);

// fallback: distribute the script's words evenly across the real audio duration
if (!words || !words.length) {
  const toks = script.replace(/\[[a-z]+\]/gi, '').split(/\s+/).filter(Boolean);
  durationSec ??= (toks.length / 150) * 60; // last resort: ~150wpm
  const per = durationSec / toks.length;
  let t = 0;
  words = toks.map((tk) => { const s = t; t += per; return { text: tk, start: s, end: t }; });
}

fs.writeFileSync(capPath, JSON.stringify({ durationSec, audioFile: path.basename(audioPath), words }, null, 2));
console.log(JSON.stringify({
  audio: path.relative(here, audioPath), kb: Math.round(fs.statSync(audioPath).size / 1024),
  words: words.length, durationSec: Number(durationSec.toFixed(2)), frames: Math.round(durationSec * 30),
}));

// ---------- helpers ----------
function pcmToWav(pcm, rate) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

function transcribeForTimings(wavBuf) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${BASE.replace(/^http/, 'ws')}/v1/transcribe/stream`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const collected = [];
    let done = false;
    const finish = (fn, arg) => { if (!done) { done = true; clearTimeout(timer); fn(arg); } };
    const timer = setTimeout(() => { ws.close(); finish(reject, new Error('timeout')); }, 90_000);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      // deepgram emits word-level timings on final transcripts; keywords fix
      // brand-name spellings in the captions (KEYWORDS=comma,separated to override)
      const keywords = (process.env.KEYWORDS || 'Speko').split(',').map((s) => s.trim()).filter(Boolean);
      ws.send(JSON.stringify({ type: 'config', language: 'en', keywords, constraints: { allowedProviders: { stt: ['deepgram'] } } }));
      for (let i = 0; i < wavBuf.length; i += 32_768) ws.send(wavBuf.subarray(i, Math.min(i + 32_768, wavBuf.length)));
      ws.send(JSON.stringify({ type: 'end' }));
    };
    ws.onmessage = (ev) => {
      let f;
      try { f = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
      if (f.type === 'transcript' && f.isFinal && Array.isArray(f.words)) {
        collected.push(...f.words.map((w) => ({ text: w.text, start: w.start, end: w.end })));
      }
      if (f.type === 'end') { ws.close(); finish(resolve, collected); }
      if (f.type === 'error') { ws.close(); finish(reject, new Error(f.message || f.code)); }
    };
    ws.onclose = () => { collected.length ? finish(resolve, collected) : finish(reject, new Error('closed before end')); };
    ws.onerror = () => finish(reject, new Error('websocket error'));
  });
}
