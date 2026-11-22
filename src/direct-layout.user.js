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