// ==UserScript==
// @name         pull to refresh
// ==/UserScript==

(function () {
  'use strict';

  var PULL_THRESHOLD = 70; // px of pull needed to trigger a refresh
  var MAX_PULL = 120; // px cap on how far <main> visually slides down
  var RESISTANCE = 2.5; // higher = harder to pull (raw drag distance / RESISTANCE)
  var HIDDEN_OFFSET = 50; // px above main's top edge where the indicator starts, hidden
  var REVEAL_OFFSET = 16; // px below main's top edge where the indicator ends up at full pull
  var SPINNER_SIZE = 32; // px

  var mainEl = null;
  var indicator = null; // fixed wrapper (positioning + opacity)
  var spinner = null; // the ring element we rotate manually while pulling
  var attached = false;
  var touchStartY = null;
  var pulling = false;
  var refreshing = false;
  var currentPull = 0;
  var baseTop = 0;
  var styleInjected = false;

  function isHomeRoute() {
    return location.pathname === '/';
  }

  function isAtTop(el) {
    if (!el) return window.scrollY === 0;
    var elScrollable = el.scrollHeight > el.clientHeight + 1;
    return elScrollable ? el.scrollTop <= 0 : window.scrollY === 0;
  }

  function injectStyle() {
    if (styleInjected) return;
    styleInjected = true;
    var style = document.createElement('style');
    style.textContent =
      '.ptr-indicator{position:fixed;left:50%;transform:translateX(-50%);' +
      'pointer-events:none;opacity:0;z-index:0;}' +
      '.ptr-spinner{width:' +
      SPINNER_SIZE +
      'px;padding:1.5px;aspect-ratio:1;border-radius:50%;' +
      'background:rgb(var(--ig-primary-text, 0, 0, 0));' +
      '--_m:conic-gradient(#0000 10%,#000),linear-gradient(#000 0 0) content-box;' +
      '-webkit-mask:var(--_m);mask:var(--_m);' +
      '-webkit-mask-composite:source-out;mask-composite:subtract;' +
      'display:block;box-sizing:border-box;transform-origin:center;' +
      'animation:ptr-spin 1s linear infinite;}' +
      '@keyframes ptr-spin{to{transform:rotate(1turn);}}';
    document.head.appendChild(style);
  }

  function ensureIndicator() {
    injectStyle();
    if (indicator && indicator.isConnected) return;

    indicator = document.createElement('div');
    indicator.className = 'ptr-indicator';

    spinner = document.createElement('div');
    spinner.className = 'ptr-spinner';
    // Pause the CSS-driven spin so we can rotate it manually from pull
    // distance instead, while dragging.
    spinner.style.animation = 'none';

    indicator.appendChild(spinner);
    document.body.appendChild(indicator);

    positionIndicator(0);
    setRotation(0);
  }

  function setRotation(deg) {
    if (spinner) spinner.style.transform = 'rotate(' + deg + 'deg)';
  }

  function positionIndicator(progress) {
    if (!indicator) return;
    var top = baseTop - HIDDEN_OFFSET + (HIDDEN_OFFSET + REVEAL_OFFSET) * progress;
    indicator.style.top = top + 'px';
    indicator.style.opacity = String(Math.min(progress, 1));
  }

  function updatePull(pullDistance) {
    currentPull = pullDistance;
    var progress = Math.min(pullDistance / PULL_THRESHOLD, 1); // for opacity/position, capped
    var rotationProgress = pullDistance / PULL_THRESHOLD; // uncapped, keeps turning past 360° if overpulled
    var visualPull = Math.min(pullDistance, MAX_PULL);

    mainEl.style.transition = 'none';
    mainEl.style.transform = 'translateY(' + visualPull + 'px)';

    if (indicator) indicator.style.transition = 'none';
    positionIndicator(progress);

    if (spinner) spinner.style.transition = 'none';
    setRotation(rotationProgress * 360);
  }

  function releaseBack() {
    currentPull = 0;
    if (mainEl) {
      mainEl.style.transition = 'transform .25s ease';
      mainEl.style.transform = 'translateY(0px)';
    }
    if (indicator) {
      indicator.style.transition = 'top .25s ease, opacity .2s ease';
      positionIndicator(0);
    }
    if (spinner) {
      spinner.style.transition = 'transform .25s ease';
      setRotation(0);
    }
  }

  function showRefreshing() {
    if (mainEl) {
      mainEl.style.transition = 'transform .2s ease';
      mainEl.style.transform = 'translateY(' + PULL_THRESHOLD + 'px)';
    }
    if (indicator) {
      indicator.style.transition = 'top .2s ease, opacity .2s ease';
      positionIndicator(1);
    }
    if (spinner) {
      // Hand control back to the real continuous CSS spin now that we're
      // actually refreshing, instead of the manual pull-driven rotation.
      spinner.style.transition = 'none';
      spinner.style.transform = '';
      spinner.style.animation = ''; // clears the inline "none" override
    }
  }

  function onTouchStart(e) {
    if (refreshing || e.touches.length !== 1) return;
    if (!isAtTop(mainEl)) {
      touchStartY = null;
      return;
    }
    touchStartY = e.touches[0].clientY;
    pulling = true;
    baseTop = mainEl.getBoundingClientRect().top;
    ensureIndicator();
  }

  function onTouchMove(e) {
    if (!pulling || touchStartY === null || refreshing) return;
    var delta = e.touches[0].clientY - touchStartY;

    if (delta <= 0 || !isAtTop(mainEl)) {
      pulling = false;
      releaseBack();
      return;
    }

    // Stop native rubber-band scrolling so our own indicator drives the pull.
    e.preventDefault();
    updatePull(delta / RESISTANCE);
  }

  function onTouchEnd() {
    if (!pulling) {
      touchStartY = null;
      return;
    }
    pulling = false;
    touchStartY = null;
    if (!refreshing && currentPull >= PULL_THRESHOLD) {
      triggerRefresh();
    } else if (!refreshing) {
      releaseBack();
    }
  }

  function triggerRefresh() {
    refreshing = true;
    showRefreshing();
    setTimeout(function () {
      window.location.reload();
    }, 550);
  }

  function attach() {
    if (attached || !mainEl) return;
    mainEl.addEventListener('touchstart', onTouchStart, { passive: true });
    mainEl.addEventListener('touchmove', onTouchMove, { passive: false });
    mainEl.addEventListener('touchend', onTouchEnd, { passive: true });
    mainEl.addEventListener('touchcancel', onTouchEnd, { passive: true });
    attached = true;
  }

  function detach() {
    if (!attached || !mainEl) return;
    mainEl.removeEventListener('touchstart', onTouchStart);
    mainEl.removeEventListener('touchmove', onTouchMove);
    mainEl.removeEventListener('touchend', onTouchEnd);
    mainEl.removeEventListener('touchcancel', onTouchEnd);
    attached = false;
    mainEl.style.transform = '';
    mainEl.style.transition = '';
    if (indicator && indicator.parentNode) indicator.parentNode.removeChild(indicator);
    indicator = null;
    spinner = null;
  }

  function evaluate() {
    if (!isHomeRoute()) {
      detach();
      mainEl = null;
      return;
    }
    var found = document.querySelector('main');
    if (found !== mainEl) {
      detach();
      mainEl = found;
    }
    if (mainEl) attach();
  }

  // --- SPA route-change detection ---
  (function patchHistory() {
    var fire = function () {
      window.dispatchEvent(new Event('locationchange'));
    };
    var origPush = history.pushState;
    history.pushState = function () {
      var ret = origPush.apply(this, arguments);
      fire();
      return ret;
    };
    var origReplace = history.replaceState;
    history.replaceState = function () {
      var ret = origReplace.apply(this, arguments);
      fire();
      return ret;
    };
    window.addEventListener('popstate', fire);
  })();

  window.addEventListener('locationchange', evaluate);

  // Re-attach if <main> gets replaced by a re-render.
  var mo = new MutationObserver(evaluate);
  mo.observe(document.documentElement, { childList: true, subtree: true });

  evaluate();
})();