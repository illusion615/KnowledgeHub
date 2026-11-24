import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { parseArgs, parseEnv } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VOLCENGINE_TTS_ENDPOINT = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional/sse';
export const VOLCENGINE_SPEAKERS = [
  { id: 'zh_female_cancan_uranus_bigtts', label: ['灿灿 · 字节官方女声 (Seed-TTS 2.0)', 'Cancan · Volcengine Female (Seed-TTS 2.0)'] },
  { id: 'zh_male_chunhou_uranus_bigtts', label: ['醇厚 · 字节官方男声 (Seed-TTS 2.0)', 'Chunhou · Volcengine Male (Seed-TTS 2.0)'] }
];

export function parseEvent(block) {
  const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
  return data ? JSON.parse(data) : null;
}

export function consumeEvents(buffer, consume, final = false) {
  const blocks = buffer.replaceAll('\r\n', '\n').split('\n\n');
  const remainder = blocks.pop();
  for (const block of blocks) {
    const event = parseEvent(block);
    if (event) consume(event);
  }
  if (final && remainder.trim()) {
    const event = parseEvent(remainder);
    if (event) consume(event);
    return '';
  }
  return remainder;
}

export function makeCaptions(sentences) {
  const captions = [];
  for (const sentence of sentences) {
    if (!Array.isArray(sentence?.words)) continue;
    const words = sentence.words;
    if (words.length === 0) continue;
    if (!words.every(word => Number.isFinite(word.startTime) && Number.isFinite(word.endTime) && word.startTime >= 0 && word.endTime > word.startTime && typeof word.word === 'string')) continue;
    const caption = { start: words[0].startTime, end: words.at(-1).endTime, text: words.map(word => word.word).join('') };
    if (caption.end <= caption.start || !caption.text.trim()) continue;
    captions.push(caption);
  }
  captions.sort((first, second) => first.start - second.start);
  return captions.filter((caption, index) => index === 0 || caption.start >= captions[index - 1].end);
}

export function srtTime(seconds) {
  const milliseconds = Math.round(seconds * 1000);
  return `${String(Math.floor(milliseconds / 3600000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 60000) % 60).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')},${String(milliseconds % 1000).padStart(3, '0')}`;
}

export function selfCheck() {
  const events = [];
  let pending = consumeEvents('event: 352\r\ndata: {"code":0,"da', event => events.push(event));
  pending = consumeEvents(pending + 'ta":"YQ=="}\r\n\r\nevent: 152\r\ndata: {"code":20000000}\r\n\r\n', event => events.push(event), true);
  assert.equal(pending, '');
  assert.equal(events.length, 2);
  assert.equal(Buffer.from(events[0].data, 'base64').toString(), 'a');
  assert.equal(events[1].code, 20000000);
  const captions = makeCaptions([{ words: [{ startTime: 0.1, endTime: 0.6, word: 'sample' }] }]);
  assert.deepEqual(captions, [{ start: 0.1, end: 0.6, text: 'sample' }]);
  assert.equal(srtTime(61.125), '00:01:01,125');
  assert.deepEqual(makeCaptions([{ text: 'no timestamps' }]), []);
  return {
    offlineCheck: 'PASS',
    networkCalled: false,
    checks: ['split SSE chunks', 'CRLF', 'audio decode', 'terminal code', 'real timestamp captions', 'missing timestamps']
  };
}

