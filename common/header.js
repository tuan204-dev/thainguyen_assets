// Collapsible lists — show only N items by default, toggle expand/collapse.
//
// Usage:
//   <ul data-collapsible-list data-collapsible-limit="4">
//     <li>Item 1</li>
//     ...
//     <li>Item 8</li>
//     <li><a href="" data-collapsible-toggle>Xem...</a></li>
//   </ul>
//
// Toggle text swaps between the anchor's original text (expand label) and
// "Ẩn..." (collapse label). Override either via data-expand-label /
// data-collapse-label on the anchor.

const LIST_SELECTOR = "[data-collapsible-list]";
const TOGGLE_SELECTOR = "[data-collapsible-toggle]";
const DEFAULT_LIMIT = 4;
const HIDDEN_CLASS = "collapsible-hidden";
const ENTERING_CLASS = "collapsible-entering";
const EXITING_CLASS = "collapsible-exiting";
const STAGGER_IN_MS = 30;
const STAGGER_OUT_MS = 20;

function ensureStyles() {
    if (document.getElementById("collapsible-list-styles")) return;
    const style = document.createElement("style");
    style.id = "collapsible-list-styles";
    style.textContent = `
        .${HIDDEN_CLASS}{display:none!important;}
        .${ENTERING_CLASS}{animation:collapsibleFadeIn 280ms cubic-bezier(0.22,1,0.36,1) both;}
        .${EXITING_CLASS}{animation:collapsibleFadeOut 220ms cubic-bezier(0.22,1,0.36,1) both;}
        @keyframes collapsibleFadeIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
        @keyframes collapsibleFadeOut{from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(-6px);}}
    `;
    document.head.appendChild(style);
}

function clearAnim(el, klass) {
    el.classList.remove(klass);
    el.style.animationDelay = "";
}

function expand(items) {
    items.forEach((el, i) => {
        el.classList.remove(HIDDEN_CLASS, EXITING_CLASS);
        el.style.animationDelay = `${i * STAGGER_IN_MS}ms`;
        el.classList.add(ENTERING_CLASS);
        const onEnd = (e) => {
            if (e.target !== el) return;
            el.removeEventListener("animationend", onEnd);
            clearAnim(el, ENTERING_CLASS);
        };
        el.addEventListener("animationend", onEnd);
    });
}

function collapse(items) {
    items.forEach((el, i) => {
        el.classList.remove(ENTERING_CLASS);
        el.style.animationDelay = `${(items.length - 1 - i) * STAGGER_OUT_MS}ms`;
        el.classList.add(EXITING_CLASS);
        const onEnd = (e) => {
            if (e.target !== el) return;
            el.removeEventListener("animationend", onEnd);
            el.classList.add(HIDDEN_CLASS);
            clearAnim(el, EXITING_CLASS);
        };
        el.addEventListener("animationend", onEnd);
    });
}

function initList(list) {
    if (list.dataset.collapsibleReady === "true") return;
    list.dataset.collapsibleReady = "true";

    const limit = Number(list.dataset.collapsibleLimit) || DEFAULT_LIMIT;
    const toggle = list.querySelector(TOGGLE_SELECTOR);
    const toggleItem = toggle ? toggle.closest("li") : null;

    const items = Array.from(list.children).filter(
        (el) => el.tagName === "LI" && el !== toggleItem,
    );

    if (items.length <= limit) {
        if (toggleItem) toggleItem.classList.add(HIDDEN_CLASS);
        return;
    }

    const hidden = items.slice(limit);
    hidden.forEach((el) => el.classList.add(HIDDEN_CLASS));

    if (!toggle) return;

    const expandLabel = (toggle.dataset.expandLabel || toggle.textContent).trim();
    const collapseLabel = (toggle.dataset.collapseLabel || "Ẩn...").trim();
    let expanded = false;

    toggle.addEventListener("click", (e) => {
        e.preventDefault();
        expanded = !expanded;
        toggle.textContent = expanded ? collapseLabel : expandLabel;
        if (expanded) expand(hidden);
        else collapse(hidden);
    });
}

function initAll(root = document) {
    ensureStyles();
    root.querySelectorAll(LIST_SELECTOR).forEach(initList);
}

initAll();

const CollapsibleList = { init: initAll };

if (typeof window !== "undefined") window.CollapsibleList = CollapsibleList;

export default CollapsibleList;
