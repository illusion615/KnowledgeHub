// ======================================
// article-email-share.js — Email newsletter export
// ======================================
// Lazy-loaded by article-presentation.js when user clicks "Email share"
// Exposes: window.StudyRoomEmailShare

(function () {
  'use strict';

  window.StudyRoomEmailShare = {
    /**
     * Open a preview window with the full page content styled for email.
     * @param {Function} getLang - returns 'zh' or 'en'
     */
    share: function (getLang) {
      var lang = getLang();
      var title = document.title || 'Newsletter';
      var main = document.querySelector('main');

      // Build full-page clone preserving all original styles
      var docClone = document.documentElement.cloneNode(true);

      // Expand all accordions so deep-dives are visible
      docClone.querySelectorAll('[data-accordion]').forEach(function (item) {
        item.classList.add('is-open');
        var btn = item.querySelector('.subsection-toggle');
        var content = item.querySelector('.subsection-content');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        if (content) {
          content.setAttribute('aria-hidden', 'false');
          content.style.maxHeight = 'none';
          content.style.overflow = 'visible';
        }
      });

      // Strip interactive / non-email elements
      var removeSelectors = [
        '.topbar', '.present-floating', '.backdrop', 'script', 'footer',
        '.ai-assistant-entry', '.ai-assistant-panel',
        '[data-presentation-toggle]', '.share-wrapper',
        '.present-nav', '.present-exit', '.present-status'
      ];
      removeSelectors.forEach(function (sel) {
        docClone.querySelectorAll(sel).forEach(function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
      });

      // Force light theme for email readability
      docClone.setAttribute('data-theme', 'light');

      // Remove all scroll-reveal opacity so content is visible immediately
      docClone.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      docClone.querySelectorAll('.load-in').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      // Convert external CSS links to absolute URLs
      var origin = window.location.origin;
      var basePath = window.location.pathname.replace(/[^\/]*$/, '');
      docClone.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
        var href = link.getAttribute('href');
        if (href && href.indexOf('http') !== 0) {
          if (href.indexOf('/') === 0) {
            link.setAttribute('href', origin + href);
          } else {
            link.setAttribute('href', origin + basePath + href);
          }
        }
      });

      // Inject newsletter-specific overrides
      var overrideStyle = docClone.querySelector('head').appendChild(document.createElement('style'));
      overrideStyle.textContent = ''
        + 'body { overflow: auto !important; }'
        + '.page-shell { min-height: auto !important; }'
        + '.backdrop, .orb { display: none !important; }'
        + '.site { max-width: 780px; margin: 0 auto; padding: 24px 32px; }'
        + '.subsection-content[aria-hidden="false"] { max-height: none !important; overflow: visible !important; }'
        + '.newsletter-banner { position: sticky; top: 0; z-index: 9999; background: #2563eb; color: #fff;'
        + '  padding: 10px 20px; text-align: center; font-size: 14px; line-height: 1.5;'
        + '  border-radius: 0 0 8px 8px; font-family: -apple-system, sans-serif; }'
        + '.newsletter-banner a { color: #fff; text-decoration: underline; margin-left: 12px; cursor: pointer; }'
        + '@media print { .newsletter-banner { display: none; } }';

      // Add helper banner at top of body
      var body = docClone.querySelector('body');
      var banner = document.createElement('div');
      banner.className = 'newsletter-banner';
      var bannerText = lang === 'zh'
        ? '全选 (⌘A) → 复制 (⌘C) → 粘贴到邮件正文'
        : 'Select All (⌘A) → Copy (⌘C) → Paste into email body';
      var mailtoLabel = lang === 'zh' ? '打开邮件客户端' : 'Open email client';
      banner.innerHTML = bannerText + '<a data-mailto-trigger>' + mailtoLabel + '</a>';
      body.insertBefore(banner, body.firstChild);

      // Append source link at bottom
      var sourceFooter = document.createElement('div');
      sourceFooter.style.cssText = 'max-width:780px;margin:32px auto 24px;padding:16px 32px;border-top:1px solid #e5e7eb;font-size:13px;color:#9ca3af;';
      sourceFooter.innerHTML = 'Source: <a href="' + window.location.href + '" style="color:#2563eb;">' + title + '</a>';
      body.appendChild(sourceFooter);

      var fullHtml = '<!DOCTYPE html>\n' + docClone.outerHTML;

      // Open preview window with full-styled content
      var win = window.open('', '_blank');
      if (win) {
        win.document.write(fullHtml);
        win.document.close();
        win.document.title = '\u2709 ' + title;

        // Wire up the mailto link inside the preview window
        var mailtoTrigger = win.document.querySelector('[data-mailto-trigger]');
        if (mailtoTrigger) {
          mailtoTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            var subject = encodeURIComponent(title);
            var mailBody = encodeURIComponent(title + '\n\n' + window.location.href);
            win.location.href = 'mailto:?subject=' + subject + '&body=' + mailBody;
          });
        }
      }
    }
  };
})();
