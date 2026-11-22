// ==UserScript==
// @name  native emojis
// ==/UserScript==

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