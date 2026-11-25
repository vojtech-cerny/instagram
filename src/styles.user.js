// ==UserScript==
// @name  styles
// ==/UserScript==

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
[data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] > div > div:first-child > div > div, [data-pagelet="IGDInboxThreadListScrollableAreaPagelet"] [role="presentation"] li [role="button"] > div > div:first-child > div > div > div {
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 49%, rgb(var(--ig-primary-background)) 50%, rgb(var(--ig-primary-background)));
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