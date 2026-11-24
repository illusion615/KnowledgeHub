import bgmEngine from '../assets/video-studio-bgm.js';

export const SAMPLE_RATE = bgmEngine.SAMPLE_RATE;
export const bgmStyles = bgmEngine.bgmStyles;
export const allowedBgmIds = bgmEngine.allowedIds;
export const normalizeBgmStyle = bgmEngine.normalizeStyle;
export const getBgmStyle = bgmEngine.getStyle;
export const synthesizeStereoBuffer = bgmEngine.synthesizeStereoBuffer;
export default bgmEngine;
