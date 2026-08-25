import Swiper from "./vendor/swiper-bundle.mjs";

const ImageGallery = (() => {
    const ICON_CLOSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.4 5L5 6.4L10.6 12L5 17.6L6.4 19L12 13.4L17.6 19L19 17.6L13.4 12L19 6.4L17.6 5L12 10.6z"/></svg>`;
    const ICON_PREV = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.7 6.3a1 1 0 0 1 0 1.4L10.4 12l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0z"/></svg>`;
    const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.3 6.3a1 1 0 0 0 0 1.4L13.6 12l-4.3 4.3a1 1 0 1 0 1.4 1.4l5-5a1 1 0 0 0 0-1.4l-5-5a1 1 0 0 0-1.4 0z"/></svg>`;
    const ICON_DOWNLOAD = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v9.58l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V4a1 1 0 0 1 1-1ZM4 19a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z"/></svg>`;

    const EXCLUDE_SELECTORS = ['[class^="related-"]', '[class*=" related-"]'];
    const EXCLUDE_SELECTOR = EXCLUDE_SELECTORS.join(",");

    /* Zoom bằng tay: pinch 2 ngón trên mobile, double-tap / double-click, kéo để pan.
       Do module Zoom của Swiper đảm nhiệm (đã có sẵn trong swiper-bundle). */
    const ZOOM_MAX_RATIO = 3;

    let root = null;
    let counterEl = null;
    let swiperEl = null;
    let swiperInstance = null;
    let lastFocused = null;

    function escapeHtml(s) {
        return String(s).replace(
            /[&<>"']/g,
            (c) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[c],
        );
    }

    function buildRoot() {
        const el = document.createElement("div");
        el.className = "image-gallery";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-modal", "true");
        el.setAttribute("aria-hidden", "true");
        el.innerHTML = `
            <div class="image-gallery__backdrop" data-gallery-close></div>
            <div class="image-gallery__counter" aria-live="polite"></div>
            <button type="button" class="image-gallery__btn image-gallery__download" data-gallery-download aria-label="Tải ảnh">${ICON_DOWNLOAD}</button>
            <button type="button" class="image-gallery__btn image-gallery__close" data-gallery-close aria-label="Đóng">${ICON_CLOSE}</button>
            <button type="button" class="image-gallery__btn image-gallery__nav image-gallery__nav--prev" aria-label="Ảnh trước">${ICON_PREV}</button>
            <button type="button" class="image-gallery__btn image-gallery__nav image-gallery__nav--next" aria-label="Ảnh sau">${ICON_NEXT}</button>
            <div class="swiper image-gallery__swiper">
                <div class="swiper-wrapper"></div>
            </div>
        `;

        counterEl = el.querySelector(".image-gallery__counter");
        swiperEl = el.querySelector(".image-gallery__swiper");

        el.addEventListener("click", (e) => {
            if (e.target.closest("[data-gallery-close]")) return close();
            if (e.target.closest("[data-gallery-download]")) return downloadCurrent();
            if (e.target.closest(".image-gallery__btn")) return;
            if (e.target.closest(".image-gallery__zoom")) return;
            if (e.target.closest(".image-gallery__img")) return;
            close();
        });

        document.body.appendChild(el);
        return el;
    }

    function isVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function isExcluded(img) {
        return !!EXCLUDE_SELECTOR && !!img.closest(EXCLUDE_SELECTOR);
    }

    function collectImages() {
        const content = document.getElementById("content");
        if (!content) return [];
        return Array.from(content.querySelectorAll("img")).filter(
            (img) => isVisible(img) && !isExcluded(img),
        );
    }

    function captionFor(img) {
        const figure = img.closest("figure");
        const fc = figure ? figure.querySelector("figcaption") : null;
        const text = fc ? fc.textContent.trim() : "";
        return text || (img.alt || "").trim();
    }

    function buildSlides(images) {
        const wrapper = swiperEl.querySelector(".swiper-wrapper");
        wrapper.innerHTML = images
            .map((img) => {
                const src = img.currentSrc || img.src;
                const alt = escapeHtml(img.alt || "");
                const caption = escapeHtml(captionFor(img));
                return `
                    <div class="swiper-slide">
                        <figure class="image-gallery__figure">
                            <div class="swiper-zoom-container image-gallery__zoom">
                                <img class="image-gallery__img" src="${src}" alt="${alt}">
                            </div>
                            ${caption ? `<figcaption class="image-gallery__caption">${caption}</figcaption>` : ""}
                        </figure>
                    </div>
                `;
            })
            .join("");
    }

    function updateCounter(index, total) {
        if (counterEl) counterEl.textContent = `${index + 1} / ${total}`;
        if (root) root.dataset.single = total <= 1 ? "true" : "false";
    }

    function setZoomed(isZoomed) {
        if (root) root.dataset.zoomed = isZoomed ? "true" : "false";
    }

    function createSwiper(initialSlide) {
        return new Swiper(swiperEl, {
            initialSlide,
            speed: 400,
            spaceBetween: 40,
            slidesPerView: 1,
            keyboard: { enabled: true, onlyInViewport: false },
            zoom: {
                enabled: true,
                minRatio: 1,
                maxRatio: ZOOM_MAX_RATIO,
                toggle: true,
            },
            navigation: {
                prevEl: root.querySelector(".image-gallery__nav--prev"),
                nextEl: root.querySelector(".image-gallery__nav--next"),
            },
            on: {
                init(s) {
                    updateCounter(s.activeIndex, s.slides.length);
                    setZoomed(false);
                },
                slideChange(s) {
                    updateCounter(s.activeIndex, s.slides.length);
                    setZoomed(false);
                },
                zoomChange(s, scale) {
                    setZoomed(scale > 1);
                },
            },
        });
    }

    function open(index) {
        if (!root) root = buildRoot();
        const images = collectImages();
        if (!images.length || index < 0 || index >= images.length) return;

        buildSlides(images);
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
        swiperInstance = createSwiper(index);

        lastFocused = document.activeElement;
        root.classList.add("is-active");
        root.setAttribute("aria-hidden", "false");
        document.body.classList.add("overlay-open");
    }

    function close() {
        if (!root || !root.classList.contains("is-active")) return;

        if (swiperInstance && swiperInstance.zoom) {
            try {
                swiperInstance.zoom.out();
            } catch {
                /* swiper đã bị hủy — bỏ qua */
            }
        }
        setZoomed(false);

        root.classList.remove("is-active");
        root.setAttribute("aria-hidden", "true");
        document.body.classList.remove("overlay-open");

        if (swiperInstance) {
            const inst = swiperInstance;
            swiperInstance = null;
            setTimeout(() => inst.destroy(true, true), 300);
        }

        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus();
        }
        lastFocused = null;
    }

    async function downloadCurrent() {
        if (!swiperInstance) return;
        const slide = swiperInstance.slides[swiperInstance.activeIndex];
        const img = slide?.querySelector("img");
        if (!img) return;

        const url = img.src;
        const filename = (url.split("/").pop() || "image").split("?")[0] || "image";

        try {
            const res = await fetch(url, { mode: "cors" });
            if (!res.ok) throw new Error(`status ${res.status}`);
            const blob = await res.blob();
            const objUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
        } catch {
            window.open(url, "_blank", "noopener");
        }
    }

    function isOpen() {
        return !!root && root.classList.contains("is-active");
    }

    function onContentClick(e) {
        const img = e.target.closest("img");
        if (!img) return;
        const list = collectImages();
        const index = list.indexOf(img);
        if (index === -1) return;
        e.preventDefault();
        open(index);
    }

    function init() {
        const content = document.getElementById("content");
        if (!content) return;
        content.addEventListener("click", onContentClick);

        document.addEventListener("keydown", (e) => {
            if (!isOpen()) return;
            if (e.key === "Escape") {
                e.preventDefault();
                close();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    return { open, close };
})();

export default ImageGallery;
