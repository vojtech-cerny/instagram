// ==UserScript==
// @name         block recommended feed
// ==/UserScript==

(function limitScroll(selector, offset = 0) {
  const html = document.documentElement;
  const body = document.body;
  const getOffset = () => (typeof offset === 'function' ? offset() : offset);

  const STYLES = {
    html: { height: 'auto', 'min-height': '0', 'overflow-y': 'auto' },
    body: {
      position: 'relative',
      'min-height': '0',
      overflow: 'clip',
      'overflow-clip-margin': '0px',
    },
  };

  // původní inline hodnoty pro uvolnění omezení
  const saved = new Map();
  const remember = (node, prop) => {
    const key = node === html ? 'html' : 'body';
    const k = key + ':' + prop;
    if (!saved.has(k)) {
      saved.set(k, [
        node.style.getPropertyValue(prop),
        node.style.getPropertyPriority(prop),
      ]);
    }
  };
  const set = (node, prop, val) => {
    if (
      node.style.getPropertyValue(prop) !== val ||
      node.style.getPropertyPriority(prop) !== 'important'
    ) {
      remember(node, prop);
      node.style.setProperty(prop, val, 'important');
    }
  };
  const release = () => {
    saved.forEach(([val, prio], k) => {
      const [which, prop] = k.split(':');
      const node = which === 'html' ? html : body;
      if (val) node.style.setProperty(prop, val, prio);
      else node.style.removeProperty(prop);
    });
    saved.clear();
    body.style.removeProperty('height');
  };

  let el = null;
  let raf = 0;
  let lastH = null;

  const ro = new ResizeObserver(() => schedule());

  // sleduj element, jeho předky a všechny předchozí sourozence na cestě nahoru
  // (cokoliv nad elementem ho může posunout)
  const observeChain = () => {
    ro.disconnect();
    for (let n = el; n && n !== body && n !== html; n = n.parentElement) {
      ro.observe(n);
      for (let s = n.previousElementSibling; s; s = s.previousElementSibling) {
        ro.observe(s);
      }
    }
  };

  const apply = () => {
    raf = 0;

    // po změně routy může být element nový nebo žádný
    const found = el && el.isConnected ? el : document.querySelector(selector);
    if (!found) {
      if (el) { el = null; ro.disconnect(); lastH = null; }
      release();
      return;
    }
    if (found !== el) {
      el = found;
      observeChain();
    }

    // framework mohl styly přepsat – vždy je znovu vynuť (zapisuje se jen při rozdílu)
    for (const p in STYLES.html) set(html, p, STYLES.html[p]);
    for (const p in STYLES.body) set(body, p, STYLES.body[p]);

    const scrollTop = html.scrollTop;
    const bodyTop = body.getBoundingClientRect().top + scrollTop;
    const elBottom = el.getBoundingClientRect().bottom + scrollTop;
    const h = Math.max(0, Math.ceil(elBottom - bodyTop + getOffset()));

    if (h !== lastH || body.style.getPropertyValue('height') !== h + 'px') {
      lastH = h;
      set(body, 'height', h + 'px');
    }
  };

  function schedule() {
    if (!raf) raf = requestAnimationFrame(apply);
  }

  // DOM změny (výměna routy, rozbalení popisku přes class/style/hidden, text)
  const mo = new MutationObserver(schedule);
  mo.observe(html, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden', 'open'],
  });

  // SPA navigace
  ['pushState', 'replaceState'].forEach((m) => {
    const orig = history[m];
    history[m] = function () {
      const r = orig.apply(this, arguments);
      schedule();
      setTimeout(schedule, 100);
      setTimeout(schedule, 400);
      return r;
    };
  });

  const on = (t, e, opt) => t.addEventListener(e, schedule, opt);
  on(window, 'popstate');
  on(window, 'resize');
  on(window, 'orientationchange');
  on(window, 'load');
  on(document, 'load', true);            // načtení obrázků (capture)
  on(document, 'transitionend', true);   // animace rozbalení
  on(document, 'animationend', true);
  on(window, 'scroll', { passive: true });       // pojistka
  on(window, 'touchstart', { passive: true });   // pojistka

  apply();

  // úklid
  return function destroy() {
    ro.disconnect();
    mo.disconnect();
    cancelAnimationFrame(raf);
    release();
  };
})('[href="/?variant=past_posts"]', 64);