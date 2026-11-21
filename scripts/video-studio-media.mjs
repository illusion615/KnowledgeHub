import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, writeFile, readFile, rename, copyFile, cp, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { BridgeError } from './copilot-runtime.mjs';
import { runtimeRoot } from './setup-video-studio.mjs';
import { readWave, writeWave, SAMPLE_RATE, assembleAudio } from './video-studio-audio.mjs';
import { needsImage, keys } from './video-studio-model.mjs';

const imageEntry = join(homedir(), '.agents/skills/z-image-turbo-local/scripts/generate.sh');
const template = join(dirname(fileURLToPath(import.meta.url)), 'video-studio-render');
async function exists(file) {
  try { await access(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
async function command(program, args, { cwd, env = process.env, signal } = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(program, args, { cwd, env, signal, stdio: ['ignore', 'pipe', 'pipe'] });
    let detail = '';
    child.stdout.on('data', data => { detail = (detail + data).slice(-6000); });
    child.stderr.on('data', data => { detail = (detail + data).slice(-6000); });
    child.on('error', error => reject(signal?.aborted ? signal.reason :
      new BridgeError(503, 'MEDIA_TOOL', `本地媒体工具不可用：${error.code || '启动失败'}。`)));
    child.on('exit', code => {
      if (code === 0) resolve();
      else {
        console.error('Video Studio media process failed:', program, code, detail);
        reject(signal?.aborted ? signal.reason : new BridgeError(502, 'MEDIA_FAILED', `本地媒体步骤失败（${code}）。完成步骤已保留，请检查本机日志后重试。`));
      }
    });
  });
}
export function createMediaEngine() {
  async function tools() {
    const root = runtimeRoot(), require = createRequire(join(root, 'package.json'));
    let binary;
    try { binary = dirname(require.resolve('@remotion/compositor-darwin-arm64/package.json')); }
    catch { throw new BridgeError(503, 'VIDEO_RUNTIME', '尚未准备视频运行时。请运行 node scripts/setup-video-studio.mjs；依赖仅安装到本机缓存。'); }
    return { root, ffmpeg: join(binary, 'ffmpeg'), env: { ...process.env, DYLD_LIBRARY_PATH: binary } };
  }
  return {
    async status() {
      return {
        image: await exists(imageEntry), voice: process.platform === 'darwin',
        renderer: await exists(join(runtimeRoot(), 'node_modules/@motion-canvas/core/package.json')),
        setup: 'node scripts/setup-video-studio.mjs',
        note: 'Copilot只生成文字；生图、配音、镜头渲染均为用户批准的本机程序。'
      };
    },
    async run(kind, input) {
      const { project, scene, output, signal, artifactPath } = input;
      const work = await mkdtemp(join(dirname(output), 'work-'));
      try {
        if (kind === 'image') {
          if (!await exists(imageEntry)) throw new BridgeError(503, 'IMAGE_RUNTIME', '没有找到已配置的本地 Z-Image-Turbo，不自动下载模型或改用云端。');
          const prompt = scene.imagePromptVersion === 2 ?
            `${scene.visual}\nVisual direction: ${project.brief.style}` :
            `Original refined editorial campaign illustration, unlettered, no logos or watermark.\n${scene.visual}\nArt direction: ${project.brief.style}`;
          if (prompt.length > 3000) throw new BridgeError(413, 'IMAGE_PROMPT', '生图提示词过长，请缩短当前镜头画面描述。');
          const file = join(work, 'image.png');
          const generation = project.assetVersions && Object.hasOwn(project.assetVersions, scene.id) && project.assetVersions[scene.id].image;
          await command('/bin/bash', [imageEntry, '--prompt', prompt, '--output', file, '--seed',
            String(generation ? parseInt(keys(project, scene).image.slice(0, 7), 16) :
              parseInt(project.id.slice(2, 9), 16)), '--width', '1536', '--height', '864', '--steps', '9'], { signal });
          const png = await readFile(file);
          if (png.readUInt32BE(16) !== 1536 || png.readUInt32BE(20) !== 864) throw new BridgeError(502, 'IMAGE_SIZE', '生成图片尺寸异常。');
          await rename(file, output);
          return { width: 1536, height: 864, localAI: true };
        }
        if (kind === 'voice') {
          const sentences = scene.narration.match(/[^。！？；]+[。！？；]?/g) || [];
          if (sentences.some(sentence => sentence.length > 64)) throw new BridgeError(400, 'VOICE_SENTENCE', '单句旁白超过64字，请先断句，避免字幕超出两行。');
          const parts = [], cues = [];
          let cursor = .4;
          for (let i = 0; i < sentences.length; i++) {
            const raw = join(work, i + '.aiff'), wave = join(work, i + '.wav');
            await command('/usr/bin/say', ['-v', project.brief.voice, '-r', String(project.brief.voiceRate), '-o', raw, sentences[i]], { signal });
            await command('/usr/bin/afconvert', ['-f', 'WAVE', '-d', 'LEI16@48000', '-c', '1', raw, wave], { signal });
            const samples = await readWave(wave);
            if (samples.length < 1000) throw new BridgeError(502, 'VOICE_EMPTY', '本机声音没有返回有效音频，请检查声音是否已下载。');
            cues.push({ text: sentences[i], start: cursor, duration: samples.length / SAMPLE_RATE });
            parts.push({ start: cursor, samples }); cursor += samples.length / SAMPLE_RATE + .12;
          }
          const frames = Math.max(150, Math.ceil((cursor + .5) * 30));
          const samples = new Float32Array(frames * 1600);
          for (const part of parts) samples.set(part.samples, Math.round(part.start * SAMPLE_RATE));
          let peak = 0; for (const value of samples) peak = Math.max(peak, Math.abs(value));
          if (peak < .01) throw new BridgeError(502, 'VOICE_EMPTY', '配音音量异常，未发布。');
          const gain = Math.min(2.5, .76 / peak);
          for (let i = 0; i < samples.length; i++) samples[i] *= gain;
          const file = join(work, 'voice.wav');
          await writeWave(file, samples); await rename(file, output);
          return { frames, duration: frames / 30, cues };
        }
        if (kind === 'clip') {
          if ((needsImage(scene) && !input.image) || !input.voice) throw new BridgeError(409, 'ASSETS_MISSING', '镜头图片或配音缓存不存在，请先生成素材。');
          const runtime = await tools();
          await mkdir(join(runtime.root, 'work'), { recursive: true, mode: 0o700 });
          const renderWork = await mkdtemp(join(runtime.root, 'work/scene-'));
          try {
            await cp(template, renderWork, { recursive: true });
            await copyFile(join(dirname(template), '../assets/video-studio-composition.js'), join(renderWork, 'composition.js'));
            await mkdir(join(renderWork, 'public'));
            if (needsImage(scene)) await copyFile(await artifactPath(input.image), join(renderWork, 'public/art.png'));
            await writeFile(join(renderWork, 'input.json'), JSON.stringify({ ...scene, voice: input.voice }));
            await command(process.execPath, [join(renderWork, 'render.mjs')], { cwd: renderWork, env: runtime.env, signal });
            await copyFile(join(renderWork, 'clip.mp4'), join(work, 'clip.mp4'));
            await rename(join(work, 'clip.mp4'), output);
          } finally { await rm(renderWork, { recursive: true, force: true }); }
          return { frames: input.voice.frames, duration: input.voice.duration };
        }
        if (kind === 'export') {
          const runtime = await tools();
          const clips = [], voices = [];
          for (let i = 0; i < project.scenes.length; i++) {
            const entry = project.artifacts[project.scenes[i].id];
            const clip = join(work, `${i}.mp4`);
            await copyFile(await artifactPath(entry.clip), clip);
            clips.push(`file '${i}.mp4'`);
            voices.push({ file: await artifactPath(entry.voice), frames: entry.clip.frames });
          }
          await writeFile(join(work, 'concat.txt'), clips.join('\n'));
          const audio = await assembleAudio(voices, join(work, 'mix.wav'), project.brief.music);
          await command(runtime.ffmpeg, ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', join(work, 'concat.txt'),
            '-i', join(work, 'mix.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac',
            '-b:a', '256k', '-movflags', '+faststart', join(work, 'film.mp4')], { env: runtime.env, signal });
          await rename(join(work, 'film.mp4'), output);
          return { duration: audio.duration, frames: voices.reduce((sum, item) => sum + item.frames, 0), music: project.brief.music, videoStreamCopy: true };
        }
        throw new BridgeError(400, 'MEDIA_KIND', '未知媒体步骤。');
      } finally { await rm(work, { recursive: true, force: true }); }
    }
  };
}
