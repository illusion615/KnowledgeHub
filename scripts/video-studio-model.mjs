import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { BridgeError } from './copilot-runtime.mjs';
import composition from '../assets/video-studio-composition.js';
import vgCatalog from '../assets/video-studio-templates.js';

export const digest = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export const cameras = ['push', 'pull', 'pan-left', 'pan-right', 'static'];
export const voices = ['Yue (Premium)', 'Lili (Premium)', 'Tingting', ...vgCatalog.stylePacks ? ['zh_female_cancan_uranus_bigtts', 'zh_male_chunhou_uranus_bigtts'] : []];
export const scenarios = vgCatalog.scenarios.map(item => item.id);
export const stylePackIds = vgCatalog.stylePacks.map(item => item.id);
export const needsImage = scene => !scene.composition || composition.nodes(scene.composition).some(layer => layer.type === 'image');
const invalid = message => { throw new BridgeError(400, 'STUDIO_INPUT', message); };
export function text(value, name, max = 4000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) invalid(`${name}必须填写，且不能超过${max}个字符。`);
  return value.trim();
}
export function decode(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, entity) => {
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[entity.toLowerCase()];
  });
}
function attribute(tag, name) {
  const found = new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(tag);
  return found ? decode(found[1] ?? found[2] ?? found[3]) : null;
}
export function extractSource(html) {
  const pieces = [], anchors = [];
  const tokens = html.match(/<!--[\s\S]*?-->|<(?:[^"'<>]|"[^"]*"|'[^']*')*>|[^<]+/g) || [];
  const stack = [];
  const voids = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'embed']);
  let blocked = 0, translated = 0;
  for (const token of tokens) {
    if (token.startsWith('<!--')) continue;
    if (token[0] !== '<') {
      if (!blocked && !translated) pieces.push(decode(token));
      continue;
    }
    const match = /^<\s*(\/?)\s*([a-z0-9-]+)/i.exec(token);
    if (!match) continue;
    const name = match[2].toLowerCase();
    if (match[1]) {
      const index = stack.map(entry => entry.name).lastIndexOf(name);
      if (index >= 0) {
        const closed = stack.splice(index);
        for (const entry of closed) {
          if (entry.block) blocked--;
          if (entry.translate) translated--;
        }
      }
      if (!blocked && !translated) pieces.push('\n');
      continue;
    }
    const block = ['script', 'style', 'noscript', 'nav', 'button'].includes(name);
    const id = attribute(token, 'id');
    if (id && !blocked) anchors.push(id);
    const zh = attribute(token, 'data-zh');
    const translate = !blocked && !translated && !block && zh !== null;
    if (translate) pieces.push('\n' + zh.replace(/<[^>]*>/g, '') + '\n');
    if (name === 'a' && !blocked && !translated) {
      const href = attribute(token, 'href');
      if (href && /^(https?:|#)/.test(href)) pieces.push(' [' + href + '] ');
    }
    if (name === 'input' && !blocked) {
      const value = attribute(token, 'value');
      if (value) pieces.push(` [${id || 'input'}=${value}] `);
    }
    if (voids.has(name) || /\/\s*>$/.test(token)) continue;
    stack.push({ name, block, translate });
    if (block) blocked++;
    if (translate) translated++;
  }
  const h1 = /<h1\b[^>]*>[\s\S]*?<\/h1>/i.exec(html)?.[0];
  const title = h1 ? attribute(h1, 'data-zh') || decode(h1.replace(/<[^>]+>/g, '')).trim() : '';
  return { title, anchors: [...new Set(anchors)], text: pieces.join('').replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim() };
}
export async function readArticle(root, slug) {
  if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(slug)) invalid('文章标识无效。');
  const posts = await realpath(resolve(root, 'posts'));
  let file;
  try { file = await realpath(resolve(posts, slug, 'index.html')); }
  catch (error) {
    if (error.code === 'ENOENT') throw new BridgeError(404, 'ARTICLE_MISSING', '本机没有这篇文章，请先同步文章文件。');
    throw error;
  }
  if (!file.startsWith(posts + sep)) invalid('不允许读取文章目录之外的文件。');
  const raw = await readFile(file);
  if (raw.length > 2 * 1024 * 1024) throw new BridgeError(413, 'ARTICLE_LIMIT', '文章超过2MiB，未截断。');
  const source = extractSource(raw.toString('utf8'));
  if (!source.title || !source.text) invalid('文章没有可提取的标题或正文。');
  return { slug, hash: digest(raw), ...source };
}
export function validateBrief(value) {
  if (!value || typeof value !== 'object') invalid('视频需求无效。');
  if (!Number.isInteger(value.seconds) || value.seconds < 30 || value.seconds > 600) invalid('目标时长必须为30–600秒。');
  if (!voices.includes(value.voice)) invalid('请选择受支持的本机或官方TTS声音。');
  if (!Number.isInteger(value.voiceRate) || value.voiceRate < 150 || value.voiceRate > 300) invalid('语速必须为150–300。');
  if (!['bright', 'none'].includes(value.music)) invalid('配乐选项无效。');
  if (value.idea !== undefined && (typeof value.idea !== 'string' || value.idea.length > 4000)) invalid('创意想法最多4000字。');
  if (value.scenario !== undefined && !scenarios.includes(value.scenario)) invalid('视频制作路线仅支持 presenter（真人口播）或 product（产品介绍）。');
  if (value.stylePack !== undefined && !stylePackIds.includes(value.stylePack)) invalid('Adu/MotionGit 风格编号无效。');
  return {
    audience: text(value.audience, '受众', 300), goal: text(value.goal, '观看目标', 500),
    style: text(value.style, '视觉方向', 1200), seconds: value.seconds, voice: value.voice,
    voiceRate: value.voiceRate, music: value.music,
    ...(value.idea !== undefined ? { idea: value.idea.trim() } : {}),
    ...(value.scenario !== undefined ? { scenario: value.scenario } : {}),
    ...(value.stylePack !== undefined ? { stylePack: value.stylePack } : {})
  };
}
export function validateScenes(value, source) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 24) invalid('分镜数量必须为1–24。');
  const ids = new Set();
  return value.map(scene => {
    if (!scene || !/^[a-z0-9][a-z0-9-]{0,39}$/.test(scene.id) || ids.has(scene.id)) invalid('镜头标识必须唯一，且只含小写字母、数字和短横线。');
    ids.add(scene.id);
    const camera = scene.camera === undefined && scene.composition ? 'static' : scene.camera;
    if (!cameras.includes(camera)) invalid('镜头运动无效。');
    if (!Array.isArray(scene.anchors) || !scene.anchors.length || scene.anchors.some(anchor => !source.anchors.includes(anchor))) invalid('每个镜头必须引用文章内存在的章节锚点。');
    const screenText = scene.screenText === undefined && scene.composition ? '' : scene.screenText;
    if (typeof screenText !== 'string' || screenText.length > 160) invalid('画面主文案最多160字，也可留空。');
    if (scene.imagePromptVersion !== undefined && scene.imagePromptVersion !== 2) invalid('图片提示词版本无效。');
    let directed;
    if (scene.composition !== undefined) {
      try { directed = composition.validate(scene.composition); }
      catch (error) { invalid(error.message); }
    }
    for (const key of ['intent', 'cinematography'])
      if (scene[key] !== undefined && (typeof scene[key] !== 'string' || scene[key].length > 2000)) invalid('镜头设计说明最多2000字。');
    return {
      id: scene.id, title: text(scene.title, '镜头标题', 100),
      narration: text(scene.narration, '讲解文案', 1600),
      visual: directed && !needsImage({ composition: directed }) && (scene.visual === undefined || scene.visual === '') ? '' : text(scene.visual, '画面提示词', 4000),
      screenText: screenText.trim(), camera,
      anchors: [...new Set(scene.anchors)],
      ...(directed ? { composition: directed } : {}),
      ...(scene.intent !== undefined ? { intent: scene.intent } : {}),
      ...(scene.cinematography !== undefined ? { cinematography: scene.cinematography } : {}),
      ...(scene.imagePromptVersion === 2 ? { imagePromptVersion: 2 } : {})
    };
  });
}
export const defaultBrief = () => ({
  audience: '希望快速理解方案价值的一线业务用户', goal: '讲清挑战、方案、获益与实施边界',
  style: '根据要解释的信息选择文字、图形、动画、运镜、图片或其组合，不预设必须生图；以简洁直观为先。',
  seconds: 180, voice: 'Yue (Premium)', voiceRate: 235, music: 'bright', idea: ''
});
export function keys(project, scene) {
  const versions = project.assetVersions && Object.hasOwn(project.assetVersions, scene.id) ? project.assetVersions[scene.id] : undefined;
  const imageInput = [scene.imagePromptVersion === 2 ? 'image-v2' : 'image-v1', project.brief.style, scene.visual, 1536, 864];
  const voiceInput = ['voice-v1', scene.narration, project.brief.voice, project.brief.voiceRate];
  if (versions?.image) imageInput.push(versions.image);
  if (versions?.voice) voiceInput.push(versions.voice);
  const image = digest(imageInput);
  const voice = digest(voiceInput);
  const clip = digest(scene.composition ?
    [scene.composition.camera || composition.nodes(scene.composition).some(layer => ['group', 'path'].includes(layer.type) || layer.reveal !== undefined ||
      layer.keyframes?.some(frame => frame.reveal !== undefined)) ? 'clip-v3' : 'clip-v2',
      needsImage(scene) ? image : null, voice, scene.screenText, scene.composition, 1920, 1080, 30] :
    ['clip-v1', image, voice, scene.title, scene.screenText, scene.camera, 1920, 1080, 30]);
  return { image, voice, clip, approval: digest([image, voice]) };
}
export const planKey = project => {
  const content = [project.source.hash, project.brief.audience, project.brief.goal, project.brief.style, project.brief.seconds,
    project.scenes.map(({ composition: _composition, intent: _intent, cinematography: _cinematography, ...scene }) => scene)];
  return digest(project.brief.idea ? content.concat(project.brief.idea) : content);
};
export const exportKey = project => digest(['export-v1', project.scenes.map(scene => keys(project, scene).clip), project.brief.music]);
export function viewProject(project, sourceHash) {
  const planApproved = project.planApproval === planKey(project) && project.scenes.length > 0;
  const scenes = project.scenes.map(scene => {
    const expected = keys(project, scene);
    const saved = project.artifacts[scene.id] || {};
    const artifacts = {};
    for (const kind of ['image', 'voice', 'clip']) {
      if (saved[kind]?.key === expected[kind]) artifacts[kind] = saved[kind];
    }
    return { ...scene, artifacts, imageRequired: needsImage(scene), assetsReady: (!needsImage(scene) || !!artifacts.image) && !!artifacts.voice,
      approved: project.assetApprovals[scene.id] === expected.approval &&
      !!artifacts.image && !!artifacts.voice };
  });
  return { ...project, scenes, stale: sourceHash !== project.source.hash, planApproved,
    legacyComposition: scenes.some(scene => !scene.composition),
    canExport: planApproved && scenes.length > 0 && scenes.every(scene => scene.assetsReady && scene.artifacts.clip),
    currentExport: project.export?.key === exportKey(project) ? project.export : null };
}
