// ==UserScript==
// @name  topnav
// ==/UserScript==

(function() {
    'use strict';

    let navbar = null;
    let navHeight = 0;
    let aktualniPosunY = 0;
    let posledniPoziceScrollu = window.scrollY || document.documentElement.scrollTop;

    // Aplikuje fixní styly na nalezený element
    function nastavitListu(element) {
        navbar = element;
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.width = '100%';
        navbar.style.transition = 'none'; // KOUZLO: Vypínáme animaci!
        navbar.style.zIndex = '999999';

        navHeight = navbar.offsetHeight;
        aktualniPosunY = 0; // Resetujeme posun pro novou stránku
        navbar.style.transform = `translateY(0px)`;

        console.log("Parťák v programování: Aktivuji pixel-perfect chytrou lištu na novém prvku!");
    }

    // Zkontroluje, zda SPA nepodvrhlo nový DOM element pro navigaci
    function zkontrolovatDOM() {
        const aktualniNav = document.querySelector('nav header');

        // Pokud jsme našli navigaci a je to JINÝ element než ten, co už sledujeme
        if (aktualniNav && aktualniNav !== navbar) {
            nastavitListu(aktualniNav);
        }
        // Pokud navigace úplně zmizela z DOMu
        else if (navbar && !document.body.contains(navbar)) {
            navbar = null;
        }
    }

    // 1. Zavedeme MutationObserver. Ten hlídá změny v Reactu bez ohledu na pushState/hydrataci.
    const observer = new MutationObserver(() => {
        zkontrolovatDOM();
    });

    // Začneme sledovat celou stránku na jakékoliv překreslení DOMu
    observer.observe(document.body, { childList: true, subtree: true });

    // Provedeme první kontrolu ihned pro případ, že prvek už existuje
    zkontrolovatDOM();

    // 2. Globální EventListener (zavěšený na window vydrží i přes změny stránek)
    window.addEventListener('scroll', () => {
        if (!navbar) return; // Pokud na dané stránce navigace není, neděláme nic

        const aktualniPoziceScrollu = window.scrollY || document.documentElement.scrollTop;
        const rozdilScrollu = aktualniPoziceScrollu - posledniPoziceScrollu;

        aktualniPosunY = aktualniPosunY - rozdilScrollu;
        aktualniPosunY = Math.max(-navHeight, Math.min(0, aktualniPosunY));

        navbar.style.transform = `translateY(${aktualniPosunY}px)`;

        posledniPoziceScrollu = aktualniPoziceScrollu <= 0 ? 0 : aktualniPoziceScrollu;

        // Průběžně aktualizujeme výšku, kdyby se změnila
        navHeight = navbar.offsetHeight;
    }, { passive: true });

})();