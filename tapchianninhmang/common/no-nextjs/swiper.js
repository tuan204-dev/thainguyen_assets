/**
 * SwiperManager — reusable, data-attribute-driven Swiper initialization system.
 *
 * HTML contract (data attributes on the .swiper container):
 *   [data-swiper]                    – marks element for Swiper init (required)
 *   [data-swiper-loop]              – "true" to enable loop mode
 *   [data-swiper-speed]             – transition speed in ms (default: 300)
 *   [data-swiper-slides-per-view]   – number or "auto" (default: 1)
 *   [data-swiper-space-between]     – gap in px (default: 0)
 *   [data-swiper-autoplay]          – "true" or JSON, e.g. {"delay":3000,"disableOnInteraction":false}
 *   [data-swiper-effect]            – "slide"|"fade"|"cube"|"coverflow"|"flip"|"cards"|"creative"
 *   [data-swiper-direction]         – "horizontal"|"vertical" (default: "horizontal")
 *   [data-swiper-centered-slides]   – "true" to center active slide
 *   [data-swiper-free-mode]         – "true" to enable free mode
 *   [data-swiper-breakpoints]       – JSON string for responsive config
 *   [data-swiper-pagination-type]   – "bullets"|"fraction"|"progressbar" (default: "bullets")
 *
 * Navigation & Pagination:
 *   Navigation — auto-detected via .swiper-button-next / .swiper-button-prev inside [data-swiper]
 *   Pagination — auto-detected via .swiper-pagination inside [data-swiper]
 *
 * Usage:
 *   1. Include Swiper CSS via CDN <link>.
 *   2. Include this script as a normal <script> (no type="module").
 *   3. Add `data-swiper` to any .swiper container — no extra JS needed.
 *
 * Features:
 *   - Auto-initializes on script load once Swiper is available.
 *   - Prevents duplicate initialization via __swiperInstance property.
 *   - Auto-loads Swiper UMD build if window.Swiper is not present.
 *   - Scoped navigation & pagination per instance.
 */