export function resolveVolcengineConfig(envFilePath) {
  const defaultEnv = path.join(repoRoot, 'private/video-studio/tts.local.env');
  const envFile = path.resolve(envFilePath ?? defaultEnv);
  const local = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, 'utf8')) : {};
  const apiKey = process.env.VOLCENGINE_TTS_API_KEY ?? local.VOLCENGINE_TTS_API_KEY ?? '';
  const resource = process.env.VOLCENGINE_TTS_RESOURCE_ID ?? local.VOLCENGINE_TTS_RESOURCE_ID ?? 'seed-tts-2.0';
  const userId = process.env.VOLCENGINE_TTS_USER_ID ?? local.VOLCENGINE_TTS_USER_ID ?? 'study-room-video';
  const speaker = process.env.VOLCENGINE_TTS_SPEAKER ?? local.VOLCENGINE_TTS_SPEAKER ?? '';
  const validKey = typeof apiKey === 'string' && /^[A-Za-z0-9_-]{24,256}$/.test(apiKey);
  return {
    ready: validKey && resource === 'seed-tts-2.0',
    envFile,
    apiKey: validKey ? apiKey : null,
    resource,
    userId,
    speaker,
    endpoint: VOLCENGINE_TTS_ENDPOINT,
    credentialSource: process.env.VOLCENGINE_TTS_API_KEY ? 'process environment' : fs.existsSync(envFile) ? 'local env file' : 'unconfigured'
  };
}

export async function generateVolcengineTts({ text, speaker, rate = 0, envFile, maxCharacters = 1000, signal, fetchImpl = fetch }) {
  const config = resolveVolcengineConfig(envFile);
  if (!config.apiKey) throw new Error('Missing or invalid VOLCENGINE_TTS_API_KEY; configure private/video-studio/tts.local.env or VOLCENGINE_TTS_API_KEY');
  if (config.resource !== 'seed-tts-2.0') throw new Error('This generator targets verified seed-tts-2.0 resources only');
  const trimmed = String(text || '').replace(/^\uFEFF/, '').trim();
  const characters = [...trimmed].length;
  if (!Number.isSafeInteger(maxCharacters) || maxCharacters < 1 || characters === 0 || characters > maxCharacters) {
    throw new Error('Text is empty or exceeds the explicit local character budget');
  }
  const speechRate = Number(rate);
  if (!Number.isFinite(speechRate) || speechRate < -50 || speechRate > 100) {
    throw new Error('Speech rate must be between -50 and 100');
  }
  const chosenSpeaker = speaker || config.speaker;
  if (!chosenSpeaker || !/^[A-Za-z0-9_-]{1,128}$/.test(chosenSpeaker)) {
    throw new Error('Missing or invalid speaker ID');
  }
  const requestId = crypto.randomUUID();
  const response = await fetchImpl(VOLCENGINE_TTS_ENDPOINT, {
    method: 'POST',
    signal: signal ?? AbortSignal.timeout(90000),
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': config.apiKey,
      'X-Api-Resource-Id': config.resource,
      'X-Api-Request-Id': requestId,
      'X-Control-Require-Usage-Tokens-Return': '*'
    },
    body: JSON.stringify({
      user: { uid: config.userId },
      req_params: {
        text: trimmed,
        speaker: chosenSpeaker,
        audio_params: { format: 'mp3', sample_rate: 24000, speech_rate: speechRate, enable_subtitle: true },
        additions: JSON.stringify({ aigc_metadata: { enable: true } })
      }
    })
  });
  if (!response.ok) throw new Error(`TTS HTTP ${response.status}; check project, Key, resource and quota; not automatically retried`);
  if (!response.body) throw new Error('TTS returned no response stream');
  const decoder = new TextDecoder(), audio = [], sentences = [];
  let pending = '', completed = false, usage = null;
  const consume = event => {
    if (event.code !== 0 && event.code !== 20000000) throw new Error(`TTS service code ${event.code}; not automatically retried`);
    if (typeof event.data === 'string' && event.data.length) {
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(event.data)) throw new Error('Invalid audio Base64');
      audio.push(Buffer.from(event.data, 'base64'));
    }
    if (event.sentence && typeof event.sentence === 'object') sentences.push(event.sentence);
    if (event.code === 20000000) { completed = true; usage = event.usage ?? null; }
  };
  for await (const chunk of response.body) pending = consumeEvents(pending + decoder.decode(chunk, { stream: true }), consume);
  consumeEvents(pending + decoder.decode(), consume, true);
  if (!completed || audio.length === 0) throw new Error('TTS ended without successful terminal code or audio; no output written');
  const bytes = Buffer.concat(audio);
  if (bytes.length === 0) throw new Error('TTS returned empty audio');
  const captions = makeCaptions(sentences);
  const metadata = {
    provider: 'Volcengine Doubao official TTS',
    endpoint: VOLCENGINE_TTS_ENDPOINT,
    resource: config.resource,
    speaker: chosenSpeaker,
    rate: speechRate,
    text: trimmed,
    characters,
    requestId,
    logId: response.headers?.get?.('x-tt-logid') ?? null,
    generatedAt: new Date().toISOString(),
    successCode: 20000000,
    usage,
    audioBytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    subtitleStatus: captions.length ? 'service-returned word times grouped by sentence' : 'not returned; no fabricated timestamps',
    captions,
    sentences
  };
  return { bytes, metadata, captions };
}

