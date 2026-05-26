import Swiper from "./vendor/swiper-bundle.mjs";

const SwiperManager = (() => {
    const SELECTOR = "[data-swiper]";
    const INSTANCE_KEY = "__swiperInstance";

    const attr = (el, name, fallback) => {
        const v = el.getAttribute(`data-swiper-${name}`);
        return v == null ? fallback : v;
    };
    const toBool = (v) => v === "true";

    const parseJSON = (str, fallback) => {
        try {
            return JSON.parse(str);
        } catch {
            return fallback;
        }
    };

    function buildConfig(el) {
        const config = {};

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

        const effect = attr(el, "effect", null);
        if (effect != null) {
            config.effect = effect;
            if (effect === "fade") {
                config.fadeEffect = { crossFade: true };
            }
        }

        const autoplay = attr(el, "autoplay", null);
        if (autoplay != null) {
            if (autoplay === "true") {
                config.autoplay = { delay: 3000, disableOnInteraction: false };
            } else {
                config.autoplay = parseJSON(autoplay, false);
            }
        }

        const breakpoints = attr(el, "breakpoints", null);
        if (breakpoints != null) {
            config.breakpoints = parseJSON(breakpoints, undefined);
        }

        // Support external nav via data-swiper-next-el / data-swiper-prev-el (CSS selector)
        const nextSel = attr(el, "next-el", null);
        const prevSel = attr(el, "prev-el", null);
        const nextEl = nextSel ? document.querySelector(nextSel) : el.querySelector(".swiper-button-next");
        const prevEl = prevSel ? document.querySelector(prevSel) : el.querySelector(".swiper-button-prev");
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

    function initElement(el) {
        if (el[INSTANCE_KEY]) return;

        const config = buildConfig(el);
        const instance = new Swiper(el, config);
        el[INSTANCE_KEY] = instance;
    }

    function destroyElement(el) {
        const instance = el[INSTANCE_KEY];
        if (instance) {
            instance.destroy(true, true);
            el[INSTANCE_KEY] = null;
        }
    }

    function reinitElement(el) {
        destroyElement(el);
        initElement(el);
    }

    function initAll(root = document) {
        root.querySelectorAll(SELECTOR).forEach(initElement);
    }

    initAll();

    return {
        init: (elOrRoot) => {
            if (elOrRoot?.hasAttribute?.("data-swiper")) {
                initElement(elOrRoot);
            } else {
                initAll(elOrRoot);
            }
        },
        destroy: destroyElement,
        reinit: reinitElement,
    };
})();

if (typeof window !== "undefined") window.SwiperManager = SwiperManager;

export default SwiperManager;
