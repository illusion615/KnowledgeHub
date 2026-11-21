import {Renderer, RendererResult, Vector2} from '@motion-canvas/core';
import project from './project?project';
import input from './input.json';
project.logger.onLogged.subscribe(entry => {if (entry.level === 'error') console.error(entry.message, entry.stack || '');});
const renderer = new Renderer(project);
window.renderClip = async () => {
  await document.fonts.ready;
  await window.studioArtworkReady;
  const finished = new Promise(resolve => renderer.onFinished.subscribe(resolve));
  await renderer.render({name: 'studio', fps: 30, range: [0, (input.voice.frames - 1) / 30],
    size: new Vector2(1920, 1080), resolutionScale: 1, colorSpace: 'srgb', background: '#f5eedf',
    exporter: {name: 'studio-frames', options: {}}});
  if (await finished !== RendererResult.Success) throw new Error('镜头渲染失败。');
};
