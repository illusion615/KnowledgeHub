/// <reference types="@motion-canvas/core/project" />

declare module '*?project' {
  const project: import('@motion-canvas/core').Project;
  export default project;
}
declare module '*.json' {
  const input: {
    screenText: string;
    camera: string;
    composition?: StudioComposition;
    voice: {
      frames: number;
      cues: Array<{ text: string; start: number; duration: number }>;
    };
  };
  export default input;
}
interface Window {
  studioArtworkReady: Promise<void>;
  KHVideoComposition: {
    nodes: (composition: StudioComposition) => StudioLayer[];
    draw: (context: CanvasRenderingContext2D, scene: { screenText: string; composition?: StudioComposition }, progress: number,
      image: HTMLImageElement, cues: Array<{ text: string; start: number; duration: number }>, duration: number) => void;
  };
  sendFrame: (frame: number, image: string) => Promise<void>;
  renderClip: () => Promise<void>;
}
interface StudioComposition {
  background: string;
  layers: StudioLayer[];
  camera?: StudioMotion;
}
interface StudioMotion {
  x?: number; y?: number; scale?: number; rotation?: number; opacity?: number; reveal?: number;
  keyframes?: Array<{at: number; x?: number; y?: number; scale?: number; rotation?: number; opacity?: number; reveal?: number}>;
}
interface StudioLayer extends StudioMotion {
  type: string; x: number; y: number; width: number; height: number;
  children?: StudioLayer[];
}
