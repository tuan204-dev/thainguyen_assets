(function (doc) {
    "use strict";
    const root = doc.defaultView;

    const DEPS = [
        { url: "https://assets.tapchianninhmang.vn/common/overlay.js", global: "Overlay" },
        { url: "https://assets.tapchianninhmang.vn/common/swiper.js", global: "SwiperManager" },
    ];

    const loadScript = (url) =>
        new Promise((resolve, reject) => {
            const existing = Array.from(doc.scripts).find(
                (s) => (s.getAttribute("src") || "") === url,
            );
            if (existing) {
                if (existing.dataset.loaded === "true") return resolve();
                existing.addEventListener("load", () => resolve(), { once: true });
                existing.addEventListener(
                    "error",
                    () => reject(new Error(`Failed to load: ${url}`)),
                    { once: true },
                );
                return;
            }
            const script = doc.createElement("script");
            script.src = url;
            script.type = "module";
            script.async = true;
            script.addEventListener(
                "load",
                () => {
                    script.dataset.loaded = "true";
                    resolve();
                },
                { once: true },
            );
            script.addEventListener("error", () => reject(new Error(`Failed to load: ${url}`)), {
                once: true,
            });
            (doc.head || doc.documentElement).appendChild(script);
        });

    const ensureDeps = () =>
        Promise.all(
            DEPS.map((dep) => (root[dep.global] ? Promise.resolve() : loadScript(dep.url))),
        ).then(() => {
            const missing = DEPS.filter((dep) => !root[dep.global]).map((dep) => dep.global);
            if (missing.length) {
                throw new Error(`Missing globals after load: ${missing.join(", ")}`);
            }
            return { Overlay: root.Overlay, SwiperManager: root.SwiperManager };
        });

    let Overlay;
    let SwiperManager;

    const SECTION_SELECTOR = ".short-video-section";
    const OVERLAY_ID = "short-video-player";
    const STYLE_ID = "short-video-styles";

    const STYLES = `
.short-video-section .swiper-slide { height: auto; }
.short-video-section .swiper { padding: 4px; }
.short-video-section .swiper-button-prev,
.short-video-section .swiper-button-next {
    width: 44px;
    height: 44px;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 9999px;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: background 0.2s ease, transform 0.2s ease;
}
.short-video-section .swiper-button-prev:hover,
.short-video-section .swiper-button-next:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
}
.short-video-section .swiper-button-prev { left: 8px; }
.short-video-section .swiper-button-next { right: 8px; }
.short-video-section .swiper-button-prev::after,
.short-video-section .swiper-button-next::after {
    font-size: 18px;
    font-weight: 700;
}
.short-video-section .swiper-button-disabled {
    opacity: 0.35;
    pointer-events: none;
}
.short-video-player { width: 100%; height: 100%; }
.short-video-player > .swiper-wrapper > .swiper-slide {
    display: flex;
    justify-content: center;
    background: #000;
}

.short-video-stage {
    position: relative;
    aspect-ratio: var(--video-aspect, 9 / 16);
    height: 100%;
    width: auto;
    max-width: 100%;
    max-height: 100%;
    background: #000;
    overflow: hidden;
    border-radius: 12px;
}
.short-video-stage__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.short-video-stage__mute {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 36px;
    height: 36px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    padding: 0;
    z-index: 3;
}
.short-video-stage__mute:hover { background: rgba(0, 0, 0, 0.75); }
.short-video-stage__playpause {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 92px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    border-radius: 14px;
    border: none;
    padding: 0;
    cursor: pointer;
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.short-video-stage__playpause svg { width: 36px; height: 36px; }
.short-video-stage[data-paused="true"] .short-video-stage__playpause {
    opacity: 1;
    pointer-events: auto;
}
.short-video-stage__playpause:hover { transform: translate(-50%, -50%) scale(1.05); }
.short-video-stage__actions {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: flex-end;
    margin-left: 12px;
    padding-bottom: 16px;
}
@media (max-width: 767px) {
    .short-video-player > .swiper-wrapper > .swiper-slide { position: relative; }
    .short-video-stage__actions {
        position: absolute;
        right: 10px;
        bottom: 80px;
        margin-left: 0;
        padding-bottom: 0;
        z-index: 3;
    }
}
.short-video-stage__action {
    width: 44px;
    height: 44px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    padding: 0;
    transition: background 0.2s ease, transform 0.2s ease;
}
.short-video-stage__action:hover {
    background: rgba(0, 0, 0, 0.65);
    transform: scale(1.05);
}
.short-video-stage__title {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 14px;
    padding: 32px 16px 12px;
    color: #fff;
    pointer-events: none;
    z-index: 1;
}
.short-video-stage__title p {
    margin: 0;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}

.short-video-seek {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 14px;
    margin: 0;
    padding: 0;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}
.short-video-stage:hover .short-video-seek,
.short-video-seek:hover,
.short-video-seek:focus,
.short-video-seek:active {
    opacity: 1;
    pointer-events: auto;
}
.short-video-seek:focus { outline: none; }
.short-video-seek::-webkit-slider-runnable-track {
    height: 3px;
    background: linear-gradient(to right, #fff 0%, #fff var(--progress, 0%), rgba(255,255,255,0.3) var(--progress, 0%), rgba(255,255,255,0.3) 100%);
}
.short-video-seek::-moz-range-track {
    height: 3px;
    background: rgba(255,255,255,0.3);
}
.short-video-seek::-moz-range-progress {
    height: 3px;
    background: #fff;
}
.short-video-seek::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #fff;
    margin-top: -5px;
    box-shadow: 0 0 6px rgba(0,0,0,0.4);
    transition: transform 0.15s ease;
}
.short-video-seek:hover::-webkit-slider-thumb,
.short-video-seek:active::-webkit-slider-thumb { transform: scale(1.25); }
.short-video-seek::-moz-range-thumb {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #fff;
    border: 0;
    box-shadow: 0 0 6px rgba(0,0,0,0.4);
}

.short-video-time {
    position: absolute;
    right: 12px;
    bottom: 16px;
    z-index: 2;
    color: #fff;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}
.short-video-stage:hover .short-video-time { opacity: 1; }
`;

    const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC_MAP[c]);

    const ICON_VOLUME_ON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    const ICON_VOLUME_OFF = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`;
    const ICON_PLAY = `<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4v16l14-8z"/></svg>`;
    const ICON_SHARE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill="currentColor" fill-rule="evenodd" d="M10.938 3.175a.674.674 0 0 1 1.138-.488l6.526 6.215c.574.547.554 1.47-.043 1.991l-6.505 5.676a.674.674 0 0 1-1.116-.508V13.49s-6.985-1.258-9.225 2.854c-.209.384-1.023.518-.857-1.395.692-3.52 2.106-9.017 10.082-9.017z" clip-rule="evenodd"/><path fill="#161823" fill-rule="evenodd" d="m15.754 6.212 1.295 2.59a1.12 1.12 0 0 1-.268 1.349l-5.799 5.042s-.28 1.403.562 1.403 7.578-6.174 7.578-6.174.28-.842-.561-1.684c-.843-.842-2.807-2.526-2.807-2.526" clip-rule="evenodd" opacity="0.03"/><path fill="url(#short-video-share-gradient)" fill-rule="evenodd" d="M10.937 6.23v7.297s-6.683-.942-8.777 2.246C.146 18.839.331 12.309 3.363 9.057s7.574-2.827 7.574-2.827" clip-rule="evenodd" opacity="0.09"/><defs><radialGradient id="short-video-share-gradient" cx="0" cy="0" r="1" gradientTransform="rotate(-113.046 11.628 5.43)scale(8.93256 8.78076)" gradientUnits="userSpaceOnUse"><stop/><stop offset="0.995" stop-opacity="0.01"/><stop offset="1" stop-opacity="0.01"/></radialGradient></defs></svg>`;

    ensureDeps()
        .then((deps) => {
            Overlay = deps.Overlay;
            SwiperManager = deps.SwiperManager;
            const section = doc.querySelector(SECTION_SELECTOR);
            if (!section) return;
            const items = readItems(section);
            if (!items.length) return;
            injectStyles();
            renderSection(section, items);
            const overlay = injectOverlay(items);
            SwiperManager.init(section);
            SwiperManager.init(overlay);
            wireBehavior(overlay);
        })
        .catch((err) => console.error("[short-video] Failed to load dependencies.", err));

    function readItems(section) {
        return [...section.querySelectorAll("[data-short-video]")].map((el) => ({
            title: el.dataset.title || "",
            thumbnail: el.dataset.thumbnail || "",
            view: el.dataset.view || "",
            videoSrc: el.dataset.videoSrc || "",
        }));
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    function renderSection(section, items) {
        const container = section.querySelector('[class~="t:container"]') || section;
        container.querySelectorAll("[data-short-video]").forEach((el) => el.remove());
        container.insertAdjacentHTML(
            "beforeend",
            `<div class="swiper" data-swiper data-swiper-slides-per-view="1.4" data-swiper-space-between="16"
             data-swiper-breakpoints='{"640":{"slidesPerView":2.4},"880":{"slidesPerView":3.4},"1100":{"slidesPerView":4.4}}'>
            <div class="swiper-wrapper">${items.map(cardHTML).join("")}</div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
        </div>`,
        );
    }

    function cardHTML(item, i) {
        const viewBadge = item.view
            ? `<span class="t:absolute t:top-2 t:right-2 t:flex t:items-center t:gap-1 t:bg-black/50 t:text-white t:text-xs t:px-2 t:py-1 t:rounded">
                <i class="material-symbols--visibility-rounded"></i> ${esc(item.view)}
            </span>`
            : "";
        return `<div class="swiper-slide">
        <div role="button" tabindex="0" data-short-video-index="${i}"
                class="t:relative t:block t:w-full t:aspect-9/16 t:rounded-lg t:overflow-hidden t:bg-cover t:bg-center t:cursor-pointer t:shadow-md"
                style="background-image:url('${esc(item.thumbnail)}')">
            ${viewBadge}
            <div class="t:absolute t:inset-x-0 t:bottom-0 t:p-3 t:pt-9 t:text-left t:text-white t:text-sm t:font-semibold t:line-clamp-3 t:bg-linear-to-b t:from-[rgba(0,0,0,0)] t:to-[rgba(0,0,0,0.95)]">
                <h3 class="title l3 t:text-white!">${esc(item.title)}</h3>
            </div>
        </div>
    </div>`;
    }

    function injectOverlay(items) {
        const overlay = document.createElement("div");
        overlay.className = "overlay";
        overlay.setAttribute("data-overlay-id", OVERLAY_ID);
        overlay.setAttribute("data-overlay-variant", "fullscreen");
        overlay.setAttribute("aria-hidden", "true");
        overlay.innerHTML = `
        <div class="overlay__backdrop"></div>
        <div class="overlay__content t:p-0! t:py-6! t:bg-black! t:flex t:items-center t:justify-center">
            <button type="button" data-overlay-target="${OVERLAY_ID}" aria-label="Close"
                    class="t:absolute t:top-4 t:right-4 t:z-10 t:w-10 t:h-10 t:rounded-full t:bg-white/15 t:text-white t:text-2xl t:flex t:items-center t:justify-center t:hover:bg-white/25">✕</button>
            <div class="t:absolute t:right-4 t:top-1/2 t:-translate-y-1/2 t:z-10 t:flex t:flex-col t:gap-4">
                <button type="button" data-short-video-nav="prev" aria-label="Video trước"
                        class="t:w-11 t:h-11 t:rounded-full t:bg-white/15 t:text-white t:text-2xl t:flex t:items-center t:justify-center t:hover:bg-white/25 t:max-md:hidden">↑</button>
                <button type="button" data-short-video-nav="next" aria-label="Video kế tiếp"
                        class="t:w-11 t:h-11 t:rounded-full t:bg-white/15 t:text-white t:text-2xl t:flex t:items-center t:justify-center t:hover:bg-white/25 t:max-md:hidden">↓</button>
            </div>
            <div class="swiper short-video-player" data-swiper data-swiper-direction="vertical" data-swiper-slides-per-view="1" data-swiper-speed="350">
                <div class="swiper-wrapper">${items.map(playerSlideHTML).join("")}</div>
            </div>
        </div>`;
        document.body.appendChild(overlay);
        return overlay;
    }

    function playerSlideHTML(item) {
        return `<div class="swiper-slide t:flex t:items-end t:justify-center t:bg-black">
        <div class="short-video-stage" data-paused="false">
            <video class="short-video-stage__video"
                   src="${esc(item.videoSrc)}" poster="${esc(item.thumbnail)}"
                   playsinline loop preload="metadata"></video>
            <button type="button" data-short-video-mute aria-label="Bật/tắt tiếng"
                    class="short-video-stage__mute swiper-no-swiping">${ICON_VOLUME_ON}</button>
            <button type="button" data-short-video-play aria-label="Phát/tạm dừng"
                    class="short-video-stage__playpause swiper-no-swiping">${ICON_PLAY}</button>
            <div class="short-video-stage__title">
                <p>${esc(item.title || "Đang cập nhật")}</p>
            </div>
            <input type="range" class="short-video-seek swiper-no-swiping" data-short-video-seek
                   min="0" max="100" value="0" step="0.1" aria-label="Seek video">
            <span class="short-video-time" data-short-video-time>0:00 / 0:00</span>
        </div>
        <div class="short-video-stage__actions">
            <button type="button" data-short-video-share aria-label="Chia sẻ"
                    class="short-video-stage__action swiper-no-swiping">${ICON_SHARE}</button>
        </div>
    </div>`;
    }

    function formatTime(s) {
        if (!Number.isFinite(s) || s < 0) s = 0;
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    }

    function wireBehavior(overlay) {
        const playerEl = overlay.querySelector(".short-video-player");

        const getInst = () => playerEl?.__swiperInstance;
        const isOpen = () => overlay.classList.contains("is-active");
        const getActiveVideo = () =>
            playerEl?.querySelector(".swiper-slide-active video") ||
            playerEl?.querySelectorAll(".swiper-slide video")?.[getInst()?.activeIndex ?? 0];

        let isMuted = false;
        const applyMute = () => {
            overlay.querySelectorAll("video").forEach((v) => {
                v.muted = isMuted;
            });
            overlay.querySelectorAll("[data-short-video-mute]").forEach((btn) => {
                btn.innerHTML = isMuted ? ICON_VOLUME_OFF : ICON_VOLUME_ON;
            });
        };
        const syncStage = (slide) => {
            const v = slide.querySelector("video");
            const stage = slide.querySelector(".short-video-stage");
            if (!v || !stage) return;
            stage.dataset.paused = v.paused ? "true" : "false";
        };

        const pauseAll = () => {
            overlay.querySelectorAll("video").forEach((v) => {
                v.pause();
                v.currentTime = 0;
            });
        };

        const playActiveOnly = () => {
            const inst = getInst();
            const activeIndex = inst ? inst.activeIndex : 0;
            playerEl.querySelectorAll(".swiper-slide").forEach((slide, i) => {
                const v = slide.querySelector("video");
                if (!v) return;
                if (i === activeIndex) v.play().catch(() => {});
                else {
                    v.pause();
                    v.currentTime = 0;
                }
            });
        };

        document.addEventListener("click", (e) => {
            const card = e.target.closest("[data-short-video-index]");
            if (!card) return;
            e.preventDefault();
            const idx = Number(card.dataset.shortVideoIndex) || 0;
            Overlay.open(OVERLAY_ID);
            getInst()?.slideTo(idx, 0);
            playActiveOnly();
        });

        new MutationObserver(() => {
            if (isOpen()) playActiveOnly();
            else pauseAll();
        }).observe(overlay, { attributes: true, attributeFilter: ["class"] });

        getInst()?.on?.("slideChange", playActiveOnly);

        overlay.addEventListener("click", (e) => {
            if (e.target.closest("[data-short-video-mute]")) {
                isMuted = !isMuted;
                applyMute();
                return;
            }
            if (e.target.closest("[data-short-video-play]")) {
                const v = getActiveVideo();
                if (v) v.paused ? v.play().catch(() => {}) : v.pause();
                return;
            }
            if (e.target.closest("[data-short-video-share]")) {
                const shareBtn = e.target.closest("[data-short-video-share]");
                const slide =
                    shareBtn.closest(".swiper-slide") ||
                    playerEl?.querySelector(".swiper-slide-active");
                const v = slide?.querySelector("video") || getActiveVideo();
                const title =
                    slide?.querySelector(".short-video-stage__title p")?.textContent?.trim() ||
                    doc.title;
                const url = v?.currentSrc || v?.src || root.location.href;
                const shareData = { title, text: title, url };
                if (root.navigator?.share) {
                    root.navigator.share(shareData).catch(() => {});
                } else if (root.navigator?.clipboard?.writeText) {
                    root.navigator.clipboard.writeText(url).catch(() => {});
                }
                return;
            }
            const navBtn = e.target.closest("[data-short-video-nav]");
            if (navBtn) {
                const inst = getInst();
                if (!inst) return;
                navBtn.dataset.shortVideoNav === "prev" ? inst.slidePrev() : inst.slideNext();
                return;
            }
            const v = e.target.closest("video");
            if (!v) return;
            v.paused ? v.play().catch(() => {}) : v.pause();
        });

        playerEl.querySelectorAll(".swiper-slide").forEach((slide) => {
            const v = slide.querySelector("video");
            const stage = slide.querySelector(".short-video-stage");
            if (!v) return;
            const sync = () => syncStage(slide);
            v.addEventListener("play", sync);
            v.addEventListener("pause", sync);
            sync();
            const applyAspect = () => {
                if (stage && v.videoWidth && v.videoHeight) {
                    stage.style.aspectRatio = `${v.videoWidth} / ${v.videoHeight}`;
                }
            };
            v.addEventListener("loadedmetadata", applyAspect);
            applyAspect();
        });
        applyMute();

        playerEl.querySelectorAll(".swiper-slide").forEach((slide) => {
            const v = slide.querySelector("video");
            const seek = slide.querySelector("[data-short-video-seek]");
            const timeEl = slide.querySelector("[data-short-video-time]");
            if (!v || !seek) return;

            let isSeeking = false;
            const setProgress = (pct) => seek.style.setProperty("--progress", `${pct}%`);
            const updateTime = () => {
                if (timeEl)
                    timeEl.textContent = `${formatTime(v.currentTime)} / ${formatTime(v.duration)}`;
            };

            v.addEventListener("timeupdate", () => {
                updateTime();
                if (isSeeking || !v.duration) return;
                const pct = (v.currentTime / v.duration) * 100;
                seek.value = pct;
                setProgress(pct);
            });
            v.addEventListener("loadedmetadata", () => {
                setProgress(0);
                updateTime();
            });
            v.addEventListener("durationchange", updateTime);

            seek.addEventListener("pointerdown", () => {
                isSeeking = true;
            });
            seek.addEventListener("input", () => {
                if (v.duration) v.currentTime = (Number(seek.value) / 100) * v.duration;
                setProgress(Number(seek.value));
                updateTime();
            });
            const endSeek = () => {
                isSeeking = false;
            };
            seek.addEventListener("pointerup", endSeek);
            seek.addEventListener("pointercancel", endSeek);
            seek.addEventListener("change", endSeek);
        });

        document.addEventListener("keydown", (e) => {
            if (!isOpen()) return;
            const inst = getInst();
            if (e.key === "ArrowUp") {
                e.preventDefault();
                inst?.slidePrev();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                inst?.slideNext();
            } else if (e.code === "Space" || e.key === " ") {
                e.preventDefault();
                const v = getActiveVideo();
                if (!v) return;
                v.paused ? v.play().catch(() => {}) : v.pause();
            }
        });
    }
})(document);
