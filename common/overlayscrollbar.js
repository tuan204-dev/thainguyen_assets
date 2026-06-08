/**
 * OverlayScrollbar — reusable, data-attribute-driven custom scrollbar system.
 *
 * HTML contract (data attributes on the scrollable element):
 *   [data-scroll]                – marks element for OverlayScrollbars init
 *   [data-scroll-auto-hide]     – "never" | "scroll" | "leave" | "move"  (default: "scroll")
 *   [data-scroll-auto-hide-delay] – ms before auto-hide                   (default: 800)
 *   [data-scroll-theme]         – theme classname                         (default: "os-theme-dark")
 *   [data-scroll-overflow-x]    – "scroll" | "hidden" | "visible"        (default: "scroll")
 *   [data-scroll-overflow-y]    – "scroll" | "hidden" | "visible"        (default: "scroll")
 *   [data-scroll-click-scroll]  – "true" to enable click-on-track scroll (default: false)
 *   [data-scroll-visibility]    – "auto" | "visible" | "hidden"          (default: "auto")
 *
 * Usage:
 *   1. Include OverlayScrollbars CSS via CDN (see index.html).
 *   2. Include this script (type="module") and the companion overlayscrollbar.css.
 *   3. Add `data-scroll` to any element — no extra JS needed.
 *
 * Features:
 *   - Auto-initializes on DOMContentLoaded.
 *   - MutationObserver watches for dynamically added [data-scroll] elements.
 *   - Avoids duplicate initialization (stores instance ref on element).
 *   - Supports destroy via attribute removal and re-init via attribute change.
 */

import { OverlayScrollbars, ClickScrollPlugin } from "./vendor/overlayscrollbars.mjs";

const ScrollManager = (() => {
    /* ── constants ────────────────────────────────── */
    const ATTR = "data-scroll";
    const INSTANCE_KEY = "__osInstance";

    /* ── helpers ──────────────────────────────────── */

    /** Read a data-attribute value with a fallback. */
    const attr = (el, name, fallback) => {
        const v = el.getAttribute(`data-scroll-${name}`);
        return v == null ? fallback : v;
    };

    /** Build OverlayScrollbars options from data attributes. */
    function buildOptions(el) {
        const autoHide = attr(el, "auto-hide", "scroll");
        const autoHideDelay = Number(attr(el, "auto-hide-delay", 800));
        const theme = attr(el, "theme", "os-theme-dark");
        const overflowX = attr(el, "overflow-x", "scroll");
        const overflowY = attr(el, "overflow-y", "scroll");
        const clickScroll = attr(el, "click-scroll", "false") === "true";
        const visibility = attr(el, "visibility", "auto");

        return {
            scrollbars: {
                theme,
                visibility,
                autoHide,
                autoHideDelay,
                autoHideSuspend: true,
                dragScroll: true,
                clickScroll,
            },
            overflow: {
                x: overflowX,
                y: overflowY,
            },
        };
    }

    /* ── core ─────────────────────────────────────── */

    // Register ClickScrollPlugin once
    OverlayScrollbars.plugin(ClickScrollPlugin);

    /** Initialize OverlayScrollbars on a single element. */
    function initElement(el) {
        // Guard: skip if already initialized
        if (el[INSTANCE_KEY]) return;

        const opts = buildOptions(el);
        const instance = OverlayScrollbars(el, opts);
        el[INSTANCE_KEY] = instance;
    }

    /** Destroy OverlayScrollbars on a single element. */
    function destroyElement(el) {
        const instance = el[INSTANCE_KEY];
        if (instance) {
            instance.destroy();
            el[INSTANCE_KEY] = null;
        }
    }

    /** Re-initialize an element (destroy + init). */
    function reinitElement(el) {
        destroyElement(el);
        initElement(el);
    }

    /** Scan the DOM and initialize all [data-scroll] elements. */
    function initAll(root = document) {
        root.querySelectorAll(`[${ATTR}]`).forEach(initElement);
    }

    /* ── MutationObserver (dynamic content) ───────── */

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            // Handle added nodes
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                // Check the added node itself
                if (node.hasAttribute?.(ATTR)) initElement(node);

                // Check descendants
                node.querySelectorAll?.(`[${ATTR}]`).forEach(initElement);
            }

            // Handle removed nodes — destroy instances to free memory
            for (const node of mutation.removedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                if (node[INSTANCE_KEY]) destroyElement(node);
                node.querySelectorAll?.(`[${ATTR}]`).forEach(destroyElement);
            }

            // Handle attribute changes on existing elements
            if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) {
                const el = mutation.target;

                if (mutation.attributeName === ATTR) {
                    // Attribute added → init; attribute removed → destroy
                    el.hasAttribute(ATTR) ? initElement(el) : destroyElement(el);
                }

                // If any data-scroll-* config attribute changes → re-init
                if (mutation.attributeName?.startsWith("data-scroll-") && el.hasAttribute(ATTR)) {
                    reinitElement(el);
                }
            }
        }
    });

    /* ── bootstrap ────────────────────────────────── */

    function boot() {
        initAll();

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
                ATTR,
                "data-scroll-auto-hide",
                "data-scroll-auto-hide-delay",
                "data-scroll-theme",
                "data-scroll-overflow-x",
                "data-scroll-overflow-y",
                "data-scroll-click-scroll",
                "data-scroll-visibility",
            ],
        });
    }

    // Module scripts are deferred by default, so DOM is ready
    boot();

    /* ── public API ───────────────────────────────── */
    return {
        /** Initialize a single element or all [data-scroll] under a root. */
        init: (elOrRoot) => {
            if (elOrRoot?.hasAttribute?.(ATTR)) {
                initElement(elOrRoot);
            } else {
                initAll(elOrRoot);
            }
        },
        /** Destroy scrollbar on a specific element. */
        destroy: destroyElement,
        /** Re-initialize (useful after major content changes). */
        reinit: reinitElement,
    };
})();

export default ScrollManager;
