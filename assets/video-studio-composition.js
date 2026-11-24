(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KHVideoComposition = api;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  var transforms = ['x', 'y', 'scale', 'rotation', 'opacity', 'reveal'];
  var visualThemeIds = ['professional', 'vibrant', 'dynamic', 'elegant'];
  var paths = new Map();
  function fail(message) { throw new Error('画面编排：' + message); }
  function object(value, allowed, label) {
    var unsupported;
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label + '必须是对象。');
    unsupported = Object.keys(value).filter(function (key) { return allowed.indexOf(key) < 0; });
    if (unsupported.length) fail(label + '包含无效字段：' + unsupported.join(', ') + '。');
  }
  function number(value, min, max, label) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
      fail(label + '超出范围（收到' + String(value).slice(0, 40) + '，允许' + min + '–' + max + '）。位置与尺寸使用比例，不是像素。');
    return value;
  }
  function color(value) {
    if (typeof value !== 'string' || !/^#[a-f0-9]{6}(?:[a-f0-9]{2})?$/i.test(value)) fail('颜色须为六位或八位十六进制值。');
    return value;
  }
  function isLightColor(hex) {
    var raw = String(hex || '#11141C').replace('#', '');
    var r = parseInt(raw.slice(0, 2), 16) || 0;
    var g = parseInt(raw.slice(2, 4), 16) || 0;
    var b = parseInt(raw.slice(4, 6), 16) || 0;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  }
  function readFrames(layer, result) {
    var last = -1;
    if (layer.ease !== undefined) {
      if (['linear', 'smooth'].indexOf(layer.ease) < 0) fail('插值方式无效。');
      result.ease = layer.ease;
    }
    if (layer.keyframes !== undefined) {
      if (!Array.isArray(layer.keyframes) || layer.keyframes.length > 32) fail('每层最多32个关键帧。');
      result.keyframes = layer.keyframes.map(function (frame) {
        var entry;
        object(frame, ['at'].concat(transforms), '关键帧');
        entry = { at: number(frame.at, 0, 1, '关键帧时间') };
        if (entry.at <= last) fail('关键帧时间须严格递增。');
        last = entry.at;
        transforms.forEach(function (key) {
          var limits = { x: [-2, 3], y: [-2, 3], scale: [.01, 8], rotation: [-720, 720], opacity: [0, 1], reveal: [0, 1] }[key];
          if (frame[key] !== undefined) entry[key] = number(frame[key], limits[0], limits[1], key);
        });
        return entry;
      });
    }
  }
  function validate(value) {
    var count = 0, result;
    object(value, ['background', 'visualTheme', 'layers', 'camera'], '画面');
    if (!Array.isArray(value.layers) || !value.layers.length || value.layers.length > 64) fail('需要1–64个图层。');
    function readLayer(layer, depth) {
      var result;
      count++;
      if (count > 64 || depth > 8) fail('最多64个图层、8级组合。');
      object(layer, ['type', 'x', 'y', 'width', 'height', 'rotation', 'opacity', 'scale', 'fill', 'stroke', 'strokeWidth',
        'radius', 'text', 'bind', 'fontSize', 'fontFamily', 'weight', 'align', 'lineHeight', 'fit', 'focusX', 'focusY', 'keyframes', 'ease',
        'path', 'children', 'reveal'], '图层');
      if (['image', 'text', 'rect', 'ellipse', 'line', 'path', 'group', 'captions'].indexOf(layer.type) < 0) fail('图层类型不受支持。');
      result = { type: layer.type, x: number(layer.x, -2, 3, 'x'), y: number(layer.y, -2, 3, 'y'),
        width: number(layer.width, .001, 4, '宽度'), height: number(layer.height, .001, 4, '高度') };
      ['rotation', 'opacity', 'scale', 'strokeWidth', 'radius', 'focusX', 'focusY', 'reveal'].forEach(function (key) {
        var limits = { rotation: [-720, 720], opacity: [0, 1], scale: [.01, 8], strokeWidth: [0, 80],
          radius: [0, 1], focusX: [0, 1], focusY: [0, 1], reveal: [0, 1] }[key];
        if (layer[key] !== undefined) result[key] = number(layer[key], limits[0], limits[1], key);
      });
      ['fill', 'stroke'].forEach(function (key) { if (layer[key] !== undefined) result[key] = color(layer[key]); });
      if (layer.type !== 'image' && layer.type !== 'group' && !result.fill) fail('文字和图形需要fill颜色。');
      if (layer.type === 'path') {
        if (typeof layer.path !== 'string' || layer.path.length > 20000 || !/^[Mm][MmLlHhVvCcSsQqTtAaZz\d\s.,eE+-]+$/.test(layer.path))
          fail('路径须为本地SVG路径数据，不能含代码、URL或标记。');
        result.path = layer.path;
      } else if (layer.path !== undefined) fail('只有path图层能包含路径。');
      if (layer.type === 'group') {
        if (!Array.isArray(layer.children) || !layer.children.length) fail('组合需要子图层。');
        result.children = layer.children.map(function (child) { return readLayer(child, depth + 1); });
      } else if (layer.children !== undefined) fail('只有group图层能包含子图层。');
      if (layer.type === 'text' || layer.type === 'captions') {
        result.fontSize = number(layer.fontSize, 16, 300, '字号');
        if (layer.bind !== undefined && layer.bind !== 'screenText') fail('只能绑定screenText。');
        if (layer.type === 'text' && layer.bind !== 'screenText' &&
          (typeof layer.text !== 'string' || !layer.text.trim() || layer.text.length > 500)) fail('文字图层需要有效文字。');
        if (layer.text !== undefined) {
          if (typeof layer.text !== 'string' || layer.text.length > 500) fail('文字不能超过500字。');
          result.text = layer.text;
        }
        if (layer.bind) result.bind = layer.bind;
        if (layer.weight !== undefined) result.weight = number(layer.weight, 100, 900, '字重');
        if (layer.lineHeight !== undefined) result.lineHeight = number(layer.lineHeight, .8, 3, '行距');
        if (layer.align !== undefined) {
          if (['left', 'center', 'right'].indexOf(layer.align) < 0) fail('文字对齐方式无效。');
          result.align = layer.align;
        }
        if (layer.fontFamily !== undefined) {
          if (typeof layer.fontFamily !== 'string' || !/^[\p{L}\d ,'"-]{1,120}$/u.test(layer.fontFamily)) fail('字体名称无效。');
          result.fontFamily = layer.fontFamily;
        }
      }
      if (layer.fit !== undefined) {
        if (['cover', 'contain'].indexOf(layer.fit) < 0) fail('图片适配方式无效。');
        result.fit = layer.fit;
      }
      readFrames(layer, result);
      return result;
    }
    result = { background: color(value.background), layers: value.layers.map(function (layer) { return readLayer(layer, 0); }) };
    if (value.visualTheme !== undefined) {
      if (visualThemeIds.indexOf(value.visualTheme) < 0) fail('视觉美学风格不受支持。');
      result.visualTheme = value.visualTheme;
    }
    if (value.camera !== undefined) {
      object(value.camera, ['x', 'y', 'scale', 'rotation', 'keyframes', 'ease'], '整体运镜');
      result.camera = { x: value.camera.x === undefined ? .5 : number(value.camera.x, -2, 3, '镜头x'),
        y: value.camera.y === undefined ? .5 : number(value.camera.y, -2, 3, '镜头y') };
      if (value.camera.scale !== undefined) result.camera.scale = number(value.camera.scale, .01, 8, '镜头缩放');
      if (value.camera.rotation !== undefined) result.camera.rotation = number(value.camera.rotation, -720, 720, '镜头旋转');
      readFrames(value.camera, result.camera);
    }
    return result;
  }
  function state(layer, progress) {
    var before = { at: 0, x: layer.x, y: layer.y, scale: layer.scale === undefined ? 1 : layer.scale,
      opacity: layer.opacity === undefined ? 1 : layer.opacity, rotation: layer.rotation || 0,
      reveal: layer.reveal === undefined ? 1 : layer.reveal };
    var frames = layer.keyframes || [], after, ratio, i, result = {};
    for (i = 0; i < frames.length; i++) {
      after = Object.assign({}, before, frames[i]);
      if (progress < after.at) {
        ratio = (progress - before.at) / (after.at - before.at);
        ratio = Math.max(0, Math.min(1, ratio));
        if (layer.ease !== 'linear') ratio = ratio * ratio * (3 - 2 * ratio);
        transforms.forEach(function (key) { result[key] = before[key] + (after[key] - before[key]) * ratio; });
        return result;
      }
      before = after;
    }
    return before;
  }
  function lines(context, value, width) {
    var result = [];
    value.split('\n').forEach(function (paragraph) {
      var line = '';
      Array.from(paragraph).forEach(function (character) {
        if (line && context.measureText(line + character).width > width) { result.push(line); line = ''; }
        line += character;
      });
      result.push(line);
    });
    return result;
  }
  function fitText(context, value, width, height, fontSize, lineHeightRatio, weight, family) {
    var currentFont = fontSize;
    var ratio = lineHeightRatio || 1.28;
    var wrapped, leading;
    while (currentFont >= 22) {
      context.font = (weight || 600) + ' ' + currentFont + 'px ' + (family || '"PingFang SC", "Segoe UI", sans-serif');
      wrapped = lines(context, value, width);
      leading = currentFont * ratio;
      if (wrapped.length * leading <= height + 2) return { font: currentFont, leading: leading, wrapped: wrapped };
      currentFont -= 2;
    }
    context.font = (weight || 600) + ' ' + currentFont + 'px ' + (family || '"PingFang SC", "Segoe UI", sans-serif');
    wrapped = lines(context, value, width);
    leading = currentFont * ratio;
    if (wrapped.length * leading > height + 2) fail('文字超出图层高度，请调整字号、文字或构图。');
    return { font: currentFont, leading: leading, wrapped: wrapped };
  }
  function nodes(composition) {
    var result = [];
    function visit(layers) {
      layers.forEach(function (layer) {
        result.push(layer);
        if (layer.type === 'group') visit(layer.children);
      });
    }
    visit(composition.layers);
    return result;
  }
  function drawAmbientEnvironment(context, baseBg, themeId, tSec) {
    var light = isLightColor(baseBg);
    var theme = themeId || 'professional';
    var baseGrad = context.createLinearGradient(0, 0, 1920, 1080);
    var i, x, y, r, g2, pulse, waveY;
    context.save();
    if (theme === 'vibrant') {
      if (light) {
        baseGrad.addColorStop(0, '#FFF6ED');
        baseGrad.addColorStop(0.5, baseBg);
        baseGrad.addColorStop(1, '#ECFEFF');
      } else {
        baseGrad.addColorStop(0, '#131836');
        baseGrad.addColorStop(0.52, baseBg);
        baseGrad.addColorStop(1, '#1E112A');
      }
    } else if (theme === 'dynamic') {
      if (light) {
        baseGrad.addColorStop(0, '#EFF6FF');
        baseGrad.addColorStop(0.5, baseBg);
        baseGrad.addColorStop(1, '#F0FDF4');
      } else {
        baseGrad.addColorStop(0, '#070B19');
        baseGrad.addColorStop(0.5, baseBg);
        baseGrad.addColorStop(1, '#0F172A');
      }
    } else if (theme === 'elegant') {
      if (light) {
        baseGrad.addColorStop(0, '#FDF8F3');
        baseGrad.addColorStop(0.5, baseBg);
        baseGrad.addColorStop(1, '#F5F0FF');
      } else {
        baseGrad.addColorStop(0, '#161124');
        baseGrad.addColorStop(0.5, baseBg);
        baseGrad.addColorStop(1, '#1E162B');
      }
    } else {
      if (light) {
        baseGrad.addColorStop(0, '#F8FAFC');
        baseGrad.addColorStop(0.55, baseBg);
        baseGrad.addColorStop(1, '#EEF2F9');
      } else {
        baseGrad.addColorStop(0, '#0B1120');
        baseGrad.addColorStop(0.55, baseBg);
        baseGrad.addColorStop(1, '#131C31');
      }
    }
    context.fillStyle = baseGrad;
    context.fillRect(0, 0, 1920, 1080);

    var blobs = theme === 'vibrant'
      ? [
          { cx: 0.22, cy: 0.26, r: 580, color: light ? 'rgba(249, 115, 22, 0.22)' : 'rgba(249, 115, 22, 0.28)', speed: 0.9 },
          { cx: 0.82, cy: 0.72, r: 640, color: light ? 'rgba(16, 185, 129, 0.20)' : 'rgba(20, 184, 166, 0.26)', speed: 1.1 },
          { cx: 0.56, cy: 0.22, r: 490, color: light ? 'rgba(236, 72, 153, 0.16)' : 'rgba(236, 72, 153, 0.22)', speed: 0.75 }
        ]
      : theme === 'dynamic'
      ? [
          { cx: 0.18, cy: 0.30, r: 620, color: light ? 'rgba(56, 189, 248, 0.24)' : 'rgba(56, 189, 248, 0.30)', speed: 1.35 },
          { cx: 0.84, cy: 0.66, r: 660, color: light ? 'rgba(99, 102, 241, 0.20)' : 'rgba(139, 92, 246, 0.28)', speed: 1.15 },
          { cx: 0.50, cy: 0.84, r: 520, color: light ? 'rgba(14, 165, 233, 0.18)' : 'rgba(6, 182, 212, 0.24)', speed: 1.5 }
        ]
      : theme === 'elegant'
      ? [
          { cx: 0.26, cy: 0.28, r: 650, color: light ? 'rgba(217, 119, 6, 0.16)' : 'rgba(245, 158, 11, 0.22)', speed: 0.55 },
          { cx: 0.78, cy: 0.72, r: 680, color: light ? 'rgba(168, 85, 247, 0.15)' : 'rgba(192, 132, 252, 0.22)', speed: 0.65 },
          { cx: 0.54, cy: 0.42, r: 540, color: light ? 'rgba(244, 63, 94, 0.12)' : 'rgba(251, 113, 133, 0.18)', speed: 0.5 }
        ]
      : [
          { cx: 0.20, cy: 0.24, r: 620, color: light ? 'rgba(37, 99, 235, 0.15)' : 'rgba(59, 130, 246, 0.24)', speed: 0.65 },
          { cx: 0.82, cy: 0.76, r: 660, color: light ? 'rgba(14, 165, 233, 0.14)' : 'rgba(14, 165, 233, 0.20)', speed: 0.75 },
          { cx: 0.62, cy: 0.22, r: 480, color: light ? 'rgba(99, 102, 241, 0.11)' : 'rgba(99, 102, 241, 0.18)', speed: 0.55 }
        ];

    blobs.forEach(function (b, idx) {
      var bx = (b.cx + 0.06 * Math.sin(tSec * b.speed + idx * 2.1)) * 1920;
      var by = (b.cy + 0.05 * Math.cos(tSec * b.speed * 0.85 + idx * 1.7)) * 1080;
      var br = b.r * (1 + 0.08 * Math.sin(tSec * 1.2 + idx));
      var rad = context.createRadialGradient(bx, by, 10, bx, by, br);
      rad.addColorStop(0, b.color);
      rad.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = rad;
      context.fillRect(0, 0, 1920, 1080);
    });

    if (theme === 'professional') {
      context.strokeStyle = light ? 'rgba(37, 99, 235, 0.065)' : 'rgba(148, 163, 184, 0.075)';
      context.lineWidth = 1;
      for (x = 96; x < 1920; x += 96) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 1080); context.stroke();
      }
      for (y = 96; y < 1080; y += 96) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(1920, y); context.stroke();
      }
      for (i = 0; i < 12; i++) {
        x = ((i * 173 + tSec * 22) % 1840) + 40;
        y = ((i * 97 + Math.sin(tSec * 0.8 + i) * 28) % 980) + 50;
        r = 3.5 + 1.8 * Math.sin(tSec * 1.8 + i);
        context.fillStyle = light ? 'rgba(37, 99, 235, 0.22)' : 'rgba(96, 165, 250, 0.34)';
        context.beginPath(); context.arc(x, y, r, 0, Math.PI * 2); context.fill();
      }
    } else if (theme === 'vibrant') {
      for (i = 0; i < 16; i++) {
        x = (i * 127 + Math.sin(tSec * 1.1 + i * 0.9) * 45 + 60) % 1900;
        y = (1080 - ((tSec * (28 + (i % 4) * 8) + i * 73) % 1120));
        r = 12 + (i % 5) * 7 + 4 * Math.sin(tSec * 2.2 + i);
        context.fillStyle = i % 2 === 0
          ? (light ? 'rgba(249, 115, 22, 0.14)' : 'rgba(251, 146, 60, 0.20)')
          : (light ? 'rgba(16, 185, 129, 0.14)' : 'rgba(45, 212, 191, 0.20)');
        context.beginPath(); context.arc(x, y, r, 0, Math.PI * 2); context.fill();
        context.strokeStyle = light ? 'rgba(249, 115, 22, 0.22)' : 'rgba(255, 255, 255, 0.20)';
        context.lineWidth = 1.5;
        context.stroke();
      }
    } else if (theme === 'dynamic') {
      for (i = 0; i < 3; i++) {
        context.beginPath();
        context.strokeStyle = i === 0
          ? (light ? 'rgba(14, 165, 233, 0.22)' : 'rgba(56, 189, 248, 0.30)')
          : i === 1
          ? (light ? 'rgba(99, 102, 241, 0.18)' : 'rgba(168, 85, 247, 0.25)')
          : (light ? 'rgba(16, 185, 129, 0.16)' : 'rgba(45, 212, 191, 0.22)');
        context.lineWidth = 2.5;
        for (x = 0; x <= 1920; x += 32) {
          waveY = 890 + i * 28 + Math.sin(x * 0.0045 + tSec * (2.2 + i * 0.5) + i) * (24 + i * 8);
          if (x === 0) context.moveTo(x, waveY);
          else context.lineTo(x, waveY);
        }
        context.stroke();
      }
      for (i = 0; i < 44; i++) {
        pulse = Math.abs(Math.sin(tSec * 4.2 + i * 0.45)) * Math.abs(Math.cos(tSec * 2.1 - i * 0.22));
        r = 8 + pulse * 38;
        x = 120 + i * 38;
        context.fillStyle = light ? 'rgba(2, 132, 199, 0.18)' : 'rgba(56, 189, 248, 0.26)';
        context.beginPath();
        context.roundRect(x, 1056 - r, 14, r, 6);
        context.fill();
      }
    } else if (theme === 'elegant') {
      for (i = 0; i < 18; i++) {
        x = (i * 113 + Math.sin(tSec * 0.55 + i) * 52 + 80) % 1880;
        y = (i * 67 + Math.cos(tSec * 0.48 + i * 1.3) * 42 + 70) % 1020;
        r = 18 + (i % 4) * 14 + 6 * Math.sin(tSec * 1.4 + i);
        g2 = context.createRadialGradient(x, y, 2, x, y, r);
        g2.addColorStop(0, light ? 'rgba(217, 119, 6, 0.24)' : 'rgba(253, 224, 71, 0.28)');
        g2.addColorStop(0.5, light ? 'rgba(168, 85, 247, 0.12)' : 'rgba(192, 132, 252, 0.16)');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = g2;
        context.beginPath(); context.arc(x, y, r, 0, Math.PI * 2); context.fill();
      }
    }
    context.restore();
  }
  function draw(context, scene, progress, image, cues, duration) {
    var composition = scene.composition, camera;
    var tSec = (Number.isFinite(progress) ? progress : 0.5) * (Number.isFinite(duration) && duration > 0 ? duration : 6);
    var visualTheme = (composition && composition.visualTheme) || (scene && scene.visualTheme) || 'professional';
    context.save();
    try {
      drawAmbientEnvironment(context, composition.background, visualTheme, tSec);
      if (composition.camera) {
        camera = state(composition.camera, progress);
        context.translate(960, 540); context.scale(camera.scale, camera.scale);
        context.rotate(-camera.rotation * Math.PI / 180); context.translate(-camera.x * 1920, -camera.y * 1080);
      }
      function drawLayers(layers, pW, pH) {
        var cW = pW || 1920, cH = pH || 1080;
        layers.forEach(function (layer) {
        var pose = state(layer, progress), width = layer.width * cW, height = layer.height * cH;
        var text, fitted, x, scale, imageWidth, imageHeight, cue, radius, data, element, pathScale, padX, padY, pillW, pillH;
        if (pose.opacity <= 0) return;
        context.save();
        try {
          context.translate(pose.x * cW, pose.y * cH);
          context.rotate(pose.rotation * Math.PI / 180);
          context.scale(pose.scale, pose.scale);
          context.globalAlpha *= pose.opacity;
          if (layer.fill) context.fillStyle = layer.fill;
          if (layer.stroke) context.strokeStyle = layer.stroke;
          context.lineWidth = layer.strokeWidth || 0;
          if (layer.type === 'group') {
            context.translate(-width / 2, -height / 2);
            drawLayers(layer.children, width, height);
          } else if (layer.type === 'path') {
            if (typeof document === 'undefined' || typeof Path2D === 'undefined') return;
            data = paths.get(layer.path); pathScale = Math.max(width, height) / 1000;
            if (!data) {
              element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              element.setAttribute('d', layer.path);
              data = { path: new Path2D(layer.path), length: element.getTotalLength() };
              if (!Number.isFinite(data.length)) fail('路径长度无效。');
              if (paths.size >= 128) paths.delete(paths.keys().next().value);
              paths.set(layer.path, data);
            }
            context.translate(-width / 2, -height / 2); context.scale(width / 1000, height / 1000);
            if (pose.reveal >= 1) context.fill(data.path);
            if (layer.stroke && layer.strokeWidth) {
              context.lineWidth = layer.strokeWidth / pathScale;
              context.setLineDash([data.length, data.length]);
              context.lineDashOffset = data.length * (1 - pose.reveal);
              context.stroke(data.path);
            }
          } else if (layer.type === 'image') {
            if (!image || !image.naturalWidth) return;
            scale = (layer.fit === 'contain' ? Math.min : Math.max)(width / image.naturalWidth, height / image.naturalHeight);
            imageWidth = image.naturalWidth * scale; imageHeight = image.naturalHeight * scale;
            context.beginPath(); context.rect(-width / 2, -height / 2, width, height); context.clip();
            context.drawImage(image, -width / 2 + (width - imageWidth) * (layer.focusX === undefined ? .5 : layer.focusX),
              -height / 2 + (height - imageHeight) * (layer.focusY === undefined ? .5 : layer.focusY), imageWidth, imageHeight);
          } else if (layer.type === 'text' || layer.type === 'captions') {
            cue = layer.type === 'captions' && cues && cues.find(function (item) { return progress * duration >= item.start && progress * duration < item.start + item.duration; });
            text = layer.type === 'captions' ? (cue ? cue.text : (cues && cues.length ? '' : (scene.narration || '').slice(0, 42))) : layer.bind === 'screenText' ? scene.screenText : layer.text;
            if (!text) return;
            fitted = fitText(context, text, width, height, layer.fontSize, layer.lineHeight || 1.28, layer.weight || 600, layer.fontFamily);
            if (layer.type === 'captions') {
              padX = 36; padY = 18;
              pillW = Math.min(width + padX * 2, 1760);
              pillH = fitted.wrapped.length * fitted.leading + padY * 2;
              context.save();
              context.fillStyle = isLightColor(composition.background) ? 'rgba(15, 23, 42, 0.84)' : 'rgba(9, 13, 24, 0.82)';
              context.strokeStyle = isLightColor(composition.background) ? 'rgba(37, 99, 235, 0.38)' : 'rgba(148, 163, 184, 0.32)';
              context.lineWidth = 2;
              context.beginPath();
              context.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 18);
              context.fill();
              context.stroke();
              context.restore();
              context.fillStyle = '#F8FAFC';
            }
            context.textAlign = layer.align || 'left'; context.textBaseline = 'middle';
            x = context.textAlign === 'center' ? 0 : context.textAlign === 'right' ? width / 2 : -width / 2;
            fitted.wrapped.forEach(function (line, index) { context.fillText(line, x, (index - (fitted.wrapped.length - 1) / 2) * fitted.leading); });
          } else {
            context.beginPath();
            if (layer.type === 'ellipse') context.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
            else if (layer.type === 'line') {
              context.moveTo(-width / 2, -height / 2);
              context.lineTo(-width / 2 + width * pose.reveal, -height / 2 + height * pose.reveal);
            }
            else {
              radius = Math.min(width, height) * (layer.radius || 0);
              context.roundRect(-width / 2, -height / 2, width, height, radius);
            }
            if (layer.type === 'line') {
              context.strokeStyle = layer.fill; context.lineWidth = layer.strokeWidth || 4; context.stroke();
            } else {
              context.save();
              if (width > 120 && height > 60) {
                context.shadowColor = 'rgba(0, 0, 0, 0.22)';
                context.shadowBlur = 24;
                context.shadowOffsetY = 8;
              }
              context.fill();
              context.restore();
              if (layer.stroke && layer.strokeWidth) context.stroke();
            }
          }
        } finally { context.restore(); }
        });
      }
      drawLayers(composition.layers);
    } finally { context.restore(); }
  }
  return { validate: validate, state: state, draw: draw, nodes: nodes, visualThemeIds: visualThemeIds };
}));
