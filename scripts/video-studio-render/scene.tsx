import {makeScene2D, Node, Rect, Txt, Img, Line} from '@motion-canvas/2d';
import {all, createSignal, linear, easeInOutCubic} from '@motion-canvas/core';
import input from './input.json';
import './composition.js';

class DirectedFrame extends Node {
  constructor(private readonly progress: () => number) {
    super({});
  }
  protected override draw(context: CanvasRenderingContext2D) {
    context.save();
    try {
      context.translate(-960, -540);
      window.KHVideoComposition.draw(context, input, this.progress(), artwork, input.voice.cues, input.voice.frames / 30);
    } finally { context.restore(); }
  }
}
const artwork = new Image();
const needsArtwork = !input.composition || window.KHVideoComposition.nodes(input.composition).some(layer => layer.type === 'image');
if (needsArtwork) artwork.src = '/art.png';
window.studioArtworkReady = needsArtwork ? artwork.decode() : Promise.resolve();

export default makeScene2D(function* (view) {
  const duration = input.voice.frames / 30;
  const clock = createSignal(0);
  if (input.composition) {
    if (!artwork.complete) throw new Error('镜头图片尚未加载。');
    view.add(new DirectedFrame(() => clock() / duration));
    yield* clock(duration, duration, linear);
    return;
  }
  const root = new Node({x: -960, y: -540});
  view.add(root);
  const camera = new Node({x: 960, y: 540, scale: input.camera === 'pull' ? 1.08 : 1.025});
  root.add(camera);
  camera.add(new Img({src: '/art.png', width: 1920, height: 1080}));
  root.add(new Rect({x: 465, y: 330, width: 770, height: 410, radius: 5, fill: '#f5eedfeF'}));
  root.add(new Txt({text: 'STUDY ROOM / VIDEO STUDIO', x: 420, y: 60, fontFamily: 'PingFang SC', fontSize: 24, fill: '#152e43'}));
  root.add(new Txt({text: '方案演绎 · 非产品实录', x: 1640, y: 60, fontFamily: 'PingFang SC', fontSize: 22, fill: '#152e43'}));
  const headline = input.screenText.length > 12 ? input.screenText.slice(0, Math.ceil(input.screenText.length / 2)) + '\n' +
    input.screenText.slice(Math.ceil(input.screenText.length / 2)) : input.screenText;
  root.add(new Txt({text: headline, x: 465, y: 320, width: 680, fontFamily: 'PingFang SC', fontSize: 55,
    lineHeight: 76, fill: '#152e43', textAlign: 'left', textWrap: true, fontWeight: 700}));
  root.add(new Line({points: [[135, 480], [720, 480]], stroke: '#b95232', lineWidth: 9, lineCap: 'round'}));
  root.add(new Rect({x: 960, y: 1014, width: 1800, height: 100, fill: '#f8f2e8'}));
  root.add(new Txt({x: 960, y: 1014, width: 1640, fontFamily: 'PingFang SC', fontSize: 32, lineHeight: 40,
    textWrap: true, fill: '#152e43', text: () => {
      const active = input.voice.cues.find(cue => clock() >= cue.start && clock() < cue.start + cue.duration);
      return active ? active.text : '';
    }}));
  const targetScale = input.camera === 'pull' || input.camera === 'static' ? 1.025 : 1.08;
  const targetX = input.camera === 'pan-left' ? 930 : input.camera === 'pan-right' ? 990 : 960;
  yield* all(clock(duration, duration, linear), camera.scale(targetScale, duration, easeInOutCubic), camera.x(targetX, duration, easeInOutCubic));
});
