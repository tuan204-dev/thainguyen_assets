/**
 * Trình xem PDF nhúng cho trang "Đọc báo in".
 *
 * Phỏng theo player toàn màn hình ở dhd_page_flit/ nhưng chạy trong một khối
 * cao cố định giữa trang CUỘN, theme sáng. Khác biệt chính:
 *   - DFlip + jQuery được nạp LƯỜI (chỉ khi thật sự cần) để không kéo ~1,3MB JS
 *     vào đường tới hạn của trang danh sách.
 *   - Desktop tự nạp khi khối lọt vào khung nhìn; mobile phải bấm vào poster,
 *     vì DFlip nuốt thao tác vuốt dọc nên không được tự chiếm màn hình cảm ứng.
 *   - Đường dẫn vendor/PDF suy ra từ import.meta.url nên chạy đúng cả khi file
 *     nằm ở repo (đường dẫn tương đối) lẫn khi phục vụ từ R2 (URL tuyệt đối).
 */

const VENDOR = new URL("../../doc_bao_in_chi_tiet/vendor/", import.meta.url).href;

const viewer = document.getElementById("baoin-viewer");
const poster = document.getElementById("baoin-viewer-poster");
const spinner = document.getElementById("baoin-viewer-spinner");

/* ── Nạp script cổ điển theo thứ tự (jQuery/DFlip không phải ES module) ── */

const loaded = new Map();

function loadScript(src) {
    if (loaded.has(src)) return loaded.get(src);

    const promise = new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = src;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`Không nạp được ${src}`));
        document.head.appendChild(el);
    });

    loaded.set(src, promise);
    return promise;
}

function loadStyle(href) {
    if (loaded.has(href)) return loaded.get(href);

    const promise = new Promise((resolve, reject) => {
        const el = document.createElement("link");
        el.rel = "stylesheet";
        el.href = href;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`Không nạp được ${href}`));
        document.head.appendChild(el);
    });

    loaded.set(href, promise);
    return promise;
}

/* ── Khởi tạo ── */

let booting = false;

/**
 * File PDF phục vụ ở /file/... của chính site (baothainguyen.vn) và host đó
 * KHÔNG trả header CORS. Trên domain khác (preview media-soft.cloud) đường dẫn
 * tương đối này trả 404, còn số báo cũ có thể chưa đính PDF — cả hai trường hợp
 * DFlip sẽ treo ở màn "Loading PDF" không báo lỗi. Thử một byte trước để biết
 * có nạp được không; không thì để nguyên poster (poster là thẻ <a> nên bấm vào
 * vẫn sang được trang đọc chi tiết).
 */
async function isReadable(pdf) {
    try {
        const res = await fetch(pdf, { method: "GET", headers: { Range: "bytes=0-0" } });
        return res.ok;
    } catch {
        return false;
    }
}

async function boot() {
    if (booting || !viewer) return;
    booting = true;

    const pdf = viewer.getAttribute("data-pdf");
    if (!pdf || !(await isReadable(pdf))) {
        booting = false;
        return;
    }

    if (poster) poster.hidden = true;
    if (spinner) spinner.hidden = false;

    try {
        /* dflip.css BẮT BUỘC: thiếu nó thì canvas trang không được định vị
           tuyệt đối, sách tràn khỏi khung và .loading-info chen vào luồng. */
        await loadStyle(`${VENDOR}dflip.css`);
        await loadScript(`${VENDOR}jquery.min.js`);
        /* dflip.js đọc BIẾN TOÀN CỤC `theme_path` ngay lúc eval để dựng đường dẫn
           mặc định — không khai báo trước là ReferenceError, script chết im lặng.
           Để rỗng rồi ghi đè từng *Src bên dưới bằng đường dẫn tuyệt đối. */
        if (typeof window.theme_path === "undefined") window.theme_path = "";
        await loadScript(`${VENDOR}dflip.js`);
        start(window.jQuery, pdf);
    } catch (error) {
        console.error("[doc_bao_in] Không khởi tạo được trình xem PDF:", error);
        if (spinner) spinner.textContent = "Không tải được số báo. Vui lòng thử lại.";
        if (poster) poster.hidden = false;
        booting = false;
    }
}

