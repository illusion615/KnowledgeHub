import { readFile, writeFile } from 'node:fs/promises';
import { BridgeError } from './copilot-runtime.mjs';
export const SAMPLE_RATE = 48000;
export async function readWave(file) {
  const buffer = await readFile(file);
  let channels, bits, rate, format;
  for (let offset = 12; offset + 8 < buffer.length;) {
    const name = buffer.toString('ascii', offset, offset + 4), size = buffer.readUInt32LE(offset + 4), start = offset + 8;
    if (name === 'fmt ') {
      format = buffer.readUInt16LE(start); channels = buffer.readUInt16LE(start + 2);
      rate = buffer.readUInt32LE(start + 4); bits = buffer.readUInt16LE(start + 14);
    }
    if (name === 'data') {
      if (format !== 1 || channels !== 1 || rate !== SAMPLE_RATE || bits !== 16)
        throw new BridgeError(422, 'VOICE_FORMAT', '本机配音不是48kHz单声道PCM，请重新生成该镜头配音。');
      const samples = new Float32Array(size / 2);
      for (let i = 0; i < samples.length; i++) samples[i] = buffer.readInt16LE(start + i * 2) / 32768;
      return samples;
    }
    offset = start + size + size % 2;
  }
  throw new BridgeError(422, 'VOICE_FORMAT', '配音文件缺少有效PCM数据。');
}
export async function writeWave(file, samples, channels = 1) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24); buffer.writeUInt32LE(SAMPLE_RATE * 2 * channels, 28);
  buffer.writeUInt16LE(channels * 2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
    buffer.writeInt16LE(Math.round(Math.min(1, Math.max(-1, samples[i])) * 32767), 44 + i * 2);
  }
  if (peak > 1) throw new BridgeError(422, 'AUDIO_CLIPPING', '音频混音超出峰值限制，未发布。');
  await writeFile(file, buffer, { mode: 0o600 });
  return { peak };
}
export async function assembleAudio(items, output, music) {
  const length = items.reduce((sum, item) => sum + item.frames * 1600, 0);
  if (length > SAMPLE_RATE * 1200) throw new BridgeError(413, 'FILM_LENGTH', '整片超过20分钟，未分配音频缓冲。');
  const voice = new Float32Array(length), stereo = new Float32Array(length * 2);
  let position = 0;
  for (const item of items) {
    const samples = await readWave(item.file);
    if (samples.length > item.frames * 1600) throw new BridgeError(422, 'VOICE_LENGTH', '配音超过镜头长度。');
    voice.set(samples, position);
    position += item.frames * 1600;
  }
  const bpm = 112, beat = 60 / bpm, bar = beat * 4;
  const chords = [[62, 66, 69, 73], [59, 62, 66, 69], [59, 62, 66, 67], [61, 64, 66, 69]];
  const roots = [38, 35, 31, 33];
  if (music === 'bright') {
    let seed = 620261115;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
    const add = (at, duration, gain, pan, oscillator) => {
      const start = Math.round(at * SAMPLE_RATE), count = Math.min(Math.round(duration * SAMPLE_RATE), length - start);
      for (let i = 0; i < count; i++) {
        const value = oscillator(i / SAMPLE_RATE) * gain;
        stereo[(start + i) * 2] += value * Math.sqrt((1 - pan) / 2);
        stereo[(start + i) * 2 + 1] += value * Math.sqrt((1 + pan) / 2);
      }
    };
    for (let at = 0, index = 0; at < length / SAMPLE_RATE; at += bar, index++) {
      chords[index % 4].forEach((note, i) => {
        const hz = 440 * 2 ** ((note - 69) / 12);
        add(at + i * .013, bar * .95, .014, -.45 + i * .3, t =>
          Math.sin(2 * Math.PI * hz * t + .5 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * hz * 3 * t)) *
          Math.min(1, t / .008) * Math.exp(-t * 1.8));
      });
      const bass = 440 * 2 ** ((roots[index % 4] - 69) / 12);
      for (const off of [0, 1.5, 2, 3.5]) add(at + off * beat, .4, .035, 0, t =>
        Math.sin(2 * Math.PI * bass * t) * Math.exp(-t * 7) * Math.min(1, t / .007));
      for (const off of [0, 2]) add(at + off * beat, .2, .04, 0, t =>
        Math.sin(2 * Math.PI * (48 * t + 1.1 * (1 - Math.exp(-t * 55)))) * Math.exp(-t * 23));
      for (const off of [1, 3]) add(at + off * beat, .12, .012, .12, t => random() * Math.exp(-t * 45));
      for (let i = 0; i < 8; i++) add(at + i * beat / 2, .05, i % 2 ? .003 : .005, i % 2 ? .4 : -.4,
        t => random() * Math.exp(-t * 80));
      const melody = [78, 76, 73, 76, 74, 73, 71, 69];
      const hz = 440 * 2 ** ((melody[index % melody.length] - 69) / 12);
      add(at + beat * .75, .7, .009, .3, t => Math.sin(2 * Math.PI * hz * t) * Math.exp(-t * 8));
    }
  }
  let duck = .7;
  for (let i = 0; i < length; i++) {
    const target = Math.abs(voice[Math.min(i + 2400, length - 1)]) > .008 ? .32 : .75;
    duck += (target - duck) / (target < duck ? 1200 : 12000);
    const fade = Math.max(0, Math.min(1, i / SAMPLE_RATE, (length - i) / SAMPLE_RATE / 1.3));
    stereo[i * 2] = voice[i] + stereo[i * 2] * duck * fade;
    stereo[i * 2 + 1] = voice[i] + stereo[i * 2 + 1] * duck * fade;
  }
  const { peak } = await writeWave(output, stereo, 2);
  return { duration: length / SAMPLE_RATE, peak, bpm: music === 'bright' ? bpm : null };
}
