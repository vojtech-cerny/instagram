// ==UserScript==
// @name         Hermit bundle
// @description  Auto-generated bundle of 10 script(s). Do not edit by hand.
// ==/UserScript==
// Content hash: a7ee69164a
// Sources:
//   - src/block-recommended.user.js
//   - src/direct-layout.user.js
//   - src/fix-gifs.user.js
//   - src/hide-ads.user.js
//   - src/native-emojis.user.js
//   - src/pull-to-refresh.user.js
//   - src/stories-fallback.user.js
//   - src/styles.user.js
//   - src/topnav.user.js
//   - src/unmute-stories.user.js

;(function () {
const __bundleShouldRun = (inc, exc) => {
  const hit = ([src, flags]) => new RegExp(src, flags).test(location.href);
  return (!inc.length || inc.some(hit)) && !exc.some(hit);
};
const __bundleReady = (fn) =>
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true })
    : fn();

// ===== block recommended feed  (src/block-recommended.user.js) =====
;(function () {
  const __main = function () {
    try {
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
    } catch (e) { console.error("[bundle] " + "block recommended feed" + " failed:", e); }
  };
  __main();
})();

// ===== direct-layout.user.js  (src/direct-layout.user.js) =====
;(function () {
  const __main = function () {
    try {
(function () {
    'use strict';

    // Guard against Hermit injecting the script twice
    if (window.__igDirectLayoutLoaded) return;
    window.__igDirectLayoutLoaded = true;

    var LOG = '[IG Direct layout]';

    var PARENT_SELECTOR = '[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"]';
    // Fragile (hashed class names) - first thing to check if the script stops working
    var SEARCH_SELECTOR =
        'div.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.x82snj4.x5lhr3w.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.xs83m0k.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1';

    // State of the currently mounted Direct inbox. Instagram is an SPA: leaving
    // Direct destroys these elements and returning creates new ones, so this
    // state is rebuilt for every new mount.
    var ctx = null;

    // ---------- layout ----------

    function applyLayout(c) {
        if (c.custom) return;
        // Same result as prepend(second); prepend(first); prepend(search)
        c.third.insertBefore(c.second, c.third.firstChild);
        c.third.insertBefore(c.first, c.third.firstChild);
        c.third.insertBefore(c.search, c.third.firstChild);
        c.custom = true;
        console.log(LOG, 'custom layout applied');
    }

    function revertLayout(c) {
        if (!c.custom) return;

        c.parent.insertBefore(c.second, c.third);
        c.parent.insertBefore(c.first, c.second);

        var home = c.searchHome;
        if (home.next && home.next.parentNode === home.parent) {
            home.parent.insertBefore(c.search, home.next);
        } else {
            home.parent.appendChild(c.search);
        }

        c.custom = false;
        console.log(LOG, 'layout reverted for search');
    }

    // ---------- lifecycle ----------

    function createContext(parent, search) {
        var c = {
            parent: parent,
            first: parent.children[0],
            second: parent.children[1],
            third: parent.children[2],
            search: search,
            searchHome: { parent: search.parentNode, next: search.nextSibling },
            custom: false,
            timer: null
        };

        // Clicking the search box -> restore original DOM so Instagram's search works
        c.onPointerDown = function () {
            clearTimeout(c.timer);
            revertLayout(c);
            // Moving a node in the DOM drops focus, so restore it manually
            setTimeout(function () {
                var input = search.querySelector('input');
                if (input) input.focus();
            }, 10);
        };

        c.onFocusIn = function () {
            clearTimeout(c.timer);
        };

        // Leaving the search box -> re-apply custom layout
        c.onFocusOut = function (e) {
            if (!search.contains(e.target)) return;
            if (e.relatedTarget && search.contains(e.relatedTarget)) return;
            clearTimeout(c.timer);
            c.timer = setTimeout(function () {
                if (!search.contains(document.activeElement)) applyLayout(c);
            }, 200);
        };

        search.addEventListener('pointerdown', c.onPointerDown, true);
        search.addEventListener('focusin', c.onFocusIn, false);
        document.addEventListener('focusout', c.onFocusOut, false);

        return c;
    }

    function destroyContext(c) {
        clearTimeout(c.timer);
        c.search.removeEventListener('pointerdown', c.onPointerDown, true);
        c.search.removeEventListener('focusin', c.onFocusIn, false);
        document.removeEventListener('focusout', c.onFocusOut, false);
    }

    // Idempotent: safe to call as often as needed
    function sync() {
        // Stale if Instagram removed/replaced the elements
        if (ctx && !(ctx.parent.isConnected && ctx.search.isConnected)) {
            destroyContext(ctx);
            ctx = null;
            console.log(LOG, 'inbox unmounted, state reset');
        }
        if (ctx) return;

        var parent = document.querySelector(PARENT_SELECTOR);
        var search = document.querySelector(SEARCH_SELECTOR);
        if (!parent || !search || parent.children.length < 3) return;

        ctx = createContext(parent, search);
        applyLayout(ctx);
    }

    // ---------- observer ----------

    var queued = false;
    var observer = new MutationObserver(function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
            queued = false;
            sync();
        });
    });

    // documentElement exists even if <body> isn't parsed yet at injection time
    observer.observe(document.documentElement, { childList: true, subtree: true });
    sync();
})();
    } catch (e) { console.error("[bundle] " + "direct-layout.user.js" + " failed:", e); }
  };
  __main();
})();