function start($, pdf) {
    const DFLIP = window.DFLIP;

    DFLIP.defaults.pdfjsSrc = `${VENDOR}pdf.min.js`;
    DFLIP.defaults.pdfjsWorkerSrc = `${VENDOR}pdf.worker.min.js`;
    DFLIP.defaults.imageResourcesPath = `${VENDOR}images/`;
    DFLIP.defaults.threejsSrc = `${VENDOR}three.min.js`;
    /* Tắt âm thanh sẵn có của DFlip — dùng Audio riêng để nút tắt/bật ăn ngay. */
    DFLIP.defaults.soundFile = "";

    let flipBook = null;
    let isPlaying = false;
    let soundOn = false;
    let playTimer = null;
    let isZooming = false;
    let zoomTimer = null;
    let lastSoundAt = 0;

    const flipSound = new Audio(`${VENDOR}sound/turn2.mp3`);
    flipSound.preload = "auto";
    flipSound.volume = 0.6;

    const $viewer = $(viewer);
    const toolbar = viewer.querySelector(".baoin-viewer__toolbar");
    const toc = document.getElementById("baoin-toc");
    const tocList = document.getElementById("baoin-toc-list");
    const share = document.getElementById("baoin-share");
    const counter = document.getElementById("baoin-page-counter");

    /* ── Tiện ích ── */

    /* Thanh điều khiển của DFlip bị ẩn bằng display:none nhưng vẫn nhận
       .trigger("click") — cách này đã được kiểm chứng ở dhd_page_flit. */
    function dfClick(selector) {
        const $btn = $viewer.find(selector).first();
        if (!$btn.length) return false;
        $btn.trigger("click");
        return true;
    }

    function playFlipSound() {
        if (!soundOn || isZooming) return;
        const now = Date.now();
        /* chặn touchstart + mousedown bắn cùng lúc */
        if (now - lastSoundAt < 200) return;
        lastSoundAt = now;
        flipSound.currentTime = 0;
        flipSound.play().catch(() => {});
    }

    function markZooming() {
        isZooming = true;
        clearTimeout(zoomTimer);
        zoomTimer = setTimeout(() => {
            isZooming = false;
        }, 600);
    }

    /* flipBook (FlipBook) → flipBook.target (Book) chứa _activePage/pageCount/pageMode */
    function readPageInfo() {
        try {
            const book = flipBook && flipBook.target;
            if (!book || !book.pageCount) return null;
            return {
                cur: book._activePage || 1,
                total: book.pageCount,
                mode: book.pageMode || 1,
            };
        } catch {
            return null;
        }
    }

    function updateCounter() {
        const info = readPageInfo();
        if (!info || !counter) return;
        const { cur, total, mode } = info;

        /* _activePage không nhất quán: lật tự nhiên trả về trang phải (lẻ),
           gotoPage(n) trả về trang trái (chẵn) → suy ra cặp trang từ chẵn/lẻ. */
        let label = `${cur} / ${total}`;
        if (mode === 2 && cur > 1) {
            const isLeft = cur % 2 === 0;
            if (isLeft && cur + 1 <= total) label = `${cur}-${cur + 1} / ${total}`;
            else if (!isLeft && cur - 1 >= 2) label = `${cur - 1}-${cur} / ${total}`;
        }
        counter.textContent = label;
    }

    function updateNavButtons() {
        const info = readPageInfo();
        if (!info) return;
        const prev = document.getElementById("baoin-prev");
        const next = document.getElementById("baoin-next");
        if (prev) prev.disabled = info.cur <= 1;
        if (next) next.disabled = info.cur >= info.total;
    }

    function updateZoomButtons() {
        const zin = document.getElementById("baoin-zoom-in");
        const zout = document.getElementById("baoin-zoom-out");
        if (zin) zin.disabled = $viewer.find(".df-ui-zoomin").hasClass("disabled");
        if (zout) zout.disabled = $viewer.find(".df-ui-zoomout").hasClass("disabled");
    }

    function sync() {
        updateCounter();
        updateNavButtons();
    }

    /* ── Chiều cao: DFlip cần số px, tự kẹp về min(height, chiều cao cửa sổ) ── */

    function viewerHeight() {
        return Math.max(320, Math.round(viewer.getBoundingClientRect().height));
    }

    function toolbarHeight() {
        return toolbar ? Math.round(toolbar.getBoundingClientRect().height) + 10 : 52;
    }

    function applyHeight() {
        if (!flipBook) return;
        try {
            const h = viewerHeight();
            if (typeof flipBook.height === "function") {
                flipBook.height(h);
            } else {
                flipBook.options.height = h;
                window.dispatchEvent(new Event("resize"));
            }
        } catch {
            /* không chặn UI nếu DFlip đổi API */
        }
    }

    /* ── Tự động lật trang ── */

    function autoPlayTick() {
        const info = readPageInfo();
        if (info && info.total > 1 && info.cur >= info.total) {
            if (typeof flipBook.gotoPage === "function") {
                flipBook.gotoPage(1);
                setTimeout(sync, 300);
            }
            return;
        }
        playFlipSound();
        dfClick(".df-ui-next");
    }

    function setPlayIcon(playing) {
        const btn = document.getElementById("baoin-play");
        if (!btn) return;
        btn.classList.toggle("is-active", playing);
        btn.title = playing ? "Dừng tự động lật" : "Tự động lật trang";
        btn.setAttribute("aria-label", btn.title);
        btn.querySelector("path").setAttribute(
            "d",
            playing ? "M6 19h4V5H6zm8-14v14h4V5z" : "M8 5v14l11-7z",
        );
    }

    function startPlay() {
        isPlaying = true;
        clearInterval(playTimer);
        playTimer = setInterval(autoPlayTick, 3000);
        setPlayIcon(true);
    }

    function stopPlay() {
        isPlaying = false;
        clearInterval(playTimer);
        playTimer = null;
        setPlayIcon(false);
    }

    /* ── Mục lục ── */

    function buildToc() {
        const info = readPageInfo();
        if (!info || !tocList) return;

        const frag = document.createDocumentFragment();
        for (let p = 1; p <= info.total; p += 1) {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "baoin-toc__item";
            if (p === info.cur || (info.cur > 1 && p === info.cur - 1)) {
                item.classList.add("is-current");
            }
            item.dataset.page = String(p);
            item.innerHTML = `<span style="color:#333">Trang ${p}</span><span>${p}</span>`;
            frag.appendChild(item);
        }

        tocList.innerHTML = "";
        tocList.appendChild(frag);
    }

    function openToc() {
        buildToc();
        toc?.classList.add("is-open");
    }

    function closeToc() {
        toc?.classList.remove("is-open");
    }

    /* ── Khởi tạo DFlip ── */

    const preview = document.getElementById("epaper_preview");

    flipBook = $(preview).flipBook(pdf, {
        webgl: false,
        /* height PHẢI là số — DFlip chạy Math.min(height, innerHeight), truyền
           chuỗi "620px" ra NaN và khung sập không báo lỗi. */
        height: viewerHeight(),
        paddingBottom: toolbarHeight(),
        /* BẮT BUỘC: mặc định DFlip bắt cuộn chuột để thu/phóng và gọi
           preventDefault() — người đọc cuộn trang qua khối này sẽ bị KẸT. */
        scrollWheel: false,
        /* Màn hẹp: ép 1 trang/lượt. Để AUTO thì DFlip trải 2 trang cạnh nhau
           và mỗi trang chỉ còn ~158px trên điện thoại — không đọc nổi. */
        pageMode: window.matchMedia("(max-width: 767px)").matches
            ? DFLIP.PAGE_MODE.SINGLE
            : DFLIP.PAGE_MODE.AUTO,
        duration: 800,
        direction: DFLIP.DIRECTION.LTR,
        backgroundColor: "#efeae2",
        autoEnableOutline: false,
        autoEnableThumbnail: false,
        maxTextureSize: 9800,
        autoPlay: true,
        autoPlayStart: false,
        autoPlayDuration: 3000,
        allControls: "altPrev,altNext,zoomIn,zoomOut,play,sound,fullScreen",
        controlsPosition: DFLIP.CONTROLSPOSITION.BOTTOM,
        onReady() {
            sync();
            applyHeight();
            setTimeout(updateZoomButtons, 300);
        },
        onFlipStart() {
            playFlipSound();
        },
        onFlip() {
            setTimeout(sync, 50);
        },
        text: {
            previousPage: "Trang trước",
            nextPage: "Trang sau",
            zoomIn: "Phóng to",
            zoomOut: "Thu nhỏ",
            toggleFullscreen: "Toàn màn hình",
            toggleSound: "Bật/Tắt âm thanh",
            play: "Tự động lật",
            pause: "Dừng",
            share: "Chia sẻ",
        },
    });

    /* Từ đây DFlip tự hiện tiến độ "Loading PDF …%" trong .loading-info,
       nên bỏ spinner tĩnh của mình để không có hai chỉ báo chồng nhau. */
    if (spinner) spinner.hidden = true;

    /* DFlip đọc PDF bất đồng bộ — poll tới khi có pageCount thật. */
    let polls = 0;
    const pollId = setInterval(() => {
        polls += 1;
        const info = readPageInfo();
        if (info && info.total > 1) {
            sync();
            applyHeight();
            clearInterval(pollId);
        }
        if (polls > 60) clearInterval(pollId);
    }, 500);

    /* ── Nút lật hai bên ── */

    document.getElementById("baoin-prev")?.addEventListener("click", () => {
        playFlipSound();
        dfClick(".df-ui-prev");
        setTimeout(sync, 900);
    });

    document.getElementById("baoin-next")?.addEventListener("click", () => {
        playFlipSound();
        dfClick(".df-ui-next");
        setTimeout(sync, 900);
    });

    preview?.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        playFlipSound();
    });

    /* ── Thu/phóng ── */

    document.getElementById("baoin-zoom-in")?.addEventListener("click", () => {
        markZooming();
        dfClick(".df-ui-zoomin");
        setTimeout(updateZoomButtons, 600);
    });

    document.getElementById("baoin-zoom-out")?.addEventListener("click", () => {
        markZooming();
        dfClick(".df-ui-zoomout");
        setTimeout(updateZoomButtons, 600);
    });

    /* ── Tự động lật ── */

    document.getElementById("baoin-play")?.addEventListener("click", () => {
        if (isPlaying) stopPlay();
        else startPlay();
    });

    /* ── Mục lục ── */

    document.getElementById("baoin-toc-open")?.addEventListener("click", openToc);
    document.getElementById("baoin-toc-close")?.addEventListener("click", closeToc);

    tocList?.addEventListener("click", (e) => {
        const item = e.target.closest(".baoin-toc__item");
        if (!item) return;
        const page = Number(item.dataset.page);
        if (!page) return;
        if (typeof flipBook.gotoPage === "function") flipBook.gotoPage(page);
        setTimeout(sync, 400);
        closeToc();
    });

    /* ── Chia sẻ ── */

    document.getElementById("baoin-share-open")?.addEventListener("click", () => {
        const url = document.getElementById("baoin-latest-link")?.href || window.location.href;
        /* navigator.share có cả trên Chrome desktop nhưng ở đó nó bật hộp thoại
           hệ điều hành — trên máy tính hộp sao chép liên kết dễ dùng hơn. */
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (isTouch && navigator.share) {
            navigator.share({ title: document.title, url }).catch(() => {});
            return;
        }
        const input = document.getElementById("baoin-share-url");
        if (input) input.value = url;
        share?.classList.add("is-open");
    });

    document.getElementById("baoin-share-copy")?.addEventListener("click", (e) => {
        const input = document.getElementById("baoin-share-url");
        if (!input) return;
        input.select();
        input.setSelectionRange(0, 99999);
        try {
            document.execCommand("copy");
        } catch {
            /* trình duyệt chặn — người dùng vẫn copy tay được */
        }
        e.currentTarget.textContent = "Đã sao chép!";
        setTimeout(() => {
            e.currentTarget.textContent = "Sao chép";
        }, 2000);
    });

    document.getElementById("baoin-share-close")?.addEventListener("click", () => {
        share?.classList.remove("is-open");
    });

    share?.addEventListener("click", (e) => {
        if (e.target === share) share.classList.remove("is-open");
    });

    /* ── Âm thanh ── */

    const SOUND_ON_PATH =
        "M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.47 4.47 0 0 0 16.5 12M14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54";
    const SOUND_OFF_PATH =
        "M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63m2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12a8.99 8.99 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12M4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A7 7 0 0 1 14 18.7v2.06a9 9 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9zM12 4 9.91 6.09 12 8.18z";

    document.getElementById("baoin-sound")?.addEventListener("click", (e) => {
        soundOn = !soundOn;
        const btn = e.currentTarget;
        btn.classList.toggle("is-active", soundOn);
        btn.title = soundOn ? "Tắt âm thanh lật trang" : "Bật âm thanh lật trang";
        btn.setAttribute("aria-label", btn.title);
        btn.querySelector("path")?.setAttribute("d", soundOn ? SOUND_ON_PATH : SOUND_OFF_PATH);
        if (soundOn) playFlipSound();
    });

    /* ── Toàn màn hình: phóng chính khung xem, không phải cả tài liệu ── */

    document.getElementById("baoin-fullscreen")?.addEventListener("click", () => {
        const isFs = document.fullscreenElement || document.webkitFullscreenElement;
        if (!isFs) {
            (viewer.requestFullscreen || viewer.webkitRequestFullscreen)?.call(viewer);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
        }
    });

    function onFullscreenChange() {
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const btn = document.getElementById("baoin-fullscreen");
        btn?.querySelector("path")?.setAttribute(
            "d",
            isFs
                ? "M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"
                : "M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z",
        );
        /* Đợi CSS fullscreen áp dụng rồi mới đo lại chiều cao. */
        setTimeout(applyHeight, 150);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    /* ── Bàn phím ──
     * DFlip tự gắn keyup lên document và KHÔNG kiểm tra event.target, nên ←/→
     * gõ ở bất kỳ đâu (kể cả ô tìm kiếm trên header) cũng lật trang. Không có
     * option tắt → chặn ở pha capture của window khi con trỏ/focus không nằm
     * trong khung xem. stopPropagation không chặn hành vi mặc định nên caret
     * trong ô nhập vẫn di chuyển bình thường.
     */

    function inViewer(target) {
        return viewer.contains(target) || viewer.matches(":hover");
    }

    window.addEventListener(
        "keyup",
        (e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            if (inViewer(e.target)) return;
            e.stopPropagation();
        },
        true,
    );

    document.addEventListener("keydown", (e) => {
        if (share?.classList.contains("is-open")) return;
        if (!inViewer(document.activeElement)) return;

        if (e.key === "ArrowLeft") {
            playFlipSound();
            dfClick(".df-ui-prev");
            setTimeout(sync, 900);
        } else if (e.key === "ArrowRight") {
            playFlipSound();
            dfClick(".df-ui-next");
            setTimeout(sync, 900);
        } else if (e.key === "Escape") {
            closeToc();
        }
    });

    /* ── Đổi kích thước ── */

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyHeight, 200);
    });
}

/* ── Kích hoạt ──────────────────────────────────────────────────────────
 * Desktop: nạp khi khối lọt vào khung nhìn.
 * Mobile:  chờ người dùng bấm — DFlip bắt thao tác vuốt nên nếu tự nạp
 *          sẽ chặn cuộn dọc của trang.
 */

if (viewer) {
    /* Poster là thẻ <a> tới trang đọc chi tiết. Có PDF thì chặn điều hướng và
       mở ngay tại chỗ; không có thì cứ để trình duyệt đi theo liên kết. */
    poster?.addEventListener("click", (event) => {
        if (!viewer.getAttribute("data-pdf")) return;
        event.preventDefault();
        boot();
    });

    const isDesktop = window.matchMedia("(min-width: 1000px)").matches;
    if (isDesktop) {
        if ("IntersectionObserver" in window) {
            const io = new IntersectionObserver(
                (entries) => {
                    if (!entries.some((entry) => entry.isIntersecting)) return;
                    io.disconnect();
                    boot();
                },
                { rootMargin: "200px" },
            );
            io.observe(viewer);
        } else {
            boot();
        }
    }
}
