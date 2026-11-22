// ==UserScript==
// @name  topnav
// ==/UserScript==

(function () {
  'use strict';

  const SELECTOR = 'nav header';

  let navbar = null;
  let navHeight = 0;
  let offset = 0;          // current translateY, always within [-navHeight, 0]
  let applied = null;      // last value written to the DOM (to skip redundant writes)
  let lastScrollY = getScrollY();
  let scrollQueued = false;
  let lookupQueued = false;

  function getScrollY() {
    // Clamp at 0: iOS/Android overscroll bounce reports negative values,
    // which would make the bar jitter at the top of the page.
    return Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
  }

  function render(y) {
    if (y === applied) return;
    applied = y;
    navbar.style.transform = `translate3d(0, ${y}px, 0)`;
  }

  // Keep navHeight up to date WITHOUT reading offsetHeight on every scroll
  // (that forced a synchronous layout each time). ResizeObserver fires after
  // layout has already happened, so it's free.
  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[entries.length - 1];
    navHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
    offset = Math.max(-navHeight, Math.min(0, offset));
    render(offset);
  });

  function attach(el) {
    if (navbar) resizeObserver.unobserve(navbar);
    navbar = el;

    const s = el.style;
    s.position = 'fixed';
    s.top = '0';
    s.width = '100%';
    s.transition = 'none';
    s.zIndex = '999999';
    s.willChange = 'transform'; // own compositor layer -> moves on the GPU

    navHeight = el.offsetHeight; // one-time read; ResizeObserver keeps it current afterwards
    offset = 0;
    applied = null;
    lastScrollY = getScrollY(); // avoid a jump caused by a stale previous position
    render(0);

    resizeObserver.observe(el);
  }

  function detach() {
    resizeObserver.unobserve(navbar);
    navbar = null;
  }

  // ---- finding the navbar (SPA can replace it at any time) -----------------

  function lookup() {
    lookupQueued = false;
    if (navbar && !navbar.isConnected) detach();
    if (navbar) return;

    const el = document.querySelector(SELECTOR);
    if (el) attach(el);
  }

  // Only do real work when we have no navbar or the one we track was removed.
  // While the navbar is alive, a mutation batch costs a single isConnected check
  // instead of a querySelector over a huge, constantly changing DOM.
  new MutationObserver(() => {
    if (lookupQueued || navbar?.isConnected) return;
    lookupQueued = true;
    requestAnimationFrame(lookup);
  }).observe(document.documentElement, { childList: true, subtree: true });

  lookup();

  // ---- scrolling ------------------------------------------------------------

  // Scroll events are dispatched right before requestAnimationFrame callbacks in
  // the same frame, so batching through rAF adds no latency, but guarantees at
  // most one style write per frame.
  function onFrame() {
    scrollQueued = false;

    const y = getScrollY();
    const delta = y - lastScrollY;
    lastScrollY = y;

    if (!navbar || delta === 0) return;

    offset = Math.max(-navHeight, Math.min(0, offset - delta));
    render(offset);
  }

  window.addEventListener(
    'scroll',
    () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(onFrame);
    },
    { passive: true }
  );
})();