import {createServer} from 'vite';
import {chromium} from 'playwright';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const require = createRequire(import.meta.url);
const binary = dirname(require.resolve('@remotion/compositor-darwin-arm64/package.json'));
const input = JSON.parse(await readFile('input.json', 'utf8'));
const server = await createServer();
const encoder = spawn(join(binary, 'ffmpeg'), ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30',
  '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', 'clip.mp4'],
{env: {...process.env, DYLD_LIBRARY_PATH: binary}, stdio: ['pipe', 'ignore', 'pipe']});
let browser, diagnostics = '', count = 0;
encoder.stderr.on('data', data => {diagnostics += data;});
const finished = new Promise((resolve, reject) => {
  encoder.on('error', reject);
  encoder.on('exit', code => code === 0 ? resolve() : reject(new Error(diagnostics)));
});
finished.catch(() => {});
async function close() {
  if (browser) await browser.close();
  await server.close();
  if (encoder.exitCode === null) encoder.kill('SIGTERM');
}
process.once('SIGTERM', async () => {await close(); process.exit(143);});
try {
  await server.listen();
  const address = server.httpServer.address();
  const url = `http://127.0.0.1:${address.port}/render.html`;
  if (!(await fetch(url)).ok) throw new Error('镜头预览服务未就绪。');
  browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  await page.exposeFunction('sendFrame', async (frame, image) => {
    if (frame !== count) throw new Error('帧顺序异常。');
    if (encoder.exitCode !== null) throw new Error(diagnostics);
    if (!encoder.stdin.write(Buffer.from(image.split(',')[1], 'base64'))) await once(encoder.stdin, 'drain');
    count++;
  });
  await page.goto(url);
  await page.waitForFunction(() => typeof window.renderClip === 'function');
  try { await page.evaluate(() => window.renderClip()); }
  catch (error) { throw new Error([error.message, ...errors].join('\n'), { cause: error }); }
  encoder.stdin.end(); await finished;
  if (errors.length || count !== input.voice.frames) throw new Error(errors.join('\n') || '镜头帧数不符。');
} finally {await close();}
