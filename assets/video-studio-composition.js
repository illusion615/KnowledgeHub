(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KHVideoComposition = api;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  var transforms = ['x', 'y', 'scale', 'rotation', 'opacity', 'reveal'];
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
    object(value, ['background', 'layers', 'camera'], '画面');
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
  function draw(context, scene, progress, image, cues, duration) {
    var composition = scene.composition, camera;
    context.save();
    try {
      context.fillStyle = composition.background;
      context.fillRect(0, 0, 1920, 1080);
      if (composition.camera) {
        camera = state(composition.camera, progress);
        context.translate(960, 540); context.scale(camera.scale, camera.scale);
        context.rotate(-camera.rotation * Math.PI / 180); context.translate(-camera.x * 1920, -camera.y * 1080);
      }
      function drawLayers(layers) {
        layers.forEach(function (layer) {
        var pose = state(layer, progress), width = layer.width * 1920, height = layer.height * 1080;
        var text, wrapped, font, leading, x, scale, imageWidth, imageHeight, cue, radius, data, element, pathScale;
        if (pose.opacity <= 0) return;
        context.save();
        try {
          context.translate(pose.x * 1920, pose.y * 1080);
          context.rotate(pose.rotation * Math.PI / 180);
          context.scale(pose.scale, pose.scale);
          context.globalAlpha *= pose.opacity;
          if (layer.fill) context.fillStyle = layer.fill;
          if (layer.stroke) context.strokeStyle = layer.stroke;
          context.lineWidth = layer.strokeWidth || 0;
          if (layer.type === 'group') {
            context.translate(-width / 2, -height / 2);
            context.scale(width / 1920, height / 1080);
            drawLayers(layer.children);
          } else if (layer.type === 'path') {
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
            cue = layer.type === 'captions' && cues.find(function (item) { return progress * duration >= item.start && progress * duration < item.start + item.duration; });
            text = layer.type === 'captions' ? cue ? cue.text : '' : layer.bind === 'screenText' ? scene.screenText : layer.text;
            if (!text) return;
            font = layer.fontSize; leading = font * (layer.lineHeight || 1.25);
            context.font = (layer.weight || 600) + ' ' + font + 'px ' + (layer.fontFamily || '"PingFang SC", "Segoe UI", sans-serif');
            wrapped = lines(context, text, width);
            if (wrapped.length * leading > height + 1) fail('文字超出图层高度，请调整字号、文字或构图。');
            context.textAlign = layer.align || 'left'; context.textBaseline = 'middle';
            x = context.textAlign === 'center' ? 0 : context.textAlign === 'right' ? width / 2 : -width / 2;
            wrapped.forEach(function (line, index) { context.fillText(line, x, (index - (wrapped.length - 1) / 2) * leading); });
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
              context.fill();
              if (layer.stroke && layer.strokeWidth) context.stroke();
            }
          }
        } finally { context.restore(); }
        });
      }
      drawLayers(composition.layers);
    } finally { context.restore(); }
  }
  return { validate: validate, state: state, draw: draw, nodes: nodes };
}));
