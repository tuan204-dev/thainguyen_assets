const G=(()=>{"use strict";const s={autoplay:!0,autoplayThreshold:.6,pauseThreshold:.25,pauseWhenOffscreen:!0,pipOnScrollAway:!0,pipRequireEngagement:!1,startMuted:!0,showUnmuteHint:!0,resumeAfterUserPause:!1,singlePlayback:!0,respectReducedMotion:!0,respectSaveData:!0,preloadRootMargin:"400px 0px",probeMeta:!0,defaultAspect:"16 / 9",portraitMaxHeight:"78vh",seekStep:5,seekStepLong:10,volumeStep:.1,hideControlsDelay:2600,playbackRates:[.5,.75,1,1.25,1.5,2],enablePiP:!0,scope:"#content, #content-wrapper, .article-prose, .detail-content, .the-article-body, article",skip:".short-video, .image-gallery, .swiper, .video-card, [data-no-tcavp]"},t="tcavp",Y="#30a14a",J=3,k=(()=>{try{const e=document.createElement("video");return e.volume=.5,e.volume===.5}catch{return!1}})(),g={play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>',pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5h3.4v15H7zM13.6 4.5H17v15h-3.4z"/></svg>',replay:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5V2L7.5 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8Z"/></svg>',volume:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9.5h3.2L12 5.6a.8.8 0 0 1 1.3.62v11.56a.8.8 0 0 1-1.3.62L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M16.2 9.1a4 4 0 0 1 0 5.8M18.8 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>',muted:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9.5h3.2L12 5.6a.8.8 0 0 1 1.3.62v11.56a.8.8 0 0 1-1.3.62L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="m16.5 9.5 5 5m0-5-5 5"/></svg>',enterFull:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9V4h5v2H6v3H4Zm11-5h5v5h-2V6h-3V4ZM4 15h2v3h3v2H4v-5Zm14 0h2v5h-5v-2h3v-3Z"/></svg>',exitFull:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 4h2v5H4V7h5V4Zm6 0h2v3h3v2h-5V4ZM4 15h5v5H7v-3H4v-2Zm11 0h5v2h-3v3h-2v-5Z"/></svg>',pip:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13ZM5 6v12h14V6H5Zm6 6h6v4h-6v-4Z"/></svg>',settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 7h9a3 3 0 0 1 6 0h1a1 1 0 1 1 0 2h-1a3 3 0 0 1-6 0H4a1 1 0 0 1 0-2Zm12-1.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM4 15h1a3 3 0 0 1 6 0h9a1 1 0 1 1 0 2h-9a3 3 0 0 1-6 0H4a1 1 0 1 1 0-2Zm4-1.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/></svg>'},Q=`
.${t}{position:relative;display:block;width:100%;margin:0;background:#000;overflow:hidden;border-radius:4px;aspect-ratio:${s.defaultAspect};color:#fff;font-family:Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;font-size:14px;line-height:1.2;-webkit-text-size-adjust:100%;text-size-adjust:100%;--${t}-accent:${Y};container-type:inline-size}
.${t}:focus{outline:none}
.${t}:focus-visible{outline:2px solid var(--${t}-accent);outline-offset:2px}
.${t} video{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;min-width:0!important;margin:0!important;padding:0!important;display:block!important;object-fit:contain;background:#000}
/* Ch\u1EB7n CSS c\u1EE7a trang r\xF2 v\xE0o UI player (b\xE0i vi\u1EBFt hay set font-size cho * ho\u1EB7c button) */
.${t}__ui,.${t}__ui *{box-sizing:border-box;font-family:inherit;letter-spacing:normal;text-transform:none;-webkit-text-size-adjust:100%;text-size-adjust:100%}
.${t}__ui{position:absolute;inset:0;pointer-events:none;opacity:1;visibility:visible;transition:opacity .2s ease,visibility .2s ease}
/* \u1EA8n th\xEC ph\u1EA3i \u1EA9n th\u1EADt (visibility) \u0111\u1EC3 n\xFAt kh\xF4ng c\xF2n focus/click \u0111\u01B0\u1EE3c... */
.${t}.is-idle .${t}__ui{opacity:0;visibility:hidden}
/* ...nh\u01B0ng \u0111ang focus b\u1EB1ng b\xE0n ph\xEDm th\xEC lu\xF4n hi\u1EC7n l\u1EA1i */
.${t}:focus-within .${t}__ui{opacity:1!important;visibility:visible!important}
.${t}.is-idle:not(:focus-within){cursor:none}
.${t}__surface{position:absolute;inset:0;pointer-events:auto;border:0;padding:0;margin:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}

/* N\xFAt play l\u1EDBn \u1EDF gi\u1EEFa */
.${t}__big{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:66px;height:66px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:center;transition:background .18s ease,transform .18s ease;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
.${t}__big svg{width:30px;height:30px;margin-left:3px}
.${t}__big[data-state=replay] svg{margin-left:0}
.${t}.is-playing .${t}__big,.${t}.is-loading .${t}__big{display:none}

/* Spinner */
.${t}__spinner{position:absolute;top:50%;left:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border:4px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:${t}-spin .8s linear infinite;display:none}
.${t}.is-loading .${t}__spinner{display:block}
@keyframes ${t}-spin{to{transform:rotate(360deg)}}

/* N\xFAt b\u1EADt ti\u1EBFng */
.${t}__unmute{position:absolute;top:12px;right:12px;display:none;align-items:center;gap:6px;height:32px;padding:0 12px;border:0;border-radius:16px;background:rgba(0,0,0,.65);color:#fff;font-size:13px;font-weight:500;cursor:pointer;pointer-events:auto;transition:background .18s ease}
.${t}__unmute svg{width:16px;height:16px}
.${t}.is-mutedhint .${t}__unmute{display:flex}

/* Thanh \u0111i\u1EC1u khi\u1EC3n d\u01B0\u1EDBi */
.${t}__bar{position:absolute;left:0;right:0;bottom:0;padding:22px 10px 6px;pointer-events:auto;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.55) 45%,rgba(0,0,0,0) 100%)}

/* Progress */
.${t}__progress{position:relative;height:14px;display:flex;align-items:center;cursor:pointer;touch-action:none}
.${t}__progress:focus{outline:none}
.${t}__progress:focus-visible{outline:2px solid var(--${t}-accent);outline-offset:2px;border-radius:2px}
.${t}__track{position:relative;width:100%;height:3px;border-radius:2px;background:rgba(255,255,255,.28);transition:height .12s ease}
.${t}__progress.is-scrubbing .${t}__track,.${t}__progress:focus-visible .${t}__track{height:5px}
.${t}__buffer{position:absolute;left:0;top:0;height:100%;width:0;border-radius:2px;background:rgba(255,255,255,.45)}
.${t}__played{position:absolute;left:0;top:0;height:100%;width:0;border-radius:2px;background:var(--${t}-accent)}
.${t}__handle{position:absolute;top:50%;left:0;width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border-radius:50%;background:#fff;box-shadow:0 0 3px rgba(0,0,0,.5);transform:scale(0);transition:transform .12s ease}
.${t}__progress.is-scrubbing .${t}__handle,.${t}__progress:focus-visible .${t}__handle{transform:scale(1)}
.${t}__tip{position:absolute;bottom:20px;transform:translateX(-50%);padding:2px 6px;border-radius:3px;background:rgba(0,0,0,.85);font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0;transition:opacity .12s ease;pointer-events:none}
.${t}__progress.is-scrubbing .${t}__tip{opacity:1}

/* H\xE0ng n\xFAt */
.${t}__row{display:flex;align-items:center;gap:2px;height:38px}
.${t}__btn{flex:none;width:36px;height:36px;padding:7px;border:0;background:transparent;color:#fff;cursor:pointer;border-radius:4px;transition:background .15s ease,opacity .15s ease;opacity:.92}
.${t}__btn:focus-visible{outline:2px solid var(--${t}-accent);outline-offset:-2px}
.${t}__btn svg{width:100%;height:100%;display:block}
.${t}__spacer{flex:1 1 auto}
.${t}__time{flex:none;padding:0 8px;font-size:12.5px;font-variant-numeric:tabular-nums;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.6);white-space:nowrap}
.${t}__time b{font-weight:400;opacity:.7}

/* \xC2m l\u01B0\u1EE3ng: tr\u01B0\u1EE3t ra khi hover */
.${t}__vol{display:flex;align-items:center;flex:none}
.${t}__volslider{width:0;overflow:hidden;transition:width .18s ease,margin .18s ease;display:flex;align-items:center}
.${t}__vol:focus-within .${t}__volslider{width:64px;margin-right:6px}
.${t}__volslider input{width:64px;height:14px;margin:0;cursor:pointer;-webkit-appearance:none;appearance:none;background:transparent}
.${t}__volslider input::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:rgba(255,255,255,.35)}
.${t}__volslider input::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;margin-top:-4px;border-radius:50%;background:#fff}
.${t}__volslider input::-moz-range-track{height:3px;border-radius:2px;background:rgba(255,255,255,.35)}
.${t}__volslider input::-moz-range-thumb{width:11px;height:11px;border:0;border-radius:50%;background:#fff}

/* Menu t\u1ED1c \u0111\u1ED9 */
.${t}__menuwrap{position:relative;flex:none}
.${t}__menu{position:absolute;right:0;bottom:calc(100% + 8px);min-width:132px;max-width:min(190px,92cqw);padding:4px 0;border-radius:6px;background:rgba(18,18,18,.96);box-shadow:0 4px 18px rgba(0,0,0,.5);display:none}
.${t}__menu.is-open{display:block}
/* KH\xD4NG d\xF9ng <h1..h6> \u1EDF \u0111\xE2y. CSS th\xE2n b\xE0i th\u01B0\u1EDDng style h2..h6 k\xE8m !important,
   m\xE0 !important th\u1EAFng c\u1EA3 inline style n\xEAn heading trong player s\u1EBD b\u1ECB b\xF3p m\xE9o
   (\u0111\xE3 g\u1EB7p th\u1EADt tr\xEAn TCA: .article-prose h4{font-size:1.4rem!important}).
   Div + class ri\xEAng th\xEC mi\u1EC5n nhi\u1EC5m; font-size v\u1EABn \u0111\u1EC3 !important ph\xF2ng th\u1EE7. */
.${t}__menu-title{margin:0;padding:6px 12px;font-weight:500;font-size:10px!important;line-height:1.3;letter-spacing:.5px;text-transform:uppercase;opacity:.55;white-space:nowrap}
.${t}__menu button{display:flex;align-items:center;gap:8px;width:100%;padding:6px 12px;border:0;background:transparent;color:#fff;font-weight:400;font-size:12.5px;line-height:1.35;text-align:left;white-space:nowrap;cursor:pointer}
.${t}__menu button[aria-checked=true]{color:var(--${t}-accent);font-weight:600}
.${t}__menu button::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor;opacity:0;flex:none}
.${t}__menu button[aria-checked=true]::before{opacity:1}

/* L\u1ED7i \u2014 n\u1EB1m tr\xEAn c\xF9ng v\xE0 C\xD3 n\xFAt th\u1EED l\u1EA1i (n\u1EBFu kh\xF4ng s\u1EBD nu\u1ED1t click m\xE0 kh\xF4ng c\u1EE9u \u0111\u01B0\u1EE3c) */
.${t}__error{position:absolute;inset:0;z-index:2;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;text-align:center;background:rgba(0,0,0,.82);font-size:14px;pointer-events:auto}
.${t}.is-error .${t}__error{display:flex}
.${t}.is-error .${t}__big,.${t}.is-error .${t}__spinner{display:none}
.${t}__retry,.${t}__pipback{padding:7px 18px;border:1px solid rgba(255,255,255,.55);border-radius:16px;background:transparent;color:#fff;font-size:13px;cursor:pointer}

/* \u0110ang ph\xE1t \u1EDF c\u1EEDa s\u1ED5 PiP: ch\u1ED7 video trong b\xE0i ch\u1EC9 c\xF2n \xF4 \u0111en n\xEAn ph\u1EA3i n\xF3i r\xF5 */
.${t}__pipnote{position:absolute;inset:0;z-index:1;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;text-align:center;background:#000;font-size:13.5px;color:rgba(255,255,255,.8);pointer-events:auto}
.${t}.is-pip .${t}__pipnote{display:flex}
.${t}.is-pip .${t}__bar,.${t}.is-pip .${t}__big,.${t}.is-pip .${t}__spinner,.${t}.is-pip .${t}__unmute{display:none}

/* Fullscreen */
.${t}:fullscreen{aspect-ratio:auto!important;max-width:none!important;max-height:none!important;width:100%;height:100%;border-radius:0}
.${t}:-webkit-full-screen{aspect-ratio:auto!important;max-width:none!important;max-height:none!important;width:100%;height:100%;border-radius:0}

/* Hi\u1EC7u \u1EE9ng hover CH\u1EC8 cho thi\u1EBFt b\u1ECB c\xF3 con tr\u1ECF th\u1EADt. Tr\xEAn iOS, :hover d\xEDnh l\u1EA1i
   sau khi ch\u1EA1m n\xEAn n\xFAt v\u1EEBa b\u1EA5m b\u1ECB k\u1EB9t tr\u1EA1ng th\xE1i s\xE1ng, thanh progress k\u1EB9t d\xE0y. */
@media (hover:hover) and (pointer:fine){
.${t}__big:hover{background:var(--${t}-accent);transform:translate(-50%,-50%) scale(1.06)}
.${t}__unmute:hover{background:var(--${t}-accent)}
.${t}__btn:hover{background:rgba(255,255,255,.16);opacity:1}
.${t}__menu button:hover{background:rgba(255,255,255,.13)}
.${t}__retry:hover{background:var(--${t}-accent);border-color:var(--${t}-accent)}
.${t}__progress:hover .${t}__track{height:5px}
.${t}__progress:hover .${t}__handle{transform:scale(1)}
.${t}__progress:hover .${t}__tip{opacity:1}
.${t}__vol:hover .${t}__volslider{width:64px;margin-right:6px}
}

/* Co gi\xE3n theo b\u1EC1 r\u1ED9ng C\u1EE6A CH\xCDNH PLAYER (kh\xF4ng theo viewport) \u2014 player d\u1ECDc trong
   b\xE0i r\u1ED9ng v\u1EABn ph\u1EA3i thu nh\u1ECF \u0111i\u1EC1u khi\u1EC3n, n\xEAn d\xF9ng container query thay v\xEC media query. */
@container (max-width:520px){
.${t}__bar{padding:18px 6px 4px}
.${t}__row{height:34px}
.${t}__btn{width:32px;height:32px;padding:6px}
.${t}__big{width:54px;height:54px}
.${t}__big svg{width:24px;height:24px}
.${t}__time{font-size:11.5px;padding:0 5px}
.${t}__unmute{height:28px;padding:0 10px;font-size:12px}
.${t}__vol .${t}__volslider{display:none}
}
@container (max-width:340px){
.${t}__row{height:30px;gap:0}
.${t}__btn{width:28px;height:28px;padding:5px}
.${t}__big{width:44px;height:44px}
.${t}__big svg{width:20px;height:20px}
.${t}__time{font-size:10.5px;padding:0 3px}
.${t}__menu-title{font-size:9.5px!important;padding:5px 10px}
.${t}__menu button{font-size:11.5px;padding:5px 10px}
.${t}__spinner{width:40px;height:40px;margin:-20px 0 0 -20px;border-width:3px}
}
@media (prefers-reduced-motion:reduce){
.${t} *,.${t}__ui{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}
/* spinner quay nhanh .01ms = nh\u1EA5p nh\xE1y ch\xF3i m\u1EAFt, ph\u1EA3i t\u1EAFt h\u1EB3n */
.${t}__spinner{animation:none!important;border-color:rgba(255,255,255,.5);border-top-color:#fff}
}`;let A=!1;function ee(){if(A||document.getElementById(`${t}-style`)){A=!0;return}const e=document.createElement("style");e.id=`${t}-style`,e.textContent=Q,(document.head||document.documentElement).appendChild(e),A=!0}function y(e){(!isFinite(e)||e<0)&&(e=0);const n=Math.floor(e%60),r=Math.floor(e/60%60),i=Math.floor(e/3600),o=c=>String(c).padStart(2,"0");return i>0?`${i}:${o(r)}:${o(n)}`:`${r}:${o(n)}`}function x(e,n,r){return e<n?n:e>r?r:e}function te(){return!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)}function ne(){const e=navigator.connection||navigator.webkitConnection;return!!(e&&e.saveData)}function re(){return!(!s.autoplay||s.respectReducedMotion&&te()||s.respectSaveData&&ne())}const q=new Set,E=new Set;let $=null,N=!1;function ie(e){s.singlePlayback&&($&&$!==e&&!$.video.paused&&($.pausedByClaim=!0,$.video.pause()),$=e)}document.addEventListener("click",e=>{E.size&&E.forEach(n=>{n.wrap.contains(e.target)||M(n)})});function M(e){e.el.menu.classList.remove("is-open"),e.el.settingsBtn.setAttribute("aria-expanded","false"),E.delete(e)}function C(){return document.fullscreenElement||document.webkitFullscreenElement||null}function ae(e){const{wrap:n,video:r}=e;if(n.requestFullscreen)return n.requestFullscreen().catch(()=>{});if(n.webkitRequestFullscreen)return n.webkitRequestFullscreen();if(r.webkitEnterFullscreen){if(m(e),r.readyState===0){r.addEventListener("loadedmetadata",()=>{try{r.webkitEnterFullscreen()}catch{}},{once:!0});try{r.load()}catch{}return}try{r.webkitEnterFullscreen()}catch{}}}function oe(){if(document.exitFullscreen)return document.exitFullscreen().catch(()=>{});if(document.webkitExitFullscreen)return document.webkitExitFullscreen()}function se(e){return!s.enablePiP||e.disablePictureInPicture?!1:document.pictureInPictureEnabled&&e.requestPictureInPicture?!0:typeof e.webkitSetPresentationMode=="function"&&e.webkitSupportsPresentationMode&&e.webkitSupportsPresentationMode("picture-in-picture")}function w(e){return document.pictureInPictureElement===e||e.webkitPresentationMode==="picture-in-picture"}async function U(e){if(w(e))return!0;try{if(e.requestPictureInPicture)await e.requestPictureInPicture();else if(e.webkitSetPresentationMode)e.webkitSetPresentationMode("picture-in-picture");else return!1;return!0}catch{return!1}}function B(e){document.pictureInPictureElement===e?document.exitPictureInPicture().catch(()=>{}):e.webkitPresentationMode==="picture-in-picture"&&e.webkitSetPresentationMode&&e.webkitSetPresentationMode("inline")}function D(){const e=C();q.forEach(n=>{const r=e===n.wrap;n.el.fsBtn.innerHTML=r?g.exitFull:g.enterFull,n.el.fsBtn.setAttribute("aria-label",r?"Tho\xE1t to\xE0n m\xE0n h\xECnh":"To\xE0n m\xE0n h\xECnh")})}document.addEventListener("fullscreenchange",D),document.addEventListener("webkitfullscreenchange",D);const O=new IntersectionObserver(e=>{e.forEach(n=>{if(!n.isIntersecting)return;const r=n.target[`__${t}`];r&&(m(r),le(r),O.unobserve(n.target))})},{rootMargin:s.preloadRootMargin,threshold:0}),ue=new IntersectionObserver(e=>{e.forEach(n=>{const r=n.target[`__${t}`];r&&(r.ratio=n.intersectionRatio,n.intersectionRatio>=s.autoplayThreshold?(r.autoPip&&w(r.video)&&(r.autoPip=!1,B(r.video)),he(r)):s.pauseWhenOffscreen&&n.intersectionRatio<s.pauseThreshold&&!r.video.paused&&!w(r.video)&&pe(r))})},{threshold:[0,s.pauseThreshold,s.autoplayThreshold,1]});function de(e){const n=[],r=e.getAttribute("src");return r&&n.push({src:r,type:e.getAttribute("type")||""}),e.querySelectorAll("source").forEach(i=>{const o=i.getAttribute("src")||i.getAttribute("data-src");o&&n.push({src:o,type:i.getAttribute("type")||""})}),n}function ce(e){const n=document.createElement("video");Array.prototype.forEach.call(e.attributes,r=>{if(!(r.name==="src"||r.name==="controls"||r.name==="style"))try{n.setAttribute(r.name,r.value)}catch{}}),e.querySelectorAll("track").forEach(r=>n.appendChild(r)),n.preload="none",e.parentNode.replaceChild(n,e),e.removeAttribute("src"),e.querySelectorAll("source").forEach(r=>r.remove());try{e.load()}catch{}return n}function m(e){if(e.attached||!e.sources.length)return;e.attached=!0;const n=e.video;n.preload="none";const r=document.createDocumentFragment();e.sources.forEach(o=>{const c=document.createElement("source");c.setAttribute("src",o.src),o.type&&c.setAttribute("type",o.type),r.appendChild(c)});const i=n.querySelector("track");i?n.insertBefore(r,i):n.appendChild(r)}function V(e){const n=e.video;e.attached=!1,n.querySelectorAll("source").forEach(r=>r.remove()),n.removeAttribute("src");try{n.load()}catch{}m(e)}function T(e,n,r){if(!n||!r||e.aspectKnown)return;e.aspectKnown=!0;const i=e.wrap,o=n/r;i.style.aspectRatio=`${n} / ${r}`,o<1&&(i.style.maxHeight=s.portraitMaxHeight,i.style.maxWidth=`calc(${s.portraitMaxHeight} * ${o.toFixed(4)})`,i.style.marginLeft="auto",i.style.marginRight="auto")}async function le(e){if(!s.probeMeta||e.probed)return;e.probed=!0;const n=Number(e.video.dataset.w),r=Number(e.video.dataset.h);n>0&&r>0&&T(e,n,r);const i=e.video.getAttribute("poster");if(!e.aspectKnown&&i){const c=new Image;c.onload=()=>T(e,c.naturalWidth,c.naturalHeight),c.src=i}if(N)return;const o=e.sources.find(c=>/mpegurl/i.test(c.type)||/\.m3u8(\?|$)/i.test(c.src));if(o)try{const c=await fetch(o.src,{credentials:"omit"});if(!c.ok)return;const b=await c.text(),p=/RESOLUTION=(\d+)x(\d+)/i.exec(b);if(p&&T(e,Number(p[1]),Number(p[2])),e.durationKnown)return;const v=b.split(/\r?\n/).find(P=>P.trim()&&P.trim()[0]!=="#");if(!v)return;const d=await fetch(new URL(v.trim(),o.src).href,{credentials:"omit"});if(!d.ok)return;const f=await d.text();let l=0;const _=/#EXTINF:\s*([\d.]+)/gi;let L;for(;L=_.exec(f);)l+=parseFloat(L[1])||0;l>0&&!e.durationKnown&&(e.probeDuration=l,e.el.dur.textContent=y(l))}catch{N=!0}}function pe(e){const n=e.video;if(!(s.pipOnScrollAway&&se(n)&&(!s.pipRequireEngagement||e.engaged)&&C()!==e.wrap&&!e.pipPending)){e.autoPaused=!0,n.pause();return}e.pipPending=!0,U(n).then(i=>{if(e.pipPending=!1,i){e.autoPip=!0;return}e.ratio<s.pauseThreshold&&!n.paused&&!w(n)&&(e.autoPaused=!0,n.pause())})}function he(e){if(!re()||e.userPaused&&!s.resumeAfterUserPause||e.ended||e.errored||!e.video.paused)return;m(e),s.startMuted&&!e.userUnmuted&&(e.video.muted=!0),e.autoPaused=!1;const n=e.video.play();n&&typeof n.catch=="function"&&n.catch(()=>{if(!e.video.muted){e.video.muted=!0;const r=e.video.play();r&&typeof r.catch=="function"&&r.catch(()=>{})}})}function Z(e){if(!e||e.dataset[t]||e.closest(`.${t}`)||s.skip&&e.closest(s.skip)||e.closest('[contenteditable="true"]')||!e.parentNode)return null;ee();const n=de(e),r=ce(e);r.dataset[t]="1";const i={video:r,sources:n,attached:!1,probed:!1,aspectKnown:!1,durationKnown:!1,probeDuration:0,userPaused:!1,userUnmuted:!1,autoPaused:!1,pausedByClaim:!1,autoPip:!1,pipPending:!1,engaged:!1,ended:!1,errored:!1,netRetried:!1,ratio:0,scrubbing:!1,idleTimer:0};r[`__${t}`]=i;const o=document.createElement("div");o.className=t,o.tabIndex=0,o.setAttribute("role","region");const c=r.closest("figure"),b=c&&c.querySelector("figcaption"),p=b?b.textContent.trim().replace(/\s+/g," ").slice(0,80):"";o.setAttribute("aria-label",p?`Tr\xECnh ph\xE1t video: ${p}`:"Tr\xECnh ph\xE1t video"),r.parentNode.insertBefore(o,r),o.appendChild(r),i.wrap=o,r.setAttribute("playsinline",""),r.setAttribute("webkit-playsinline",""),s.startMuted&&(r.muted=!0),r.hasAttribute("poster")&&(o.style.backgroundImage=`url("${r.getAttribute("poster")}")`,o.style.backgroundSize="contain",o.style.backgroundPosition="center",o.style.backgroundRepeat="no-repeat");const v=document.createElement("div");v.className=`${t}__ui`,v.innerHTML=`
<button type="button" class="${t}__surface" tabindex="-1" aria-hidden="true"></button>
<div class="${t}__spinner" aria-hidden="true"></div>
<button type="button" class="${t}__big" tabindex="-1" aria-hidden="true" data-state="play">${g.play}</button>
<button type="button" class="${t}__unmute">${g.muted}<span>B\u1EADt ti\u1EBFng</span></button>
<div class="${t}__error" role="alert"><span>Kh\xF4ng ph\xE1t \u0111\u01B0\u1EE3c video n\xE0y.</span><button type="button" class="${t}__retry">Th\u1EED l\u1EA1i</button></div>
<div class="${t}__pipnote"><span>\u0110ang ph\xE1t \u1EDF c\u1EEDa s\u1ED5 thu nh\u1ECF</span><button type="button" class="${t}__pipback">\u0110\u01B0a video v\u1EC1 l\u1EA1i</button></div>
<div class="${t}__bar">
  <div class="${t}__progress" role="slider" tabindex="0" aria-label="Ti\u1EBFn tr\xECnh video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="${t}__track" aria-hidden="true">
      <div class="${t}__buffer"></div>
      <div class="${t}__played"></div>
      <div class="${t}__handle"></div>
    </div>
    <div class="${t}__tip" aria-hidden="true">0:00</div>
  </div>
  <div class="${t}__row">
    <button type="button" class="${t}__btn" data-act="play" aria-label="Ph\xE1t">${g.play}</button>
    <div class="${t}__vol">
      <button type="button" class="${t}__btn" data-act="mute" aria-label="T\u1EAFt ti\u1EBFng">${g.volume}</button>
      <div class="${t}__volslider"><input type="range" min="0" max="1" step="0.05" value="1" aria-label="\xC2m l\u01B0\u1EE3ng"></div>
    </div>
    <div class="${t}__time"><span data-cur>0:00</span> <b>/</b> <span data-dur>0:00</span></div>
    <div class="${t}__spacer"></div>
    <div class="${t}__menuwrap">
      <button type="button" class="${t}__btn" data-act="settings" aria-label="C\xE0i \u0111\u1EB7t" aria-haspopup="true" aria-expanded="false">${g.settings}</button>
      <div class="${t}__menu" role="menu" aria-label="T\u1ED1c \u0111\u1ED9 ph\xE1t"><div class="${t}__menu-title" aria-hidden="true">T\u1ED1c \u0111\u1ED9 ph\xE1t</div></div>
    </div>
    <button type="button" class="${t}__btn" data-act="pip" aria-label="Thu nh\u1ECF m\xE0n h\xECnh">${g.pip}</button>
    <button type="button" class="${t}__btn" data-act="fs" aria-label="To\xE0n m\xE0n h\xECnh">${g.enterFull}</button>
  </div>
</div>`,o.appendChild(v);const d=l=>v.querySelector(l),f={surface:d(`.${t}__surface`),big:d(`.${t}__big`),unmute:d(`.${t}__unmute`),retry:d(`.${t}__retry`),pipBack:d(`.${t}__pipback`),bar:d(`.${t}__bar`),progress:d(`.${t}__progress`),buffer:d(`.${t}__buffer`),played:d(`.${t}__played`),handle:d(`.${t}__handle`),tip:d(`.${t}__tip`),playBtn:d("[data-act=play]"),muteBtn:d("[data-act=mute]"),vol:d(`.${t}__vol`),volInput:d(`.${t}__volslider input`),cur:d("[data-cur]"),dur:d("[data-dur]"),settingsBtn:d("[data-act=settings]"),menu:d(`.${t}__menu`),pipBtn:d("[data-act=pip]"),fsBtn:d("[data-act=fs]")};return i.el=f,(!s.enablePiP||!document.pictureInPictureEnabled||r.disablePictureInPicture)&&(f.pipBtn.remove(),f.pipBtn=null),k||f.volInput.parentElement.remove(),s.playbackRates.forEach(l=>{const _=document.createElement("button");_.type="button",_.setAttribute("role","menuitemradio"),_.setAttribute("aria-checked",l===1?"true":"false"),_.dataset.rate=String(l),_.textContent=l===1?"Chu\u1EA9n":`${l}x`,f.menu.appendChild(_)}),q.add(i),fe(i),O.observe(r),ue.observe(r),i}function fe(e){const{video:n,wrap:r,el:i}=e,o=()=>isFinite(n.duration)&&n.duration>0?n.duration:e.probeDuration,c=()=>{const a=!n.paused&&!n.ended&&n.readyState<J;r.classList.toggle("is-loading",a)},b=()=>{const a=!n.paused&&!n.ended;i.playBtn.innerHTML=a?g.pause:g.play,i.playBtn.setAttribute("aria-label",a?"T\u1EA1m d\u1EEBng":"Ph\xE1t"),i.big.innerHTML=n.ended?g.replay:g.play,i.big.dataset.state=n.ended?"replay":"play"},p=()=>{const a=n.muted||n.volume===0;i.muteBtn.innerHTML=a?g.muted:g.volume,i.muteBtn.setAttribute("aria-label",a?"B\u1EADt ti\u1EBFng":"T\u1EAFt ti\u1EBFng"),i.volInput&&(i.volInput.value=String(a?0:n.volume)),r.classList.toggle("is-mutedhint",s.showUnmuteHint&&a&&!n.paused&&!e.userUnmuted)},v=()=>{const a=o();if(!a)return;const u=x(n.currentTime/a*100,0,100);if(i.played.style.width=`${u}%`,i.handle.style.left=`${u}%`,i.cur.textContent=y(n.currentTime),i.progress.setAttribute("aria-valuenow",String(Math.round(u))),i.progress.setAttribute("aria-valuetext",`${y(n.currentTime)} tr\xEAn ${y(a)}`),n.buffered.length){let h=0;for(let S=0;S<n.buffered.length;S++)n.buffered.start(S)<=n.currentTime&&(h=n.buffered.end(S));i.buffer.style.width=`${x(h/a*100,0,100)}%`}},d=()=>{if(n.ended&&(n.currentTime=0,e.ended=!1),n.paused){e.userPaused=!1,m(e);const a=n.play();a&&typeof a.catch=="function"&&a.catch(()=>{})}else e.userPaused=!0,n.pause()};e.toggle=d;const f=a=>{const u=o();u&&(m(e),n.currentTime=x(n.currentTime+a,0,u))},l=()=>{r.classList.remove("is-idle"),clearTimeout(e.idleTimer),n.paused||(e.idleTimer=setTimeout(()=>{!n.paused&&!e.scrubbing&&!i.menu.classList.contains("is-open")&&r.classList.add("is-idle")},s.hideControlsDelay))};r.addEventListener("pointermove",a=>{a.pointerType==="mouse"&&l()}),r.addEventListener("pointerenter",a=>{a.pointerType==="mouse"&&l()}),r.addEventListener("pointerleave",a=>{a.pointerType==="mouse"&&(clearTimeout(e.idleTimer),n.paused||r.classList.add("is-idle"))}),i.bar.addEventListener("pointerdown",l),n.addEventListener("loadedmetadata",()=>{e.durationKnown=isFinite(n.duration)&&n.duration>0,i.dur.textContent=y(o()),T(e,n.videoWidth,n.videoHeight),v()}),n.addEventListener("timeupdate",()=>{v(),c()}),n.addEventListener("progress",v),n.addEventListener("play",()=>{e.ended=!1,r.classList.add("is-playing"),ie(e),b(),p(),c(),l()}),n.addEventListener("pause",()=>{e.autoPaused||e.pausedByClaim?(e.autoPaused=!1,e.pausedByClaim=!1):e.userPaused=!0,r.classList.remove("is-playing","is-idle"),b(),p(),c(),clearTimeout(e.idleTimer)}),n.addEventListener("ended",()=>{e.ended=!0,r.classList.remove("is-playing","is-idle","is-loading"),b()}),["waiting","playing","canplay","seeked","seeking","emptied","abort","stalled"].forEach(a=>n.addEventListener(a,c)),n.addEventListener("volumechange",p),n.addEventListener("error",()=>{if(!e.attached)return;const a=n.error?n.error.code:0;if(r.classList.remove("is-loading"),a===2&&!e.netRetried){e.netRetried=!0,V(e);return}e.errored=!0,r.classList.add("is-error")});const _=a=>u=>{u.detail>1||a(u)};let L="mouse",P=!1;i.surface.addEventListener("pointerdown",a=>{L=a.pointerType,P=r.classList.contains("is-idle")}),i.surface.addEventListener("click",_(()=>{if(L!=="mouse"){if(P){l();return}if(!n.paused){r.classList.add("is-idle");return}}d()})),i.big.addEventListener("click",_(a=>{a.stopPropagation(),d()})),i.playBtn.addEventListener("click",()=>{e.engaged=!0,d()}),i.retry.addEventListener("click",()=>{e.errored=!1,e.netRetried=!1,r.classList.remove("is-error"),V(e);const a=n.play();a&&typeof a.catch=="function"&&a.catch(()=>{})}),r.addEventListener("dblclick",a=>{a.target.closest(`.${t}__bar`)||(a.preventDefault(),R())}),i.muteBtn.addEventListener("click",()=>{e.engaged=!0,n.muted=!n.muted,n.muted||(e.userUnmuted=!0,n.volume===0&&k&&(n.volume=1)),p()}),i.unmute.addEventListener("click",()=>{e.engaged=!0,n.muted=!1,e.userUnmuted=!0,n.volume===0&&k&&(n.volume=1),p()}),i.volInput&&i.volInput.addEventListener("input",()=>{const a=Number(i.volInput.value);n.volume=a,n.muted=a===0,a>0&&(e.userUnmuted=!0),p()});const j=a=>{const u=i.progress.getBoundingClientRect();return x((a-u.left)/u.width,0,1)},W=a=>{const u=o();u&&(m(e),n.currentTime=a*u)};i.progress.addEventListener("pointerdown",a=>{e.engaged=!0,e.scrubbing=!0,i.progress.classList.add("is-scrubbing");try{i.progress.setPointerCapture(a.pointerId)}catch{}W(j(a.clientX))}),i.progress.addEventListener("pointermove",a=>{const u=j(a.clientX),h=o();i.tip.style.left=`${u*100}%`,i.tip.textContent=y(h?u*h:0),e.scrubbing&&W(u)});const X=a=>{if(e.scrubbing){e.scrubbing=!1,i.progress.classList.remove("is-scrubbing");try{i.progress.releasePointerCapture(a.pointerId)}catch{}}};i.progress.addEventListener("pointerup",X),i.progress.addEventListener("pointercancel",X),i.progress.addEventListener("keydown",a=>{if(a.ctrlKey||a.metaKey||a.altKey)return;const u=o();let h=!0;switch(a.key){case"ArrowLeft":f(-s.seekStep);break;case"ArrowRight":f(s.seekStep);break;case"PageDown":f(-s.seekStepLong);break;case"PageUp":f(s.seekStepLong);break;case"Home":u&&(m(e),n.currentTime=0);break;case"End":u&&(m(e),n.currentTime=u);break;default:h=!1}h&&(a.preventDefault(),a.stopPropagation(),l())}),i.settingsBtn.addEventListener("click",a=>{a.stopPropagation();const u=!i.menu.classList.contains("is-open");i.menu.classList.toggle("is-open",u),i.settingsBtn.setAttribute("aria-expanded",String(u)),u?E.add(e):E.delete(e)}),i.menu.addEventListener("click",a=>{const u=a.target.closest("button[data-rate]");u&&(n.playbackRate=Number(u.dataset.rate),i.menu.querySelectorAll("button[data-rate]").forEach(h=>{h.setAttribute("aria-checked",h===u?"true":"false")}),M(e))}),i.pipBtn&&i.pipBtn.addEventListener("click",()=>{e.engaged=!0,w(n)?(e.autoPip=!1,B(n)):(m(e),U(n))}),i.pipBack.addEventListener("click",()=>{e.autoPip=!1,B(n),e.wrap.scrollIntoView({block:"center"})});const z=()=>{const a=w(n);r.classList.toggle("is-pip",a),!a&&(e.autoPip=!1,e.ratio<s.pauseThreshold&&!n.paused&&(e.autoPaused=!0,n.pause()))};n.addEventListener("enterpictureinpicture",z),n.addEventListener("leavepictureinpicture",z),n.addEventListener("webkitpresentationmodechanged",z);function R(){C()===r?oe():ae(e)}i.fsBtn.addEventListener("click",R),r.addEventListener("keydown",a=>{if(a.ctrlKey||a.metaKey||a.altKey||a.target.closest("input, textarea, select, [contenteditable='']"))return;const u=a.key.toLowerCase();let h=!0;switch(u){case" ":case"k":d();break;case"arrowleft":f(-s.seekStep);break;case"arrowright":f(s.seekStep);break;case"j":f(-s.seekStepLong);break;case"l":f(s.seekStepLong);break;case"arrowup":if(!k){h=!1;break}n.muted=!1,e.userUnmuted=!0,n.volume=x(n.volume+s.volumeStep,0,1);break;case"arrowdown":if(!k){h=!1;break}n.volume=x(n.volume-s.volumeStep,0,1);break;case"m":n.muted=!n.muted,n.muted||(e.userUnmuted=!0);break;case"f":R();break;case"escape":i.menu.classList.contains("is-open")?M(e):h=!1;break;default:/^[0-9]$/.test(u)&&o()?(m(e),n.currentTime=Number(u)/10*o()):h=!1}h&&(a.preventDefault(),l())}),b(),p()}function I(e){const n=e||document,r=[];if(s.scope&&n.querySelectorAll(s.scope).forEach(c=>r.push(c)),!r.length)return[];const i=new Set,o=[];return r.forEach(c=>{c.querySelectorAll(`video:not([data-${t}])`).forEach(b=>{if(i.has(b))return;i.add(b);const p=Z(b);p&&o.push(p)})}),o}let H=null,K=0;function ge(){H||!window.MutationObserver||(H=new MutationObserver(e=>{e.some(r=>Array.prototype.some.call(r.addedNodes,i=>i.nodeType===1&&(i.tagName==="VIDEO"||i.querySelector?.("video"))))&&(clearTimeout(K),K=setTimeout(()=>I(),120))}),H.observe(document.body,{childList:!0,subtree:!0}))}function F(){document.body&&(I(),ge())}return document.readyState==="loading"?document.addEventListener("DOMContentLoaded",F,{once:!0}):F(),{init:F,scan:I,upgrade:Z,CONFIG:s}})();typeof window<"u"&&(window.TCAVideoPlayer=G);export default G;
