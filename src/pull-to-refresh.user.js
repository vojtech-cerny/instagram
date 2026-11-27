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
    resistance: 2.5,
    circleSize: 32,
    strokeWidth: 2,
    lineColor: '#181C1F',
    lineGapRem: 0.5,
    trackColor: '#555555',
    progressColor: '#fff',
    refreshDelay: 550,
    onRefresh: () => window.location.reload(),
  };

  const RULES = [
    { match: '/', target: 'main' },
    { match: '/direct/inbox/', target: '[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"]' },
  ];

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const css = (el, styles) => Object.assign(el.style, styles);

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
      this.line = null;
      this.spin = null;
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
      this.clip = this.ring = this.svg = this.arc = this.line = null;
    }

    ensureIndicator() {
      if (this.clip?.isConnected) return;

      const { threshold, circleSize: size, strokeWidth, trackColor, progressColor, lineColor } = this.o;
      const center = size / 2;
      const radius = (size - strokeWidth) / 2;
      this.circumference = 2 * Math.PI * radius;

      const circle = { cx: center, cy: center, r: radius, fill: 'none', 'stroke-width': strokeWidth };
      const track = svgEl('circle', { ...circle, stroke: trackColor });
      this.arc = svgEl('circle', {
        ...circle,
        stroke: progressColor,
        transform: `rotate(-90 ${center} ${center})`,
      });
      this.arc.style.strokeDasharray = `${this.circumference}px`;

      this.svg = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` });
      this.svg.style.display = 'block';
      this.svg.append(track, this.arc);

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
        background: lineColor,
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

    isAtTop() {
      const el = this.el;
      const scrollable = el.scrollHeight > el.clientHeight + 1;
      return scrollable ? el.scrollTop <= 0 : window.scrollY === 0;
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
      if (!this.isAtTop()) {
        this.touchStartY = null;
        return;
      }
      clearTimeout(this.resetTimer);
      this.touchStartY = e.touches[0].clientY;
      this.pulling = true;
      this.ensureIndicator();
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