// ===== fix gifs in gif selector  (src/fix-gifs.user.js) =====
;(function () {
  const __main = function () {
    try {
/**
 * Fix broken GIFs/images — for Hermit Lite (plain injected JS, no userscript APIs).
 *
 * Only active on /direct/t/* (Instagram DM threads), where searching for and
 * sending GIFs tends to surface broken images. Since this is a React SPA,
 * route matching is re-checked on every navigation (pushState/replaceState/
 * popstate), not just once at page load.
 *
 * Handles two common causes of "broken image" icons, especially on Facebook's
 * external CDN (fbcdn.net):
 *
 *   1. Referrer/origin-based blocking: the CDN rejects the request based on
 *      the Referer header a lightweight browser/webview sends (or doesn't
 *      send). Fixed by retrying the same URL with referrerPolicy="no-referrer".
 *
 *   2. "GIFs" that are actually MP4s: Facebook serves animated GIFs as MP4
 *      video for bandwidth, wrapped behind an <img> tag. Browsers cannot
 *      decode video through <img> under any circumstances, referrer or not,
 *      so it always shows as broken. Fixed by swapping the <img> for a
 *      muted/looping/autoplaying <video> using the same URL, falling back to
 *      the original video URL embedded in the CDN link's `url=` query param.
 *
 * Uses a MutationObserver (not polling) to catch images added or recycled
 * dynamically, e.g. in the GIF search results flyout or a virtualized list.
 */
(function () {
  'use strict';

  var ROUTE_PATTERN = /^\/direct\/t\//;
  var PROCESSED_ATTR = 'data-gif-fix-src'; // stores the src we already tried, so a changed src gets retried

  function isTargetRoute() {
    return ROUTE_PATTERN.test(location.pathname);
  }

  function extractInnerUrl(src) {
    try {
      var parsed = new URL(src, location.href);
      var inner = parsed.searchParams.get('url');
      if (inner) return decodeURIComponent(inner);
    } catch (e) {}
    return null;
  }

  function buildCandidateList(originalSrc) {
    var inner = extractInnerUrl(originalSrc);
    var candidates = [originalSrc];
    if (inner && candidates.indexOf(inner) === -1) candidates.push(inner);
    return candidates;
  }

  // Replace `nodeToReplace` with a <video> using candidates[idx]; on failure,
  // replace the (still-attached) video with the next candidate, recursively.
  function tryVideo(nodeToReplace, candidates, idx) {
    if (idx >= candidates.length) {
      nodeToReplace.style.display = 'none';
      return;
    }

    var video = document.createElement('video');
    video.src = candidates[idx];
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = false;
    video.setAttribute('playsinline', '');
    video.style.cssText = nodeToReplace.style.cssText;
    if (nodeToReplace.className) video.className = nodeToReplace.className;
    var w = nodeToReplace.getAttribute && nodeToReplace.getAttribute('width');
    var h = nodeToReplace.getAttribute && nodeToReplace.getAttribute('height');
    if (w) video.setAttribute('width', w);
    if (h) video.setAttribute('height', h);

    video.addEventListener(
      'error',
      function () {
        tryVideo(video, candidates, idx + 1);
      },
      { once: true }
    );

    nodeToReplace.replaceWith(video);
  }

  function attemptFix(img) {
    if (!isTargetRoute() || !img) return;

    var originalSrc = img.currentSrc || img.src;
    if (!originalSrc) return;
    if (img.getAttribute(PROCESSED_ATTR) === originalSrc) return; // already tried this exact src
    img.setAttribute(PROCESSED_ATTR, originalSrc);

    // Step 1: retry without a referrer, in case the CDN is referer-blocking.
    var probe = new Image();
    probe.referrerPolicy = 'no-referrer';
    try {
      probe.crossOrigin = 'anonymous';
    } catch (e) {}

    probe.onload = function () {
      img.referrerPolicy = 'no-referrer';
      try {
        img.crossOrigin = 'anonymous';
      } catch (e) {}
      img.src = '';
      img.src = originalSrc;
    };

    probe.onerror = function () {
      // Step 2: assume it's a video served through an <img> tag.
      var candidates = buildCandidateList(originalSrc);
      tryVideo(img, candidates, 0);
    };

    probe.src = originalSrc;
  }

  function checkImg(img) {
    if (img.complete) {
      if (img.naturalWidth === 0) attemptFix(img);
    }
    // If not yet complete, the global capturing 'error' listener below will
    // catch it if the load fails.
  }

  function scanExisting(root) {
    var imgs = (root || document).querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) checkImg(imgs[i]);
  }

  // Catch load failures for any <img>, present now or added later.
  // Error events don't bubble, so this must be a capturing listener.
  document.addEventListener(
    'error',
    function (e) {
      if (e.target && e.target.tagName === 'IMG') attemptFix(e.target);
    },
    true
  );

  // Watch for new/recycled <img> nodes instead of polling.
  var observer = new MutationObserver(function (mutations) {
    if (!isTargetRoute()) return;
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'childList') {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG') {
            checkImg(node);
          } else if (node.querySelectorAll) {
            scanExisting(node);
          }
        });
      } else if (m.type === 'attributes' && m.target.tagName === 'IMG') {
        checkImg(m.target);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });

  // Initial scan on load, in case images are already broken when this
  // script is injected.
  function initialScan() {
    if (isTargetRoute()) scanExisting();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initialScan();
  } else {
    document.addEventListener('DOMContentLoaded', initialScan);
  }

  // Re-scan on SPA navigation (Instagram/Facebook use the History API).
  function patchHistoryForRouteChange() {
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
  }

  patchHistoryForRouteChange();
  window.addEventListener('locationchange', initialScan);
})();
    } catch (e) { console.error("[bundle] " + "fix gifs in gif selector" + " failed:", e); }
  };
  __main();
})();

