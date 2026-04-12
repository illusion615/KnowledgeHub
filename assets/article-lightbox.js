/**
 * Article Image Lightbox — click any article image to view full-size overlay.
 * Click backdrop or press Escape to close.
 */
(function () {
  'use strict';

  var overlay = null;
  var overlayImg = null;

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

  function open(src, alt) {
    if (!overlay) createOverlay();
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
  }

  document.addEventListener('click', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG') return;
    // Skip tiny icons / brand marks
    if (img.naturalWidth < 80 || img.naturalHeight < 80) return;
    // Skip images inside interactive controls (buttons, links that navigate)
    var parent = img.parentElement;
    if (parent && parent.tagName === 'A' && parent.getAttribute('href') && parent.getAttribute('href').charAt(0) !== '#') return;

    e.preventDefault();
    open(img.src, img.alt);
  });
})();
