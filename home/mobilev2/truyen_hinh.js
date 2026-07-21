(function () {
const POSTER =
    "https://r2-thainguyen.media-soft.cloud/common/assets/img_tv1.jpg";

const CHANNELS = {
    1: {
        name: "TNTV",
        stream: "https://streaming.thainguyentv.vn/hls/livestream.m3u8",
        poster: POSTER,
    },
    2: {
        name: "TNRADIO",
        stream: "https://radio.thainguyentv.vn/hls/livestream.m3u8",
        poster: POSTER,
    },
};

const SCHEDULE_API = (channel, day) =>
    `https://streaming.thainguyentv.vn/apicenter@/scheduler_data&tpl_gui=tpl_tv_scheduler_file_1&channel=${channel}&day=${day}`;

const BTN_ACTIVE = ["t:bg-[#30A14A]", "t:border-white", "t:hover:bg-[#268D3F]"];
const BTN_INACTIVE = ["t:bg-white", "t:border-white/20", "t:hover:bg-[#F7F7F7]"];

let currentChannel = null;
let hls = null;
let streamStarted = false;
let hlsLibPromise = null;

const video = () => document.getElementById("tv-player");
const listEl = () => document.getElementById("tv-schedule-list");

function todayStr() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
}

function parseTime(raw) {
    const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    return { label: `${String(h).padStart(2, "0")}:${m[2]}`, minutes: h * 60 + min };
}

function teardownStream() {
    if (hls) {
        hls.destroy();
        hls = null;
    }
    const v = video();
    if (v) {
        v.pause();
        v.removeAttribute("src");
        v.load();
    }
    streamStarted = false;
}

const HLS_LIB_URL = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
function loadHlsLib() {
    if (window.Hls) return Promise.resolve();
    if (hlsLibPromise) return hlsLibPromise;
    hlsLibPromise = new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = HLS_LIB_URL;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
    });
    return hlsLibPromise;
}

function prepareStream() {
    const v = video();
    const ch = CHANNELS[currentChannel];
    if (!v || !ch) return;
    const channel = currentChannel;

    if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = ch.stream;
        return;
    }

    loadHlsLib().then(() => {
        if (channel !== currentChannel) return;
        const HlsLib = window.Hls;
        if (!HlsLib || !HlsLib.isSupported()) return;
        hls = new HlsLib({ autoStartLoad: false });
        hls.loadSource(ch.stream);
        hls.attachMedia(v);
        hls.on(HlsLib.Events.ERROR, (_evt, data) => {
            if (data.fatal) teardownStream();
        });
        if (streamStarted) {
            hls.startLoad();
            v.play().catch(() => {});
        }
    });
}

function startStream() {
    if (streamStarted) return;
    streamStarted = true;
    if (hls) hls.startLoad();
    video()
        ?.play()
        .catch(() => {});
}

function setupPlayer() {
    const v = video();
    if (!v) return;
    v.addEventListener("play", startStream);
}

function setListMessage(text) {
    const el = listEl();
    if (!el) return;
    el.innerHTML = `<div class="!roboto t:px-3 t:py-4 t:text-sm t:text-[#8A94A6]">${text}</div>`;
}

async function loadSchedule(channel) {
    const el = listEl();
    if (!el) return;
    setListMessage("Đang tải lịch phát sóng...");
    try {
        const res = await fetch(SCHEDULE_API(channel, todayStr()));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const programs = parsePrograms(html);
        if (channel !== currentChannel) return;
        if (!programs.length) {
            setListMessage("Chưa có lịch phát sóng.");
            return;
        }
        renderSchedule(programs);
        highlightCurrent();
    } catch (err) {
        if (channel !== currentChannel) return;
        console.error("[truyen_hinh] schedule fetch failed:", err);
        setListMessage("Không tải được lịch phát sóng.");
    }
}

function parsePrograms(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const programs = [];
    doc.querySelectorAll("tr.t-r").forEach((tr) => {
        const cells = tr.querySelectorAll("td");
        if (cells.length < 2) return;
        const time = parseTime(cells[0].textContent || "");
        const label = (cells[1].textContent || "").trim().replace(/\s+/g, " ");
        if (!time || !label) return;
        programs.push({ ...time, name: label });
    });
    return programs;
}

function renderSchedule(programs) {
    const el = listEl();
    if (!el) return;
    el.innerHTML = programs
        .map(
            (p, i) => `
        <a
            href=""
            data-idx="${i}"
            data-minutes="${p.minutes}"
            class="t:flex t:items-start t:gap-x-2 t:px-3 t:py-2 t:rounded-lg t:bg-white t:hover:bg-[#F7F7F7]"
        >
            <span class="!roboto t:text-sm t:text-[#212636] t:shrink-0 t:w-[70px]">${p.label}</span>
            <span class="!roboto t:flex-1 t:min-w-0 t:text-sm t:text-[#212636] t:tracking-[0.15px]">${escapeHtml(
                p.name
            )}</span>
        </a>`
        )
        .join("");
}

function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

const HIGHLIGHT = ["t:bg-[#DFFFE6]", "t:font-bold", "t:hover:bg-[#CFF6DA]"];

function highlightCurrent() {
    const el = listEl();
    if (!el) return;
    const rows = Array.from(el.querySelectorAll("a[data-minutes]"));
    if (!rows.length) return;

    const now = nowMinutes();
    let activeIdx = -1;
    rows.forEach((row, i) => {
        if (Number(row.dataset.minutes) <= now) activeIdx = i;
    });
    if (activeIdx === -1) activeIdx = 0;

    rows.forEach((row, i) => {
        const on = i === activeIdx;
        row.classList.toggle("t:bg-white", !on);
        HIGHLIGHT.forEach((c) => row.classList.toggle(c, on));
        if (on) row.setAttribute("aria-current", "true");
        else row.removeAttribute("aria-current");
    });

    rows[activeIdx].scrollIntoView({ block: "nearest" });
}

function styleTab(tab, active) {
    tab.classList.remove(...(active ? BTN_INACTIVE : BTN_ACTIVE));
    tab.classList.add(...(active ? BTN_ACTIVE : BTN_INACTIVE));

    const label = tab.querySelector("span.noto");
    if (label) {
        label.classList.toggle("t:text-white", active);
        label.classList.toggle("t:text-[#212636]", !active);
    }
    const rings = tab.querySelectorAll("span.t\\:relative > span");
    if (rings.length >= 2) {
        rings[0].className = `t:absolute t:size-5 t:rounded-full ${
            active ? "t:bg-white/40" : "t:bg-[#F04438]/20"
        }`;
        rings[1].className = `t:absolute t:size-3.5 t:rounded-full ${
            active ? "t:bg-white/50" : "t:bg-[#F04438]/20"
        }`;
    }
}

function selectChannel(channel) {
    if (channel === currentChannel) return;
    currentChannel = channel;

    document.querySelectorAll("[data-tv-tab]").forEach((tab) => {
        styleTab(tab, Number(tab.dataset.tvTab) === channel);
    });

    teardownStream();
    const v = video();
    if (v) v.poster = CHANNELS[channel].poster;
    prepareStream();

    loadSchedule(channel);
}

function setupTabs() {
    document.querySelectorAll("[data-tv-tab]").forEach((tab) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            selectChannel(Number(tab.dataset.tvTab));
        });
    });
}

function init() {
    if (!video() || !listEl()) return;
    setupPlayer();
    setupTabs();
    selectChannel(1);
    setInterval(highlightCurrent, 60 * 1000);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
})();
