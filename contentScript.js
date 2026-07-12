(() => {
  if (window.__pdfSentenceNavigatorLoaded) return;
  window.__pdfSentenceNavigatorLoaded = true;
  const state = { sentences: [], index: -1, overlay: null, box: null, lastText: '' };
  const normalize = s => (s || '').replace(/\s+/g, ' ').trim();
  function ensureOverlay() {
    if (state.overlay) return state.overlay;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';
    document.documentElement.appendChild(el);
    state.overlay = el;
    return el;
  }
  function ensureBox() {
    if (state.box) return state.box;
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;border:2px solid rgba(255,165,0,.95);background:rgba(255,165,0,.18);border-radius:4px;box-shadow:0 0 0 2px rgba(255,255,255,.35) inset;transition:all .12s ease;';
    ensureOverlay().appendChild(el);
    state.box = el;
    return el;
  }
  function splitSentences(text) {
    const clean = normalize(text);
    if (!clean) return [];
    return clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || [];
  }
  function collectText() {
    const nodes = [...document.querySelectorAll('span, div')];
    return nodes.map(n => normalize(n.textContent)).filter(Boolean).join(' ');
  }
  function findNode(sentence) {
    const target = normalize(sentence).slice(0, 30);
    const spans = [...document.querySelectorAll('span')];
    return spans.find(sp => normalize(sp.textContent).includes(target)) || null;
  }
  function paint(node) {
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (!r || (!r.width && !r.height)) return;
    const box = ensureBox();
    box.style.left = `${Math.max(0, r.left + window.scrollX - 4)}px`;
    box.style.top = `${Math.max(0, r.top + window.scrollY - 2)}px`;
    box.style.width = `${r.width + 8}px`;
    box.style.height = `${r.height + 4}px`;
    box.style.display = 'block';
  }
  function refresh() {
    const t = collectText();
    if (t && t !== state.lastText) {
      state.sentences = splitSentences(t);
      state.index = state.sentences.length ? 0 : -1;
      state.lastText = t;
    }
  }
  function show() {
    refresh();
    const s = state.sentences[state.index];
    paint(s ? findNode(s) : null);
  }
  function move(step) {
    refresh();
    if (!state.sentences.length) return;
    state.index = (state.index + step + state.sentences.length) % state.sentences.length;
    show();
  }
  document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    e.stopPropagation();
    move(e.shiftKey ? -1 : 1);
  }, true);
  ensureOverlay();
  setTimeout(show, 1000);
})();
