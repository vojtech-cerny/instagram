// ==UserScript==
// @name  fix ugly stories fallback
// ==/UserScript==

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