async function runCli() {
  const { values } = parseArgs({
    options: {
      check: { type: 'boolean' },
      'self-check': { type: 'boolean' },
      text: { type: 'string' },
      'text-file': { type: 'string' },
      output: { type: 'string' },
      speaker: { type: 'string' },
      rate: { type: 'string', default: '0' },
      'env-file': { type: 'string' },
      'max-characters': { type: 'string', default: '1000' }
    }
  });
  if (values['self-check']) {
    console.log(JSON.stringify(selfCheck()));
    return;
  }
  const config = resolveVolcengineConfig(values['env-file']);
  if (values.check) {
    if (!config.ready) throw new Error('Missing or invalid VOLCENGINE_TTS_API_KEY; configure private/video-studio/tts.local.env or --env-file');
    console.log(JSON.stringify({ ready: true, credentialSource: config.credentialSource, resource: config.resource, endpoint: config.endpoint, networkCalled: false }));
    return;
  }
  if (Boolean(values.text) === Boolean(values['text-file'])) throw new Error('Supply exactly one of --text or --text-file');
  if (!values.output) throw new Error('Provide --output with an independent file prefix');
  const prefix = path.resolve(values.output);
  const files = { audio: prefix + '.mp3', metadata: prefix + '.json', subtitle: prefix + '.srt' };
  for (const file of Object.values(files)) if (fs.existsSync(file)) throw new Error('Refusing to overwrite an existing output');
  const rawText = values['text-file'] ? fs.readFileSync(path.resolve(values['text-file']), 'utf8') : values.text;
  const { bytes, metadata, captions } = await generateVolcengineTts({
    text: rawText,
    speaker: values.speaker,
    rate: Number(values.rate),
    envFile: values['env-file'],
    maxCharacters: Number(values['max-characters'])
  });
  fs.mkdirSync(path.dirname(prefix), { recursive: true });
  fs.writeFileSync(files.audio, bytes, { flag: 'wx' });
  fs.writeFileSync(files.metadata, JSON.stringify(metadata, null, 2), { flag: 'wx' });
  if (captions.length) {
    fs.writeFileSync(files.subtitle, captions.map((caption, index) => `${index + 1}\n${srtTime(caption.start)} --> ${srtTime(caption.end)}\n${caption.text}\n`).join('\n'), { flag: 'wx' });
  }
  console.log(JSON.stringify({
    generated: true,
    audio: files.audio,
    metadata: files.metadata,
    subtitle: captions.length ? files.subtitle : null,
    audioBytes: bytes.length,
    speaker: metadata.speaker,
    characters: metadata.characters,
    usage: metadata.usage,
    successCode: 20000000,
    subtitleStatus: metadata.subtitleStatus
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCli().catch(error => {
    console.error(error instanceof Error ? error.message : 'TTS generation failed');
    process.exitCode = 1;
  });
}
