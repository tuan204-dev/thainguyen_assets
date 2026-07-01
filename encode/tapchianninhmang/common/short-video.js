(function(p){"use strict";const c=p.defaultView,y=[{url:"https://assets.tapchianninhmang.vn/common/overlay.js",global:"Overlay"},{url:"https://assets.tapchianninhmang.vn/common/swiper.js",global:"SwiperManager"}],M=e=>new Promise((t,s)=>{const d=Array.from(p.scripts).find(h=>(h.getAttribute("src")||"")===e);if(d){if(d.dataset.loaded==="true")return t();d.addEventListener("load",()=>t(),{once:!0}),d.addEventListener("error",()=>s(new Error(`Failed to load: ${e}`)),{once:!0});return}const l=p.createElement("script");l.src=e,l.type="module",l.async=!0,l.addEventListener("load",()=>{l.dataset.loaded="true",t()},{once:!0}),l.addEventListener("error",()=>s(new Error(`Failed to load: ${e}`)),{once:!0}),(p.head||p.documentElement).appendChild(l)}),q=()=>Promise.all(y.map(e=>c[e.global]?Promise.resolve():M(e.url))).then(()=>{const e=y.filter(t=>!c[t.global]).map(t=>t.global);if(e.length)throw new Error(`Missing globals after load: ${e.join(", ")}`);return{Overlay:c.Overlay,SwiperManager:c.SwiperManager}});let k,w;const A=".short-video-section",x="short-video-player",_="short-video-styles",$=`
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
`,C={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},v=e=>String(e??"").replace(/[&<>"']/g,t=>C[t]),S='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',O='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>',j='<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4v16l14-8z"/></svg>',T='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill="currentColor" fill-rule="evenodd" d="M10.938 3.175a.674.674 0 0 1 1.138-.488l6.526 6.215c.574.547.554 1.47-.043 1.991l-6.505 5.676a.674.674 0 0 1-1.116-.508V13.49s-6.985-1.258-9.225 2.854c-.209.384-1.023.518-.857-1.395.692-3.52 2.106-9.017 10.082-9.017z" clip-rule="evenodd"/><path fill="#161823" fill-rule="evenodd" d="m15.754 6.212 1.295 2.59a1.12 1.12 0 0 1-.268 1.349l-5.799 5.042s-.28 1.403.562 1.403 7.578-6.174 7.578-6.174.28-.842-.561-1.684c-.843-.842-2.807-2.526-2.807-2.526" clip-rule="evenodd" opacity="0.03"/><path fill="url(#short-video-share-gradient)" fill-rule="evenodd" d="M10.937 6.23v7.297s-6.683-.942-8.777 2.246C.146 18.839.331 12.309 3.363 9.057s7.574-2.827 7.574-2.827" clip-rule="evenodd" opacity="0.09"/><defs><radialGradient id="short-video-share-gradient" cx="0" cy="0" r="1" gradientTransform="rotate(-113.046 11.628 5.43)scale(8.93256 8.78076)" gradientUnits="userSpaceOnUse"><stop/><stop offset="0.995" stop-opacity="0.01"/><stop offset="1" stop-opacity="0.01"/></radialGradient></defs></svg>';q().then(e=>{k=e.Overlay,w=e.SwiperManager;const t=p.querySelector(A);if(!t)return;const s=z(t);if(!s.length)return;I(),N(t,s);const d=V(s);w.init(t),w.init(d),D(d)}).catch(e=>console.error("[short-video] Failed to load dependencies.",e));function z(e){return[...e.querySelectorAll("[data-short-video]")].map(t=>({title:t.dataset.title||"",thumbnail:t.dataset.thumbnail||"",view:t.dataset.view||"",videoSrc:t.dataset.videoSrc||""}))}function I(){if(document.getElementById(_))return;const e=document.createElement("style");e.id=_,e.textContent=$,document.head.appendChild(e)}function N(e,t){const s=e.querySelector('[class~="t:container"]')||e;s.querySelectorAll("[data-short-video]").forEach(d=>d.remove()),s.insertAdjacentHTML("beforeend",`<div class="swiper" data-swiper data-swiper-slides-per-view="1.4" data-swiper-space-between="16"
             data-swiper-breakpoints='{"640":{"slidesPerView":2.4},"880":{"slidesPerView":3.4},"1100":{"slidesPerView":4.4}}'>
            <div class="swiper-wrapper">${t.map(P).join("")}</div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
        </div>`)}function P(e,t){const s=e.view?`<span class="t:absolute t:top-2 t:right-2 t:flex t:items-center t:gap-1 t:bg-black/50 t:text-white t:text-xs t:px-2 t:py-1 t:rounded">
                <i class="material-symbols--visibility-rounded"></i> ${v(e.view)}
            </span>`:"";return`<div class="swiper-slide">
        <button type="button" data-short-video-index="${t}"
                class="t:relative t:block t:w-full t:aspect-9/16 t:rounded-lg t:overflow-hidden t:bg-cover t:bg-center t:cursor-pointer t:shadow-md"
                style="background-image:url('${v(e.thumbnail)}')">
            ${s}
            <div class="t:absolute t:inset-x-0 t:bottom-0 t:p-3 t:pt-9 t:text-left t:text-white t:text-sm t:font-semibold t:line-clamp-3 t:bg-linear-to-b t:from-[rgba(0,0,0,0)] t:to-[rgba(0,0,0,0.95)]">
                <h3 class="title l3 t:text-white!">${v(e.title)}</h3>
            </div>
        </button>
    </div>`}function V(e){const t=document.createElement("div");return t.className="overlay",t.setAttribute("data-overlay-id",x),t.setAttribute("data-overlay-variant","fullscreen"),t.setAttribute("aria-hidden","true"),t.innerHTML=`
        <div class="overlay__backdrop"></div>
        <div class="overlay__content t:p-0! t:py-6! t:bg-black! t:flex t:items-center t:justify-center">
            <button type="button" data-overlay-target="${x}" aria-label="Close"
                    class="t:absolute t:top-4 t:right-4 t:z-10 t:w-10 t:h-10 t:rounded-full t:bg-white/15 t:text-white t:text-2xl t:flex t:items-center t:justify-center t:hover:bg-white/25">\u2715</button>
            <div class="t:absolute t:right-4 t:top-1/2 t:-translate-y-1/2 t:z-10 t:flex t:flex-col t:gap-4">
                <button type="button" data-short-video-nav="prev" aria-label="Video tr\u01B0\u1EDBc"
                        class="t:w-11 t:h-11 t:rounded-full t:bg-white/15 t:text-white t:text-2xl t:flex t:items-center t:justify-center t:hover:bg-white/25 t:max-md:hidden">\u2191</button>
                <button type="button" data-short-video-nav="next" aria-label="Video k\u1EBF ti\u1EBFp"
                        class="t:w-11 t:h-11 t:rounded-full t:bg-white/15 t:text-white t:text-2xl t:flex t:items-center t:justify-center t:hover:bg-white/25 t:max-md:hidden">\u2193</button>
            </div>
            <div class="swiper short-video-player" data-swiper data-swiper-direction="vertical" data-swiper-slides-per-view="1" data-swiper-speed="350">
                <div class="swiper-wrapper">${e.map(B).join("")}</div>
            </div>
        </div>`,document.body.appendChild(t),t}function B(e){return`<div class="swiper-slide t:flex t:items-end t:justify-center t:bg-black">
        <div class="short-video-stage" data-paused="false">
            <video class="short-video-stage__video"
                   src="${v(e.videoSrc)}" poster="${v(e.thumbnail)}"
                   playsinline loop preload="metadata"></video>
            <button type="button" data-short-video-mute aria-label="B\u1EADt/t\u1EAFt ti\u1EBFng"
                    class="short-video-stage__mute swiper-no-swiping">${S}</button>
            <button type="button" data-short-video-play aria-label="Ph\xE1t/t\u1EA1m d\u1EEBng"
                    class="short-video-stage__playpause swiper-no-swiping">${j}</button>
            <div class="short-video-stage__title">
                <p>${v(e.title||"\u0110ang c\u1EADp nh\u1EADt")}</p>
            </div>
            <input type="range" class="short-video-seek swiper-no-swiping" data-short-video-seek
                   min="0" max="100" value="0" step="0.1" aria-label="Seek video">
            <span class="short-video-time" data-short-video-time>0:00 / 0:00</span>
        </div>
        <div class="short-video-stage__actions">
            <button type="button" data-short-video-share aria-label="Chia s\u1EBB"
                    class="short-video-stage__action swiper-no-swiping">${T}</button>
        </div>
    </div>`}function E(e){(!Number.isFinite(e)||e<0)&&(e=0);const t=Math.floor(e/60),s=Math.floor(e%60);return`${t}:${s.toString().padStart(2,"0")}`}function D(e){const t=e.querySelector(".short-video-player"),s=()=>t?.__swiperInstance,d=()=>e.classList.contains("is-active"),l=()=>t?.querySelector(".swiper-slide-active video")||t?.querySelectorAll(".swiper-slide video")?.[s()?.activeIndex??0];let h=!1;const L=()=>{e.querySelectorAll("video").forEach(o=>{o.muted=h}),e.querySelectorAll("[data-short-video-mute]").forEach(o=>{o.innerHTML=h?O:S})},H=o=>{const r=o.querySelector("video"),i=o.querySelector(".short-video-stage");!r||!i||(i.dataset.paused=r.paused?"true":"false")},F=()=>{e.querySelectorAll("video").forEach(o=>{o.pause(),o.currentTime=0})},m=()=>{const o=s(),r=o?o.activeIndex:0;t.querySelectorAll(".swiper-slide").forEach((i,a)=>{const n=i.querySelector("video");n&&(a===r?n.play().catch(()=>{}):(n.pause(),n.currentTime=0))})};document.addEventListener("click",o=>{const r=o.target.closest("[data-short-video-index]");if(!r)return;o.preventDefault();const i=Number(r.dataset.shortVideoIndex)||0;k.open(x),s()?.slideTo(i,0),m()}),new MutationObserver(()=>{d()?m():F()}).observe(e,{attributes:!0,attributeFilter:["class"]}),s()?.on?.("slideChange",m),e.addEventListener("click",o=>{if(o.target.closest("[data-short-video-mute]")){h=!h,L();return}if(o.target.closest("[data-short-video-play]")){const a=l();a&&(a.paused?a.play().catch(()=>{}):a.pause());return}if(o.target.closest("[data-short-video-share]")){const n=o.target.closest("[data-short-video-share]").closest(".swiper-slide")||t?.querySelector(".swiper-slide-active"),g=n?.querySelector("video")||l(),u=n?.querySelector(".short-video-stage__title p")?.textContent?.trim()||p.title,f=g?.currentSrc||g?.src||c.location.href,b={title:u,text:u,url:f};c.navigator?.share?c.navigator.share(b).catch(()=>{}):c.navigator?.clipboard?.writeText&&c.navigator.clipboard.writeText(f).catch(()=>{});return}const r=o.target.closest("[data-short-video-nav]");if(r){const a=s();if(!a)return;r.dataset.shortVideoNav==="prev"?a.slidePrev():a.slideNext();return}const i=o.target.closest("video");i&&(i.paused?i.play().catch(()=>{}):i.pause())}),t.querySelectorAll(".swiper-slide").forEach(o=>{const r=o.querySelector("video"),i=o.querySelector(".short-video-stage");if(!r)return;const a=()=>H(o);r.addEventListener("play",a),r.addEventListener("pause",a),a();const n=()=>{i&&r.videoWidth&&r.videoHeight&&(i.style.aspectRatio=`${r.videoWidth} / ${r.videoHeight}`)};r.addEventListener("loadedmetadata",n),n()}),L(),t.querySelectorAll(".swiper-slide").forEach(o=>{const r=o.querySelector("video"),i=o.querySelector("[data-short-video-seek]"),a=o.querySelector("[data-short-video-time]");if(!r||!i)return;let n=!1;const g=b=>i.style.setProperty("--progress",`${b}%`),u=()=>{a&&(a.textContent=`${E(r.currentTime)} / ${E(r.duration)}`)};r.addEventListener("timeupdate",()=>{if(u(),n||!r.duration)return;const b=r.currentTime/r.duration*100;i.value=b,g(b)}),r.addEventListener("loadedmetadata",()=>{g(0),u()}),r.addEventListener("durationchange",u),i.addEventListener("pointerdown",()=>{n=!0}),i.addEventListener("input",()=>{r.duration&&(r.currentTime=Number(i.value)/100*r.duration),g(Number(i.value)),u()});const f=()=>{n=!1};i.addEventListener("pointerup",f),i.addEventListener("pointercancel",f),i.addEventListener("change",f)}),document.addEventListener("keydown",o=>{if(!d())return;const r=s();if(o.key==="ArrowUp")o.preventDefault(),r?.slidePrev();else if(o.key==="ArrowDown")o.preventDefault(),r?.slideNext();else if(o.code==="Space"||o.key===" "){o.preventDefault();const i=l();if(!i)return;i.paused?i.play().catch(()=>{}):i.pause()}})}})(document);
