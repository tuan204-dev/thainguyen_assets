/**
 * video-player.js — Player video custom cho trang bài viết.
 *
 * BẢN DÙNG CHUNG với repo tcanm-assets (common/video-player.js). Khác nhau đúng
 * 3 chỗ: ACCENT, CONFIG.scope và URL nhúng ở cuối comment này. Sửa logic thì
 * nhớ đồng bộ cả hai repo.
 *
 * - Thuần JS, KHÔNG phụ thuộc thư viện (không video.js / hls.js / npm package).
 * - Tự quét toàn bộ <video> trong thân bài và thay bằng UI custom.
 * - Tất cả cấu hình fix cứng trong CONFIG bên dưới.
 * - UI THUẦN ICON, không có chữ hiển thị => dùng được ở mọi ngôn ngữ, khỏi dịch.
 *   Nhãn cho screen reader nằm trong LABELS (en/vi/zh/ko), tự chọn theo <html lang>,
 *   ghi đè bằng TCAVideoPlayer.setLabels("ko" | {play:"...", ...}).
 *
 * HIỆU NĂNG — vì sao không làm chậm load bài viết:
 * 1. <video> của CMS bị THAY bằng element mới tinh khôi; element cũ được gọi
 *    load() để huỷ request đang bay rồi vứt đi (xem swapVideo — đo được rằng
 *    load() làm element đó vĩnh viễn bỏ qua preload="none").
 * 2. Element mới giữ preload="none" và KHÔNG bao giờ được gọi load(); source
 *    chỉ gắn lại khi IntersectionObserver (rootMargin 400px) báo video sắp tới.
 *    Kết quả đo: readyState đứng ở 0, 0 byte media cho tới khi play().
 *    (preload="metadata" là bẫy: với HLS phải tải trọn segment đầu ~1 MB mới có
 *     metadata; với MP4 non-faststart phải request 2 lần để lấy moov ở cuối file.)
 * 3. Kích thước + thời lượng lấy từ playlist HLS: master.m3u8 (~283 B) cho
 *    RESOLUTION, index.m3u8 (~274 B) cộng EXTINF cho duration. ~557 B thay vì 1 MB.
 * 4. Giữ chỗ bằng aspect-ratio nên không gây layout shift (CLS).
 * 5. CSS nhúng trong file, chèn 1 lần => không thêm request chặn render.
 *
 * HẠN CHẾ CÒN LẠI: script là <script type="module"> nên chạy sau khi parse xong
 * HTML; trong khoảng đó trình duyệt đã kịp bắn request cho <video preload="metadata">.
 * Ta huỷ được nhưng không ngăn được. Muốn triệt để thì portlet phải render sẵn
 * preload="none" và <source data-src="..."> (xem README/ghi chú khi gắn CMS).
 *
 * Cách nhúng:
 *   <script type="module" src="https://r2-thainguyen.media-soft.cloud/common/video-player.js"></script>
 */