// ===== hide sponsored posts  (src/hide-ads.user.js) =====
;(function () {
  const __main = function () {
    try {
(function() {
    'use strict';

    function hideAds(root = document) {

        // 1) cílení podle class
        const candidates = root.querySelectorAll('.x1fhwpqd.x132q4wb.x5n08af');

        candidates.forEach(el => {
            const text = el.innerText || '';

            if (text.includes('Sponzorováno')) {
                const article = el.closest('article');
                if (article) {
                    article.style.visibility = 'hidden';
                    article.style.height = '0';
                    article.style.margin = '0';
                    article.style.overflow = 'hidden';
                }
            }
        });

        // 2) fallback (tvůj původní signál)
        const links = root.querySelectorAll('a[href^="https://www.facebook.com/ads/ig_redirect/"]');

        links.forEach(link => {
            const article = link.closest('article');
            if (article) {
                article.style.visibility = 'hidden';
                article.style.height = '0';
                article.style.margin = '0';
                article.style.overflow = 'hidden';
            }
        });
    }

    hideAds();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node instanceof HTMLElement) {
                    hideAds(node);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
    } catch (e) { console.error("[bundle] " + "hide sponsored posts" + " failed:", e); }
  };
  __main();
})();

// ===== native emojis  (src/native-emojis.user.js) =====
;(function () {
  const __main = function () {
    try {
(function() {
    'use strict';

    // --- PŘEVOD IG EMOJI NA NATIVNÍ ZNAKY ---

    // KROK 1: Funkce, která provede samotnou výměnu obrázku za text
    const nahradZaTextoveEmoji = (imgElement) => {
        if (imgElement.src && imgElement.src.includes('emoji.php') && imgElement.alt) {

            const textoveEmoji = document.createTextNode(imgElement.alt);

            if (imgElement.parentNode) {
                imgElement.parentNode.classList.add('native-emoji-fix');
                imgElement.parentNode.replaceChild(textoveEmoji, imgElement);
            }
        }
    };

    // KROK 2: Nastavíme hlídače pro nově načítaný obsah (zprávy, feed)
    const hlidacEmoji = new MutationObserver((mutace) => {
        mutace.forEach((zmena) => {
            if (zmena.addedNodes) {
                zmena.addedNodes.forEach((uzel) => {
                    // Ignorujeme běžný text, zajímají nás jen HTML elementy
                    if (uzel.nodeType !== Node.ELEMENT_NODE) return;

                    // A) Přidaný uzel je přímo obrázek
                    if (uzel.tagName === 'IMG') {
                        nahradZaTextoveEmoji(uzel);
                    }
                    // B) Přidaný uzel je nějaký kontejner (div, span), uvnitř kterého mohou být emoji
                    else if (uzel.querySelectorAll) {
                        const emojiObrazky = uzel.querySelectorAll('img[src*="emoji.php"]');
                        emojiObrazky.forEach(nahradZaTextoveEmoji);
                    }
                });
            }
        });
    });

    // KROK 3: Inicializace (spuštění po načtení)
    const inicializaceEmoji = () => {
        // Nejprve vyměníme všechny emoji, které už na stránce jsou
        document.querySelectorAll('img[src*="emoji.php"]').forEach(nahradZaTextoveEmoji);

        // A pak zapneme hlídače, který bude sledovat zbytek
        hlidacEmoji.observe(document.body, { childList: true, subtree: true });
        console.log("Parťák: Převaděč nativních emoji je aktivní!");
    };

    if (document.body) {
        inicializaceEmoji();
    } else {
        document.addEventListener('DOMContentLoaded', inicializaceEmoji);
    }
    // ----------------------------------------

})();
    } catch (e) { console.error("[bundle] " + "native emojis" + " failed:", e); }
  };
  __main();
})();

// ===== pull to refresh  (src/pull-to-refresh.user.js) =====
;(function () {
  const __main = function () {
    try {
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
    } catch (e) { console.error("[bundle] " + "pull to refresh" + " failed:", e); }
  };
  __main();
})();

// ===== fix ugly stories fallback  (src/stories-fallback.user.js) =====
;(function () {
  const __main = function () {
    try {
(function() {
    'use strict';

    const TRANSPARENT_POSTER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    // 1. Inject the CSS fix using standard DOM manipulation
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            video {
                background: transparent !important;
                background-color: transparent !important;
                outline: none !important;
                border: none !important;
            }
            video::-webkit-media-controls-start-playback-button {
                display: none !important;
                -webkit-appearance: none !important;
            }
        `;
        // Append to head (or documentElement if head isn't parsed yet)
        (document.head || document.documentElement).appendChild(style);
    }

    // 2. The core function to find and fix videos
    function fixVideos() {
        // Only apply the fix if the URL path starts with /stories/
        if (!window.location.pathname.startsWith('/stories/')) return;

        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            // If it doesn't already have our transparent poster, add it
            if (video.getAttribute('poster') !== TRANSPARENT_POSTER) {
                video.setAttribute('poster', TRANSPARENT_POSTER);
            }
        });
    }

    // 3. Intercept React's SPA Routing (PushState & ReplaceState)
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        fixVideos();
        setTimeout(fixVideos, 100); 
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        fixVideos();
        setTimeout(fixVideos, 100);
    };

    // Listen for browser Back/Forward navigation
    window.addEventListener('popstate', () => {
        fixVideos();
        setTimeout(fixVideos, 100);
    });

    // 4. Initialize styles and MutationObserver on DOM ready
    window.addEventListener('DOMContentLoaded', () => {
        injectStyles();

        const observer = new MutationObserver((mutations) => {
            if (!window.location.pathname.startsWith('/stories/')) return;
            
            // Check if any new nodes were added before running querySelectorAll
            let hasNewNodes = false;
            for (let mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    hasNewNodes = true;
                    break;
                }
            }
            
            if (hasNewNodes) {
                fixVideos();
            }
        });

        // Watch for React swapping out video elements without changing the URL
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Run once on initial load (if landing directly on a story URL)
        fixVideos();
    });

})();
    } catch (e) { console.error("[bundle] " + "fix ugly stories fallback" + " failed:", e); }
  };
  __main();
})();

// ===== styles  (src/styles.user.js) =====
;(function () {
  const __main = function () {
    try {
const css = `
/* Fix top header */
header {
    padding-top: .5rem;
    padding-bottom: .25rem
}
main {
    margin-top: .75rem;
}
/* Hide reels icon in bottombar */
.x78zum5.xaw8158.xh8yej3 > div:nth-child(3) {
    display: none;
}
/* Improve bottombar */
.x78zum5.xaw8158.xh8yej3 {
    border: 0;
}
/* Direct Navbar */
.x6s0dn4.x1bs97v6.x1q0q8m5.x9f619.xat24cr.xh8yej3.x1qhh985.xn3w4p2.x1gg8mnh.x78zum5.x1q0g3np.x1qughib.xexx8yu.x18d9i69.xf7dkkf.xv54qhq {
    height: 4.5rem;
    flex-shrink: 0;
}
/* Bottombar */
.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.xixxii4.x1ey2m1c.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1.xg7h5cd.xh8yej3.xhtitgo.x6w1myc.x1jeouym {
    z-index: 99;
    height: 3rem;
}
._acc8._abpk {
    display: none; /* Fix for Hermit - residual bottombar shadow */
}
.x6s0dn4.x1bs97v6.x1q0q8m5.x9f619.xat24cr.xh8yej3.x1qhh985.xn3w4p2.x1gg8mnh.x78zum5.x1q0g3np.x1qughib.xexx8yu.x18d9i69.xf7dkkf.xv54qhq > div:nth-child(2) {
    margin-right: auto;
}
.x1c4vz4f.x2lah0s.x1njnjl6.xw7yly9 {
    margin-top: 1.5rem;
}
.x6s0dn4.x78zum5.x1q0g3np.x1nhvcw1.xyinxu5.xv54qhq.x1a8lsjc.xf7dkkf {
    padding-top: 2rem;
}
.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x1iyjqo2 > div:nth-child(2) {
    height: 4px !important;
}
.x78zum5.x2lah0s.xpdmqnj {
    scale: 0.95;
}
.html-div.xdj266r.x14z9mp.xat24cr.x1lziwak.xyri2b.x1c1uobl.x9f619.x5lhr3w.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.xwib8y2.x1y1aw1k.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x6s0dn4.x1oa3qoh.xl56j7k {
    display: none;
}
[data-pagelet="story_tray"] > div > div > div,
html, [data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] > *, body {
    scrollbar-width: none;
}
.x1l895ks:hover, .x1l895ks {
    background-color: transparent !important;
}
.x1l895ks:active {
    transform: scale(1) !important;
    background-color: rgb(var(--ig-secondary-background)) !important;
    border-radius: 0;
}
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] > div > .x1c4vz4f.x2lah0s.xhjk10j.x6ikm8r.x10wlt62.xf7dkkf.xv54qhq {
    padding-inline-end: 0 !important;
    padding-top: 0.5rem;
}
.x6s0dn4.x1bs97v6.x1q0q8m5.x9f619.xat24cr.xh8yej3.x1qhh985.xn3w4p2.x1gg8mnh.x78zum5.x1q0g3np.x1qughib.xexx8yu.x18d9i69.xf7dkkf.xv54qhq > div:nth-child(2) {
    margin: auto !important;
}
.x1e56ztr {
    margin-bottom: 0.25rem !important;
}
a.xjqpnuy[href="/direct/requests/"] {
    color: rgb(var(--ig-colors-button-primary-link-text)) !important;
    font-weight: 600;
    font-size: var(--system-16-font-size);
}
h1.x1lliihq {
    font-weight: 600;
}
._afxw,
._afxv {
    display: none;
}
/* Message bubble */
.x5slmwz:not([role="button"]):not([data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] *) {
    background-clip: padding-box;
    background-image: linear-gradient(180deg, #d102c4 0%, #5554f8 100%);
    background-position: 0;
    background-size: 100vw;
    background-attachment: fixed;
}
[id^="double_tappable_id"] {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none !important;
    -ms-user-select: none;
    user-select: none !important;
}
/* Fix native emoji display */
.native-emoji-fix {
    justify-content: center;
    align-items: center;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
}
/* Fix first story item */
[data-pagelet="story_tray"] div[role="button"]:first-of-type > div:first-child {
    margin-bottom: 14px;
}
/* Enlarge stories in tray */
[data-pagelet="story_tray"] div[role="button"] > div:first-child {
    scale: 1.1;
}
/* Fix max story username length */
[data-pagelet="story_tray"] div[role="button"] > div:nth-child(2) {
    max-width: 6rem !important;
}
/* Fix stories gaps in tray*/
[data-pagelet="story_tray"] div[role="button"]:not(:first-of-type) {
    padding-inline-start: 0.75rem;
}
/* Chat bubble font increase */
.x6prxxf {
    font-size: 1rem !important;
}
/* Follows stats fix */
.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.xjbmbcv.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1 {
    height: calc(2rem + 2px);
}
.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.xjbmbcv.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1 > div > span,
.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.xjbmbcv.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1 > div > a > span {
    display: flex;
    flex-direction: column-reverse;
    text-transform: lowercase;
    clip-path: polygon(0 25%, 100% 25%, 100% 75%, 0 75%);
    word-spacing: 1rem;
}
.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.xjbmbcv.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1 > div > span > span,
.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.xjbmbcv.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1 > div > a > span > span {
    display: block;
    word-spacing: normal;
}
/* Make spinner prettier */
div[aria-label="Video player"]:has([data-visualcompletion="loading-state"][role="progressbar"] svg) {
    display: flex;
    justify-content: center;
}
[data-visualcompletion="loading-state"][role="progressbar"]:has(svg) {
    padding: 1.5px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgb(var(--ig-primary-text));
    --_m: conic-gradient(#0000 10%, #000),
    linear-gradient(#000 0 0) content-box;
    -webkit-mask: var(--_m);
    mask: var(--_m);
    -webkit-mask-composite: source-out;
    mask-composite: subtract;
    animation: l3 1s infinite linear;
    transform-origin: center;
    display: block;
    box-sizing: border-box;
    position: static;
    align-self: center;
    justify-self: center;
    margin: auto;
}
[data-visualcompletion="loading-state"][role="progressbar"]:has(svg) > svg {
    display: none;
}
@keyframes l3 {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
/* Hide alt for images */
img {
    color: transparent;
}
/* Hide navbar, when splash screen is visible */
body:has(#splash-screen) #moje-ig-lista-kontejner {
    visibility: hidden;
}
/* Fix animations on chat click in direct */
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] .xg6hnt2 {
    transform: scale(1) !important;
    border-radius: 0px !important;
}
/* Fix direct notes */
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] > div > div:first-child {
    width: 85px;
}
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] > div > div:first-child > div > div:last-child, [data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] > div > div:first-child > div > div > div {
    width: 100%;
    justify-content: center;
}
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li {
    scale: 0.95;
}
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] > div > div:nth-child(2) > div:nth-child(2) {
    padding-top: 2px;
}
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] div svg {
    scale: 0.75;
}
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] .x117nqv4 {   
    font-weight: 500;
}
/* Smaller avatar on chat direct preview */
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] .x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x78zum5.xbmvrgn {
    scale: 0.9;
    margin-left: -3px;
}
/* Enlarge gap between Messages heading and chats */
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] .html-div.x14z9mp.x1lziwak.xexx8yu.x18d9i69.x9f619.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.xw7yly9.x1e56ztr.x64bnmy.x13jy36j.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1qughib {
    padding-bottom: 4px;
}
/* Search: enlarge gap between input and results */
.x78zum5.xdt5ytf > .x6s0dn4.x78zum5.xdt5ytf.x5yr21d.x1odjw0f.x1n2onr6.xh8yej3 {
    margin-top: 1rem
}
/* Prettier elipsis (search results) */
a .x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft > div > span {
    text-overflow: ellipsis;
    overflow: hidden;
}
/* End element in input */
label .html-div.xdj266r.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x2fvf9.x10l6tqk.x1ey2m1c.x13vifvy.xtijo5x.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x6s0dn4.x1oa3qoh.xl56j7k {
    margin-right: 8px;
}

/* === DIRECT CHAT: Input design === */

div[data-pagelet="IGDComposerForCannes"] {
  position: fixed;
  bottom: 0;
  width: 100vw;
}

div[data-pagelet="IGDComposerForCannes"] {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 49%,
    var(--igd-thread-background-color, rgb(var(--ig-primary-background))) 50%,
    var(--igd-thread-background-color, rgb(var(--ig-primary-background))) 100%
  );
}

div[data-pagelet=IGDComposerForCannes] > div > div > div:last-child > * {
  background-color: transparent;
  border: none;
}

div[data-pagelet="IGDComposerForCannes"] .xshg46c { 
  background-color: rgb(var(--ig-incoming-message-bubble));
  border-color: transparent;
}

/* === UNIVERSAL: Add inset shadow === */
div[data-pagelet="IGDComposerForCannes"] .xshg46c, [id^="double_tappable_id"] > div > div > div, .xsnw5ke {
  box-shadow: inset 0 0 3px 1px rgba(var(--ig-primary-text), 0.025);
}

div[data-pagelet="IGDMessagesList"] > div > div {
  margin-bottom: 77.4px;
}

/* === DIRECT INBOX: Dont crop harshly shadows in notes === */
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] > div > .x1c4vz4f.x2lah0s.xhjk10j.x6ikm8r.x10wlt62.xf7dkkf.xv54qhq {
  padding-inline-end: 0;
  margin-inline-start: -1rem;
}

[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] > div > .x1c4vz4f.x2lah0s.xhjk10j.x6ikm8r.x10wlt62.xf7dkkf.xv54qhq > div > div {
  padding: 1rem
}

/* === DIRECT INBOX: HEADER === */

div[data-pagelet="IGDInboxHeaderOffMsys"] > div {
  border: 0;
}

div[data-pagelet="IGDInboxHeaderOffMsys"] div:has(span:empty) {
  margin-top: 0;
}

div.x1kmbdvd:has([aria-label="Pinned message icon"]) {
  background-color: rgb(var(--ig-primary-background));
  scale: 1 !important;
}

/* Fill reel full width */
article[data-interactable="|click|"]:has(a[href*="/reel/"]) > div > div:nth-child(2) div[data-visualcompletion="ignore-late-mutation"]:has(video) > div > div {
  position: static;
  height: fit-content;
}

article[data-interactable="|click|"]:has(a[href*="/reel/"]) > div > div:nth-child(2) div[data-visualcompletion="ignore-late-mutation"]:has(video) > div {
  padding-bottom: 0 !important;;
}

/* Compensate for moved header */
article[data-interactable="|click|"]:has(a[href*="/reel/"]) {
  margin-top: 12px;
}

/* Move header inside */
article[data-interactable="|click|"]:has(a[href*="/reel/"]) > div > div:first-child {
  position: absolute;
  z-index: 2;
  box-sizing: border-box;
  width: 100vw;
}

/* Font in header should be always white */
article[data-interactable="|click|"]:has(a[href*="/reel/"]) > div > div:first-child * {
    color: rgb(var(--web-always-white)) !important;
}

/* Add backdrop */
article[data-interactable="|click|"]:has(a[href*="/reel/"]) > div > div:first-child::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100vw;
  background: linear-gradient(0deg,rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
  height: 6rem;
}

/* Remove follow(ed) button in posts header */
article header ._aar2:has(button) {
  display: none;
}

@media (prefers-color-scheme: dark) {
  :root, [data-pagelet="IGDMessagesList"] .x1k4qllp {
    --igd-thread-background-color: rgb(0, 0, 0);
    --mwp-message-row-background: var(--igd-thread-background-color) !important
  }
}
`

;(function () {
  const style = document.createElement("style")

  style.type = "text/css"

  style.appendChild(document.createTextNode(css))

  if (document.head) {
    document.head.appendChild(style)
  } else {
    document.addEventListener("DOMContentLoaded", () =>
      document.head.appendChild(style),
    )
  }
})()
    } catch (e) { console.error("[bundle] " + "styles" + " failed:", e); }
  };
  __main();
})();

// ===== topnav  (src/topnav.user.js) =====
;(function () {
  const __main = function () {
    try {
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
    } catch (e) { console.error("[bundle] " + "topnav" + " failed:", e); }
  };
  __main();
})();

// ===== auto unmute stories  (src/unmute-stories.user.js) =====
;(function () {
  const __main = function () {
    try {
(function () {
  'use strict';

  // SVG path data of the two speaker icons
  const MUTED_D = "M1.5 13.3c-.8 0-1.5.7-1.5 1.5v18.4c0 .8.7 1.5 1.5 1.5h8.7l12.9 12.9c.9.9 2.5.3 2.5-1v-9.8c0-.4-.2-.8-.4-1.1l-22-22c-.3-.3-.7-.4-1.1-.4h-.6zm46.8 31.4-5.5-5.5C44.9 36.6 48 31.4 48 24c0-11.4-7.2-17.4-7.2-17.4-.6-.6-1.6-.6-2.2 0L37.2 8c-.6.6-.6 1.6 0 2.2 0 0 5.7 5 5.7 13.8 0 5.4-2.1 9.3-3.8 11.6L35.5 32c1.1-1.7 2.3-4.4 2.3-8 0-6.8-4.1-10.3-4.1-10.3-.6-.6-1.6-.6-2.2 0l-1.4 1.4c-.6.6-.6 1.6 0 2.2 0 0 2.6 2 2.6 6.7 0 1.8-.4 3.2-.9 4.3L25.5 22V1.4c0-1.3-1.6-1.9-2.5-1L13.5 10 3.3-.3c-.6-.6-1.5-.6-2.1 0L-.2 1.1c-.6.6-.6 1.5 0 2.1L4 7.6l26.8 26.8 13.9 13.9c.6.6 1.5.6 2.1 0l1.4-1.4c.7-.6.7-1.6.1-2.2z";
  const UNMUTED_D = "M16.636 7.028a1.5 1.5 0 1 0-2.395 1.807 5.365 5.365 0 0 1 1.103 3.17 5.378 5.378 0 0 1-1.105 3.176 1.5 1.5 0 1 0 2.395 1.806 8.396 8.396 0 0 0 1.71-4.981 8.39 8.39 0 0 0-1.708-4.978Zm3.73-2.332A1.5 1.5 0 1 0 18.04 6.59 8.823 8.823 0 0 1 20 12.007a8.798 8.798 0 0 1-1.96 5.415 1.5 1.5 0 0 0 2.326 1.894 11.672 11.672 0 0 0 2.635-7.31 11.682 11.682 0 0 0-2.635-7.31Zm-8.963-3.613a1.001 1.001 0 0 0-1.082.187L5.265 6H2a1 1 0 0 0-1 1v10.003a1 1 0 0 0 1 1h3.265l5.01 4.682.02.021a1 1 0 0 0 1.704-.814L12.005 2a1 1 0 0 0-.602-.917Z";

  const MUTED_BTN = `div[role="button"]:has([d="${MUTED_D}"])`;
  const UNMUTED_BTN = `div[role="button"]:has([d="${UNMUTED_D}"])`;

  // Hide the sound buttons ONLY while the <html> element carries this flag,
  // which we set only on /stories/ URLs. Everywhere else (e.g. reels opened
  // from /direct/t/...) the buttons stay visible and usable.
  const FLAG = "data-auto-unmute-stories";

  const style = document.createElement("style");
  style.textContent = `
    html[${FLAG}] ${MUTED_BTN},
    html[${FLAG}] ${UNMUTED_BTN} {
      display: none;
    }`;
  (document.head || document.documentElement).appendChild(style);

  const isStories = () => location.pathname.startsWith("/stories/");

  // Instagram is an SPA: the URL changes without a page load, so re-check it
  // whenever the DOM changes (and on back/forward).
  const syncFlag = () => {
    const root = document.documentElement;
    const on = isStories();
    if (on !== root.hasAttribute(FLAG)) {
      on ? root.setAttribute(FLAG, "") : root.removeAttribute(FLAG);
    }
    return on;
  };

  const unmuteStory = () => {
    const muteBtn = document.querySelector(MUTED_BTN);
    if (muteBtn) {
      muteBtn.click();
      console.log("🔊 Story sound turned on automatically");
    }
  };

  const observer = new MutationObserver((mutations) => {
    if (!syncFlag()) return;
    if (mutations.some((m) => m.addedNodes.length > 0)) unmuteStory();
  });

  syncFlag();
  window.addEventListener("popstate", syncFlag);
  // documentElement instead of body: body may not exist yet at document-start
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
    } catch (e) { console.error("[bundle] " + "auto unmute stories" + " failed:", e); }
  };
  __main();
})();
})();
