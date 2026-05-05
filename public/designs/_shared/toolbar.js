/**
 * TheBrandFriend — Design Preview Toolbar
 * Injects a floating toolbar with viewport toggle + CTA into each design page.
 * 
 * HOW IT WORKS:
 * - Desktop mode: shows the page normally (no iframe)
 * - Mobile/Tablet mode: hides page content, loads the same page inside an iframe
 *   at the target width. The iframe triggers proper CSS media queries.
 * - The iframe loads the page with ?_tbf_embed=1, which tells this script
 *   to NOT inject the toolbar again (prevents infinite recursion).
 */

(function () {
  'use strict';

  const CONTACT_BASE = 'https://thebrandfriend.com/contact';

  const VIEWPORTS = [
    {
      id: 'mobile', label: 'Mobile', width: 375, height: 812,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>'
    },
    {
      id: 'tablet', label: 'Tablet', width: 768, height: 1024,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>'
    },
    {
      id: 'desktop', label: 'Desktop', width: null, height: null,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    },
  ];

  // If this is an embedded preview (loaded inside our own iframe), skip toolbar
  const params = new URLSearchParams(window.location.search);
  if (params.has('_tbf_embed')) {
    return; // Don't inject toolbar in the iframe copy
  }

  function getSlug() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const designsIdx = parts.indexOf('designs');
    if (designsIdx !== -1 && parts[designsIdx + 1]) {
      return parts[designsIdx + 1];
    }
    return '';
  }

  function init() {
    const slug = getSlug();
    const currentUrl = window.location.pathname;

    // Wrap all body children in a content frame (shown in desktop mode)
    const contentFrame = document.createElement('div');
    contentFrame.className = 'tbf-content';
    while (document.body.firstChild) {
      contentFrame.appendChild(document.body.firstChild);
    }
    document.body.appendChild(contentFrame);
    document.body.classList.add('tbf-active');

    // Create iframe container (hidden by default, shown in mobile/tablet mode)
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'tbf-iframe-container';
    iframeContainer.style.display = 'none';
    document.body.appendChild(iframeContainer);

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'tbf-toolbar';
    toolbar.innerHTML = `
      <a class="tbf-brand" href="https://thebrandfriend.com" target="_blank">THEBRANDFRIEND</a>
      ${VIEWPORTS.map(v => `
        <button class="tbf-btn${v.id === 'desktop' ? ' active' : ''}" data-viewport="${v.id}" data-width="${v.width || ''}" data-height="${v.height || ''}">
          ${v.icon}<span>${v.label}</span>
        </button>
      `).join('')}
      <a class="tbf-cta" href="${CONTACT_BASE}?design=${slug}" target="_blank">
        <span>I WANT THIS</span>
      </a>
    `;
    document.body.prepend(toolbar);

    // Collapse button
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'tbf-collapse';
    collapseBtn.innerHTML = '▲';
    collapseBtn.title = 'Toggle toolbar';
    document.body.appendChild(collapseBtn);

    let isHidden = false;
    let currentIframe = null;

    collapseBtn.addEventListener('click', () => {
      isHidden = !isHidden;
      toolbar.classList.toggle('hidden', isHidden);
      document.body.classList.toggle('tbf-active', !isHidden);
      collapseBtn.innerHTML = isHidden ? '▼' : '▲';
    });

    // Switch viewport
    function switchViewport(viewportId, width, height) {
      if (viewportId === 'desktop') {
        // Show original content, hide iframe
        contentFrame.style.display = '';
        iframeContainer.style.display = 'none';
        if (currentIframe) {
          currentIframe.remove();
          currentIframe = null;
        }
        document.body.classList.remove('tbf-preview-mode');
      } else {
        // Hide original content, show iframe at target width
        contentFrame.style.display = 'none';
        iframeContainer.style.display = 'flex';
        document.body.classList.add('tbf-preview-mode');

        // Remove old iframe
        if (currentIframe) {
          currentIframe.remove();
        }

        // Create device frame wrapper
        iframeContainer.innerHTML = `
          <div class="tbf-device-frame" style="width:${width}px; height:${height}px;">
            <div class="tbf-device-bezel">
              <div class="tbf-device-notch"></div>
            </div>
            <iframe class="tbf-preview-iframe" src="${currentUrl}?_tbf_embed=1" width="${width}" height="${height}"></iframe>
          </div>
          <div class="tbf-device-label">${width} × ${height}px</div>
        `;
        currentIframe = iframeContainer.querySelector('iframe');
      }
    }

    // Viewport button clicks
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tbf-btn');
      if (!btn) return;

      toolbar.querySelectorAll('.tbf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const viewportId = btn.dataset.viewport;
      const width = parseInt(btn.dataset.width) || null;
      const height = parseInt(btn.dataset.height) || null;
      switchViewport(viewportId, width, height);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
