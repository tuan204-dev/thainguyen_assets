// Podcast player — enhances the native <audio> from the CMS article body
// (`#podcast-content audio`) into the custom control bar in `#podcastPlayer`.
// If the script fails to run, the native <audio controls> stays visible as a fallback.

const RATES = [1, 1.25, 1.5, 2, 0.75];

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function formatRate(rate) {
    return rate + "×";
}

function initPodcastPlayer() {
    const player = document.getElementById("podcastPlayer");
    if (!player) return;

    // The CMS renders the article body (with <audio>) into .article-prose (portlet
    // detail_content); the standalone mockup uses #podcast-content. Support both.
    const content =
        document.getElementById("podcast-content") ||
        document.querySelector("main .article-prose") ||
        document.querySelector(".article-prose");
    const audio =
        (content && content.querySelector("audio")) ||
        player.querySelector("audio") ||
        document.querySelector("main audio");

    // No audio → nothing to play, hide the empty control bar.
    if (!audio) {
        player.style.display = "none";
        return;
    }

    // Adopt the native <audio> as the engine: strip its own UI, move it into the
    // player (so it survives hiding the content wrapper) and keep it invisible.
    audio.removeAttribute("controls");
    audio.preload = "metadata";
    audio.style.display = "none";
    player.appendChild(audio);

    // Tidy up the (now empty) content wrapper.
    if (content) {
        content.querySelectorAll("p").forEach((p) => {
            const hasMedia = p.querySelector("img, iframe, audio, video");
            const hasText = p.textContent.replace(/ /g, "").trim();
            if (!hasMedia && !hasText) p.remove();
        });
        const stillHasContent =
            content.textContent.trim() || content.querySelector("img, iframe, video");
        if (!stillHasContent) {
            // detail_content wraps .article-prose in <article> → hide that; the mockup's
            // #podcast-content has no <article> ancestor → hide itself.
            const hideTarget = content.closest("article") || content;
            hideTarget.hidden = true;
        }
    }

    const playBtn = player.querySelector(".pp-play");
    const playIcon = playBtn.querySelector(".pp-ico");
    const currentEl = player.querySelector(".pp-current");
    const durationEl = player.querySelector(".pp-duration");
    const bar = player.querySelector(".pp-progress");
    const fill = player.querySelector(".pp-progress__fill");
    const handle = player.querySelector(".pp-progress__handle");
    const rateBtn = player.querySelector(".pp-rate");
    const volBtn = player.querySelector(".pp-vol-btn");
    const volIcon = volBtn.querySelector(".pp-ico");
    const volRange = player.querySelector(".pp-vol-range");

    let rateIdx = 0;

    function renderPlaying(isPlaying) {
        playBtn.classList.toggle("is-playing", isPlaying);
        playIcon.className = "pp-ico " + (isPlaying ? "is-pause" : "is-play");
        playBtn.setAttribute("aria-label", isPlaying ? "Tạm dừng" : "Phát");
    }

    function renderProgress() {
        const dur = audio.duration || 0;
        const pct = dur ? (audio.currentTime / dur) * 100 : 0;
        fill.style.width = pct + "%";
        handle.style.left = pct + "%";
        currentEl.textContent = formatTime(audio.currentTime);
        bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    }

    function renderVolume() {
        const v = audio.muted ? 0 : audio.volume;
        volIcon.className = "pp-ico " + (v === 0 ? "is-mute" : "is-vol");
        volRange.value = String(v);
    }

    // Play / pause
    playBtn.addEventListener("click", () => {
        if (audio.paused) audio.play();
        else audio.pause();
    });
    audio.addEventListener("play", () => renderPlaying(true));
    audio.addEventListener("pause", () => renderPlaying(false));
    audio.addEventListener("ended", () => renderPlaying(false));

    // Time / duration
    audio.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(audio.duration);
        renderProgress();
    });
    audio.addEventListener("timeupdate", renderProgress);

    // Skip buttons (±seconds via data-skip)
    player.querySelectorAll(".pp-skip").forEach((btn) => {
        btn.addEventListener("click", () => {
            const step = parseFloat(btn.dataset.skip) || 0;
            const dur = audio.duration || 0;
            audio.currentTime = Math.min(Math.max(0, audio.currentTime + step), dur || Infinity);
        });
    });

    // Seek by clicking / dragging the progress bar
    function seekFromEvent(e) {
        const rect = bar.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pct = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
        if (audio.duration) audio.currentTime = pct * audio.duration;
        renderProgress();
    }
    let dragging = false;
    bar.addEventListener("mousedown", (e) => {
        dragging = true;
        seekFromEvent(e);
    });
    window.addEventListener("mousemove", (e) => {
        if (dragging) seekFromEvent(e);
    });
    window.addEventListener("mouseup", () => {
        dragging = false;
    });
    bar.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
            audio.currentTime = Math.min((audio.currentTime || 0) + 5, audio.duration || 0);
            e.preventDefault();
        } else if (e.key === "ArrowLeft") {
            audio.currentTime = Math.max((audio.currentTime || 0) - 5, 0);
            e.preventDefault();
        }
    });

    // Playback rate
    rateBtn.addEventListener("click", () => {
        rateIdx = (rateIdx + 1) % RATES.length;
        audio.playbackRate = RATES[rateIdx];
        rateBtn.textContent = formatRate(RATES[rateIdx]);
    });

    // Volume / mute
    volBtn.addEventListener("click", () => {
        audio.muted = !audio.muted;
        renderVolume();
    });
    volRange.addEventListener("input", () => {
        audio.volume = parseFloat(volRange.value);
        audio.muted = audio.volume === 0;
        renderVolume();
    });

    // Initial paint
    renderPlaying(false);
    renderVolume();
    if (audio.readyState >= 1) {
        durationEl.textContent = formatTime(audio.duration);
        renderProgress();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPodcastPlayer);
} else {
    initPodcastPlayer();
}