const TCAVideoPlayer = (() => {
    "use strict";

    // -----------------------------------------------------------------------
    // Cấu hình (fix cứng)
    // -----------------------------------------------------------------------
    const CONFIG = {
        // --- Autoplay khi scroll tới ---
        autoplay: true,             // bật autoplay khi video lọt vào viewport
        autoplayThreshold: 0.6,     // >= 60% diện tích video hiện ra thì phát
        pauseThreshold: 0.25,       // < 25% thì tạm dừng
        pauseWhenOffscreen: true,   // cuộn ra khỏi màn hình thì dừng
        pipOnScrollAway: true,      // ...nhưng ưu tiên thu nhỏ thành PiP nếu được
        pipRequireEngagement: false,// true = chỉ PiP khi user đã tương tác (bật tiếng/bấm phát)
        startMuted: true,           // mặc định câm (trình duyệt thường chỉ cho autoplay khi muted)
        autoplayUnmutedIfAllowed: true, // ...nhưng nếu trình duyệt ĐÃ cho phép thì phát có tiếng luôn
        rememberSoundChoice: true,  // nhớ lựa chọn bật/tắt tiếng của user trong phiên
        showUnmuteHint: true,       // hiện nút "Bật tiếng" khi đang autoplay câm
        showMuteHint: true,         // ...và nút "Tắt tiếng" khi tiếng TỰ bật
        resumeAfterUserPause: false,// user bấm dừng tay thì không tự phát lại nữa
        singlePlayback: true,       // chỉ 1 video phát tại một thời điểm
        respectReducedMotion: true, // tôn trọng prefers-reduced-motion
        respectSaveData: true,      // tôn trọng Save-Data / saveData

        // --- Hiệu năng ---
        preloadRootMargin: "400px 0px", // khoảng cách bắt đầu chuẩn bị
        probeMeta: true,                // đọc playlist HLS để biết tỉ lệ + thời lượng
        defaultAspect: "16 / 9",        // tỉ lệ giữ chỗ trước khi biết kích thước thật
        portraitMaxHeight: "78vh",      // video dọc: giới hạn chiều cao, canh giữa

        // --- Điều khiển ---
        seekStep: 5,                    // ArrowLeft / ArrowRight
        seekStepLong: 10,               // phím J / L
        volumeStep: 0.1,
        hideControlsDelay: 2600,        // ms không thao tác thì ẩn thanh điều khiển
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        enablePiP: true,

        // --- Phạm vi quét ---
        scope: "#content, #content-wrapper, .article-prose, .detail-content, .the-article-body, article",
        skip: ".short-video, .image-gallery, .swiper, .video-card, [data-no-tcavp]",
    };

    /**
     * Nhãn cho công nghệ trợ giúp (screen reader). KHÔNG có chữ nào hiển thị ra
     * màn hình — UI thuần icon nên dùng được ở mọi ngôn ngữ mà không cần dịch.
     * Nhưng aria-label thì KHÔNG được bỏ: bỏ đi là người dùng screen reader mất
     * hoàn toàn khả năng dùng player.
     *
     * Chọn ngôn ngữ: <html lang> -> LABELS -> "en".
     * LƯU Ý: nhiều template đa ngữ trong các repo này để lang="en" cho cả trang
     * Trung/Hàn, nên hãy ghi đè thủ công khi cần:
     *     TCAVideoPlayer.setLabels("ko")                  // dùng bộ có sẵn
     *     TCAVideoPlayer.setLabels({ play: "재생", ... })  // hoặc bộ riêng
     * Gọi trước khi script quét, hoặc gọi rồi TCAVideoPlayer.scan() lại.
     */
    const LABELS = {
        en: { player: "Video player", play: "Play", pause: "Pause", replay: "Replay",
              mute: "Mute", unmute: "Unmute", volume: "Volume", progress: "Seek",
              settings: "Settings", speed: "Playback speed", pip: "Picture in picture",
              pipExit: "Exit picture in picture", pipActive: "Playing in picture in picture",
              restore: "Return video here", fullscreen: "Full screen", fullscreenExit: "Exit full screen",
              error: "This video could not be played", retry: "Retry",
              soundOn: "Sound on", soundOff: "Sound off", of: "of" },
        vi: { player: "Trình phát video", play: "Phát", pause: "Tạm dừng", replay: "Xem lại",
              mute: "Tắt tiếng", unmute: "Bật tiếng", volume: "Âm lượng", progress: "Tua",
              settings: "Cài đặt", speed: "Tốc độ phát", pip: "Thu nhỏ màn hình",
              pipExit: "Thoát thu nhỏ màn hình", pipActive: "Đang phát ở cửa sổ thu nhỏ",
              restore: "Đưa video về lại", fullscreen: "Toàn màn hình", fullscreenExit: "Thoát toàn màn hình",
              error: "Không phát được video này", retry: "Thử lại",
              soundOn: "Đã bật tiếng", soundOff: "Đã tắt tiếng", of: "trên" },
        zh: { player: "视频播放器", play: "播放", pause: "暂停", replay: "重播",
              mute: "静音", unmute: "取消静音", volume: "音量", progress: "进度",
              settings: "设置", speed: "播放速度", pip: "画中画",
              pipExit: "退出画中画", pipActive: "正在画中画播放",
              restore: "返回视频", fullscreen: "全屏", fullscreenExit: "退出全屏",
              error: "无法播放此视频", retry: "重试",
              soundOn: "已开启声音", soundOff: "已静音", of: "/" },
        ko: { player: "동영상 플레이어", play: "재생", pause: "일시정지", replay: "다시 재생",
              mute: "음소거", unmute: "음소거 해제", volume: "볼륨", progress: "탐색",
              settings: "설정", speed: "재생 속도", pip: "화면 속 화면",
              pipExit: "화면 속 화면 종료", pipActive: "화면 속 화면으로 재생 중",
              restore: "동영상 되돌리기", fullscreen: "전체 화면", fullscreenExit: "전체 화면 종료",
              error: "이 동영상을 재생할 수 없습니다", retry: "다시 시도",
              soundOn: "소리 켜짐", soundOff: "소리 꺼짐", of: "/" },
    };

    let L = LABELS.en;
    function pickLabels() {
        const lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
        const base = lang.split("-")[0];
        L = LABELS[base] || LABELS.en;
    }
    pickLabels();

    /** Đổi ngôn ngữ nhãn trợ năng: mã ngôn ngữ có sẵn, hoặc object nhãn riêng. */
    function setLabels(langOrMap) {
        if (typeof langOrMap === "string") L = LABELS[langOrMap.toLowerCase().split("-")[0]] || LABELS.en;
        else if (langOrMap && typeof langOrMap === "object") L = Object.assign({}, LABELS.en, langOrMap);
        allStates.forEach(relabel);
    }

    const NS = "tcavp";
    const ACCENT = "#30a14a"; // xanh thương hiệu Thái Nguyên
    const HAVE_FUTURE_DATA = 3;

    // iOS bỏ qua hoàn toàn việc set volume => đừng hiện thanh âm lượng dối trá ở đó
    const VOLUME_SETTABLE = (() => {
        try {
            const t = document.createElement("video");
            t.volume = 0.5;
            return t.volume === 0.5;
        } catch (_) {
            return false;
        }
    })();

    // -----------------------------------------------------------------------
    // Icon (inline SVG, ăn theo currentColor)
    // -----------------------------------------------------------------------
    const ICON = {
        play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>`,
        pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5h3.4v15H7zM13.6 4.5H17v15h-3.4z"/></svg>`,
        replay: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5V2L7.5 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8Z"/></svg>`,
        volume: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9.5h3.2L12 5.6a.8.8 0 0 1 1.3.62v11.56a.8.8 0 0 1-1.3.62L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M16.2 9.1a4 4 0 0 1 0 5.8M18.8 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>`,
        muted: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9.5h3.2L12 5.6a.8.8 0 0 1 1.3.62v11.56a.8.8 0 0 1-1.3.62L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="m16.5 9.5 5 5m0-5-5 5"/></svg>`,
        enterFull: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9V4h5v2H6v3H4Zm11-5h5v5h-2V6h-3V4ZM4 15h2v3h3v2H4v-5Zm14 0h2v5h-5v-2h3v-3Z"/></svg>`,
        exitFull: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 4h2v5H4V7h5V4Zm6 0h2v3h3v2h-5V4ZM4 15h5v5H7v-3H4v-2Zm11 0h5v2h-3v3h-2v-5Z"/></svg>`,
        pip: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13ZM5 6v12h14V6H5Zm6 6h6v4h-6v-4Z"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.2a1.3 1.3 0 0 1 1.13.66l8.2 14.4A1.3 1.3 0 0 1 20.2 20.2H3.8a1.3 1.3 0 0 1-1.13-1.94l8.2-14.4A1.3 1.3 0 0 1 12 3.2Zm0 4.3a1 1 0 0 0-1 1v4.6a1 1 0 1 0 2 0V8.5a1 1 0 0 0-1-1Zm0 8a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"/></svg>`,
        restore: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13ZM6 6v12h12V6H6Zm5.3 2.3a1 1 0 0 1 1.4 1.4L11.4 11H15a1 1 0 1 1 0 2h-3.6l1.3 1.3a1 1 0 0 1-1.4 1.4l-3-3a1 1 0 0 1 0-1.4l3-3Z"/></svg>`,
        settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 7h9a3 3 0 0 1 6 0h1a1 1 0 1 1 0 2h-1a3 3 0 0 1-6 0H4a1 1 0 0 1 0-2Zm12-1.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM4 15h1a3 3 0 0 1 6 0h9a1 1 0 1 1 0 2h-9a3 3 0 0 1-6 0H4a1 1 0 1 1 0-2Zm4-1.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/></svg>`,
    };

    // -----------------------------------------------------------------------
    // CSS (chèn 1 lần)
    // -----------------------------------------------------------------------
    const CSS = `
.${NS}{position:relative;display:block;width:100%;margin:0;background:#000;overflow:hidden;border-radius:4px;aspect-ratio:${CONFIG.defaultAspect};color:#fff;font-family:Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;font-size:14px;line-height:1.2;-webkit-text-size-adjust:100%;text-size-adjust:100%;--${NS}-accent:${ACCENT};container-type:inline-size}
.${NS}:focus{outline:none}
.${NS}:focus-visible{outline:2px solid var(--${NS}-accent);outline-offset:2px}
.${NS} video{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;min-width:0!important;margin:0!important;padding:0!important;display:block!important;object-fit:contain;background:#000}
/* Chặn CSS của trang rò vào UI player (bài viết hay set font-size cho * hoặc button) */
.${NS}__ui,.${NS}__ui *{box-sizing:border-box;font-family:inherit;letter-spacing:normal;text-transform:none;-webkit-text-size-adjust:100%;text-size-adjust:100%}
.${NS}__ui{position:absolute;inset:0;pointer-events:none;opacity:1;visibility:visible;transition:opacity .2s ease,visibility .2s ease}
/* Ẩn thì phải ẩn thật (visibility) để nút không còn focus/click được... */
.${NS}.is-idle .${NS}__ui{opacity:0;visibility:hidden}
/* ...nhưng đang focus bằng bàn phím thì luôn hiện lại */
.${NS}:focus-within .${NS}__ui{opacity:1!important;visibility:visible!important}
.${NS}.is-idle:not(:focus-within){cursor:none}
.${NS}__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
.${NS}__surface{position:absolute;inset:0;pointer-events:auto;border:0;padding:0;margin:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}

/* Nút play lớn ở giữa */
.${NS}__big{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:66px;height:66px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:center;transition:background .18s ease,transform .18s ease;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
.${NS}__big svg{width:30px;height:30px;margin-left:3px}
.${NS}__big[data-state=replay] svg{margin-left:0}
.${NS}.is-playing .${NS}__big,.${NS}.is-loading .${NS}__big{display:none}

/* Spinner */
.${NS}__spinner{position:absolute;top:50%;left:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border:4px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:${NS}-spin .8s linear infinite;display:none}
.${NS}.is-loading .${NS}__spinner{display:block}
@keyframes ${NS}-spin{to{transform:rotate(360deg)}}

/* Nút bật tiếng */
.${NS}__unmute{position:absolute;top:12px;right:12px;display:none;align-items:center;justify-content:center;width:38px;height:38px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:13px;font-weight:500;cursor:pointer;pointer-events:auto;transition:background .18s ease}
.${NS}__unmute svg{width:19px;height:19px}
.${NS}.is-mutedhint .${NS}__unmute{display:flex}
/* Tiếng tự bật thì PHẢI có cách tắt ngay và luôn thấy được — không ẩn theo idle,
   vì sau 2.6s thanh điều khiển biến mất mà tiếng thì vẫn phát. */
.${NS}__mute{position:absolute;top:12px;right:12px;display:none;align-items:center;justify-content:center;width:38px;height:38px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.72);color:#fff;font-size:13px;font-weight:500;cursor:pointer;pointer-events:auto;transition:background .18s ease}
.${NS}__mute svg{width:19px;height:19px}
.${NS}.is-soundhint .${NS}__mute{display:flex}
.${NS}.is-idle .${NS}__mute{opacity:1;visibility:visible}

/* Thanh điều khiển dưới */
.${NS}__bar{position:absolute;left:0;right:0;bottom:0;padding:22px 10px 6px;pointer-events:auto;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.55) 45%,rgba(0,0,0,0) 100%)}

/* Progress */
.${NS}__progress{position:relative;height:14px;display:flex;align-items:center;cursor:pointer;touch-action:none}
.${NS}__progress:focus{outline:none}
.${NS}__progress:focus-visible{outline:2px solid var(--${NS}-accent);outline-offset:2px;border-radius:2px}
.${NS}__track{position:relative;width:100%;height:3px;border-radius:2px;background:rgba(255,255,255,.28);transition:height .12s ease}
.${NS}__progress.is-scrubbing .${NS}__track,.${NS}__progress:focus-visible .${NS}__track{height:5px}
.${NS}__buffer{position:absolute;left:0;top:0;height:100%;width:0;border-radius:2px;background:rgba(255,255,255,.45)}
.${NS}__played{position:absolute;left:0;top:0;height:100%;width:0;border-radius:2px;background:var(--${NS}-accent)}
.${NS}__handle{position:absolute;top:50%;left:0;width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border-radius:50%;background:#fff;box-shadow:0 0 3px rgba(0,0,0,.5);transform:scale(0);transition:transform .12s ease}
.${NS}__progress.is-scrubbing .${NS}__handle,.${NS}__progress:focus-visible .${NS}__handle{transform:scale(1)}
.${NS}__tip{position:absolute;bottom:20px;transform:translateX(-50%);padding:2px 6px;border-radius:3px;background:rgba(0,0,0,.85);font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0;transition:opacity .12s ease;pointer-events:none}
.${NS}__progress.is-scrubbing .${NS}__tip{opacity:1}

/* Hàng nút */
.${NS}__row{display:flex;align-items:center;gap:2px;height:38px}
.${NS}__btn{flex:none;width:36px;height:36px;padding:7px;border:0;background:transparent;color:#fff;cursor:pointer;border-radius:4px;transition:background .15s ease,opacity .15s ease;opacity:.92}
.${NS}__btn:focus-visible{outline:2px solid var(--${NS}-accent);outline-offset:-2px}
.${NS}__btn svg{width:100%;height:100%;display:block}
.${NS}__spacer{flex:1 1 auto}
.${NS}__time{flex:none;padding:0 8px;font-size:12.5px;font-variant-numeric:tabular-nums;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.6);white-space:nowrap}
.${NS}__time b{font-weight:400;opacity:.7}

/* Âm lượng: trượt ra khi hover */
.${NS}__vol{display:flex;align-items:center;flex:none}
.${NS}__volslider{width:0;overflow:hidden;transition:width .18s ease,margin .18s ease;display:flex;align-items:center}
.${NS}__vol:focus-within .${NS}__volslider{width:64px;margin-right:6px}
.${NS}__volslider input{width:64px;height:14px;margin:0;cursor:pointer;-webkit-appearance:none;appearance:none;background:transparent}
.${NS}__volslider input::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:rgba(255,255,255,.35)}
.${NS}__volslider input::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;margin-top:-4px;border-radius:50%;background:#fff}
.${NS}__volslider input::-moz-range-track{height:3px;border-radius:2px;background:rgba(255,255,255,.35)}
.${NS}__volslider input::-moz-range-thumb{width:11px;height:11px;border:0;border-radius:50%;background:#fff}

/* Menu tốc độ */
.${NS}__menuwrap{position:relative;flex:none}
.${NS}__menu{position:absolute;right:0;bottom:calc(100% + 8px);min-width:132px;max-width:min(190px,92cqw);padding:4px 0;border-radius:6px;background:rgba(18,18,18,.96);box-shadow:0 4px 18px rgba(0,0,0,.5);display:none}
.${NS}__menu.is-open{display:block}
.${NS}__menu button{display:flex;align-items:center;gap:8px;width:100%;padding:6px 12px;border:0;background:transparent;color:#fff;font-weight:400;font-size:12.5px;line-height:1.35;text-align:left;white-space:nowrap;cursor:pointer}
.${NS}__menu button[aria-checked=true]{color:var(--${NS}-accent);font-weight:600}
.${NS}__menu button::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor;opacity:0;flex:none}
.${NS}__menu button[aria-checked=true]::before{opacity:1}

/* Lỗi — nằm trên cùng và CÓ nút thử lại (nếu không sẽ nuốt click mà không cứu được) */
.${NS}__error{position:absolute;inset:0;z-index:2;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;text-align:center;background:rgba(0,0,0,.82);font-size:14px;pointer-events:auto}
.${NS}.is-error .${NS}__error{display:flex}
.${NS}.is-error .${NS}__big,.${NS}.is-error .${NS}__spinner{display:none}
.${NS}__retry,.${NS}__pipback{display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:9px;border:1px solid rgba(255,255,255,.55);border-radius:50%;background:transparent;color:#fff;cursor:pointer}
.${NS}__retry svg,.${NS}__pipback svg{width:100%;height:100%}
.${NS}__erricon,.${NS}__pipicon{display:block;width:30px;height:30px;opacity:.75}
.${NS}__erricon svg,.${NS}__pipicon svg{width:100%;height:100%}

/* Đang phát ở cửa sổ PiP: chỗ video trong bài chỉ còn ô đen nên phải nói rõ */
.${NS}__pipnote{position:absolute;inset:0;z-index:1;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;text-align:center;background:#000;font-size:13.5px;color:rgba(255,255,255,.8);pointer-events:auto}
.${NS}.is-pip .${NS}__pipnote{display:flex}
.${NS}.is-pip .${NS}__bar,.${NS}.is-pip .${NS}__big,.${NS}.is-pip .${NS}__spinner,.${NS}.is-pip .${NS}__unmute{display:none}

/* Fullscreen */
.${NS}:fullscreen{aspect-ratio:auto!important;max-width:none!important;max-height:none!important;width:100%;height:100%;border-radius:0}
.${NS}:-webkit-full-screen{aspect-ratio:auto!important;max-width:none!important;max-height:none!important;width:100%;height:100%;border-radius:0}

/* Hiệu ứng hover CHỈ cho thiết bị có con trỏ thật. Trên iOS, :hover dính lại
   sau khi chạm nên nút vừa bấm bị kẹt trạng thái sáng, thanh progress kẹt dày. */
@media (hover:hover) and (pointer:fine){
.${NS}__big:hover{background:var(--${NS}-accent);transform:translate(-50%,-50%) scale(1.06)}
.${NS}__unmute:hover,.${NS}__mute:hover{background:var(--${NS}-accent)}
.${NS}__btn:hover{background:rgba(255,255,255,.16);opacity:1}
.${NS}__menu button:hover{background:rgba(255,255,255,.13)}
.${NS}__retry:hover{background:var(--${NS}-accent);border-color:var(--${NS}-accent)}
.${NS}__progress:hover .${NS}__track{height:5px}
.${NS}__progress:hover .${NS}__handle{transform:scale(1)}
.${NS}__progress:hover .${NS}__tip{opacity:1}
.${NS}__vol:hover .${NS}__volslider{width:64px;margin-right:6px}
}

/* Co giãn theo bề rộng CỦA CHÍNH PLAYER (không theo viewport) — player dọc trong
   bài rộng vẫn phải thu nhỏ điều khiển, nên dùng container query thay vì media query. */
@container (max-width:520px){
.${NS}__bar{padding:18px 6px 4px}
.${NS}__row{height:34px}
.${NS}__btn{width:32px;height:32px;padding:6px}
.${NS}__big{width:54px;height:54px}
.${NS}__big svg{width:24px;height:24px}
.${NS}__time{font-size:11.5px;padding:0 5px}
.${NS}__unmute,.${NS}__mute{width:34px;height:34px}
.${NS}__vol .${NS}__volslider{display:none}
}
@container (max-width:340px){
.${NS}__row{height:30px;gap:0}
.${NS}__btn{width:28px;height:28px;padding:5px}
.${NS}__big{width:44px;height:44px}
.${NS}__big svg{width:20px;height:20px}
.${NS}__time{font-size:10.5px;padding:0 3px}
.${NS}__menu button{font-size:11.5px;padding:5px 10px}
.${NS}__spinner{width:40px;height:40px;margin:-20px 0 0 -20px;border-width:3px}
}
@media (prefers-reduced-motion:reduce){
.${NS} *,.${NS}__ui{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}
/* spinner quay nhanh .01ms = nhấp nháy chói mắt, phải tắt hẳn */
.${NS}__spinner{animation:none!important;border-color:rgba(255,255,255,.5);border-top-color:#fff}
}`;

    // -----------------------------------------------------------------------
    // Tiện ích
    // -----------------------------------------------------------------------
    let styleInjected = false;
    function injectStyle() {
        if (styleInjected || document.getElementById(`${NS}-style`)) {
            styleInjected = true;
            return;
        }
        const el = document.createElement("style");
        el.id = `${NS}-style`;
        el.textContent = CSS;
        (document.head || document.documentElement).appendChild(el);
        styleInjected = true;
    }

    function fmtTime(sec) {
        if (!isFinite(sec) || sec < 0) sec = 0;
        const s = Math.floor(sec % 60);
        const m = Math.floor((sec / 60) % 60);
        const h = Math.floor(sec / 3600);
        const pad = (n) => String(n).padStart(2, "0");
        return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
    }

    function clamp(v, lo, hi) {
        return v < lo ? lo : v > hi ? hi : v;
    }

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    function saveDataOn() {
        const c = navigator.connection || navigator.webkitConnection;
        return !!(c && c.saveData);
    }

    function autoplayAllowed() {
        if (!CONFIG.autoplay) return false;
        if (CONFIG.respectReducedMotion && prefersReducedMotion()) return false;
        if (CONFIG.respectSaveData && saveDataOn()) return false;
        return true;
    }

    // -----------------------------------------------------------------------
    // "Đã có quyền mở tiếng chưa?"
    //
    // Trình duyệt chỉ cho autoplay CÓ TIẾNG khi người dùng đã tương tác đủ nhiều
    // với site (Chrome: Media Engagement Index). Không có cách hỏi nào chắc chắn:
    // navigator.getAutoplayPolicy() lý thuyết trả lời được nhưng đo trên Chrome 150
    // thì API này KHÔNG tồn tại. Nên chiến lược là: dùng API nếu có, còn lại thì
    // thử phát có tiếng đúng một lần rồi ghi nhớ kết quả cho cả trang.
    // -----------------------------------------------------------------------
    const SOUND_KEY = `${NS}:sound`;       // phiên hiện tại: "1"/"0" (+ mức âm lượng)
    const SOUND_OFF_KEY = `${NS}:sound-off`; // "đừng phát tiếng" — nhớ lâu, xem ghi chú dưới
    const SOUND_OFF_TTL = 30 * 24 * 3600 * 1000; // 30 ngày
    let soundAllowed = null;  // null = chưa biết · true = phát có tiếng được · false = bị chặn
    let soundProbing = false; // đang có 1 lần dò chạy dở => video khác đừng dò song song

    function policySaysAllowed() {
        if (typeof navigator.getAutoplayPolicy !== "function") return null;
        try {
            return navigator.getAutoplayPolicy("mediaelement") === "allowed";
        } catch (_) {
            return null;
        }
    }

    /**
     * Ghi nhớ lựa chọn âm thanh — CỐ Ý bất đối xứng:
     * - "Tắt tiếng" ghi vào localStorage (30 ngày): người đọc nói "đừng phát tiếng"
     *   thì không có nghĩa là "đừng phát tiếng trong 20 phút". Bắt họ tắt lại ở mỗi
     *   tab mới là làm phiền.
     * - "Bật tiếng" chỉ ghi sessionStorage: quyền phát tiếng không nên kéo dài vô hạn
     *   sang các lần truy cập sau, vì bối cảnh người đọc đã khác (có thể đang ở nơi công cộng).
     * Trả về: true = muốn có tiếng · false = muốn im · null = chưa có ý kiến.
     */
    function soundPref() {
        if (!CONFIG.rememberSoundChoice) return null;
        try {
            const off = localStorage.getItem(SOUND_OFF_KEY);
            if (off !== null && Date.now() - Number(off) < SOUND_OFF_TTL) return false;
        } catch (_) { /* private mode */ }
        try {
            const v = sessionStorage.getItem(SOUND_KEY);
            if (v === null) return null;
            return Number(v) > 0;
        } catch (_) {
            return null; // Safari private mode có thể ném lỗi
        }
    }

    // Mức âm lượng đã lưu (0..1), null nếu chưa có
    function soundLevel() {
        if (!CONFIG.rememberSoundChoice) return null;
        try {
            const v = sessionStorage.getItem(SOUND_KEY);
            if (v === null) return null;
            const n = Number(v);
            return isFinite(n) && n > 0 ? Math.min(n, 1) : null;
        } catch (_) {
            return null;
        }
    }

    function setSoundPref(on, level) {
        if (!CONFIG.rememberSoundChoice) return;
        const val = on ? (isFinite(level) && level > 0 ? Math.min(level, 1) : 1) : 0;
        try { sessionStorage.setItem(SOUND_KEY, String(val)); } catch (_) { /* noop */ }
        try {
            if (on) localStorage.removeItem(SOUND_OFF_KEY);
            else localStorage.setItem(SOUND_OFF_KEY, String(Date.now()));
        } catch (_) { /* noop */ }
    }

    /** Mọi chỗ bật/tắt tiếng đều đi qua đây để trạng thái không bao giờ lệch nhau. */
    function applySoundChoice(state, on) {
        const v = state.video;
        v.muted = !on;
        state.userUnmuted = on;
        state.mutedByUser = !on;
        state.engaged = true;
        if (on) {
            soundAllowed = true; // user tự bấm => chắc chắn phát có tiếng được
            if (v.volume === 0 && VOLUME_SETTABLE) v.volume = 1;
        }
        setSoundPref(on, v.volume);
    }

    function shouldStartWithSound(state) {
        if (!CONFIG.autoplayUnmutedIfAllowed) return false;
        // Ý người dùng đứng TRÊN mọi suy đoán về khả năng của trình duyệt.
        const pref = soundPref();
        if (pref === false) return false;
        if (state.userUnmuted || pref === true) {
            return soundAllowed !== false;
        }
        if (soundAllowed === false) return false;
        if (soundAllowed === true) return true;
        const policy = policySaysAllowed();
        if (policy !== null) {
            soundAllowed = policy;
            return policy;
        }
        // Chưa biết gì: cho ĐÚNG MỘT video dò, các video khác chờ kết quả.
        return !soundProbing;
    }

    // -----------------------------------------------------------------------
    // Trạng thái dùng chung ở mức module (tránh gắn listener theo từng player)
    // -----------------------------------------------------------------------
    const allStates = new Set();
    const openMenus = new Set();
    let activeState = null;
    let probeBlocked = false; // bật lên khi probe playlist bị CORS chặn

    function claimPlayback(state) {
        if (!CONFIG.singlePlayback) return;
        if (activeState && activeState !== state && !activeState.video.paused) {
            // đánh dấu để handler 'pause' không hiểu nhầm đây là user bấm dừng
            activeState.pausedByClaim = true;
            activeState.video.pause();
        }
        activeState = state;
    }

    // Đóng menu khi bấm ra ngoài — MỘT listener cho cả trang
    document.addEventListener("click", (e) => {
        if (!openMenus.size) return;
        openMenus.forEach((st) => {
            if (!st.wrap.contains(e.target)) closeMenu(st);
        });
    });

    function closeMenu(state) {
        state.el.menu.classList.remove("is-open");
        state.el.settingsBtn.setAttribute("aria-expanded", "false");
        openMenus.delete(state);
    }

    // -----------------------------------------------------------------------
    // Fullscreen helper
    // -----------------------------------------------------------------------
    function fsElement() {
        return document.fullscreenElement || document.webkitFullscreenElement || null;
    }
    function requestFs(state) {
        const { wrap, video } = state;
        if (wrap.requestFullscreen) return wrap.requestFullscreen().catch(() => {});
        if (wrap.webkitRequestFullscreen) return wrap.webkitRequestFullscreen();
        // iOS Safari: chỉ <video> vào fullscreen được, và phải có source sẵn
        if (video.webkitEnterFullscreen) {
            attachSources(state);
            if (video.readyState === 0) {
                video.addEventListener("loadedmetadata", () => {
                    try { video.webkitEnterFullscreen(); } catch (_) { /* noop */ }
                }, { once: true });
                try { video.load(); } catch (_) { /* noop */ }
                return;
            }
            try { video.webkitEnterFullscreen(); } catch (_) { /* noop */ }
        }
    }
    function exitFs() {
        if (document.exitFullscreen) return document.exitFullscreen().catch(() => {});
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    }

    // -----------------------------------------------------------------------
    // Picture-in-Picture (hỗ trợ cả API chuẩn lẫn webkit của Safari/iOS)
    // -----------------------------------------------------------------------
    function pipAvailable(video) {
        if (!CONFIG.enablePiP || video.disablePictureInPicture) return false;
        if (document.pictureInPictureEnabled && video.requestPictureInPicture) return true;
        return typeof video.webkitSetPresentationMode === "function" &&
               video.webkitSupportsPresentationMode &&
               video.webkitSupportsPresentationMode("picture-in-picture");
    }

    function inPip(video) {
        return document.pictureInPictureElement === video ||
               video.webkitPresentationMode === "picture-in-picture";
    }

    async function enterPip(video) {
        if (inPip(video)) return true;
        try {
            if (video.requestPictureInPicture) await video.requestPictureInPicture();
            else if (video.webkitSetPresentationMode) video.webkitSetPresentationMode("picture-in-picture");
            else return false;
            return true;
        } catch (_) {
            // Thường là NotAllowedError: trình duyệt đòi user gesture mà cuộn chuột
            // thì không tạo ra gesture. Gọi bên gọi sẽ fallback sang pause.
            return false;
        }
    }

    function leavePip(video) {
        if (document.pictureInPictureElement === video) {
            document.exitPictureInPicture().catch(() => {});
        } else if (video.webkitPresentationMode === "picture-in-picture" && video.webkitSetPresentationMode) {
            video.webkitSetPresentationMode("inline");
        }
    }

    // Một listener cho cả trang, tự tìm player đang fullscreen
    function syncAllFs() {
        const cur = fsElement();
        allStates.forEach((st) => {
            const on = cur === st.wrap;
            st.el.fsBtn.innerHTML = on ? ICON.exitFull : ICON.enterFull;
            st.el.fsBtn.setAttribute("aria-label", on ? L.fullscreenExit : L.fullscreen);
        });
    }
    document.addEventListener("fullscreenchange", syncAllFs);
    document.addEventListener("webkitfullscreenchange", syncAllFs);

    // -----------------------------------------------------------------------
    // Observer dùng chung
    // -----------------------------------------------------------------------
    const prepareIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const state = e.target[`__${NS}`];
            if (!state) return;
            attachSources(state);
            probeMeta(state);
            prepareIO.unobserve(e.target);
        });
    }, { rootMargin: CONFIG.preloadRootMargin, threshold: 0 });

    // KHÔNG rootMargin: nếu có, intersectionRatio sẽ tính theo root đã nới rộng
    // và video còn nằm ngoài màn hình vẫn báo ratio = 1 => autoplay sai chỗ.
    const playIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            const state = e.target[`__${NS}`];
            if (!state) return;
            state.ratio = e.intersectionRatio;

            if (e.intersectionRatio >= CONFIG.autoplayThreshold) {
                // Cuộn trở lại: đưa video từ cửa sổ PiP về lại trong bài
                if (state.autoPip && inPip(state.video)) {
                    state.autoPip = false;
                    leavePip(state.video);
                }
                tryAutoplay(state);
            } else if (
                CONFIG.pauseWhenOffscreen &&
                e.intersectionRatio < CONFIG.pauseThreshold &&
                !state.video.paused &&
                !inPip(state.video)          // đang ở PiP thì cứ để phát tiếp
            ) {
                scrollAway(state);
            }
        });
    }, { threshold: [0, CONFIG.pauseThreshold, CONFIG.autoplayThreshold, 1] });

    // -----------------------------------------------------------------------
    // Nguồn phát
    // -----------------------------------------------------------------------
    function readSources(v) {
        const list = [];
        const attr = v.getAttribute("src");
        if (attr) list.push({ src: attr, type: v.getAttribute("type") || "" });
        v.querySelectorAll("source").forEach((s) => {
            const src = s.getAttribute("src") || s.getAttribute("data-src");
            if (src) list.push({ src, type: s.getAttribute("type") || "" });
        });
        return list;
    }

    /**
     * Thay <video> của CMS bằng một element mới tinh khôi.
     *
     * Vì sao phải thay chứ không tái dùng: đo trên Chrome 150, chỉ cần gọi
     * load() ĐÚNG MỘT LẦN là element đó vĩnh viễn bỏ qua preload="none" —
     * mọi <source> chèn về sau bị tải thẳng tới readyState 4 (~1 MB/video).
     * Mà ta lại BẮT BUỘC phải gọi load() để huỷ request trình duyệt đã tự bắn
     * cho <video preload="metadata"> trong lúc script chưa chạy.
     * Lối thoát: gọi load() trên element CŨ rồi vứt nó đi, dựng player trên
     * element mới chưa từng bị load() nên preload="none" còn hiệu lực.
     */
    function swapVideo(old) {
        const fresh = document.createElement("video");
        Array.prototype.forEach.call(old.attributes, (a) => {
            if (a.name === "src" || a.name === "controls" || a.name === "style") return;
            try { fresh.setAttribute(a.name, a.value); } catch (_) { /* noop */ }
        });
        // giữ phụ đề nếu có
        old.querySelectorAll("track").forEach((t) => fresh.appendChild(t));
        fresh.preload = "none";
        old.parentNode.replaceChild(fresh, old);

        // Huỷ request đang bay của element cũ. Nó đã bị gỡ khỏi DOM nên việc
        // load() làm "hỏng" preload của nó không còn ảnh hưởng gì.
        old.removeAttribute("src");
        old.querySelectorAll("source").forEach((s) => s.remove());
        try { old.load(); } catch (_) { /* noop */ }
        return fresh;
    }

    function attachSources(state) {
        if (state.attached || !state.sources.length) return;
        state.attached = true;
        const v = state.video;
        v.preload = "none";
        const frag = document.createDocumentFragment();
        state.sources.forEach((s) => {
            const el = document.createElement("source");
            el.setAttribute("src", s.src);
            if (s.type) el.setAttribute("type", s.type);
            frag.appendChild(el);
        });
        const firstTrack = v.querySelector("track");
        if (firstTrack) v.insertBefore(frag, firstTrack);
        else v.appendChild(frag);
        // TUYỆT ĐỐI KHÔNG gọi v.load() ở đây.
        // Đo trên Chrome 150: load() ghi đè preload="none" và tải luôn tới
        // readyState 4 (~1 MB/video). Không gọi thì readyState đứng ở 0.
        // Việc chèn <source> vào element đang NETWORK_EMPTY đã tự kích hoạt
        // resource selection theo spec, nên không cần load() vẫn phát được.
    }

    // Gỡ sạch source rồi gắn lại (dùng cho retry — nếu không sẽ nhân đôi <source>)
    function resetSources(state) {
        const v = state.video;
        state.attached = false;
        v.querySelectorAll("source").forEach((s) => s.remove());
        v.removeAttribute("src");
        try { v.load(); } catch (_) { /* noop */ }
        attachSources(state);
    }

    // CHÚ Ý — không có cơ chế "nhả source khi cuộn qua":
    // muốn nhả thì phải gọi load(), mà load() lại vô hiệu hoá preload="none"
    // cho lần gắn sau (xem swapVideo). Đánh đổi 1 MB/video để tiết kiệm buffer
    // là lỗ, nên bỏ. Chrome vốn cũng tự thu hồi buffer của media đang pause
    // ngoài màn hình khi thiếu bộ nhớ.

    // -----------------------------------------------------------------------
    // Lấy tỉ lệ + thời lượng SIÊU RẺ từ playlist HLS (~557 B, thay vì ~1 MB metadata)
    // -----------------------------------------------------------------------
    // Cấp độ tin cậy của số đo tỉ lệ — số LỚN HƠN được phép ghi đè số nhỏ hơn.
    // Poster chỉ là ước lượng TẠM: rất nhiều poster cũ bị cắt lệch so với video
    // (đo 2026-07: poster .gif sinh từ V1 có tỉ lệ rải từ 1.53 đến 2.19 trong khi
    // video luôn 16/9), tin vào nó là khung sai vĩnh viễn vì guard cũ khoá luôn.
    const ASPECT_POSTER = 1; // đoán từ ảnh poster
    const ASPECT_META = 2; // CMS render sẵn (data-w/data-h) hoặc RESOLUTION trong HLS
    const ASPECT_EXACT = 3; // videoWidth/videoHeight — sự thật cuối cùng

    function applyAspect(state, w, h, level) {
        const lv = level || ASPECT_EXACT;
        if (!w || !h || lv <= state.aspectLevel) return;
        state.aspectLevel = lv;
        // "Biết chắc" chỉ tính từ mức META trở lên; poster không được coi là chốt.
        state.aspectKnown = lv >= ASPECT_META;
        const wrap = state.wrap;
        const ar = w / h;
        wrap.style.aspectRatio = `${w} / ${h}`;
        if (ar < 1) {
            // Video dọc: giới hạn chiều cao và bó sát bề ngang để không có viền đen
            wrap.style.maxHeight = CONFIG.portraitMaxHeight;
            wrap.style.maxWidth = `calc(${CONFIG.portraitMaxHeight} * ${ar.toFixed(4)})`;
            wrap.style.marginLeft = "auto";
            wrap.style.marginRight = "auto";
        } else {
            // Lần đặt trước có thể là DỌC (poster dọc mà video ngang) → gỡ giới hạn,
            // nếu không khung sẽ bị bó lại theo số đo cũ.
            wrap.style.maxHeight = "";
            wrap.style.maxWidth = "";
            wrap.style.marginLeft = "";
            wrap.style.marginRight = "";
        }
    }

    async function probeMeta(state) {
        if (!CONFIG.probeMeta || state.probed) return;
        state.probed = true;

        // 1. Rẻ nhất: kích thước do CMS render sẵn, không tốn request nào
        const dw = Number(state.video.dataset.w);
        const dh = Number(state.video.dataset.h);
        if (dw > 0 && dh > 0) applyAspect(state, dw, dh, ASPECT_META);

        // 2. Có poster thì đọc kích thước từ ảnh (ảnh không bị chặn CORS như fetch).
        //    CHỈ tin poster khi nó DỌC — đó là trường hợp duy nhất mà tỉ lệ mặc định
        //    16/9 sai hẳn và cần báo trước để khỏi nhảy khung. Poster NGANG thì bỏ
        //    qua: video ngang gần như luôn 16/9, trong khi poster ngang rất hay bị
        //    cắt lệch (1.40 → 2.19), tin vào nó là khung sai suốt.
        const poster = state.video.getAttribute("poster");
        if (!state.aspectKnown && poster) {
            const img = new Image();
            img.onload = () => {
                if (img.naturalWidth < img.naturalHeight) {
                    applyAspect(state, img.naturalWidth, img.naturalHeight, ASPECT_POSTER);
                }
            };
            img.src = poster;
        }

        // 3. Đọc playlist HLS. LƯU Ý: tính đến 2026-07 cdn.tapchianninhmang.vn trả
        //    header access-control-allow-origin HAI LẦN ("*, *") nên trình duyệt
        //    chặn fetch. Hỏng thì tắt luôn cho cả trang để khỏi spam console;
        //    sửa được CDN là tự chạy lại, không cần đụng code.
        if (probeBlocked) return;
        const hls = state.sources.find(
            (s) => /mpegurl/i.test(s.type) || /\.m3u8(\?|$)/i.test(s.src)
        );
        if (!hls) return;

        try {
            const res = await fetch(hls.src, { credentials: "omit" });
            if (!res.ok) return;
            const master = await res.text();

            const mr = /RESOLUTION=(\d+)x(\d+)/i.exec(master);
            if (mr) applyAspect(state, Number(mr[1]), Number(mr[2]), ASPECT_META);

            if (state.durationKnown) return;
            const child = master.split(/\r?\n/).find((l) => l.trim() && l.trim()[0] !== "#");
            if (!child) return;
            const res2 = await fetch(new URL(child.trim(), hls.src).href, { credentials: "omit" });
            if (!res2.ok) return;
            const idx = await res2.text();
            let total = 0;
            const re = /#EXTINF:\s*([\d.]+)/gi;
            let m;
            while ((m = re.exec(idx))) total += parseFloat(m[1]) || 0;
            if (total > 0 && !state.durationKnown) {
                state.probeDuration = total;
                state.el.dur.textContent = fmtTime(total);
            }
        } catch (_) {
            // Gần như luôn là CORS. Probe chỉ để làm đẹp (tỉ lệ + thời lượng
            // sớm), không có vẫn phát bình thường => tắt im lặng.
            probeBlocked = true;
        }
    }

    /**
     * Video đang phát mà bị cuộn ra khỏi tầm nhìn.
     * Ưu tiên thu nhỏ thành PiP; không được thì mới dừng như cũ.
     *
     * Lưu ý về giới hạn của trình duyệt: requestPictureInPicture() đòi
     * "transient user activation". Cuộn bằng chuột/bánh xe KHÔNG tạo activation
     * nên trên desktop lệnh này thường bị từ chối -> rơi về pause. Trên cảm ứng,
     * thao tác vuốt bắt đầu bằng pointerdown nên thường vẫn còn activation và
     * PiP mở được. Vì vậy code luôn phải có nhánh fallback, không được giả định.
     */
    function scrollAway(state) {
        const v = state.video;
        const wantPip =
            CONFIG.pipOnScrollAway &&
            pipAvailable(v) &&
            (!CONFIG.pipRequireEngagement || state.engaged) &&
            fsElement() !== state.wrap &&
            !state.pipPending;

        if (!wantPip) {
            state.autoPaused = true;
            v.pause();
            return;
        }

        state.pipPending = true;
        enterPip(v).then((ok) => {
            state.pipPending = false;
            if (ok) {
                state.autoPip = true;
                return;
            }
            // PiP bị từ chối -> giữ nguyên hành vi cũ, nhưng phải kiểm lại vì
            // người dùng có thể đã cuộn ngược về trong lúc chờ promise.
            if (state.ratio < CONFIG.pauseThreshold && !v.paused && !inPip(v)) {
                state.autoPaused = true;
                v.pause();
            }
        });
    }

    // -----------------------------------------------------------------------
    // Autoplay
    // -----------------------------------------------------------------------
    function tryAutoplay(state) {
        if (!autoplayAllowed()) return;
        if (state.userPaused && !CONFIG.resumeAfterUserPause) return;
        if (state.ended || state.errored) return;
        if (!state.video.paused) return;
        attachSources(state);

        const v = state.video;
        const wantSound = shouldStartWithSound(state);
        v.muted = !wantSound;
        if (wantSound && VOLUME_SETTABLE) {
            const lvl = soundLevel();
            if (lvl !== null) v.volume = lvl;
        }
        state.autoPaused = false;

        const probing = wantSound && soundAllowed === null;
        if (probing) soundProbing = true;

        const p = v.play();
        if (!p || typeof p.then !== "function") {
            soundProbing = false;
            return;
        }
        p.then(() => {
            if (probing) soundProbing = false;
            // Phát được mà KHÔNG câm => origin này đã đủ quyền, các video sau khỏi dò lại
            if (!v.muted) soundAllowed = true;
        }).catch((err) => {
            if (probing) soundProbing = false;
            if (v.muted) return;

            // QUAN TRỌNG: chỉ NotAllowedError mới có nghĩa "bị chặn vì có tiếng".
            // AbortError = play() bị pause() cắt ngang (user bấm dừng, cuộn qua,
            // hoặc single-playback nhường video khác) — hiểu nhầm thành lỗi âm thanh
            // sẽ vừa ghi sai soundAllowed vừa TỰ PHÁT LẠI video mà user vừa dừng.
            if (!err || err.name !== "NotAllowedError") return;

            soundAllowed = false;
            v.muted = true;

            // Trạng thái có thể đã đổi trong lúc chờ promise -> kiểm lại trước khi phát.
            if (state.userPaused || state.errored ||
                state.ratio < CONFIG.autoplayThreshold || inPip(v)) return;

            const p2 = v.play();
            if (p2 && typeof p2.catch === "function") p2.catch(() => {});
        });
    }

    /** Áp lại toàn bộ nhãn trợ năng cho một player đã dựng. */
    function relabel(state) {
        const { wrap, el, video } = state;
        const cap = wrap.getAttribute("data-caption") || "";
        wrap.setAttribute("aria-label", cap ? `${L.player}: ${cap}` : L.player);
        el.progress.setAttribute("aria-label", L.progress);
        el.playBtn.setAttribute("aria-label", video.paused ? L.play : L.pause);
        el.muteBtn.setAttribute("aria-label", video.muted ? L.unmute : L.mute);
        el.unmute.setAttribute("aria-label", L.unmute);
        el.mute.setAttribute("aria-label", L.mute);
        el.retry.setAttribute("aria-label", L.retry);
        el.settingsBtn.setAttribute("aria-label", L.settings);
        el.menu.setAttribute("aria-label", L.speed);
        el.pipBack.setAttribute("aria-label", L.restore);
        el.fsBtn.setAttribute("aria-label", fsElement() === wrap ? L.fullscreenExit : L.fullscreen);
        if (el.pipBtn) el.pipBtn.setAttribute("aria-label", inPip(video) ? L.pipExit : L.pip);
        if (el.volInput) el.volInput.setAttribute("aria-label", L.volume);
        const err = wrap.querySelector(`.${NS}__error`);
        if (err) err.setAttribute("aria-label", L.error);
        const note = wrap.querySelector(`.${NS}__pipnote`);
        if (note) note.setAttribute("aria-label", L.pipActive);
    }

    // -----------------------------------------------------------------------
    // Dựng 1 player
    // -----------------------------------------------------------------------
    function upgrade(original) {
        if (!original || original.dataset[NS]) return null;
        if (original.closest(`.${NS}`)) return null;
        if (CONFIG.skip && original.closest(CONFIG.skip)) return null;
        if (original.closest('[contenteditable="true"]')) return null;
        if (!original.parentNode) return null;

        injectStyle();

        // Đọc nguồn TRƯỚC, rồi thay bằng element tinh khôi (xem swapVideo)
        const sources = readSources(original);
        const video = swapVideo(original);
        video.dataset[NS] = "1";

        const state = {
            video,
            sources,
            attached: false,
            probed: false,
            aspectKnown: false,
            aspectLevel: 0,
            durationKnown: false,
            probeDuration: 0,
            userPaused: false,
            userUnmuted: false,
            autoPaused: false,
            pausedByClaim: false,
            autoPip: false,      // PiP do cuộn qua tự mở (khác với user tự bấm)
            pipPending: false,
            engaged: false,      // user đã chủ động tương tác với player này chưa
            mutedByUser: false,  // user CHỦ ĐỘNG tắt tiếng (khác với mặc định câm)
            ended: false,
            errored: false,
            netRetried: false,
            ratio: 0,
            scrubbing: false,
            idleTimer: 0,
        };
        video[`__${NS}`] = state;

        const wrap = document.createElement("div");
        wrap.className = NS;
        wrap.tabIndex = 0;
        wrap.setAttribute("role", "region");
        // Đặt tên theo caption để nhiều player trên 1 bài không trùng nhãn
        const fig = video.closest("figure");
        const cap = fig && fig.querySelector("figcaption");
        const capText = cap ? cap.textContent.trim().replace(/\s+/g, " ").slice(0, 80) : "";
        if (capText) wrap.setAttribute("data-caption", capText);
        wrap.setAttribute("aria-label", capText ? `${L.player}: ${capText}` : L.player);
        video.parentNode.insertBefore(wrap, video);
        wrap.appendChild(video);
        state.wrap = wrap;

        // swapVideo đã bỏ style/controls; chỉ cần bổ sung các thuộc tính bắt buộc
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        if (CONFIG.startMuted) video.muted = true;
        if (video.hasAttribute("poster")) {
            wrap.style.backgroundImage = `url("${video.getAttribute("poster")}")`;
            wrap.style.backgroundSize = "contain";
            wrap.style.backgroundPosition = "center";
            wrap.style.backgroundRepeat = "no-repeat";
        }

        const ui = document.createElement("div");
        ui.className = `${NS}__ui`;
        // surface + big: bấm được nhưng KHÔNG phải tab stop (tránh 4 điểm dừng Tab/player)
        ui.innerHTML = `
<button type="button" class="${NS}__surface" tabindex="-1" aria-hidden="true"></button>
<div class="${NS}__spinner" aria-hidden="true"></div>
<button type="button" class="${NS}__big" tabindex="-1" aria-hidden="true" data-state="play">${ICON.play}</button>
<button type="button" class="${NS}__unmute" aria-label="${L.unmute}">${ICON.muted}</button>
<button type="button" class="${NS}__mute" aria-label="${L.mute}">${ICON.volume}</button>
<span class="${NS}__sr" aria-live="polite"></span>
<div class="${NS}__error" role="alert" aria-label="${L.error}"><span class="${NS}__erricon" aria-hidden="true">${ICON.warning}</span><button type="button" class="${NS}__retry" aria-label="${L.retry}">${ICON.replay}</button></div>
<div class="${NS}__pipnote" role="status" aria-label="${L.pipActive}"><span class="${NS}__pipicon" aria-hidden="true">${ICON.pip}</span><button type="button" class="${NS}__pipback" aria-label="${L.restore}">${ICON.restore}</button></div>
<div class="${NS}__bar">
  <div class="${NS}__progress" role="slider" tabindex="0" aria-label="${L.progress}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="${NS}__track" aria-hidden="true">
      <div class="${NS}__buffer"></div>
      <div class="${NS}__played"></div>
      <div class="${NS}__handle"></div>
    </div>
    <div class="${NS}__tip" aria-hidden="true">0:00</div>
  </div>
  <div class="${NS}__row">
    <button type="button" class="${NS}__btn" data-act="play" aria-label="${L.play}">${ICON.play}</button>
    <div class="${NS}__vol">
      <button type="button" class="${NS}__btn" data-act="mute" aria-label="${L.mute}">${ICON.volume}</button>
      <div class="${NS}__volslider"><input type="range" min="0" max="1" step="0.05" value="1" aria-label="${L.volume}"></div>
    </div>
    <div class="${NS}__time"><span data-cur>0:00</span> <b>/</b> <span data-dur>0:00</span></div>
    <div class="${NS}__spacer"></div>
    <div class="${NS}__menuwrap">
      <button type="button" class="${NS}__btn" data-act="settings" aria-label="${L.settings}" aria-haspopup="true" aria-expanded="false">${ICON.settings}</button>
      <div class="${NS}__menu" role="menu" aria-label="${L.speed}"></div>
    </div>
    <button type="button" class="${NS}__btn" data-act="pip" aria-label="${L.pip}">${ICON.pip}</button>
    <button type="button" class="${NS}__btn" data-act="fs" aria-label="${L.fullscreen}">${ICON.enterFull}</button>
  </div>
</div>`;
        wrap.appendChild(ui);

        const q = (sel) => ui.querySelector(sel);
        const el = {
            surface: q(`.${NS}__surface`),
            big: q(`.${NS}__big`),
            unmute: q(`.${NS}__unmute`),
            mute: q(`.${NS}__mute`),
            sr: q(`.${NS}__sr`),
            retry: q(`.${NS}__retry`),
            pipBack: q(`.${NS}__pipback`),
            bar: q(`.${NS}__bar`),
            progress: q(`.${NS}__progress`),
            buffer: q(`.${NS}__buffer`),
            played: q(`.${NS}__played`),
            handle: q(`.${NS}__handle`),
            tip: q(`.${NS}__tip`),
            playBtn: q(`[data-act=play]`),
            muteBtn: q(`[data-act=mute]`),
            vol: q(`.${NS}__vol`),
            volInput: q(`.${NS}__volslider input`),
            cur: q(`[data-cur]`),
            dur: q(`[data-dur]`),
            settingsBtn: q(`[data-act=settings]`),
            menu: q(`.${NS}__menu`),
            pipBtn: q(`[data-act=pip]`),
            fsBtn: q(`[data-act=fs]`),
        };
        state.el = el;

        if (!CONFIG.enablePiP || !document.pictureInPictureEnabled || video.disablePictureInPicture) {
            el.pipBtn.remove();
            el.pipBtn = null;
        }
        // iOS: volume là read-only => thanh trượt vô tác dụng, bỏ hẳn thay vì lừa người dùng
        if (!VOLUME_SETTABLE) el.volInput.parentElement.remove();

        CONFIG.playbackRates.forEach((r) => {
            const b = document.createElement("button");
            b.type = "button";
            b.setAttribute("role", "menuitemradio");
            b.setAttribute("aria-checked", r === 1 ? "true" : "false");
            b.dataset.rate = String(r);
            b.textContent = `${r}x`;
            el.menu.appendChild(b);
        });

        allStates.add(state);
        bind(state);
        prepareIO.observe(video);
        playIO.observe(video);
        return state;
    }

    // -----------------------------------------------------------------------
    // Gắn sự kiện
    // -----------------------------------------------------------------------
    function bind(state) {
        const { video, wrap, el } = state;

        const effDuration = () =>
            isFinite(video.duration) && video.duration > 0 ? video.duration : state.probeDuration;

        const updateLoading = () => {
            const busy = !video.paused && !video.ended && video.readyState < HAVE_FUTURE_DATA;
            wrap.classList.toggle("is-loading", busy);
        };

        const setPlayIcon = () => {
            const playing = !video.paused && !video.ended;
            el.playBtn.innerHTML = playing ? ICON.pause : ICON.play;
            el.playBtn.setAttribute("aria-label", playing ? L.pause : L.play);
            el.big.innerHTML = video.ended ? ICON.replay : ICON.play;
            el.big.dataset.state = video.ended ? "replay" : "play";
        };

        const setVolIcon = () => {
            const off = video.muted || video.volume === 0;
            el.muteBtn.innerHTML = off ? ICON.muted : ICON.volume;
            el.muteBtn.setAttribute("aria-label", off ? L.unmute : L.mute);
            if (el.volInput) el.volInput.value = String(off ? 0 : video.volume);

            // Gợi ý "Bật tiếng": chỉ khi user CHƯA tự quyết định gì về âm thanh.
            // Đã tự tắt rồi mà còn mời bật lại thì phản cảm.
            wrap.classList.toggle(
                "is-mutedhint",
                CONFIG.showUnmuteHint && off && !video.paused &&
                !state.userUnmuted && !state.mutedByUser && soundPref() !== false
            );
            // Gợi ý "Tắt tiếng": khi tiếng TỰ bật mà user chưa hề đụng vào.
            wrap.classList.toggle(
                "is-soundhint",
                CONFIG.showMuteHint && !off && !video.paused && !state.engaged
            );
        };

        const announce = (msg) => {
            if (el.sr) el.sr.textContent = msg;
        };

        const renderProgress = () => {
            const d = effDuration();
            if (!d) return;
            const pct = clamp((video.currentTime / d) * 100, 0, 100);
            el.played.style.width = `${pct}%`;
            el.handle.style.left = `${pct}%`;
            el.cur.textContent = fmtTime(video.currentTime);
            el.progress.setAttribute("aria-valuenow", String(Math.round(pct)));
            el.progress.setAttribute("aria-valuetext", `${fmtTime(video.currentTime)} ${L.of} ${fmtTime(d)}`);
            if (video.buffered.length) {
                let end = 0;
                for (let i = 0; i < video.buffered.length; i++) {
                    if (video.buffered.start(i) <= video.currentTime) end = video.buffered.end(i);
                }
                el.buffer.style.width = `${clamp((end / d) * 100, 0, 100)}%`;
            }
        };

        const toggle = () => {
            if (video.ended) {
                video.currentTime = 0;
                state.ended = false;
            }
            if (video.paused) {
                state.userPaused = false;
                attachSources(state);
                const p = video.play();
                if (p && typeof p.catch === "function") p.catch(() => {});
            } else {
                state.userPaused = true;
                video.pause();
            }
        };
        state.toggle = toggle;

        const seekBy = (delta) => {
            const d = effDuration();
            if (!d) return;
            attachSources(state);
            video.currentTime = clamp(video.currentTime + delta, 0, d);
        };

        // --- Ẩn/hiện thanh điều khiển ---
        const wake = () => {
            wrap.classList.remove("is-idle");
            clearTimeout(state.idleTimer);
            if (!video.paused) {
                state.idleTimer = setTimeout(() => {
                    if (!video.paused && !state.scrubbing && !el.menu.classList.contains("is-open")) {
                        wrap.classList.add("is-idle");
                    }
                }, CONFIG.hideControlsDelay);
            }
        };
        // CHỈ dành cho chuột. Trên cảm ứng, con trỏ chạm bị huỷ ngay khi nhấc tay
        // nên pointerleave bắn liền sau MỖI cú chạm => điều khiển vừa hiện đã bị
        // ẩn ngay: đúng hiện tượng "nháy rồi tắt" trên iOS Safari.
        wrap.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") wake(); });
        wrap.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") wake(); });
        wrap.addEventListener("pointerleave", (e) => {
            if (e.pointerType !== "mouse") return;
            clearTimeout(state.idleTimer);
            if (!video.paused) wrap.classList.add("is-idle");
        });
        // Chạm/bấm vào thanh điều khiển thì giữ cho nó hiện
        el.bar.addEventListener("pointerdown", wake);

        // --- Sự kiện video ---
        video.addEventListener("loadedmetadata", () => {
            state.durationKnown = isFinite(video.duration) && video.duration > 0;
            el.dur.textContent = fmtTime(effDuration());
            applyAspect(state, video.videoWidth, video.videoHeight, ASPECT_EXACT);
            renderProgress();
        });
        video.addEventListener("timeupdate", () => { renderProgress(); updateLoading(); });
        video.addEventListener("progress", renderProgress);
        video.addEventListener("play", () => {
            state.ended = false;
            wrap.classList.add("is-playing");
            claimPlayback(state);
            setPlayIcon();
            setVolIcon();
            updateLoading();
            wake();
        });
        video.addEventListener("pause", () => {
            // Phân biệt dừng do người dùng với dừng do observer / single-playback.
            // Nếu không, mọi lần cuộn qua đều bị coi là "user bấm dừng" và autoplay chết.
            if (state.autoPaused || state.pausedByClaim) {
                state.autoPaused = false;
                state.pausedByClaim = false;
            } else {
                state.userPaused = true;
            }
            wrap.classList.remove("is-playing", "is-idle");
            setPlayIcon();
            setVolIcon();
            updateLoading();
            clearTimeout(state.idleTimer);
        });
        video.addEventListener("ended", () => {
            state.ended = true;
            wrap.classList.remove("is-playing", "is-idle", "is-loading");
            setPlayIcon();
        });
        ["waiting", "playing", "canplay", "seeked", "seeking", "emptied", "abort", "stalled"]
            .forEach((ev) => video.addEventListener(ev, updateLoading));
        video.addEventListener("volumechange", setVolIcon);
        video.addEventListener("error", () => {
            if (!state.attached) return; // lỗi do ta chủ động gỡ source, bỏ qua
            const code = video.error ? video.error.code : 0;
            wrap.classList.remove("is-loading");
            // Lỗi mạng thoáng qua (rất hay gặp trên 4G) thì tự thử lại 1 lần
            if (code === 2 && !state.netRetried) {
                state.netRetried = true;
                resetSources(state);
                return;
            }
            state.errored = true;
            wrap.classList.add("is-error");
        });

        // --- Nút ---
        // e.detail > 1 => đây là click thứ 2 của một double-click (dành cho fullscreen).
        // Không chặn thì toggle chạy 2 lần và userPaused bị khoá vĩnh viễn.
        const singleClick = (fn) => (e) => { if (e.detail > 1) return; fn(e); };

        // Ghi lại loại con trỏ + trạng thái ẩn/hiện NGAY LÚC pointerdown, trước khi
        // wake() của handler khác kịp xoá is-idle (nếu đọc lúc click sẽ luôn thấy
        // "đang hiện" và lập tức ẩn đi — lại thành nháy).
        let tapPointerType = "mouse";
        let tapWasIdle = false;
        el.surface.addEventListener("pointerdown", (e) => {
            tapPointerType = e.pointerType;
            tapWasIdle = wrap.classList.contains("is-idle");
        });
        el.surface.addEventListener("click", singleClick(() => {
            if (tapPointerType !== "mouse") {
                // Cảm ứng: chạm khung video = bật/tắt thanh điều khiển (giống app
                // video trên mobile). Phát/dừng dùng nút giữa hoặc nút trên thanh.
                if (tapWasIdle) { wake(); return; }
                if (!video.paused) { wrap.classList.add("is-idle"); return; }
            }
            toggle();
        }));
        el.big.addEventListener("click", singleClick((e) => { e.stopPropagation(); toggle(); }));
        el.playBtn.addEventListener("click", () => { state.engaged = true; toggle(); });
        el.retry.addEventListener("click", () => {
            state.errored = false;
            state.netRetried = false;
            wrap.classList.remove("is-error");
            resetSources(state);
            const p = video.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
        });
        wrap.addEventListener("dblclick", (e) => {
            if (e.target.closest(`.${NS}__bar`)) return;
            e.preventDefault();
            toggleFs();
        });

        el.muteBtn.addEventListener("click", () => {
            applySoundChoice(state, video.muted);
            announce(video.muted ? L.soundOff : L.soundOn);
            setVolIcon();
        });
        el.unmute.addEventListener("click", () => {
            applySoundChoice(state, true);
            announce(L.soundOn);
            setVolIcon();
        });
        el.mute.addEventListener("click", () => {
            applySoundChoice(state, false);
            announce(L.soundOff);
            setVolIcon();
        });
        if (el.volInput) {
            el.volInput.addEventListener("input", () => {
                const v = Number(el.volInput.value);
                video.volume = v;
                video.muted = v === 0;
                state.engaged = true;
                state.userUnmuted = v > 0;
                state.mutedByUser = v === 0;
                if (v > 0) soundAllowed = true;
                setSoundPref(v > 0, v);
                setVolIcon();
            });
        }

        // --- Progress: chuột/chạm ---
        const ratioAt = (clientX) => {
            const r = el.progress.getBoundingClientRect();
            return clamp((clientX - r.left) / r.width, 0, 1);
        };
        const seekTo = (ratio) => {
            const d = effDuration();
            if (!d) return;
            attachSources(state);
            video.currentTime = ratio * d;
        };
        el.progress.addEventListener("pointerdown", (e) => {
            state.engaged = true;
            state.scrubbing = true;
            el.progress.classList.add("is-scrubbing");
            try { el.progress.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
            seekTo(ratioAt(e.clientX));
        });
        el.progress.addEventListener("pointermove", (e) => {
            const ratio = ratioAt(e.clientX);
            const d = effDuration();
            el.tip.style.left = `${ratio * 100}%`;
            el.tip.textContent = fmtTime(d ? ratio * d : 0);
            if (state.scrubbing) seekTo(ratio);
        });
        const endScrub = (e) => {
            if (!state.scrubbing) return;
            state.scrubbing = false;
            el.progress.classList.remove("is-scrubbing");
            try { el.progress.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }
        };
        el.progress.addEventListener("pointerup", endScrub);
        el.progress.addEventListener("pointercancel", endScrub);

        // --- Progress: bàn phím (role="slider" thì bắt buộc phải dùng được) ---
        el.progress.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const d = effDuration();
            let handled = true;
            switch (e.key) {
                case "ArrowLeft": seekBy(-CONFIG.seekStep); break;
                case "ArrowRight": seekBy(CONFIG.seekStep); break;
                case "PageDown": seekBy(-CONFIG.seekStepLong); break;
                case "PageUp": seekBy(CONFIG.seekStepLong); break;
                case "Home": if (d) { attachSources(state); video.currentTime = 0; } break;
                case "End": if (d) { attachSources(state); video.currentTime = d; } break;
                default: handled = false;
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation(); // đừng để wrapper xử lý lần nữa
                wake();
            }
        });

        // --- Menu tốc độ ---
        el.settingsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = !el.menu.classList.contains("is-open");
            el.menu.classList.toggle("is-open", open);
            el.settingsBtn.setAttribute("aria-expanded", String(open));
            if (open) openMenus.add(state);
            else openMenus.delete(state);
        });
        el.menu.addEventListener("click", (e) => {
            const b = e.target.closest("button[data-rate]");
            if (!b) return;
            video.playbackRate = Number(b.dataset.rate);
            el.menu.querySelectorAll("button[data-rate]").forEach((x) => {
                x.setAttribute("aria-checked", x === b ? "true" : "false");
            });
            closeMenu(state);
        });

        // --- PiP ---
        if (el.pipBtn) {
            el.pipBtn.addEventListener("click", () => {
                state.engaged = true;
                if (inPip(video)) {
                    state.autoPip = false;
                    leavePip(video);
                } else {
                    attachSources(state);
                    enterPip(video);
                }
            });
        }
        el.pipBack.addEventListener("click", () => {
            state.autoPip = false;
            leavePip(video);
            state.wrap.scrollIntoView({ block: "center" });
        });

        // Trạng thái PiP đổi (kể cả khi user tự đóng cửa sổ PiP)
        const syncPip = () => {
            const on = inPip(video);
            wrap.classList.toggle("is-pip", on);
            if (el.pipBtn) el.pipBtn.setAttribute("aria-label", on ? L.pipExit : L.pip);
            if (on) return;
            state.autoPip = false;
            // User đóng PiP trong lúc video vẫn ngoài tầm nhìn => dừng hẳn,
            // đừng để nó phát ngầm ở chỗ không ai nhìn thấy.
            if (state.ratio < CONFIG.pauseThreshold && !video.paused) {
                state.autoPaused = true;
                video.pause();
            }
        };
        video.addEventListener("enterpictureinpicture", syncPip);
        video.addEventListener("leavepictureinpicture", syncPip);
        video.addEventListener("webkitpresentationmodechanged", syncPip);

        // --- Fullscreen ---
        function toggleFs() {
            if (fsElement() === wrap) exitFs();
            else requestFs(state);
        }
        el.fsBtn.addEventListener("click", toggleFs);

        // --- Bàn phím trên wrapper ---
        wrap.addEventListener("keydown", (e) => {
            // Đừng nuốt Cmd+F / Ctrl+F (tìm trong trang), Cmd+L, Cmd+J...
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.target.closest("input, textarea, select, [contenteditable='']")) return;
            // toLowerCase cho TẤT CẢ: " " giữ nguyên, "ArrowLeft" -> "arrowleft",
            // "Escape" -> "escape", và "K" (Shift/CapsLock) cũng khớp.
            const k = e.key.toLowerCase();
            let handled = true;
            switch (k) {
                case " ":
                case "k": toggle(); break;
                case "arrowleft": seekBy(-CONFIG.seekStep); break;
                case "arrowright": seekBy(CONFIG.seekStep); break;
                case "j": seekBy(-CONFIG.seekStepLong); break;
                case "l": seekBy(CONFIG.seekStepLong); break;
                case "arrowup":
                    if (!VOLUME_SETTABLE) { handled = false; break; }
                    video.volume = clamp(video.volume + CONFIG.volumeStep, 0, 1);
                    applySoundChoice(state, true);
                    setVolIcon();
                    break;
                case "arrowdown":
                    if (!VOLUME_SETTABLE) { handled = false; break; }
                    video.volume = clamp(video.volume - CONFIG.volumeStep, 0, 1);
                    if (video.volume === 0) applySoundChoice(state, false);
                    else setSoundPref(true, video.volume);
                    setVolIcon();
                    break;
                case "m":
                    applySoundChoice(state, video.muted);
                    announce(video.muted ? L.soundOff : L.soundOn);
                    setVolIcon();
                    break;
                case "f": toggleFs(); break;
                case "escape":
                    if (el.menu.classList.contains("is-open")) closeMenu(state);
                    else handled = false;
                    break;
                default:
                    if (/^[0-9]$/.test(k) && effDuration()) {
                        attachSources(state);
                        video.currentTime = (Number(k) / 10) * effDuration();
                    } else {
                        handled = false;
                    }
            }
            if (handled) {
                e.preventDefault();
                wake();
            }
        });

        setPlayIcon();
        setVolIcon();
    }

    // -----------------------------------------------------------------------
    // Quét trang
    // -----------------------------------------------------------------------
    function scan(root) {
        const base = root || document;
        const scopes = [];
        if (CONFIG.scope) base.querySelectorAll(CONFIG.scope).forEach((n) => scopes.push(n));
        // KHÔNG fallback ra cả document: trang podcast/pv có player riêng, quét bừa sẽ cướp mất
        if (!scopes.length) return [];

        const seen = new Set();
        const out = [];
        scopes.forEach((s) => {
            s.querySelectorAll(`video:not([data-${NS}])`).forEach((v) => {
                if (seen.has(v)) return;
                seen.add(v);
                const st = upgrade(v);
                if (st) out.push(st);
            });
        });
        return out;
    }

    let mo = null;
    let moTimer = 0;
    function watch() {
        if (mo || !window.MutationObserver) return;
        mo = new MutationObserver((records) => {
            const hasVideo = records.some((r) =>
                Array.prototype.some.call(r.addedNodes, (n) =>
                    n.nodeType === 1 && (n.tagName === "VIDEO" || n.querySelector?.("video"))
                )
            );
            if (!hasVideo) return;
            clearTimeout(moTimer);
            moTimer = setTimeout(() => scan(), 120);
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        if (!document.body) return;
        scan();
        watch();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

    return { init, scan, upgrade, setLabels, LABELS, CONFIG };
})();

if (typeof window !== "undefined") window.TCAVideoPlayer = TCAVideoPlayer;

export default TCAVideoPlayer;
