// ==UserScript==
// @name         pull to refresh
// @match        https://*/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const DEFAULTS = {
    threshold: 70,
    maxPull: 120,
    resistance: 2,
    circleSize: 32,
    strokeWidth: 2,
    lineGapRem: 0.5,
    colors: {
      light: { line: '#fff', track: '#EFEFEF', progress: '#C7C7C7' },
      dark: { line: '#181C1F', track: '#555555', progress: '#fff' },
    },
    refreshDelay: 550,
    onRefresh: () => window.location.reload(),
  };

  const RULES = [
    { match: '/', target: 'main' },
    { match: '/direct/inbox/', target: '[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"]' },
    { match: '/explore/', target: 'main:has(nav) > div' },
  ];

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const css = (el, styles) => Object.assign(el.style, styles);

  function isScrollable(node) {
    const { overflowY } = getComputedStyle(node);
    return /(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight;
  }

  function isDarkAround(el) {
    for (let node = el; node instanceof Element; node = node.parentElement) {
      const color = getComputedStyle(node).backgroundColor;
      if (!color.startsWith('rgb')) continue;
      const [r, g, b, a = 1] = color.match(/[\d.]+/g).map(Number);
      if (a < 0.1) continue;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function svgEl(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  }

  function matchesLocation(pattern, loc) {
    if (typeof pattern === 'function') return !!pattern(loc);
    if (pattern instanceof RegExp) return pattern.test(loc.pathname);
    if (typeof pattern === 'string') {
      return pattern.endsWith('*')
        ? loc.pathname.startsWith(pattern.slice(0, -1))
        : loc.pathname === pattern;
    }
    return false;
  }

  function resolveTargets({ target, all }) {
    let result = null;
    if (typeof target === 'function') result = target();
    else if (typeof target === 'string') {
      result = all ? document.querySelectorAll(target) : document.querySelector(target);
    }
    if (!result) return [];
    const list = result instanceof Element ? [result] : Array.from(result);
    return list.filter((el) => el instanceof Element && el.isConnected);
  }

  class PullToRefresh {
    constructor(el, options) {
      this.el = el;
      this.o = options;
      this.gap = options.lineGapRem * parseFloat(getComputedStyle(document.documentElement).fontSize);

      this.clip = null;
      this.ring = null;
      this.svg = null;
      this.arc = null;
      this.track = null;
      this.line = null;
      this.spin = null;
      this.scrollers = [];
      this.resetTimer = null;
      this.circumference = 0;

      this.touchStartY = null;
      this.pulling = false;
      this.refreshing = false;
      this.destroyed = false;
      this.armed = false;
      this.currentPull = 0;

      this.attach();
    }

    attach() {
      this.el.addEventListener('touchstart', this.onTouchStart, { passive: true });
      this.el.addEventListener('touchmove', this.onTouchMove, { passive: false });
      this.el.addEventListener('touchend', this.onTouchEnd, { passive: true });
      this.el.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
    }

    destroy() {
      this.destroyed = true;
      clearTimeout(this.resetTimer);
      this.stopSpin();
      this.el.removeEventListener('touchstart', this.onTouchStart);
      this.el.removeEventListener('touchmove', this.onTouchMove);
      this.el.removeEventListener('touchend', this.onTouchEnd);
      this.el.removeEventListener('touchcancel', this.onTouchEnd);
      css(this.el, { transform: '', transition: '' });
      this.clip?.remove();
      this.clip = this.ring = this.svg = this.track = this.arc = this.line = null;
    }

    ensureIndicator() {
      if (this.clip?.isConnected) return;

      const { threshold, circleSize: size, strokeWidth } = this.o;
      const center = size / 2;
      const radius = (size - strokeWidth) / 2;
      this.circumference = 2 * Math.PI * radius;

      const circle = { cx: center, cy: center, r: radius, fill: 'none', 'stroke-width': strokeWidth };
      this.track = svgEl('circle', circle);
      this.arc = svgEl('circle', {
        ...circle,
        transform: `rotate(-90 ${center} ${center})`,
      });
      this.arc.style.strokeDasharray = `${this.circumference}px`;

      this.svg = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` });
      this.svg.style.display = 'block';
      this.svg.append(this.track, this.arc);

      this.ring = document.createElement('div');
      css(this.ring, {
        position: 'absolute',
        top: `${(threshold - size) / 2}px`,
        left: `calc(50% - ${center}px)`,
        width: `${size}px`,
        height: `${size}px`,
      });
      this.ring.append(this.svg);

      this.line = document.createElement('div');
      css(this.line, {
        position: 'absolute',
        left: '0px',
        right: '0px',
        bottom: '0px',
        height: '1px',
      });

      this.clip = document.createElement('div');
      css(this.clip, {
        position: 'fixed',
        height: '0px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: '1',
      });
      this.clip.append(this.ring, this.line);
      document.body.append(this.clip);

      this.setProgress(0);
    }

    placeIndicator() {
      const rect = this.el.getBoundingClientRect();
      const offsetY = new DOMMatrix(getComputedStyle(this.el).transform).m42;
      css(this.clip, {
        top: `${rect.top - offsetY}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    }

    setProgress(progress) {
      this.arc.style.strokeDashoffset = `${this.circumference * (1 - progress)}px`;
    }

    setArmed(armed) {
      if (armed === this.armed) return;
      this.armed = armed;
      if (!armed) return;
      this.ring.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
        { duration: 300, easing: 'ease-out' }
      );
    }

    startSpin() {
      this.spin = this.svg.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        { duration: 1000, iterations: Infinity }
      );
    }

    stopSpin() {
      this.spin?.cancel();
      this.spin = null;
    }

    applyTheme() {
      const { light, dark } = this.o.colors;
      const palette = isDarkAround(this.el) ? dark : light;
      this.track.setAttribute('stroke', palette.track);
      this.arc.setAttribute('stroke', palette.progress);
      this.line.style.background = palette.line;
    }

    collectScrollers(node) {
      const scrollers = [];
      for (let current = node; current instanceof Element; current = current.parentElement) {
        if (isScrollable(current)) scrollers.push(current);
      }
      const root = document.scrollingElement;
      if (root && !scrollers.includes(root)) scrollers.push(root);
      return scrollers;
    }

    isAtTop() {
      return this.scrollers.every((scroller) => scroller.scrollTop <= 0);
    }

    updatePull(distance) {
      const { threshold, maxPull } = this.o;
      const visualPull = Math.min(distance, maxPull);
      this.currentPull = distance;

      css(this.el, { transition: 'none', transform: `translateY(${visualPull}px)` });
      css(this.clip, { transition: 'none', height: `${Math.max(visualPull - this.gap, 0)}px` });

      this.setProgress(Math.min(distance / threshold, 1));
      this.setArmed(distance >= threshold);
    }

    releaseBack() {
      this.currentPull = 0;
      this.setArmed(false);
      this.stopSpin();

      css(this.el, { transition: 'transform .25s ease', transform: 'translateY(0px)' });
      css(this.clip, { transition: 'height .25s ease', height: '0px' });

      this.resetTimer = setTimeout(() => {
        if (this.destroyed) return;
        this.setProgress(0);
      }, 250);
    }

    showRefreshing() {
      const { threshold } = this.o;
      css(this.el, { transition: 'transform .2s ease', transform: `translateY(${threshold}px)` });
      css(this.clip, { transition: 'height .2s ease', height: `${threshold - this.gap}px` });
      this.setProgress(0.25);
      this.startSpin();
    }

    async triggerRefresh() {
      this.refreshing = true;
      this.showRefreshing();
      await sleep(this.o.refreshDelay);
      try {
        await this.o.onRefresh(this.el);
      } catch (err) {
        console.error('[pull-to-refresh] onRefresh failed:', err);
      }
      if (this.destroyed) return;
      this.refreshing = false;
      this.releaseBack();
    }

    onTouchStart = (e) => {
      if (this.refreshing || e.touches.length !== 1) return;
      this.scrollers = this.collectScrollers(e.target);
      if (!this.isAtTop()) {
        this.touchStartY = null;
        return;
      }
      clearTimeout(this.resetTimer);
      this.touchStartY = e.touches[0].clientY;
      this.pulling = true;
      this.ensureIndicator();
      this.applyTheme();
      this.placeIndicator();
    };

    onTouchMove = (e) => {
      if (!this.pulling || this.touchStartY === null || this.refreshing) return;
      const delta = e.touches[0].clientY - this.touchStartY;

      if (delta <= 0 || !this.isAtTop()) {
        this.pulling = false;
        this.releaseBack();
        return;
      }

      e.preventDefault();
      this.updatePull(delta / this.o.resistance);
    };

    onTouchEnd = () => {
      const wasPulling = this.pulling;
      this.pulling = false;
      this.touchStartY = null;
      if (!wasPulling || this.refreshing) return;

      if (this.currentPull >= this.o.threshold) this.triggerRefresh();
      else this.releaseBack();
    };
  }

  const controllers = new Map();

  function sync() {
    const wanted = new Map();
    for (const rule of RULES) {
      if (!matchesLocation(rule.match, window.location)) continue;
      for (const el of resolveTargets(rule)) {
        if (!wanted.has(el)) wanted.set(el, { ...DEFAULTS, ...rule });
      }
    }

    for (const [el, controller] of controllers) {
      if (!wanted.has(el)) {
        controller.destroy();
        controllers.delete(el);
      }
    }

    for (const [el, options] of wanted) {
      if (!controllers.has(el)) controllers.set(el, new PullToRefresh(el, options));
    }
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  function patchHistory() {
    const fire = () => window.dispatchEvent(new Event('locationchange'));
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        fire();
        return result;
      };
    }
    window.addEventListener('popstate', fire);
  }

  patchHistory();
  window.addEventListener('locationchange', scheduleSync);

  new MutationObserver(scheduleSync).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  sync();
})();