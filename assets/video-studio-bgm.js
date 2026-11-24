(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KHVideoBgm = api;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  var SAMPLE_RATE = 48000;

  var bgmStyles = [
    {
      id: 'ambient-tech',
      name: ['知性科技 (Ambient Tech)', 'Ambient Tech'],
      shortName: ['知性科技', 'Ambient Tech'],
      bpm: 96,
      summary: ['温暖大七和弦 Pad + 清脆五声琶音脉冲，适合架构拆解与技术解析', 'Warm Maj7 pads + crisp pentatonic arpeggio pulses for architecture & tech'],
      chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]],
      roots: [36, 33, 29, 31],
      arp: [72, 76, 79, 83, 79, 76, 74, 71]
    },
    {
      id: 'upbeat-pulse',
      name: ['轻快律动 (Upbeat Pulse)', 'Upbeat Pulse'],
      shortName: ['轻快律动', 'Upbeat Pulse'],
      bpm: 112,
      summary: ['明亮大调五声音阶 Marimba 轻节奏律动 + 柔和低音推进，适合活泼方案演示', 'Bright major pentatonic marimba plucks + warm bass groove for lively demos'],
      chords: [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 69]],
      roots: [38, 35, 31, 33],
      arp: [74, 78, 81, 86, 81, 78, 76, 74]
    },
    {
      id: 'dynamic-drive',
      name: ['动感节奏 (Dynamic Drive)', 'Dynamic Drive'],
      shortName: ['动感节奏', 'Dynamic Drive'],
      bpm: 122,
      summary: ['现代电子合成器 Bassline + 切分节拍能量推进，适合产品发布与效能对比', 'Modern synth bassline + syncopated rhythmic drive for product launches & benchmarks'],
      chords: [[57, 60, 64, 69], [53, 57, 60, 64], [60, 64, 67, 72], [55, 59, 62, 67]],
      roots: [33, 29, 36, 31],
      arp: [69, 72, 76, 81, 79, 76, 72, 69]
    },
    {
      id: 'elegant-minimal',
      name: ['优雅极简 (Elegant Piano/Strings)', 'Elegant Minimal'],
      shortName: ['优雅极简', 'Elegant Minimal'],
      bpm: 78,
      summary: ['柔和泛音电钢琴分解和弦 + 温暖大提琴/弦乐长音呼吸感，适合深度思考与总结', 'Soft harmonic electric piano arpeggios + breathing warm strings for deep insights'],
      chords: [[60, 64, 67, 71], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 64]],
      roots: [36, 31, 33, 29],
      arp: [72, 67, 64, 71, 69, 64, 60, 67]
    }
  ];

  var allowedIds = ['none', 'bright', 'ambient-tech', 'upbeat-pulse', 'dynamic-drive', 'elegant-minimal'];

  function normalizeStyle(music) {
    if (!music || music === 'none') return 'none';
    if (music === 'bright') return 'upbeat-pulse';
    var i;
    for (i = 0; i < bgmStyles.length; i++) {
      if (bgmStyles[i].id === music) return bgmStyles[i].id;
    }
    return 'ambient-tech';
  }

  function getStyle(music) {
    var norm = normalizeStyle(music);
    var i;
    if (norm === 'none') return null;
    for (i = 0; i < bgmStyles.length; i++) {
      if (bgmStyles[i].id === norm) return bgmStyles[i];
    }
    return bgmStyles[0];
  }

  function midiToHz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function synthesizeStereoBuffer(frameCount, styleId, sampleRate) {
    var rate = sampleRate || SAMPLE_RATE;
    var stereo = new Float32Array(frameCount * 2);
    var style = getStyle(styleId);
    if (!style || frameCount <= 0) return { stereo: stereo, bpm: null, styleId: 'none' };

    var bpm = style.bpm;
    var beat = 60 / bpm;
    var bar = beat * 4;
    var totalSeconds = frameCount / rate;
    var seed = 88482026;

    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return (seed / 4294967296) * 2 - 1;
    }

    function addNote(at, duration, gain, pan, oscFn) {
      var start = Math.max(0, Math.round(at * rate));
      var count = Math.min(Math.round(duration * rate), frameCount - start);
      if (count <= 0) return;
      var leftGain = Math.sqrt((1 - pan) / 2) * gain;
      var rightGain = Math.sqrt((1 + pan) / 2) * gain;
      var i, t, val, idx;
      for (i = 0; i < count; i++) {
        t = i / rate;
        val = oscFn(t);
        idx = (start + i) * 2;
        stereo[idx] += val * leftGain;
        stereo[idx + 1] += val * rightGain;
      }
    }

    var at = 0, barIdx = 0;
    while (at < totalSeconds) {
      var chord = style.chords[barIdx % style.chords.length];
      var rootNote = style.roots[barIdx % style.roots.length];
      var bassHz = midiToHz(rootNote);

      if (style.id === 'ambient-tech') {
        chord.forEach(function (note, nIdx) {
          var hz = midiToHz(note);
          addNote(at + nIdx * 0.04, bar * 1.05, 0.018, -0.35 + nIdx * 0.23, function (t) {
            var env = Math.min(1, t / 0.18) * Math.exp(-t * 0.65);
            var fundamental = Math.sin(2 * Math.PI * hz * t);
            var warmHarmonic = 0.35 * Math.sin(2 * Math.PI * hz * 2 * t + 0.4 * Math.sin(2 * Math.PI * 1.5 * t));
            return (fundamental + warmHarmonic) * env;
          });
        });
        addNote(at, bar * 0.92, 0.032, 0, function (t) {
          var env = Math.min(1, t / 0.04) * Math.exp(-t * 1.2);
          return (Math.sin(2 * Math.PI * bassHz * t) + 0.25 * Math.sin(2 * Math.PI * bassHz * 2 * t)) * env;
        });
        var stepIdx;
        for (stepIdx = 0; stepIdx < 8; stepIdx++) {
          var arpNote = style.arp[(barIdx * 2 + stepIdx) % style.arp.length];
          var arpHz = midiToHz(arpNote);
          addNote(at + stepIdx * (beat / 2), beat * 0.85, 0.013, (stepIdx % 2 === 0 ? -0.28 : 0.28), function (t) {
            var env = Math.min(1, t / 0.01) * Math.exp(-t * 5.2);
            return (Math.sin(2 * Math.PI * arpHz * t) + 0.22 * Math.sin(2 * Math.PI * arpHz * 3 * t) * Math.exp(-t * 12)) * env;
          });
        }
      } else if (style.id === 'upbeat-pulse') {
        chord.forEach(function (note, nIdx) {
          var hz = midiToHz(note);
          addNote(at + nIdx * 0.015, bar * 0.92, 0.016, -0.4 + nIdx * 0.26, function (t) {
            var env = Math.min(1, t / 0.012) * Math.exp(-t * 1.65);
            return (Math.sin(2 * Math.PI * hz * t) + 0.4 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * hz * 3 * t)) * env;
          });
        });
        [0, 1.5, 2, 3.5].forEach(function (off) {
          addNote(at + off * beat, 0.45, 0.038, 0, function (t) {
            return Math.sin(2 * Math.PI * bassHz * t) * Math.exp(-t * 6.5) * Math.min(1, t / 0.008);
          });
        });
        [0, 2].forEach(function (off) {
          addNote(at + off * beat, 0.22, 0.036, 0, function (t) {
            return Math.sin(2 * Math.PI * (52 * t + 1.15 * (1 - Math.exp(-t * 50)))) * Math.exp(-t * 21);
          });
        });
        var pIdx;
        for (pIdx = 0; pIdx < 8; pIdx++) {
          var mNote = style.arp[(barIdx + pIdx) % style.arp.length];
          var mHz = midiToHz(mNote);
          addNote(at + pIdx * (beat / 2), 0.35, 0.012, (pIdx % 2 ? 0.32 : -0.32), function (t) {
            var env = Math.min(1, t / 0.006) * Math.exp(-t * 8.5);
            return (Math.sin(2 * Math.PI * mHz * t) + 0.3 * Math.sin(2 * Math.PI * mHz * 4 * t) * Math.exp(-t * 24)) * env;
          });
        }
      } else if (style.id === 'dynamic-drive') {
        chord.forEach(function (note, nIdx) {
          var hz = midiToHz(note);
          addNote(at, bar * 0.96, 0.015, -0.42 + nIdx * 0.28, function (t) {
            var env = Math.min(1, t / 0.05) * Math.exp(-t * 1.1);
            return (Math.sin(2 * Math.PI * hz * t) + 0.35 * Math.sin(2 * Math.PI * hz * 2 * t) + 0.15 * Math.sin(2 * Math.PI * hz * 3 * t)) * env;
          });
        });
        var bStep;
        for (bStep = 0; bStep < 8; bStep++) {
          var octaveShift = (bStep % 2 === 1) ? 2 : 1;
          addNote(at + bStep * (beat / 2), beat * 0.44, 0.036, 0, function (t) {
            var env = Math.min(1, t / 0.006) * Math.exp(-t * 8.0);
            var f = bassHz * octaveShift;
            return (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 14)) * env;
          });
        }
        [0, 1, 2, 3].forEach(function (off) {
          addNote(at + off * beat, 0.2, 0.042, 0, function (t) {
            return Math.sin(2 * Math.PI * (50 * t + 1.3 * (1 - Math.exp(-t * 58)))) * Math.exp(-t * 22);
          });
        });
        [1, 3].forEach(function (off) {
          addNote(at + off * beat, 0.12, 0.012, 0.1, function (t) {
            return random() * Math.exp(-t * 42);
          });
        });
        var dIdx;
        for (dIdx = 0; dIdx < 8; dIdx++) {
          var dNote = style.arp[(barIdx * 3 + dIdx) % style.arp.length];
          var dHz = midiToHz(dNote);
          addNote(at + dIdx * (beat / 2), 0.3, 0.011, (dIdx % 2 ? -0.35 : 0.35), function (t) {
            return Math.sin(2 * Math.PI * dHz * t) * Math.min(1, t / 0.008) * Math.exp(-t * 7.5);
          });
        }
      } else {
        chord.forEach(function (note, nIdx) {
          var hz = midiToHz(note);
          addNote(at + nIdx * (beat * 0.5), bar * 0.95, 0.02, -0.3 + nIdx * 0.2, function (t) {
            var env = Math.min(1, t / 0.025) * Math.exp(-t * 1.15);
            var bell = 0.28 * Math.sin(2 * Math.PI * hz * 2 * t) * Math.exp(-t * 3.5);
            return (Math.sin(2 * Math.PI * hz * t) + bell) * env;
          });
        });
        addNote(at, bar * 1.04, 0.028, 0, function (t) {
          var env = Math.min(1, t / 0.32) * Math.exp(-t * 0.55);
          return (Math.sin(2 * Math.PI * bassHz * t) + 0.3 * Math.sin(2 * Math.PI * (bassHz * 1.5) * t)) * env;
        });
        var eIdx;
        for (eIdx = 0; eIdx < 4; eIdx++) {
          var eNote = style.arp[(barIdx * 2 + eIdx) % style.arp.length];
          var eHz = midiToHz(eNote);
          addNote(at + (eIdx + 0.5) * beat, beat * 1.3, 0.014, (eIdx % 2 === 0 ? 0.22 : -0.22), function (t) {
            var env = Math.min(1, t / 0.02) * Math.exp(-t * 2.4);
            return (Math.sin(2 * Math.PI * eHz * t) + 0.18 * Math.sin(2 * Math.PI * eHz * 2 * t)) * env;
          });
        }
      }

      at += bar;
      barIdx++;
    }

    var delaySamples = Math.round(0.26 * rate);
    var k;
    for (k = delaySamples; k < frameCount; k++) {
      stereo[k * 2] += stereo[(k - delaySamples) * 2 + 1] * 0.18;
      stereo[k * 2 + 1] += stereo[(k - delaySamples) * 2] * 0.18;
    }

    var lpfL = 0, lpfR = 0, alpha = 0.34;
    for (k = 0; k < frameCount; k++) {
      lpfL += alpha * (stereo[k * 2] - lpfL);
      lpfR += alpha * (stereo[k * 2 + 1] - lpfR);
      stereo[k * 2] = lpfL;
      stereo[k * 2 + 1] = lpfR;
    }

    return { stereo: stereo, bpm: bpm, styleId: style.id };
  }

  var webAudioState = { ctx: null, source: null, gainNode: null, styleId: null };

  function stopPreviewBgm() {
    if (webAudioState.source) {
      try { webAudioState.source.stop(); } catch (_) {}
      try { webAudioState.source.disconnect(); } catch (_) {}
      webAudioState.source = null;
    }
    if (webAudioState.gainNode) {
      try { webAudioState.gainNode.disconnect(); } catch (_) {}
      webAudioState.gainNode = null;
    }
  }

  async function startPreviewBgm(styleId, hasVoice) {
    stopPreviewBgm();
    var style = getStyle(styleId);
    if (!style || typeof window === 'undefined') return;
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!webAudioState.ctx) webAudioState.ctx = new AudioCtx();
    var ctx = webAudioState.ctx;
    if (ctx.state === 'suspended') await ctx.resume();
    var loopSeconds = (60 / style.bpm) * 16;
    var rate = ctx.sampleRate || 48000;
    var frames = Math.round(loopSeconds * rate);
    var synth = synthesizeStereoBuffer(frames, style.id, rate);
    var buffer = ctx.createBuffer(2, frames, rate);
    var left = buffer.getChannelData(0);
    var right = buffer.getChannelData(1);
    var i;
    for (i = 0; i < frames; i++) {
      left[i] = synth.stereo[i * 2];
      right[i] = synth.stereo[i * 2 + 1];
    }
    var source = ctx.createBufferSource();
    var gainNode = ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.value = hasVoice ? 0.16 : 0.48;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
    webAudioState.source = source;
    webAudioState.gainNode = gainNode;
    webAudioState.styleId = style.id;
  }

  return {
    SAMPLE_RATE: SAMPLE_RATE,
    bgmStyles: bgmStyles,
    allowedIds: allowedIds,
    normalizeStyle: normalizeStyle,
    getStyle: getStyle,
    synthesizeStereoBuffer: synthesizeStereoBuffer,
    startPreviewBgm: startPreviewBgm,
    stopPreviewBgm: stopPreviewBgm
  };
}));
