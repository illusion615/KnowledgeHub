#!/usr/bin/env node
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
export const runtimeRoot = () => resolve(process.env.KH_VIDEO_RUNTIME || join(homedir(), '.local/share/knowledge-hub-video-studio/runtime'));
export const runtimeManifest = {
  name: 'knowledge-hub-video-runtime', private: true, type: 'module',
  dependencies: {
    '@motion-canvas/2d': '3.17.2', '@motion-canvas/core': '3.17.2',
    '@motion-canvas/ui': '3.17.2', '@motion-canvas/vite-plugin': '3.17.2',
    '@remotion/compositor-darwin-arm64': '4.0.539', playwright: '1.65.0', vite: '5.4.21'
  }
};
export async function setup() {
  if (process.platform !== 'darwin' || process.arch !== 'arm64') throw new Error('当前媒体运行时仅支持 Apple Silicon macOS。');
  const root = runtimeRoot();
  await mkdir(root, { recursive: true, mode: 0o700 });
  const manifest = JSON.stringify(runtimeManifest, null, 2) + '\n';
  let existing = null;
  try { existing = await readFile(join(root, 'package.json'), 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing && existing !== manifest) throw new Error('运行时目录已有不同清单；请使用新的 KH_VIDEO_RUNTIME，不覆盖其他工程。');
  if (!existing) await writeFile(join(root, 'package.json'), manifest, { flag: 'wx', mode: 0o600 });
  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['install', '--no-audit', '--no-fund'], { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error('媒体依赖安装失败：' + code)));
  });
  console.log('视频运行时已准备；主仓库没有 node_modules 或构建步骤。');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await setup();
