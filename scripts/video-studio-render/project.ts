import {makeProject, ObjectMetaField, type Exporter} from '@motion-canvas/core';
import scene from './scene?scene';
class Frames implements Exporter {
  static id = 'studio-frames';
  static displayName = 'Studio frames';
  static async create() {return new Frames();}
  static meta() {return new ObjectMetaField('Frames', {});}
  async handleFrame(canvas: HTMLCanvasElement, frame: number) {
    await window.sendFrame(frame, canvas.toDataURL('image/jpeg', .96));
  }
}
export default makeProject({scenes: [scene], plugins: [{name: 'studio-frames', exporters() {return [Frames];}}]});
