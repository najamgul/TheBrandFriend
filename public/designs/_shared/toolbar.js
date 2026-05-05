/**
 * TheBrandFriend — Design Preview Toolbar
 * Injects a floating toolbar with viewport toggle + CTA into each design page.
 * 
 * Usage: Add <script src="../_shared/toolbar.js"></script> at bottom of each design.
 * The script auto-detects the design slug from the URL path.
 */

(function () {
  'use strict';

  const CONTACT_BASE = 'https://thebrandfriend.com/contact';

  const VIEWPORTS = [
    {
      id: 'mobile', label: 'Mobile', width: 375,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>'
    },
    {
      id: 'tablet', label: 'Tablet', width: 768,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>'
    },
    {
      id: 'desktop', label: 'Desktop', width: null,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    },
  ];

  // Detect design slug from URL
  function getSlug() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    // Path: /designs/swiss-echo/ → slug = swiss-echo
    const designsIdx = parts.indexOf('designs');
    if (designsIdx !== -1 && parts[designsIdx + 1]) {
      return parts[designsIdx + 1];
    }
    return '';
  }

  function init() {
    const slug = getSlug();

    // Wrap all body children in a viewport frame
    const frame = document.createElement('div');
    frame.className = 'tbf-viewport-frame';
    while (document.body.firstChild) {
      frame.appendChild(document.body.firstChild);
    }
    document.body.appendChild(frame);
    document.body.classList.add('tbf-active');

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'tbf-toolbar';
    toolbar.innerHTML = `
      <a class="tbf-brand" href="https://thebrandfriend.com" target="_blank">THEBRANDFRIEND</a>
      ${VIEWPORTS.map(v => `
        <button class="tbf-btn${v.id === 'desktop' ? ' active' : ''}" data-viewport="${v.id}" data-width="${v.width || ''}">
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

    // State
    let isHidden = false;

    collapseBtn.addEventListener('click', () => {
      isHidden = !isHidden;
      toolbar.classList.toggle('hidden', isHidden);
      document.body.classList.toggle('tbf-active', !isHidden);
      collapseBtn.innerHTML = isHidden ? '▼' : '▲';
    });

    // Viewport switching
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tbf-btn');
      if (!btn) return;

      toolbar.querySelectorAll('.tbf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const width = btn.dataset.width;
      if (width) {
        frame.style.maxWidth = width + 'px';
        frame.classList.add('framed');
      } else {
        frame.style.maxWidth = '';
        frame.classList.remove('framed');
      }
    });
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