(function (doc) {
    "use strict";
    const root = doc.defaultView;

    const SwiperManager = (() => {
    /* ── constants ────────────────────────────────── */
    const SELECTOR = "[data-swiper]";
    const INSTANCE_KEY = "__swiperInstance";
    const SWIPER_SCRIPT_URLS = [
        "https://assets.tapchianninhmang.vn/common/vendor/swiper-bundle.min.js",
        "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
    ];

    let loadingPromise = null;

    /* ── helpers ──────────────────────────────────── */

    /** Return Swiper constructor from global scope when available. */
    const getSwiper = () => root.Swiper;

    /** Wait for an existing Swiper script tag to finish loading. */
    const waitForScript = (scriptEl) =>
        new Promise((resolve, reject) => {
            if (!scriptEl) {
                reject(new Error("Swiper script tag was not found."));
                return;
            }

            const readySwiper = getSwiper();
            if (readySwiper) {
                resolve(readySwiper);
                return;
            }

            scriptEl.addEventListener(
                "load",
                () => {
                    const loadedSwiper = getSwiper();
                    if (loadedSwiper) {
                        resolve(loadedSwiper);
                    } else {
                        reject(
                            new Error(
                                "Swiper script loaded but window.Swiper is unavailable."
                            )
                        );
                    }
                },
                { once: true }
            );

            scriptEl.addEventListener(
                "error",
                () => reject(new Error("Failed to load existing Swiper script.")),
                { once: true }
            );
        });

    /** Inject script tag for a Swiper UMD URL and wait for it to load. */
    const loadScript = (url) =>
        new Promise((resolve, reject) => {
            const existing = Array.from(doc.scripts).find((s) => {
                const src = s.getAttribute("src") || "";
                return src === url || src.includes("swiper-bundle.min.js");
            });
            if (existing) {
                waitForScript(existing).then(resolve).catch(reject);
                return;
            }

            const script = doc.createElement("script");
            script.src = url;
            script.async = true;
            script.addEventListener(
                "load",
                () => {
                    const loadedSwiper = getSwiper();
                    if (loadedSwiper) {
                        resolve(loadedSwiper);
                    } else {
                        reject(
                            new Error(
                                "Swiper script loaded but window.Swiper is unavailable."
                            )
                        );
                    }
                },
                { once: true }
            );
            script.addEventListener(
                "error",
                () => reject(new Error(`Failed to load Swiper script: ${url}`)),
                { once: true }
            );

            (doc.head || doc.documentElement).appendChild(script);
        });

    /** Ensure Swiper UMD constructor exists before attempting initialization. */
    function ensureSwiperLoaded() {
        const existingSwiper = getSwiper();
        if (existingSwiper) return Promise.resolve(existingSwiper);

        if (loadingPromise) return loadingPromise;

        const tryLoad = (index) => {
            if (index >= SWIPER_SCRIPT_URLS.length) {
                return Promise.reject(
                    new Error("All Swiper script URLs failed to load.")
                );
            }

            return loadScript(SWIPER_SCRIPT_URLS[index]).catch(() =>
                tryLoad(index + 1)
            );
        };

        loadingPromise = tryLoad(0).catch((error) => {
            loadingPromise = null;
            throw error;
        });

        return loadingPromise;
    }

    /** Read a data-swiper-* attribute with a fallback. */
    const attr = (el, name, fallback) => {
        const v = el.getAttribute(`data-swiper-${name}`);
        return v == null ? fallback : v;
    };

    /** Parse a value as boolean ("true" → true, everything else → false). */
    const toBool = (v) => v === "true";

    /** Safely parse JSON, returning fallback on error. */
    const parseJSON = (str, fallback) => {
        try {
            return JSON.parse(str);
        } catch {
            return fallback;
        }
    };

    /* ── config builder ──────────────────────────── */

    /** Build Swiper config object from data attributes on the container. */
    function buildConfig(el) {
        const config = {};

        // — Basic options —
        const loop = attr(el, "loop", null);
        if (loop != null) config.loop = toBool(loop);

        const speed = attr(el, "speed", null);
        if (speed != null) config.speed = Number(speed);

        const slidesPerView = attr(el, "slides-per-view", null);
        if (slidesPerView != null) {
            config.slidesPerView =
                slidesPerView === "auto" ? "auto" : Number(slidesPerView);
        }

        const spaceBetween = attr(el, "space-between", null);
        if (spaceBetween != null) config.spaceBetween = Number(spaceBetween);

        const direction = attr(el, "direction", null);
        if (direction != null) config.direction = direction;

        const centeredSlides = attr(el, "centered-slides", null);
        if (centeredSlides != null) config.centeredSlides = toBool(centeredSlides);

        const freeMode = attr(el, "free-mode", null);
        if (freeMode != null) config.freeMode = toBool(freeMode);

        // — Effect —
        const effect = attr(el, "effect", null);
        if (effect != null) {
            config.effect = effect;
            // Fade effect typically needs crossFade for proper rendering
            if (effect === "fade") {
                config.fadeEffect = { crossFade: true };
            }
        }

        // — Autoplay —
        const autoplay = attr(el, "autoplay", null);
        if (autoplay != null) {
            if (autoplay === "true") {
                config.autoplay = { delay: 3000, disableOnInteraction: false };
            } else {
                config.autoplay = parseJSON(autoplay, false);
            }
        }

        // — Breakpoints —
        const breakpoints = attr(el, "breakpoints", null);
        if (breakpoints != null) {
            config.breakpoints = parseJSON(breakpoints, undefined);
        }

        // — Navigation (scoped to this container) —
        const nextEl = el.querySelector(".swiper-button-next");
        const prevEl = el.querySelector(".swiper-button-prev");
        if (nextEl || prevEl) {
            config.navigation = {};
            if (nextEl) config.navigation.nextEl = nextEl;
            if (prevEl) config.navigation.prevEl = prevEl;
        }

        // — Pagination (scoped to this container) —
        const paginationEl = el.querySelector(".swiper-pagination");
        if (paginationEl) {
            const paginationType = attr(el, "pagination-type", "bullets");
            config.pagination = {
                el: paginationEl,
                type: paginationType,
                clickable: paginationType === "bullets",
            };
        }

        return config;
    }

    /* ── core ─────────────────────────────────────── */

    /** Initialize Swiper on a single [data-swiper] element. */
    function initElement(el) {
        // Guard: skip if already initialized
        if (el[INSTANCE_KEY]) return;

        const Swiper = getSwiper();
        if (!Swiper) return;

        const config = buildConfig(el);
        const instance = new Swiper(el, config);
        el[INSTANCE_KEY] = instance;
    }

    /** Destroy Swiper on a single element to free resources. */
    function destroyElement(el) {
        const instance = el[INSTANCE_KEY];
        if (instance) {
            instance.destroy(true, true);
            el[INSTANCE_KEY] = null;
        }
    }

    /** Re-initialize an element (destroy + init). */
    function reinitElement(el) {
        destroyElement(el);
        initElement(el);
    }

    /** Scan the DOM and initialize all [data-swiper] elements. */
    function initAll(scanRoot = doc) {
        if (!scanRoot || typeof scanRoot.querySelectorAll !== "function") return;

        scanRoot.querySelectorAll(SELECTOR).forEach(initElement);
    }

    /** Run callback when DOM is ready in browser environments. */
    function onDomReady(callback) {
        if (typeof callback !== "function") return;

        if (doc.readyState === "loading") {
            doc.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    /* ── bootstrap ────────────────────────────────── */

    onDomReady(() => {
        ensureSwiperLoaded()
            .then(() => initAll())
            .catch((error) => {
                console.error("[SwiperManager] Failed to initialize sliders.", error);
            });
    });

    /* ── public API ───────────────────────────────── */
    return {
        /** Initialize a single element or all [data-swiper] under a root. */
        init: (elOrRoot) => {
            const run = () => {
                if (
                    elOrRoot &&
                    typeof elOrRoot.hasAttribute === "function" &&
                    elOrRoot.hasAttribute("data-swiper")
                ) {
                    initElement(elOrRoot);
                    return;
                }

                initAll(elOrRoot || doc);
            };

            if (getSwiper()) {
                run();
                return;
            }

            ensureSwiperLoaded()
                .then(run)
                .catch((error) => {
                    console.error("[SwiperManager] Failed to run init().", error);
                });
        },
        /** Destroy Swiper on a specific element. */
        destroy: destroyElement,
        /** Re-initialize (useful after dynamic config changes). */
        reinit: reinitElement,
    };
    })();

    root.SwiperManager = SwiperManager;
})(document);
