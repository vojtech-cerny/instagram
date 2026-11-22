// ==UserScript==
// @name  hide sponsored posts
// ==/UserScript==

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