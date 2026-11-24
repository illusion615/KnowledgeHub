/**
 * Article Image & Inline SVG Figure Lightbox
 * Click any article image or `.sr-figure-svg` / `figure svg` to view a crisp full-size overlay.
 * Resolves live CSS custom properties (light/dark theme + active zh/en language) on SVG clone.
 */
(function () {
  'use strict';

  var overlay = null;
  var overlayImg = null;
  var activeBlobUrl = null;

  var SVG_STYLE_PROPS = [
    'display', 'visibility', 'opacity',
    'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width',
    'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
    'font-family', 'font-size', 'font-weight', 'font-style',
    'font-variant-numeric', 'letter-spacing', 'text-anchor', 'dominant-baseline', 'color'
  ];

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlayImg = document.createElement('img');
    overlayImg.className = 'lightbox-img';
    overlay.appendChild(overlayImg);

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
        close();
      }
    });
  }

  function revokeActiveBlob() {
    if (activeBlobUrl) {
      URL.revokeObjectURL(activeBlobUrl);
      activeBlobUrl = null;
    }
  }

  function open(src, alt, isBlob) {
    if (!overlay) createOverlay();
    revokeActiveBlob();
    if (isBlob) activeBlobUrl = src;
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    revokeActiveBlob();
  }

  function findInteractiveAncestor(el, stopAt) {
    var cur = el;
    while (cur && cur !== stopAt && cur !== document.body) {
      var tag = cur.tagName ? cur.tagName.toUpperCase() : '';
      if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT') return cur;
      if (tag === 'A' && cur.getAttribute('href') && cur.getAttribute('href').charAt(0) !== '#') return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function findZoomableSvg(target) {
    var cur = target;
    while (cur && cur !== document.body) {
      var tag = cur.tagName ? cur.tagName.toLowerCase() : '';
      if (tag === 'svg') {
        var cls = cur.getAttribute('class') || '';
        var inFigure = cur.closest && cur.closest('figure.sr-figure, figure.generated-diagram');
        if (cls.indexOf('sr-figure-svg') !== -1 || inFigure) {
          return cur;
        }
        return null;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  function serializeLiveSvgToBlobUrl(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var vb = svg.viewBox && svg.viewBox.baseVal;
    if (vb && vb.width > 0 && vb.height > 0) {
      clone.setAttribute('width', String(Math.round(vb.width * 1.5)));
      clone.setAttribute('height', String(Math.round(vb.height * 1.5)));
    }

    var sourceNodes = [svg].concat(Array.prototype.slice.call(svg.querySelectorAll('*')));
    var cloneNodes = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
    for (var i = 0; i < sourceNodes.length; i++) {
      var cs = window.getComputedStyle(sourceNodes[i]);
      if (cs.display === 'none') {
        cloneNodes[i].setAttribute('display', 'none');
        cloneNodes[i].style.display = 'none';
        continue;
      }
      for (var j = 0; j < SVG_STYLE_PROPS.length; j++) {
        var prop = SVG_STYLE_PROPS[j];
        var val = cs.getPropertyValue(prop);
        if (val) cloneNodes[i].style.setProperty(prop, val);
      }
    }

    // Add subtle theme-matched backdrop inside standalone lightbox preview
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '0');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('rx', '16');
    bgRect.setAttribute('fill', isDark ? '#141c26' : '#fcf8f2');
    clone.insertBefore(bgRect, clone.firstChild);

    var xml = new XMLSerializer().serializeToString(clone);
    var blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(blob);
  }

  document.addEventListener('click', function (e) {
    var svg = findZoomableSvg(e.target);
    if (svg) {
      if (findInteractiveAncestor(e.target, svg)) return;
      var rect = svg.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 60) return;
      e.preventDefault();
      var titleEl = svg.querySelector('title');
      open(serializeLiveSvgToBlobUrl(svg), titleEl ? titleEl.textContent : '', true);
      return;
    }

    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    if (img.naturalWidth < 80 || img.naturalHeight < 80) return;
    if (findInteractiveAncestor(img, document.body)) return;

    e.preventDefault();
    open(img.src, img.alt, false);
  });
})();
