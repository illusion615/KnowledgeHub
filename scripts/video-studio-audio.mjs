import { readFile, writeFile } from 'node:fs/promises';
import { BridgeError } from './copilot-runtime.mjs';
import { SAMPLE_RATE as BGM_RATE, synthesizeStereoBuffer, normalizeBgmStyle } from './video-studio-bgm.mjs';
export const SAMPLE_RATE = BGM_RATE;
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
  const voice = new Float32Array(length);
  let position = 0;
  for (const item of items) {
    const samples = await readWave(item.file);
    if (samples.length > item.frames * 1600) throw new BridgeError(422, 'VOICE_LENGTH', '配音超过镜头长度。');
    voice.set(samples, position);
    position += item.frames * 1600;
  }
  const styleId = normalizeBgmStyle(music);
  const { stereo, bpm } = synthesizeStereoBuffer(length, styleId, SAMPLE_RATE);
  let duck = 0.68;
  for (let i = 0; i < length; i++) {
    const voiceAhead = Math.abs(voice[Math.min(i + 2400, length - 1)]);
    const target = voiceAhead > 0.008 ? 0.16 : 0.72;
    duck += (target - duck) / (target < duck ? 1200 : 12000);
    const fade = Math.max(0, Math.min(1, i / SAMPLE_RATE, (length - i) / SAMPLE_RATE / 1.3));
    const leftMix = voice[i] + stereo[i * 2] * duck * fade;
    const rightMix = voice[i] + stereo[i * 2 + 1] * duck * fade;
    stereo[i * 2] = Math.max(-0.98, Math.min(0.98, leftMix));
    stereo[i * 2 + 1] = Math.max(-0.98, Math.min(0.98, rightMix));
  }
  const { peak } = await writeWave(output, stereo, 2);
  return { duration: length / SAMPLE_RATE, peak, bpm, musicStyle: styleId };
}
