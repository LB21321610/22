(function () {
  'use strict';

  var toastTimer = 0;

  function addStyles() {
    if (document.getElementById('muse-enhancement-styles')) return;
    var style = document.createElement('style');
    style.id = 'muse-enhancement-styles';
    style.textContent = [
      '.muse-search-wrap{transition:transform .22s ease,box-shadow .22s ease;}',
      '.muse-search-wrap:focus-within{transform:translateY(-1px);box-shadow:0 12px 30px rgba(15,23,42,.12);}',
      '.muse-search-wrap input{outline:none;}',
      '.muse-action-ready button,.muse-action-ready a{transition:transform .16s ease,box-shadow .16s ease,filter .16s ease;}',
      '.muse-action-ready button:active,.muse-action-ready a:active{transform:translateY(1px) scale(.99);}',
      '.muse-toast{position:fixed;right:24px;bottom:24px;z-index:9999;max-width:min(360px,calc(100vw - 32px));padding:12px 14px;border:1px solid rgba(15,23,42,.12);border-radius:10px;background:rgba(255,255,255,.96);box-shadow:0 18px 55px rgba(15,23,42,.18);color:#0f172a;font:500 13px/1.4 Inter,system-ui,sans-serif;opacity:0;transform:translateY(12px);transition:opacity .18s ease,transform .18s ease;}',
      '.muse-toast[data-show=\"true\"]{opacity:1;transform:translateY(0);}',
      '.muse-modal-backdrop{position:fixed;inset:0;z-index:9998;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.42);backdrop-filter:blur(8px);}',
      '.muse-modal{width:min(520px,100%);border-radius:14px;background:#fff;color:#0f172a;box-shadow:0 30px 90px rgba(15,23,42,.28);padding:20px;}',
      '.muse-modal h2{margin:0 0 4px;font:700 20px/1.2 Inter,system-ui,sans-serif;}',
      '.muse-modal p{margin:0 0 14px;color:#64748b;font:400 13px/1.5 Inter,system-ui,sans-serif;}',
      '.muse-modal label{display:block;margin-top:12px;color:#334155;font:600 12px/1.4 Inter,system-ui,sans-serif;}',
      '.muse-modal input{box-sizing:border-box;width:100%;margin-top:6px;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;color:#0f172a;font:500 13px/1.2 Inter,system-ui,sans-serif;}',
      '.muse-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;}',
      '.muse-modal-actions button{border:0;border-radius:10px;padding:10px 14px;font:700 13px/1 Inter,system-ui,sans-serif;cursor:pointer;}',
      '.muse-modal-actions button:first-child{background:#e2e8f0;color:#0f172a;}',
      '.muse-modal-actions button:last-child{background:#0f172a;color:#fff;}',
      '.muse-generated-plan{margin-top:14px;border:1px solid rgba(15,23,42,.1);border-radius:12px;background:#fff;padding:14px;box-shadow:0 10px 32px rgba(15,23,42,.08);}',
      '.muse-generated-plan h3{margin:0 0 8px;font:800 15px/1.2 Inter,system-ui,sans-serif;color:#0f172a;}',
      '.muse-generated-plan ol{margin:0;padding-left:18px;color:#334155;font:500 13px/1.55 Inter,system-ui,sans-serif;}',
      '.muse-page-ready main section,.muse-page-ready main article{animation:museRise .42s ease both;}',
      '@keyframes museRise{from{opacity:.01;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}',
      '@media (prefers-reduced-motion:reduce){.muse-page-ready main section,.muse-page-ready main article,.muse-search-wrap,.muse-action-ready button,.muse-action-ready a,.muse-toast{animation:none!important;transition:none!important;transform:none!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function toast(message) {
    var node = document.querySelector('.muse-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'muse-toast';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.setAttribute('data-show', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      node.setAttribute('data-show', 'false');
    }, 2600);
  }

  function store(key, value) {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function read(key) {
    try {
      return localStorage.getItem(key) || '';
    } catch (e) {
      return '';
    }
  }

  function closeModal() {
    var backdrop = document.querySelector('.muse-modal-backdrop');
    if (backdrop) backdrop.remove();
  }

  function openSettings() {
    closeModal();
    var backdrop = document.createElement('div');
    backdrop.className = 'muse-modal-backdrop';
    backdrop.innerHTML = [
      '<div class="muse-modal" role="dialog" aria-modal="true" aria-labelledby="muse-settings-title">',
      '<h2 id="muse-settings-title">API Settings</h2>',
      '<p>Keys are stored only in this browser. Use a proxy endpoint when your API requires server-side auth or CORS headers.</p>',
      '<label>API proxy URL<input id="muse-api-proxy" autocomplete="off" placeholder="https://your-proxy.example/api"></label>',
      '<label>API key<input id="muse-api-key" autocomplete="off" placeholder="Stored locally, never committed"></label>',
      '<div class="muse-modal-actions"><button type="button" data-muse-close>Cancel</button><button type="button" data-muse-save>Save</button></div>',
      '</div>'
    ].join('');
    document.body.appendChild(backdrop);
    var proxy = backdrop.querySelector('#muse-api-proxy');
    var key = backdrop.querySelector('#muse-api-key');
    proxy.value = read('muse_api_proxy');
    key.value = read('muse_api_key');
    proxy.focus();
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop || event.target.hasAttribute('data-muse-close')) closeModal();
      if (event.target.hasAttribute('data-muse-save')) {
        store('muse_api_proxy', proxy.value.trim());
        store('muse_api_key', key.value.trim());
        closeModal();
        toast('API settings saved locally. Refresh to use them for Deezer requests.');
      }
    });
  }

  function download(name, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function activeArtistName() {
    var heading = document.querySelector('h1');
    if (heading && heading.textContent.trim()) return heading.textContent.trim();
    var cached = read('muse_artist');
    try {
      var parsed = JSON.parse(cached);
      if (parsed && parsed.artist && parsed.artist.name) return parsed.artist.name;
    } catch (e) {}
    return 'MuseLeo Artist';
  }

  function exportVisual() {
    var name = activeArtistName();
    var safe = name.replace(/[<>&]/g, function (ch) {
      return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[ch];
    });
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">',
      '<rect width="1200" height="675" fill="#0f172a"/>',
      '<rect x="64" y="64" width="1072" height="547" rx="28" fill="#ffffff"/>',
      '<text x="104" y="178" fill="#64748b" font-family="Inter,Arial,sans-serif" font-size="34" font-weight="700">MuseLeo Visual Export</text>',
      '<text x="104" y="330" fill="#0f172a" font-family="Inter,Arial,sans-serif" font-size="78" font-weight="800">' + safe + '</text>',
      '<text x="104" y="420" fill="#334155" font-family="Inter,Arial,sans-serif" font-size="32" font-weight="500">Audience, catalog and campaign snapshot</text>',
      '<rect x="104" y="490" width="330" height="12" rx="6" fill="#22c55e"/>',
      '<rect x="454" y="490" width="220" height="12" rx="6" fill="#38bdf8"/>',
      '<rect x="694" y="490" width="150" height="12" rx="6" fill="#f59e0b"/>',
      '</svg>'
    ].join('');
    download('museleo-visual.svg', svg, 'image/svg+xml;charset=utf-8');
    toast('Visual exported as SVG.');
  }

  function addTrack() {
    var title = window.prompt('Track title');
    if (!title || !title.trim()) return;
    var tracks = [];
    try {
      tracks = JSON.parse(read('muse_custom_tracks') || '[]');
      if (!Array.isArray(tracks)) tracks = [];
    } catch (e) {
      tracks = [];
    }
    tracks.unshift({ title: title.trim(), createdAt: new Date().toISOString() });
    store('muse_custom_tracks', JSON.stringify(tracks.slice(0, 50)));
    toast('Track saved locally.');
  }

  function generateMarketingPlan(button) {
    var host = button.closest('section') || button.closest('main') || document.body;
    var plan = host.querySelector('.muse-generated-plan');
    if (!plan) {
      plan = document.createElement('div');
      plan.className = 'muse-generated-plan';
      host.appendChild(plan);
    }
    var name = activeArtistName();
    plan.textContent = '';
    var title = document.createElement('h3');
    title.textContent = 'Generated campaign plan';
    var list = document.createElement('ol');
    [
      'Refresh the core audience hook around ' + name + ' and the strongest current track.',
      'Launch search-led discovery ads first, then retarget engaged listeners with visual exports.',
      'Review results after 7 days and shift budget toward the best-performing genre and geography.'
    ].forEach(function (itemText) {
      var item = document.createElement('li');
      item.textContent = itemText;
      list.appendChild(item);
    });
    plan.appendChild(title);
    plan.appendChild(list);
    toast('Marketing plan generated.');
  }

  function reapplyCachedArtist() {
    if (typeof window.__museUpdateAll !== 'function') return;
    try {
      var cached = JSON.parse(localStorage.getItem('muse_artist') || 'null');
      if (cached && cached.artist) window.__museUpdateAll(cached.artist, cached.tracks || []);
    } catch (e) {}
  }

  function bindActions() {
    document.documentElement.classList.add('muse-action-ready');
    document.addEventListener('click', function (event) {
      var button = event.target.closest('button,a');
      if (!button) return;
      var label = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      if (label === 'settings') {
        event.preventDefault();
        openSettings();
      } else if (label === 'notifications') {
        event.preventDefault();
        toast('No new notifications.');
      } else if (label === 'add track') {
        event.preventDefault();
        addTrack();
      } else if (label === 'export visual') {
        event.preventDefault();
        exportVisual();
      } else if (label === 'generate marketing plan') {
        event.preventDefault();
        generateMarketingPlan(button);
      }
      setTimeout(reapplyCachedArtist, 80);
    }, true);
  }

  function bindKeyboardSearch() {
    document.addEventListener('keydown', function (event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      var active = document.activeElement;
      var editing = active && /^(input|textarea|select)$/i.test(active.tagName);
      if (event.key === '/' && !editing) {
        var input = document.querySelector('.muse-search-input');
        if (input) {
          event.preventDefault();
          input.focus();
          input.select();
        }
      }
      if (event.key === 'Escape' && active && active.classList && active.classList.contains('muse-search-input')) {
        active.blur();
      }
    });
  }

  function boot() {
    addStyles();
    bindActions();
    bindKeyboardSearch();
    document.documentElement.classList.add('muse-page-ready');
    setTimeout(reapplyCachedArtist, 1200);
    setTimeout(reapplyCachedArtist, 2400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
