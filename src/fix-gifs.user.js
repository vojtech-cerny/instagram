// ==UserScript==
// @name         fix gifs in gif selector
// ==/UserScript==
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