// ==UserScript==
// @name         Direct layout fix
// ==/UserScript==

(function() {
    'use strict';

    let hasProcessed = false;
    let isCustomLayout = false;

    // Proměnné pro uložení prvků
    let parent, firstChild, secondChild, thirdChild, extraComponent;

    // Proměnné pro uložení původní lokace vyhledávání (extraComponent)
    let extraOriginalParent, extraOriginalNextSibling;

    const extraComponentSelector = 'div.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.x82snj4.x5lhr3w.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.xs83m0k.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1';

    // 1. Funkce pro sestavení tvého layoutu
    function applyCustomLayout() {
        if (isCustomLayout) return;

        // Skládáme prvky na začátek třetího kontejneru
        thirdChild.prepend(secondChild);
        thirdChild.prepend(firstChild);
        thirdChild.prepend(extraComponent);

        isCustomLayout = true;
        console.log("Parťák v programování: Vlastní layout aplikován! 📦");
    }

    // 2. Funkce pro navrácení do originálního stavu pro React
    function revertToOriginalLayout() {
        if (!isCustomLayout) return;

        // Vracíme 1. a 2. potomka zpět do původního rodiče
        parent.insertBefore(secondChild, thirdChild);
        parent.insertBefore(firstChild, secondChild);

        // Vracíme vyhledávání (extraComponent) PŘESNĚ tam, kde bylo původně
        if (extraOriginalNextSibling) {
            extraOriginalParent.insertBefore(extraComponent, extraOriginalNextSibling);
        } else {
            extraOriginalParent.appendChild(extraComponent);
        }

        isCustomLayout = false;
        console.log("Parťák v programování: Layout vrácen kvůli vyhledávání! 🔍");
    }

    // 3. Hlavní logika, která to všechno sváže
    function initLogic() {
        if (hasProcessed) return;

        parent = document.querySelector('[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"]');
        extraComponent = document.querySelector(extraComponentSelector);

        if (parent && parent.children.length >= 3 && extraComponent) {

            // Uložíme reference na potomky
            firstChild = parent.children[0];
            secondChild = parent.children[1];
            thirdChild = parent.children[2];

            // Uložíme si, kde přesně původně leželo vyhledávání, abychom ho mohli vrátit
            extraOriginalParent = extraComponent.parentNode;
            extraOriginalNextSibling = extraComponent.nextSibling;

            // Past č. 1: Když uživatel klikne na vyhledávání
            extraComponent.addEventListener('pointerdown', (e) => {
                revertToOriginalLayout();

                // Po fyzickém přesunutí prvku v DOMu mu musíme manuálně vrátit focus
                setTimeout(() => {
                    const inputElement = extraComponent.querySelector('input');
                    if (inputElement) inputElement.focus();
                }, 10);
            }, true);

            // Past č. 2: Když vyhledávání ztratí pozornost (klikneš jinam)
            document.addEventListener('focusout', (e) => {
                // Vrátíme tvůj layout jen v případě, že uživatel neklikl na jinou část samotného vyhledávání
                if (!extraComponent.contains(e.relatedTarget)) {
                    setTimeout(() => { applyCustomLayout(); }, 200);
                }
            });

            // Při načtení stránky aktivujeme tvůj přesun
            applyCustomLayout();
            hasProcessed = true;
        }
    }

    // Pozorovatel (Observer), který čeká, až Instagram stránku vykreslí
    const observer = new MutationObserver(() => {
        if (!hasProcessed) {
            initLogic();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();