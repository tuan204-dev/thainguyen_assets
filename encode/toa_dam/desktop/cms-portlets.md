<!-- Chỉ để Tailwind (source.css @source) quét class của các portlet CMS mà layout Tọa đàm nhúng lại.
     File .md nên KHÔNG lên kho asset (sync loại *.md). Chép từ prod_thainguyen 13/11/2026; portlet đổi class thì chép lại + build. -->

<!-- ===== portlet header_emagazine ===== -->
<header data-portlet="header_emagazine" class="mag-header">
    <style>
        .mag-header__back-icon{display:none}
        body.ms-layout-1273 .mag-header__back{position:absolute;left:12px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;text-decoration:none;z-index:2}
        body.ms-layout-1273 .mag-header__back-icon{display:inline-flex;align-items:center;justify-content:center}
        body.ms-layout-1273 .mag-header__back-text{display:none}
        body.ms-layout-1273 .mag-header__share{right:12px}
    </style>
    <a href="<%= absUrl('/') %>" class="mag-header__back" aria-label="Về trang chủ">
        <span class="mag-header__back-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
        </span>
        <span class="mag-header__back-text">← Về trang chủ</span>
    </a>
    <div class="mag-header__logo">
        <img src="https://cdn.baothainguyen.vn/static-assets/encode/common/assets/logo-white.png" alt="Báo Thái Nguyên">
    </div>
    <a href="#" class="mag-header__share" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), 'facebook-share', 'width=580,height=400'); return false;" title="Chia sẻ lên Facebook">
        <i class="logos--facebook"></i>
    </a>
</header>

<!-- ===== portlet detai_share_tag ===== -->
<style>
    .video-tags-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; width: 100%; font-size: 14px; }
    .video-tags-row::-webkit-scrollbar { display: none; }
    /* Ẩn mặc định: detail_info / player đã in byline ở đầu bài. Chỉ layout giấu .detail-author (265/248) mới bật lại bằng display:inline-flex trong <style> của layout. */
    .video-meta-inline { display: none; align-items: center; gap: 8px; font-size: 14px; margin-left: auto; }
    .share-no-tags { padding-bottom: 0; }

    /* ===== Cảm xúc bài viết (REACT:*) ===== */
    .tnr-wrap { margin-top: 24px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
    .tnr-heading { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #151515; }
    .tnr-list { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
    .tnr-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 8px 16px; border: 1px solid transparent; border-radius: 999px; background: #F2F2F2; color: #151515; font-family: inherit; font-size: 15px; font-weight: 600; line-height: 1.2; cursor: pointer; -webkit-appearance: none; appearance: none; transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .12s ease; }
    .tnr-btn:hover { background: #E6EDF3; }
    .tnr-btn:focus-visible { outline: 2px solid #30A14A; outline-offset: 2px; }
    .tnr-btn:active { transform: scale(.96); }
    .tnr-ic { flex: none; display: block; }
    .tnr-count { min-width: 1.5ch; font-variant-numeric: tabular-nums; }
    .tnr-btn.is-active { background: #EAF6EE; border-color: #30A14A; color: #1B6E33; }
    .tnr-btn.is-active:hover { background: #DCEFE3; }
    .tnr-pop { animation: tnr-pop .32s ease; }
    @keyframes tnr-pop { 0% { transform: scale(1); } 45% { transform: scale(1.18); } 100% { transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .tnr-btn, .tnr-pop, .tnr-list [class^="tnr-a-"] { transition: none !important; animation: none !important; } }

    /* Icon động kiểu Facebook — chỉ chạy khi khối đã vào tầm nhìn (.is-live) */
    .tnr-a-like, .tnr-a-love, .tnr-a-clapl, .tnr-a-clapr, .tnr-a-clapk { transform-box: fill-box; transform-origin: 50% 50%; }
    .tnr-a-like { transform-origin: 35% 80%; }
    .tnr-a-clapl { transform-origin: 80% 95%; }
    .tnr-a-clapr { transform-origin: 20% 95%; }
    .tnr-a-clapk { transform-origin: 50% 100%; }
    .tnr-list.is-live .tnr-a-like { animation: tnr-k-like 3.4s ease-in-out infinite; }
    .tnr-list.is-live .tnr-a-love { animation: tnr-k-love 2.6s ease-in-out infinite; }
    .tnr-list.is-live .tnr-a-clapl { animation: tnr-k-clapl 2.8s ease-in-out infinite; }
    .tnr-list.is-live .tnr-a-clapr { animation: tnr-k-clapr 2.8s ease-in-out infinite; }
    .tnr-list.is-live .tnr-a-clapk { animation: tnr-k-clapk 2.8s ease-in-out infinite; }
    .tnr-btn:hover .tnr-a-like, .tnr-btn:hover .tnr-a-love, .tnr-btn:hover .tnr-a-clapl, .tnr-btn:hover .tnr-a-clapr, .tnr-btn:hover .tnr-a-clapk { animation-duration: 1.2s; }
    @keyframes tnr-k-like { 0%,55%,100% { transform: rotate(0deg); } 62% { transform: rotate(-16deg); } 70% { transform: rotate(9deg); } 78% { transform: rotate(-6deg); } 86% { transform: rotate(2deg); } }
    @keyframes tnr-k-love { 0%,45%,100% { transform: scale(1); } 52% { transform: scale(1.24); } 60% { transform: scale(.95); } 68% { transform: scale(1.14); } 78% { transform: scale(1); } }
    @keyframes tnr-k-clapl { 0%,48%,100% { transform: translateX(0) rotate(0deg); } 56% { transform: translateX(-2.4px) rotate(-14deg); } 64% { transform: translateX(.7px) rotate(5deg); } 72% { transform: translateX(-1.5px) rotate(-9deg); } 82% { transform: translateX(0) rotate(0deg); } }
    @keyframes tnr-k-clapr { 0%,48%,100% { transform: translateX(0) rotate(0deg); } 56% { transform: translateX(2.4px) rotate(14deg); } 64% { transform: translateX(-.7px) rotate(-5deg); } 72% { transform: translateX(1.5px) rotate(9deg); } 82% { transform: translateX(0) rotate(0deg); } }
    @keyframes tnr-k-clapk { 0%,50% { transform: scale(.55) translateY(2px); opacity: .35; } 62% { transform: scale(1.15) translateY(-.5px); opacity: 1; } 78% { transform: scale(1) translateY(0); opacity: .9; } 90%,100% { transform: scale(.55) translateY(2px); opacity: .35; } }
    @media (max-width: 480px) { .tnr-list { gap: 8px; } .tnr-btn { gap: 6px; padding: 8px 12px; font-size: 14px; } }

    /* ===== Nút nguồn ưu tiên Google ===== */
    .tnr-gg { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 8px 16px; border: 1px solid #D0D5DD; border-radius: 999px; background: #FFFFFF; color: #151515; font-size: 14px; font-weight: 600; line-height: 1.2; text-decoration: none; transition: background-color .15s ease, border-color .15s ease; }
    .tnr-gg:hover { background: #F2F2F2; border-color: #B8BFCC; }
    .tnr-gg:focus-visible { outline: 2px solid #30A14A; outline-offset: 2px; }
    .tnr-gg svg { flex: none; }
    @media (max-width: 600px) { .tnr-gg { font-size: 13px; padding: 8px 12px; } }
</style>
<% var __art = typeof ARTICLE_DETAIL_PUBLIC !== 'undefined' ? (Array.isArray(ARTICLE_DETAIL_PUBLIC) ? (ARTICLE_DETAIL_PUBLIC[0] || null) : ARTICLE_DETAIL_PUBLIC) : null;
   var __isVideo = !!(__art && String(__art.category_slug || '').indexOf('/video/') === 0);
   var __author = '';
   var __vDate = '';
   if (__isVideo && __art) {
       __author = __art.article_pseudonym || '';
       if (!__author && Array.isArray(__art.authors) && __art.authors.length > 0) {
           __author = __art.authors.map(function (a) { return (a && (a.name || a.full_name)) || ''; }).filter(Boolean).join(', ');
       }
       var __pd = __art.article_publish_date ? new Date(__art.article_publish_date) : null;
       if (__pd && !isNaN(__pd.getTime())) {
           __pd = new Date(__pd.getTime() + 7 * 60 * 60 * 1000);
           var __z = function (n) { return n < 10 ? '0' + n : '' + n; };
           __vDate = __z(__pd.getUTCHours()) + ':' + __z(__pd.getUTCMinutes()) + ', ' + __z(__pd.getUTCDate()) + '/' + __z(__pd.getUTCMonth() + 1) + '/' + __pd.getUTCFullYear();
       }
   }
%>
<div data-portlet="detai_share_tag" class="tnr-wrap" data-nosnippet>
    <p class="tnr-heading">Bạn thấy bài viết này thế nào?</p>
    <div class="tnr-list" id="articleReactions">
        <button type="button" class="tnr-btn" data-react="REACT:LIKE" aria-pressed="false" aria-label="Thích" title="Thích">
            <svg class="tnr-ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="12" fill="#1877F2"/><g transform="translate(5 5) scale(0.5833)"><g class="tnr-a-like"><path fill="#FFFFFF" d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 6.59 7.59C6.22 7.95 6 8.45 6 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></g></g></svg><span class="tnr-count"></span>
        </button>
        <button type="button" class="tnr-btn" data-react="REACT:LOVE" aria-pressed="false" aria-label="Yêu thích" title="Yêu thích">
            <svg class="tnr-ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="12" fill="#F3425F"/><g transform="translate(5 5) scale(0.5833)"><g class="tnr-a-love"><path fill="#FFFFFF" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></g></g></svg><span class="tnr-count"></span>
        </button>
        <button type="button" class="tnr-btn" data-react="REACT:CLAP" aria-pressed="false" aria-label="Vỗ tay" title="Vỗ tay">
            <svg class="tnr-ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="12" fill="#F5A623"/><g class="tnr-a-clapl"><g transform="rotate(-24 7.2 14.6)"><rect x="4.0" y="9.0" width="6.4" height="11.2" rx="3.2" fill="#FFFFFF"/><path d="M5.60 10.50v4.70" stroke="#F5A623" stroke-width="1.05" stroke-linecap="round"/><path d="M7.20 10.50v4.70" stroke="#F5A623" stroke-width="1.05" stroke-linecap="round"/><path d="M8.80 10.50v4.70" stroke="#F5A623" stroke-width="1.05" stroke-linecap="round"/></g></g><g class="tnr-a-clapr"><g transform="rotate(24 16.8 14.6)"><rect x="13.6" y="9.0" width="6.4" height="11.2" rx="3.2" fill="#FFFFFF"/><path d="M15.20 10.50v4.70" stroke="#F5A623" stroke-width="1.05" stroke-linecap="round"/><path d="M16.80 10.50v4.70" stroke="#F5A623" stroke-width="1.05" stroke-linecap="round"/><path d="M18.40 10.50v4.70" stroke="#F5A623" stroke-width="1.05" stroke-linecap="round"/></g></g><g class="tnr-a-clapk" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="M12 3.0v2.3"/><path d="M6.2 4.4l1.4 1.9"/><path d="M17.8 4.4l-1.4 1.9"/></g></svg><span class="tnr-count"></span>
        </button>
    </div>
</div>
<div data-portlet="detai_share_tag" class="t:mt-6 t:flex t:flex-wrap t:items-center t:gap-3 t:border-t t:border-[#E5E7EB] t:pt-5<%= (__isVideo && !(ARTICLE_TAGS && ARTICLE_TAGS.length > 0)) ? ' share-no-tags' : '' %>">
    <button type="button" id="fbShareBtn"
        class="t:inline-flex t:size-10 t:items-center t:justify-center t:rounded-full t:bg-[#F2F2F2] t:text-[#151515] t:hover:bg-[#E6EDF3]"
        aria-label="Chia sẻ Facebook">
        <i class="logos--facebook"></i>
    </button>
    <button type="button" id="printBtn"
        class="t:inline-flex t:size-10 t:items-center t:justify-center t:rounded-full t:bg-[#F2F2F2] t:text-[#151515] t:hover:bg-[#E6EDF3]"
        aria-label="In bài viết">
        <i class="material-symbols--print-rounded"></i>
    </button>
    <a class="tnr-gg" href="https://www.google.com/preferences/source?q=baothainguyen.vn" target="_blank" rel="nofollow noopener" title="Chọn Báo Thái Nguyên làm nguồn ưu tiên trên Google Tìm kiếm">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
        <span>Thêm Báo Thái Nguyên trên Google</span>
    </a>
    <% if (__isVideo && (__author || __vDate)) { %>
    <span class="video-meta-inline">
        <% if (__author) { %><strong class="t:text-[#151515]"><%= __author %></strong><% } %>
        <% if (__author && __vDate) { %><span class="t:text-[#8A94A6]" aria-hidden="true">•</span><% } %>
        <% if (__vDate) { %><time class="t:text-[#8A94A6]"><%= __vDate %></time><% } %>
    </span>
    <% } %>
    <% if (ARTICLE_TAGS && ARTICLE_TAGS.length > 0) { %>
    <div class="<%= __isVideo ? 'video-tags-row' : 't:flex t:flex-wrap t:items-center t:gap-2 t:text-sm' %>">
        <span class="t:text-[#8A94A6]">Tags:</span>
        <% ARTICLE_TAGS.forEach(function(tag) { %>
            <% if (tag.for_article) { %>
            <a class="tag-link" href="<%= absUrl(joinUrl(['tag', tag.slug])) %>">
                <%= tag.name %>
            </a>
            <% } %>
        <% }); %>
    </div>
    <% } %>
</div>

<section data-portlet="detai_share_tag" class="t:mt-8 <%= __isVideo ? 't:border-b t:border-[#E5E7EB] t:pb-6' : 't:border-t t:border-[#E5E7EB] t:pt-6' %>">
    <h2
        class="t:mb-4 t:flex t:items-center t:gap-2 t:text-base t:font-bold t:uppercase t:tracking-wide t:text-[#151515]">
        <i class="fa6-solid--comment-alt"></i>
        Bình luận
    </h2>
    <form class="t:flex t:flex-col t:gap-4">
        <textarea rows="4" placeholder="Viết bình luận"
            class="t:w-full t:resize-none t:rounded t:border t:border-[#D0D5DD] t:p-3 t:text-sm t:outline-none t:focus:border-[#30A14A]"></textarea>
        <div class="t:grid t:grid-cols-1 t:gap-4 t:md:grid-cols-2">
            <input type="text" placeholder="Họ và tên"
                class="t:w-full t:rounded t:border t:border-[#D0D5DD] t:p-3 t:text-sm t:outline-none t:focus:border-[#30A14A]" />
            <input type="email" placeholder="Địa chỉ email *"
                class="t:w-full t:rounded t:border t:border-[#D0D5DD] t:p-3 t:text-sm t:outline-none t:focus:border-[#30A14A]" />
        </div>
        <div class="t:flex t:justify-end">
            <button type="button"
                class="t:rounded t:bg-[#30A14A] t:px-8 t:py-2.5 t:text-sm t:font-semibold t:text-white t:hover:bg-[#268D3F]">
                Gửi
            </button>
        </div>
    </form>
</section>
<script>
(function () {
    if (window.__tnReactionInit) return;
    window.__tnReactionInit = true;

    var TYPES = ['REACT:LIKE', 'REACT:LOVE', 'REACT:CLAP'];
    /* REACT:CLAP chỉ hợp lệ khi được thêm vào config `event_log_settings` (bảng configs).
       Chưa thêm thì API trả 400 cho CẢ request đếm — dùng danh sách dưới làm dự phòng. */
    var SAFE_TYPES = ['REACT:LIKE', 'REACT:LOVE'];
    var ANON_KEY = 'user_id';

    function init() {
        var list = document.getElementById('articleReactions');
        if (!list) return;
        var wrap = list.parentNode;

        var pi = document.getElementById('page_info');
        var ds = (pi && pi.dataset) || {};
        var API = String(ds.publicApiUrl || '').trim().replace(/\/+$/, '');
        var DEPT = String(ds.departmentId || '').trim();
        var ARTICLE_ID = parseInt(ds.articleId, 10) || 0;
        var CATEGORY_ID = parseInt(ds.categoryId, 10) || 0;
        var STORE_KEY = 'article_reactions_' + ARTICLE_ID;
        var SENT_KEY = 'article_reactions_sent_' + ARTICLE_ID;
        var LABELS = { 'REACT:LIKE': 'Thích', 'REACT:LOVE': 'Yêu thích', 'REACT:CLAP': 'Vỗ tay' };
        var counts = {};
        var bumped = {};
        var started = false;

        if (!API || !ARTICLE_ID) { if (wrap) wrap.style.display = 'none'; return; }

        function headers(extra) {
            var h = extra || {};
            if (DEPT) h['x-department-id'] = DEPT;
            return h;
        }
        function anonId() {
            var v = '';
            try { v = localStorage.getItem(ANON_KEY) || ''; } catch (e) {}
            if (!v) {
                v = 'user_' + Math.random().toString(36).slice(2, 11);
                try { localStorage.setItem(ANON_KEY, v); } catch (e) {}
            }
            return v;
        }
        function readList(key) {
            try {
                var a = JSON.parse(localStorage.getItem(key) || '[]');
                return Array.isArray(a) ? a : [];
            } catch (e) { return []; }
        }
        function writeList(key, a) {
            try { localStorage.setItem(key, JSON.stringify(a)); } catch (e) {}
        }
        /* chosen = đang chọn (bật/tắt tự do ở UI); sent = đã từng gửi lên server (không rút lại được) */
        function isChosen(t) { return readList(STORE_KEY).indexOf(t) !== -1; }
        function isSent(t) { return readList(SENT_KEY).indexOf(t) !== -1; }
        function setChosen(t, on) {
            var a = readList(STORE_KEY), i = a.indexOf(t);
            if (on && i === -1) a.push(t);
            if (!on && i !== -1) a.splice(i, 1);
            writeList(STORE_KEY, a);
        }
        function markSent(t) {
            var a = readList(SENT_KEY);
            if (a.indexOf(t) === -1) { a.push(t); writeList(SENT_KEY, a); }
        }
        function unmarkSent(t) {
            var a = readList(SENT_KEY), i = a.indexOf(t);
            if (i !== -1) { a.splice(i, 1); writeList(SENT_KEY, a); }
        }
        function fmt(n) {
            n = Number(n) || 0;
            try { return n.toLocaleString('vi-VN'); } catch (e) { return String(n); }
        }

        var btns = {};
        TYPES.forEach(function (t) {
            var b = list.querySelector('[data-react="' + t + '"]');
            if (b) btns[t] = b;
        });

        /* Server không có API gỡ react → hủy chỉ diễn ra ở phía người dùng:
           số hiển thị = số server − 1 nếu loại đó đã gửi nhưng hiện đang bỏ chọn. */
        function render() {
            TYPES.forEach(function (t) {
                var b = btns[t];
                if (!b) return;
                var on = isChosen(t);
                var n = Number(counts[t]) || 0;
                if (isSent(t) && !on) n -= 1;
                if (n < 0) n = 0;
                b.setAttribute('data-count', String(n));
                var el = b.querySelector('.tnr-count');
                if (el) el.textContent = counts[t] === undefined ? '' : fmt(n);
                if (on) b.classList.add('is-active'); else b.classList.remove('is-active');
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
                b.setAttribute('title', (on ? 'Bỏ chọn ' : '') + LABELS[t]);
            });
        }

        render();

        /* Chỉ gọi API đếm khi khối sắp lọt vào tầm nhìn — giảm tải API; cũng là lúc
           bật animation icon để không đốt CPU khi khối còn ngoài màn hình. */
        function loadCounts(askFor, isRetry) {
            var qs = '?target_id=' + ARTICLE_ID + '&target_type=ARTICLE&event_type=' + askFor.map(encodeURIComponent).join(',');
            return fetch(API + '/v1/event-log/count' + qs, { headers: headers({}) })
                .then(function (r) {
                    if (!r.ok) throw new Error('count_' + r.status);
                    return r.json();
                })
                .then(function (j) {
                    var d = (j && j.data) || {};
                    /* loại vừa bấm trong phiên này giữ số cục bộ, tránh bị response cũ đè mất +1 */
                    TYPES.forEach(function (t) { if (!bumped[t]) counts[t] = Number(d[t]) || 0; });
                    render();
                })
                .catch(function () {
                    /* Một loại chưa bật trong config làm HỎNG CẢ request đếm → thử lại với
                       các loại chắc chắn hợp lệ để những loại còn lại vẫn có số.
                       Khi config đã bật đủ, nhánh này không bao giờ chạy. */
                    if (!isRetry && askFor.length > SAFE_TYPES.length) return loadCounts(SAFE_TYPES, true);
                });
        }

        function start() {
            if (started) return;
            started = true;
            list.classList.add('is-live');
            loadCounts(TYPES, false);
        }

        if (typeof IntersectionObserver === 'function') {
            var io = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) { io.disconnect(); start(); return; }
                }
            }, { rootMargin: '300px 0px' });
            io.observe(wrap);
        } else {
            start();
        }

        TYPES.forEach(function (t) {
            var b = btns[t];
            if (!b) return;
            b.addEventListener('click', function () {
                var turningOn = !isChosen(t);
                setChosen(t, turningOn);

                /* Chỉ gửi lên server ở lần bày tỏ ĐẦU TIÊN của loại này.
                   Chọn lại sau khi bỏ chọn KHÔNG gửi nữa — tránh thổi số. */
                var needPost = turningOn && !isSent(t);
                if (needPost) {
                    markSent(t);
                    bumped[t] = true;
                    counts[t] = (Number(counts[t]) || 0) + 1;
                }
                start();
                render();

                if (turningOn) {
                    b.classList.add('tnr-pop');
                    setTimeout(function () { b.classList.remove('tnr-pop'); }, 420);
                }
                if (!needPost) return;

                var payload = {
                    target_id: ARTICLE_ID,
                    target_type: 'ARTICLE',
                    event_type: t,
                    anon_id: anonId()
                };
                if (CATEGORY_ID) payload.sub_target_id = CATEGORY_ID;

                fetch(API + '/v1/event-log', {
                    method: 'POST',
                    headers: headers({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify(payload),
                    keepalive: true
                }).then(function (r) {
                    if (r && r.ok) return;
                    /* Server từ chối (vd loại chưa có trong config event_log_settings) → trả UI về
                       nguyên trạng thay vì để lại +1 giả. */
                    setChosen(t, false);
                    unmarkSent(t);
                    bumped[t] = false;
                    counts[t] = Math.max(0, (Number(counts[t]) || 0) - 1);
                    render();
                }).catch(function () {});
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
</script>

<!-- ===== portlet detail_related_articles ===== -->
<%
/* Khung xương (skeleton) của MỘT thẻ tin — bám đúng cấu trúc thẻ thật do JS render.
   Server render sẵn 3 thẻ cho lượt tải ĐẦU (marker data-priority="visible" nên JS chỉ
   chạy khi cuộn tới); JS đọc lại chính markup này (outerHTML) để dùng cho mỗi lượt
   "tải thêm" — chỉ có MỘT nguồn markup duy nhất ở đây.
   Thẻ thật nay dựng bằng FLOAT (ảnh float-left, chữ chảy vòng quanh — giống target
   tca) nên THẤP hơn hẳn bản flex cũ: đo thực tế 146.3px ở cột 826px (ảnh quyết định),
   ~137–188px ở cột 411–738px, ~215px ở cột 363px. Dòng .is-m/.is-s bù đúng chênh đó. */
var SUGGESTED_SKELETON =
    '<div class="suggested-skel" data-suggested-skeleton aria-hidden="true">' +
        '<div class="suggested-skel__thumb"></div>' +
        '<div class="suggested-skel__body">' +
            '<span class="suggested-skel__line suggested-skel__line--title"></span>' +
            '<span class="suggested-skel__line suggested-skel__line--title is-t2"></span>' +
            '<span class="suggested-skel__line suggested-skel__line--title is-m"></span>' +
            '<span class="suggested-skel__line suggested-skel__line--title is-s"></span>' +
            '<span class="suggested-skel__line suggested-skel__line--date"></span>' +
            '<span class="suggested-skel__line suggested-skel__line--desc"></span>' +
            '<span class="suggested-skel__line suggested-skel__line--desc is-d2"></span>' +
            '<span class="suggested-skel__line suggested-skel__line--desc is-s"></span>' +
        '</div>' +
    '</div>';
%>
<div data-portlet="detail_related_articles" class="tin-bai-khac t:mt-6 t:pt-5 t:border-t t:border-[#E5E5E5]">
    <div class="cate-label t:mb-4">
        <h3>
            <a href="">Tin bài khác</a>
        </h3>
    </div>
    <div class="t:flex t:flex-col t:gap-y-5" id="suggested-list" aria-busy="true"><%- SUGGESTED_SKELETON.repeat(3) %>

    </div>

    <div class="suggested-more" id="suggested-more" hidden>
        <button type="button" class="suggested-more__btn" id="suggested-more-btn">
            <span class="suggested-more__spinner" aria-hidden="true"></span>
            <span class="suggested-more__label">Xem thêm</span>
        </button>
    </div>

    <div class="suggested-sentinel" id="suggested-sentinel" aria-hidden="true"></div>

    <style>
        .tin-bai-khac [hidden] { display: none !important; }
        .tin-bai-khac .suggested-sentinel { width: 100%; height: 1px; }

        /* Tiêu đề + ngày đăng nằm CÙNG một cột bên phải ảnh, tiêu đề hiện FULL chữ.
           Bố cục thẻ là float (ảnh float-left, chữ chảy vòng quanh) nên mặc định
           tiêu đề dài sẽ chảy xuống dưới ảnh; ngày đăng khi đó nằm dưới đáy ảnh nên
           trải hết bề ngang, lệch hẳn khỏi cột tiêu đề.
           Gom tiêu đề + ngày vào .suggested-head rồi cho khối này tự tạo BFC
           (display:flow-root): hộp đó KHÔNG được đè lên float nữa mà bị thu vào đúng
           cột bên phải ảnh, và giữ nguyên cột đó cho toàn bộ chiều cao — dài bao
           nhiêu cũng không chui xuống dưới ảnh, và ngày đăng luôn thẳng cột với
           tiêu đề. Sapo vẫn trải hết bề ngang như cũ (không đổi thiết kế). */
        .tin-bai-khac .suggested-item .suggested-head { display: flow-root; }

        /* Thẻ tin dùng utility t:max-[992px]:w-50! để thu ảnh còn 200px ở màn hẹp,
           nhưng utility đó CHỈ được sinh trong output.css của emagazine_full —
           THIẾU ở dhd_detail (Detail / Detail_mobile / Article_Infographic) và ở
           critical CSS của "Căn giữa". Khai báo lại ngay tại portlet để mọi layout
           hiển thị giống nhau mà không phải build lại asset. */
        @media (max-width: 992px) {
            .tin-bai-khac .suggested-item .img-block.lg { width: 200px; }
        }

        /* --- Khung xương (skeleton) trong lúc chờ tải --------------------
           Bảng màu phẳng kiểu Znews: pill #f2f2f2 bo 50px, ảnh #e6e6e6.
           Chỉ animate opacity trên 3 thẻ (rẻ, chạy trên compositor).

           Số dòng + nhịp dòng lấy từ ĐO THỰC TẾ thẻ FLOAT mới (data thật, 10 bài):
             cột 826px : ảnh 260×146.3 cao hơn chữ  → thẻ = 146.3px (đồng loạt)
             cột 738px : 2 dòng title + 2 dòng desc → 137px
             cột 410px : 3 dòng title + 3 dòng desc → 188px
             cột 363px : 4 dòng title + 3 dòng desc → 215px
           Nhịp: title 27px/dòng, date 19.2px (margin-top 8), desc 24px/dòng (margin-top 8).
           Khoảng cách ảnh ↔ chữ = 8px, khớp t:mr-2 của thẻ thật. */
        .tin-bai-khac .suggested-skel {
            display: flex;
            align-items: flex-start;
            column-gap: 8px;
            pointer-events: none;
            animation: suggestedSkelPulse 1.2s ease-in-out infinite;
        }
        .tin-bai-khac [data-suggested-skeleton] + [data-suggested-skeleton] { animation-delay: .15s; }
        .tin-bai-khac [data-suggested-skeleton] + [data-suggested-skeleton] + [data-suggested-skeleton] { animation-delay: .3s; }

        /* khớp .img-block.lg của thẻ thật: 260px, tối đa 50% cột, tỉ lệ 16/9 —
           và 200px ở ≤992px, đúng như t:max-[992px]:w-50! của thẻ thật */
        .tin-bai-khac .suggested-skel__thumb {
            flex: 0 0 auto;
            width: 260px;
            max-width: 50%;
            aspect-ratio: 16 / 9;
            border-radius: 3px;
            background: #e6e6e6;
        }
        @media (max-width: 992px) {
            .tin-bai-khac .suggested-skel__thumb { width: 200px; }
        }
        .tin-bai-khac .suggested-skel__body { flex: 1 1 auto; min-width: 0; }

        .tin-bai-khac .suggested-skel__line { display: block; background: #f2f2f2; border-radius: 50px; }
        .tin-bai-khac .suggested-skel__line--title { height: 18px; margin-bottom: 9px; }
        .tin-bai-khac .suggested-skel__line--date  { height: 11px; margin-bottom: 18.1px; }
        .tin-bai-khac .suggested-skel__line--desc  { height: 12px; margin-bottom: 12px; }

        /* dòng CUỐI mỗi nhóm: ngắn hơn + chừa đúng khoảng cách sang nhóm sau */
        .tin-bai-khac .suggested-skel__line.is-t2 { width: 72%; margin-bottom: 17.1px; }
        .tin-bai-khac .suggested-skel__line.is-d2 { width: 58%; margin-bottom: 6px; }

        /* dòng chỉ dành cho màn hẹp */
        .tin-bai-khac .suggested-skel__line.is-m,
        .tin-bai-khac .suggested-skel__line.is-s { display: none; }

        /* ≤768px (cột 411–738px): 3 dòng title + 2 dòng desc = 160.2px */
        @media (max-width: 768px) {
            .tin-bai-khac .suggested-skel__line.is-m { display: block; }
            .tin-bai-khac .suggested-skel__line.is-t2 { width: 100%; margin-bottom: 9px; }
            .tin-bai-khac .suggested-skel__line--title.is-m { width: 72%; margin-bottom: 17.1px; }
        }
        /* ≤440px (cột ≤410px): 4 dòng title + 3 dòng desc = 211.2px */
        @media (max-width: 440px) {
            .tin-bai-khac .suggested-skel__line.is-s { display: block; }
            .tin-bai-khac .suggested-skel__line--title.is-m { width: 100%; margin-bottom: 9px; }
            .tin-bai-khac .suggested-skel__line--title.is-s { width: 72%; margin-bottom: 17.1px; }
            .tin-bai-khac .suggested-skel__line.is-d2 { width: 100%; margin-bottom: 12px; }
            .tin-bai-khac .suggested-skel__line--desc.is-s { width: 58%; margin-bottom: 6px; }
        }

        /* --- Bài thật hiện ra: mờ dần tới đậm hẳn (theo Znews: fadeIn .5s) --- */
        /* Bài được nạp TRƯỚC ~1200px nên KHÔNG fade lúc chèn: animation sẽ chạy hết
           khi thẻ còn ngoài màn hình. Chèn ở opacity 0, chỉ fade khi cuộn tới.
           Chỉ animate opacity — chạy trên compositor, không layout/paint lại. */
        .tin-bai-khac .suggested-item.is-pending { opacity: 0; }
        .tin-bai-khac .suggested-item.is-in { animation: suggestedFadeIn .5s ease both; }

        .tin-bai-khac .suggested-more {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        .tin-bai-khac .suggested-more__btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 28px;
            border: 1px solid #30A14A;
            border-radius: 9999px;
            background: transparent;
            color: #30A14A;
            font-family: inherit;
            font-size: 15px;
            font-weight: 600;
            line-height: 1;
            text-transform: uppercase;
            cursor: pointer;
            transition: background-color .2s ease, color .2s ease;
        }
        .tin-bai-khac .suggested-more__btn:hover { background: #30A14A; color: #fff; }
        .tin-bai-khac .suggested-more__btn:disabled { opacity: .65; cursor: default; }
        .tin-bai-khac .suggested-more__btn:disabled:hover { background: transparent; color: #30A14A; }
        .tin-bai-khac .suggested-more__spinner {
            display: none;
            width: 14px;
            height: 14px;
            border: 2px solid currentColor;
            border-top-color: transparent;
            border-radius: 50%;
            animation: suggestedSpin .7s linear infinite;
        }
        .tin-bai-khac .suggested-more__btn.is-loading .suggested-more__spinner { display: inline-block; }

        @keyframes suggestedSkelPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        @keyframes suggestedFadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        @keyframes suggestedSpin { to { transform: rotate(360deg); } }

        @media (prefers-reduced-motion: reduce) {
            .tin-bai-khac .suggested-skel,
            .tin-bai-khac .suggested-more__spinner { animation: none; }
            /* tắt hiệu ứng nhưng TUYỆT ĐỐI không để bài bị ẩn */
            .tin-bai-khac .suggested-item.is-pending,
            .tin-bai-khac .suggested-item.is-in { opacity: 1; animation: none; }
        }
    </style>
</div>
<!-- external_javascript -->
<script>
const publicApiUrlEl = document.getElementById('page_info');
const cdnUrlEl = document.getElementById('page_info');
const articleIdEl = document.getElementById('page_info');

const publicApiUrl = publicApiUrlEl ? publicApiUrlEl.dataset.publicApiUrl : '';
const cdnUrl = cdnUrlEl ? cdnUrlEl.dataset.cdnUrl : '';
const articleId = articleIdEl ? articleIdEl.dataset.articleId : '';

var DEPARTMENT_ID = (document.getElementById('page_info')?.dataset.departmentId || '').trim();

function withDepartmentHeaders(baseHeaders) {
    var headers = Object.assign({}, baseHeaders || {});
    if (DEPARTMENT_ID) headers['x-department-id'] = DEPARTMENT_ID;
    return headers;
}


function JoinUrl(...args) {
    return args.map((part, index) => {
        if (index === 0) {
            return part.trim().replace(/\/+$/, '');
        } else {
            return part.trim().replace(/^\/+|\/+$/g, '');
        }
    }).filter(part => part.length > 0).join('/');
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(isoString) {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function stripHtmlDesc(s) {
    if (!s) { return ""; }
    var d = document.createElement("div");
    d.innerHTML = String(s);
    return (d.textContent || d.innerText || "").trim();
}

function truncateDesc(str, maxLen = 150) {
    if (!str) return '';
    const clean = str.trim();
    if (clean.length <= maxLen) return clean;
    const trimmed = clean.slice(0, maxLen);
    const lastSpace = trimmed.lastIndexOf(' ');
    return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…';
}

function buildArticleHref(slug) {
    if (!slug) return '#';
    return slug.startsWith('/') ? slug : '/' + slug;
}

function buildImageUrl(path, width) {
    if (!path) return 'https://cdn.baothainguyen.vn/original/assets/banner.png';
    var raw = String(path).trim();
    var legacyFile = raw.match(/^(?:https?:)?\/\/(?:www\.)?baothainguyen\.vn\/file\/([^?#]+)/i);
    if (/^(?:https?:)?\/\//i.test(raw) && !legacyFile) return raw;
    var clean = String(legacyFile ? legacyFile[1] : raw).replace(/^\/+/, '');
    return JoinUrl(cdnUrl, 'noindex', 'w' + (width || 400), clean);
}

function renderSuggestedItem(article) {
    const href = buildArticleHref(article.slug);
    const imageUrl = article.avatar1_url ? buildImageUrl(article.avatar1_url, 400) : '';
    const date = formatDate(article.publish_date);
    const dateHtml = date
        ? `<time class="article-date t:mt-2"><i class="material-symbols--calendar-month-rounded"></i> ${date}</time>`
        : '';
    const title = escapeHtml(article.title);
    const fullDesc = escapeHtml(stripHtmlDesc(article.desc));
    const shortDesc = escapeHtml(truncateDesc(stripHtmlDesc(article.desc), 150));

    /* Bố cục FLOAT — ảnh float-left trong khối t:flow-root, sapo vẫn tràn hết bề
       ngang ngay dưới ảnh (giống target tca). RIÊNG tiêu đề + ngày đăng được gom
       vào .suggested-head để hai thứ luôn thẳng cột với nhau — xem CSS trong
       content của portlet để biết vì sao phải bọc thêm một lớp. */
    return `
    <article class="suggested-item">
        <div class="t:flow-root">
            <figure class="img-block t:float-left lg t:mr-2 t:max-[992px]:w-50!">
                <a href="${href}">
                    <img src="${imageUrl}" alt="${title}" data-width-image="400" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://cdn.baothainguyen.vn/static-assets/encode/common/assets/images-df.png'" />
                </a>
            </figure>
            <div class="suggested-head">
                <h4 class="title l2 t:mt-0!">
                    <a href="${href}">
                        ${title}
                    </a>
                </h4>
                ${dateHtml}
            </div>
            <!-- KHÔNG thêm style="overflow:unset;display:block" vào đây: nó vô hiệu hoá
                 giới hạn 3 dòng của .desc ngay từ đầu, nên sapo hiện 4 dòng rồi vài giây
                 sau handleClampText() trong common.js mới cắt lại còn 3 dòng — nhìn thấy
                 rõ cú nhảy layout. Để CSS tự clamp 3 dòng ngay lúc render thì số dòng
                 trước/sau JS bằng nhau (đã đo: 3 → 3, không nhảy). common.js vẫn tự đặt
                 overflow/display khi nó chạy, nên không mất tính năng cắt theo từ. -->
            <p class="desc" data-original-text="${fullDesc}">
                ${shortDesc}
            </p>
        </div>
    </article>`;
}

/* ------------------------------------------------------------------
   "Tin bài khác" — tải thêm (15 bài/lượt, 5 lượt tự động — đồng bộ với mọi trang danh sách)
   - Cuộn tới cuối danh sách: tự động tải thêm tối đa 5 lần
   - Từ lần thứ 6 trở đi: người dùng phải bấm nút "Xem thêm"
   - Hết 5 lượt tự động thì nạp sẵn thêm 1 lô NHƯNG chưa render — bấm nút là hiện tức thì
------------------------------------------------------------------ */
const SUGGESTED_LIMIT = 15;
const SUGGESTED_AUTO_ROUNDS = 5;
/* Số thẻ khung xương hiển thị trong lúc chờ MỖI lượt tải (lượt đầu do server render sẵn) */
const SUGGESTED_SKELETON_COUNT = 3;
/* API có thể trả về một trang toàn bài trùng/thiếu slug → thử tối đa vài trang cho mỗi lượt tải */
const SUGGESTED_MAX_ATTEMPTS = 3;

const suggestedState = {
    page: 0,
    totalPages: null,
    autoRounds: 0,
    loading: false,
    done: false,
    seen: Object.create(null)
};

let suggestedObserver = null;

function suggestedNode(id) {
    return document.getElementById(id);
}

/* ---- Khung xương (skeleton) ---------------------------------------------
   Markup chỉ khai báo MỘT chỗ: trong content của portlet (server render sẵn 3
   thẻ). Ở đây ghi nhớ lại outerHTML của thẻ đó trước khi gỡ, rồi tái dùng cho
   các lượt "tải thêm". Không tìm thấy skeleton (trang cache bản cũ) thì mọi thứ
   vẫn chạy bình thường, chỉ là không có khung xương. */
let suggestedSkelHtml = '';

function captureSuggestedSkeleton() {
    if (suggestedSkelHtml) return;
    const container = suggestedNode('suggested-list');
    const node = container && container.querySelector('[data-suggested-skeleton]');
    if (node) suggestedSkelHtml = node.outerHTML;
}

function removeSuggestedSkeleton() {
    const container = suggestedNode('suggested-list');
    if (!container) return;
    captureSuggestedSkeleton();
    const nodes = container.querySelectorAll('[data-suggested-skeleton]');
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
    }
}

function showSuggestedSkeleton() {
    const container = suggestedNode('suggested-list');
    /* đã có skeleton (lượt đầu: bản server render) → giữ nguyên */
    if (!container || container.querySelector('[data-suggested-skeleton]')) return;
    captureSuggestedSkeleton();
    if (!suggestedSkelHtml) return;
    let html = '';
    for (let i = 0; i < SUGGESTED_SKELETON_COUNT; i++) html += suggestedSkelHtml;
    container.insertAdjacentHTML('beforeend', html);
}

/* ---- Hiện dần khi CUỘN TỚI ------------------------------------------------
   Bài được nạp trước ~1200px; nếu fade ngay lúc chèn thì animation chạy xong khi
   thẻ còn ngoài màn hình. Vì vậy chèn ở opacity 0 rồi mới fade khi lọt tầm nhìn.
   HIỆU NĂNG: dùng CHUNG một IntersectionObserver cho mọi thẻ (không phải mỗi thẻ
   một cái), unobserve ngay sau khi hiện, không gắn listener scroll, không đặt
   will-change (tránh giữ layer thừa), và chỉ đổi opacity. */
let suggestedRevealObserver = null;

function observeSuggestedItems(container) {
    const items = container.querySelectorAll('.suggested-item:not(.is-pending):not(.is-in)');
    if (!items.length) return;

    if (typeof IntersectionObserver !== 'function') {
        /* không hỗ trợ → hiện ngay, tuyệt đối không để bài kẹt ở opacity 0 */
        for (let i = 0; i < items.length; i++) items[i].classList.add('is-in');
        return;
    }

    if (!suggestedRevealObserver) {
        suggestedRevealObserver = new IntersectionObserver(entries => {
            for (let i = 0; i < entries.length; i++) {
                if (!entries[i].isIntersecting) continue;
                const el = entries[i].target;
                el.classList.remove('is-pending');
                el.classList.add('is-in');
                suggestedRevealObserver.unobserve(el);
            }
        });
    }

    for (let i = 0; i < items.length; i++) {
        items[i].classList.add('is-pending');
        suggestedRevealObserver.observe(items[i]);
    }
}

function setSuggestedLoading(isLoading) {
    suggestedState.loading = isLoading;

    const btn = suggestedNode('suggested-more-btn');
    if (btn) {
        btn.disabled = isLoading;
        btn.classList.toggle('is-loading', isLoading);
    }

    const container = suggestedNode('suggested-list');
    if (container) container.setAttribute('aria-busy', isLoading ? 'true' : 'false');

    if (isLoading) showSuggestedSkeleton();
    else removeSuggestedSkeleton();
}

function stopSuggestedObserver() {
    if (!suggestedObserver) return;
    suggestedObserver.disconnect();
    suggestedObserver = null;
}

function showSuggestedButton() {
    if (suggestedState.done) return;
    stopSuggestedObserver();
    const wrap = suggestedNode('suggested-more');
    if (wrap) wrap.hidden = false;
}

/* Het bai: neu dang NAP TRUOC ma bo dem con hang thi HOAN dong lai — phai de nguoi
   dung bam xem not so bai da tai ve, xong moi dong (xem manualLoadSuggested). */
function finishSuggested(silent) {
    if (silent && suggestedBuffer && suggestedBuffer.length) {
        suggestedPendingEnd = true;
        return;
    }
    endSuggestedList();
}

function endSuggestedList() {
    suggestedState.done = true;
    stopSuggestedObserver();
    const wrap = suggestedNode('suggested-more');
    if (wrap) wrap.hidden = true;
    const sentinel = suggestedNode('suggested-sentinel');
    if (sentinel && sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
}

/* ---- Bo dem nap truoc — BAT BIEN: LUON san dung 1 lo -----------------------
   Sau MOI lan render (ke ca luot tu dong) lai nap san 1 lo NHUNG chua chen vao
   DOM, nen den luc can lo ke thi data da nam san -> render ngay, khong cho mang.
   CAI BAY: endSuggestedList() an nut va go sentinel. Neu lo nap truoc gap 'done'
   ma bo dem con bai thi phai HOAN viec dong lai (suggestedPendingEnd), khong thi
   nguoi dung mat luon so bai da tai ve. */
let suggestedBuffer = null;
let suggestedPrefetching = null;
let suggestedPendingEnd = false;

/* Tu bo qua neu: da co lo trong dem, dang co lo bay, da het bai, da hoan dong.
   KHONG dat co 'loading' (dat thi no tu chan chinh duong bam nut). */
function prefetchSuggested() {
    if (suggestedPrefetching || (suggestedBuffer && suggestedBuffer.length) ||
        suggestedState.done || suggestedPendingEnd) return;
    startSuggestedFetch();
}

function renderSuggestedBuffer() {
    const container = suggestedNode('suggested-list');
    const batch = suggestedBuffer;
    suggestedBuffer = null;
    if (!container || !batch || !batch.length) return 0;
    removeSuggestedSkeleton();
    container.insertAdjacentHTML('beforeend', batch.map(renderSuggestedItem).join(''));
    observeSuggestedItems(container);
    return batch.length;
}

/* ---- MOT KHE DUY NHAT cho moi request -------------------------------------
   Goi lai luc dang co lo bay thi tra ve CHINH promise do (khong mo request thu
   hai). MOI duong lay bai deu di qua day nen khong bao gio hai response cung
   cong vao suggestedState.page. */
function startSuggestedFetch() {
    if (!suggestedPrefetching) {
        suggestedPrefetching = loadSuggestedPage(true).then(function (status) {
            suggestedPrefetching = null;
            return status;
        }, function (err) {
            suggestedPrefetching = null;
            console.error('Failed to load suggested articles:', err);
            return 'error';
        });
    }
    return suggestedPrefetching;
}

/* Lay MOT lo: co san trong dem -> tra ngay; dang co lo bay -> CHO chinh lo do;
   khong co gi -> fetch moi. Tra 'ok' khi bo dem da co bai san sang render. */
async function takeSuggestedBatch() {
    if (suggestedBuffer && suggestedBuffer.length) return 'ok';
    if (suggestedState.done) return 'skip';
    const status = await startSuggestedFetch();
    if (suggestedBuffer && suggestedBuffer.length) return 'ok';
    return status;
}

/* Lay lo roi render — co 'loading' bao TRON ca hai buoc de hai trigger dong thoi
   khong cung vao duoc. Render xong la nap ngay lo ke (bat bien: luon san 1 lo). */
async function consumeSuggestedBatch() {
    if (suggestedState.loading || suggestedState.done) return 'skip';
    const instant = !!(suggestedBuffer && suggestedBuffer.length);
    /* co san trong dem -> render ngay, khong bat skeleton (khong chop) */
    if (instant) suggestedState.loading = true;
    else setSuggestedLoading(true);
    let status;
    try {
        status = await takeSuggestedBatch();
        if (suggestedBuffer && suggestedBuffer.length) {
            renderSuggestedBuffer();
            status = 'ok';
        }
    } finally {
        if (instant) suggestedState.loading = false;
        else setSuggestedLoading(false);
    }
    if (suggestedPendingEnd) {
        endSuggestedList();
        return status === 'ok' ? 'ok' : 'done';
    }
    if (status === 'ok') prefetchSuggested();
    return status;
}

async function manualLoadSuggested() {
    /* Bam nut: TUYET DOI khong re-arm observer (bay so 6) — chi lay lo qua takeBatch. */
    const status = await consumeSuggestedBatch();
    if (status === 'error') showSuggestedButton();
}

/* Trả về: 'ok' | 'done' | 'error' | 'skip'. silent = nap truoc, khong chen vao DOM. */
async function loadSuggestedPage(silent) {
    /* silent (nap truoc) chi di qua khe startSuggestedFetch nen khong can co
       'loading' — ma co 'loading' gio bao TRON ca takeSuggestedBatch + render. */
    if (suggestedState.done) return 'skip';
    if (!silent && suggestedState.loading) return 'skip';

    const container = suggestedNode('suggested-list');
    if (!container) return 'skip';

    if (!silent) setSuggestedLoading(true);
    try {
        for (let attempt = 0; attempt < SUGGESTED_MAX_ATTEMPTS; attempt++) {
            const nextPage = suggestedState.page + 1;
            if (suggestedState.totalPages !== null && nextPage > suggestedState.totalPages) {
                finishSuggested(silent);
                return 'done';
            }

            const endpoint = JoinUrl(publicApiUrl, 'v1/article', articleId, 'suggestion') +
                '?page=' + nextPage + '&limit=' + SUGGESTED_LIMIT;

            const res = await fetch(endpoint, { headers: withDepartmentHeaders() });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = await res.json();
            if (!json || !json.success || !Array.isArray(json.data)) {
                finishSuggested(silent);
                return 'done';
            }

            suggestedState.page = nextPage;
            if (json.meta && Number.isFinite(json.meta.totalPages)) {
                suggestedState.totalPages = json.meta.totalPages;
            }

            /* data có thể lẫn phần tử rác (số, chuỗi, null) → chỉ giữ bài có slug */
            const items = json.data.filter(item =>
                item && typeof item === 'object' && !Array.isArray(item) && item.slug
            );
            const fresh = items.filter(item => {
                const key = String(item.id != null ? item.id : item.slug);
                if (suggestedState.seen[key]) return false;
                suggestedState.seen[key] = true;
                return true;
            });

            if (fresh.length) {
                if (silent) {
                    /* NAP TRUOC: giu lai trong bo dem, CHUA chen vao DOM */
                    suggestedBuffer = (suggestedBuffer || []).concat(fresh);
                } else {
                    /* gỡ khung xương TRƯỚC khi chèn để bài thật nằm đúng cuối danh sách */
                    removeSuggestedSkeleton();
                    container.insertAdjacentHTML('beforeend', fresh.map(renderSuggestedItem).join(''));
                    /* cùng một nhịp đồng bộ với lúc chèn → không có nháy hình */
                    observeSuggestedItems(container);
                }
            }

            const outOfPages = suggestedState.totalPages !== null &&
                suggestedState.page >= suggestedState.totalPages;
            const emptyWithoutMeta = suggestedState.totalPages === null && items.length === 0;
            if (outOfPages || emptyWithoutMeta) {
                finishSuggested(silent);
                return 'done';
            }
            if (fresh.length) return 'ok';
            /* trang này không có bài mới nào → thử tiếp trang kế */
        }
        return 'ok';
    } catch (err) {
        console.error('Failed to load suggested articles:', err);
        return 'error';
    } finally {
        if (!silent) setSuggestedLoading(false);
    }
}

function rearmSuggestedObserver() {
    /* observe lại để IntersectionObserver bắn tiếp khi sentinel vẫn nằm trong khung nhìn */
    if (!suggestedObserver || suggestedState.done) return;
    const sentinel = suggestedNode('suggested-sentinel');
    if (!sentinel) return;
    suggestedObserver.unobserve(sentinel);
    suggestedObserver.observe(sentinel);
}

async function autoLoadSuggested() {
    if (suggestedState.loading || suggestedState.done) return;

    suggestedState.autoRounds += 1;
    /* di QUA takeSuggestedBatch: dang co lo bay thi CHO no, khong fetch song song */
    const status = await consumeSuggestedBatch();
    if (status === 'done' || status === 'skip') return;
    if (status === 'error') {
        showSuggestedButton();
        return;
    }

    /* lo ke da duoc consumeSuggestedBatch nap truoc ngay sau khi render */
    if (suggestedState.autoRounds >= SUGGESTED_AUTO_ROUNDS) showSuggestedButton();
    else rearmSuggestedObserver();
}

function startSuggestedObserver() {
    const sentinel = suggestedNode('suggested-sentinel');
    if (!sentinel || typeof IntersectionObserver !== 'function') return false;

    /* Nạp TRƯỚC khi người đọc cuộn tới: 1200px ≈ 1–1,5 màn hình chạy trước.
       API suggestion đo được 0,2–0,4s nên tới nơi là bài đã nằm sẵn đó.
       (200px cũ = bắn đúng lúc tới nơi → luôn phải chờ trọn một vòng mạng.) */
    suggestedObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) autoLoadSuggested();
    }, { rootMargin: '1200px 0px' });
    suggestedObserver.observe(sentinel);
    return true;
}

async function loadSuggestedArticles() {
    const container = suggestedNode('suggested-list');
    if (!container) return;

    /* KHÔNG xóa nội dung sẵn có: đó là khung xương do server render, giữ tới khi có bài thật */

    const btn = suggestedNode('suggested-more-btn');
    if (btn) btn.addEventListener('click', () => { manualLoadSuggested(); });

    /* Lo dau: khoi nam duoi day bai nhung van tu render luc tai trang, nen day
       LA lan render dau tien — nap truoc bat dau ngay sau no (trong consume). */
    const status = await consumeSuggestedBatch();
    if (status !== 'ok') {
        const wrap = suggestedNode('suggested-more');
        if (wrap) wrap.hidden = true;
        return;
    }

    if (SUGGESTED_AUTO_ROUNDS > 0 && startSuggestedObserver()) return;

    /* trình duyệt không hỗ trợ IntersectionObserver → dùng nút ngay từ đầu */
    showSuggestedButton();
}

loadSuggestedArticles();
</script>

<!-- ===== portlet footer ===== -->
<footer data-portlet="footer" class="t:bg-[#F8F8F8] t:pt-10 t:pb-6 home-footer roboto">
    <style>
        @media (min-width: 1000px) {
            .home-footer .f-label { width: 9.25rem; }

            /* desktop: nhích cỡ chữ footer 12px -> 13px cho dễ đọc */
            .home-footer [class*="text-xs"] { font-size: 0.8125rem; }

            /* chữ to hơn dễ tràn dòng: cho email xuống dòng ở khoảng trắng,
               không cắt giữa địa chỉ như break-all */
            .home-footer [class*="break-all"] {
                word-break: normal;
                overflow-wrap: anywhere;
            }
        }
    </style>
    <div class="t:container t:mx-auto">
        <div
            class="t:grid t:gap-y-6 t:pc:grid-cols-[1fr_auto] t:min-[1200px]:grid-cols-[auto_1fr_auto] t:pc:gap-x-20 t:items-start">
            <div class="t:my-auto t:min-[1200px]:mt-0">
                <img src="https://cdn.baothainguyen.vn/w600/static-assets/encode/common/assets/logo.png" alt="Báo Thái Nguyên"
                        class="t:object-contain t:max-w-[450px] t:min-[1200px]:max-w-[350px] t:w-full" />
            </div>

            <div
                class="t:flex t:flex-col t:gap-y-2 t:text-xs t:leading-[1.5] t:pc:order-9 t:pc:col-span-2 t:min-[1200px]:col-span-1 t:min-[1200px]:order-none">
                <p class="t:font-semibold t:text-[#212636]">
                    Báo và Phát thanh, Truyền hình Thái Nguyên điện tử.
                </p>
                <div class="t:flex t:gap-x-4 t:items-start">
                    <p class="f-label t:w-25 t:shrink-0 t:text-[#667085]">Trụ sở:</p>
                    <p class="t:flex-1 t:font-semibold t:text-[#212636]">
                        Cơ sở 1 số 226 đường Bến Oánh; Cơ sở 2 số 19 phố Nhị Quý, phường
                        Phan Đình Phùng, tỉnh Thái Nguyên
                    </p>
                </div>
                <p class="t:font-semibold t:text-[#212636]">
                    Giấy phép hoạt động báo chí điện tử số: 431/GP-BTTTT cấp ngày 20 tháng
                    11 năm 2023.
                </p>
                <div class="t:flex t:gap-x-4 t:items-start">
                    <p class="f-label t:w-25 t:shrink-0 t:text-[#667085]">Giám đốc:</p>
                    <p class="t:flex-1 t:font-semibold t:text-[#212636]">Đỗ Xuân Hòa</p>
                </div>
                <div class="t:flex t:gap-x-4 t:items-start">
                    <p class="f-label t:w-25 t:shrink-0 t:text-[#667085]">Phó Giám đốc phụ trách báo điện tử:</p>
                    <p class="t:flex-1 t:font-semibold t:text-[#212636]">Nguyễn Ngọc Sơn</p>
                </div>
                <div class="t:flex t:gap-x-4 t:items-start">
                    <p class="f-label t:w-25 t:shrink-0 t:text-[#667085]">Điện thoại:</p>
                    <p class="t:flex-1 t:font-semibold t:text-[#212636]">
                        <a href="tel:02083859666">0208.3859.666</a>
                    </p>
                </div>
                <div class="t:flex t:gap-x-4 t:items-start">
                    <p class="f-label t:w-25 t:shrink-0 t:text-[#667085]">Đường dây nóng:</p>
                    <p class="t:flex-1 t:font-semibold t:text-[#212636]">
                        <a href="tel:0902006113">0902006113</a>
                        -
                        <a href="tel:0912039880">091 2039880</a>
                    </p>
                </div>
                <div class="t:flex t:gap-x-4 t:items-start">
                    <p class="f-label t:w-25 t:shrink-0 t:text-[#667085]">Email:</p>
                    <p class="t:flex-1 t:font-semibold t:text-[#212636] t:break-all">
                        <a href="mailto:toasoan@baothainguyen.vn">
                            toasoan@baothainguyen.vn
                        </a>
                        ;
                        <a href="mailto:toasoan@baothainguyen.com.vn">
                            toasoan@baothainguyen.com.vn
                        </a>
                    </p>
                </div>
            </div>

            <div class="t:flex t:flex-col t:gap-y-3 t:w-full t:pc:w-fit t:ml-auto">
                <p class="t:text-xs t:text-[#212636]">Quét mã tải ứng dụng tại:</p>
                <div class="t:flex t:gap-x-4">
                    <div class="t:flex t:flex-col t:items-center t:gap-y-1">
                        <img src="https://cdn.baothainguyen.vn/static-assets/encode/common/assets/android.jpg?v=20260820" alt="Tải bản Android" loading="lazy"
                                class="t:size-26 t:object-contain" />
                        <span class="t:text-xs t:text-[#212636]">Bản Android</span>
                    </div>
                    <div class="t:flex t:flex-col t:items-center t:gap-y-1">
                        <img src="https://cdn.baothainguyen.vn/static-assets/encode/common/assets/ios.jpg?v=20260820" alt="Tải bản iOS" loading="lazy"
                                class="t:size-26 t:object-contain" />
                        <span class="t:text-xs t:text-[#212636]">Bản IOS</span>
                    </div>
                </div>
            </div>
        </div>

        <hr class="t:my-4 t:border-0 t:border-t t:border-[#DCDFE4]" />

        <div class="t:flex t:flex-col t:gap-y-1 t:text-xs t:font-semibold t:text-[#212636] t:leading-[1.5]">
            <p>Bản quyền thuộc về Báo và Phát thanh, Truyền hình Thái Nguyên.</p>
            <p>
                Ghi rõ nguồn
                “
                <a href="https://baothainguyen.vn">https://baothainguyen.vn</a>
                ” khi phát hành lại thông tin từ website này
            </p>
        </div>
    </div>
</footer>

<button data-portlet="footer" type="button" id="scrollToTopBtn" aria-label="Lên đầu trang" class="t:max-md:hidden" style="
                position: fixed;
                right: 24px;
                bottom: 24px;
                width: 44px;
                height: 44px;
                border: none;
                border-radius: 9999px;
                background: #30A14A;
                color: #fff;
                display: none;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
                z-index: 120;
                box-shadow: 0 8px 24px rgba(10, 100, 180, 0.35);
                opacity: 0;
                transform: translateY(8px);
                transition:
                    opacity 0.25s ease,
                    transform 0.25s ease,
                    background-color 0.25s ease;
            ">
        ↑
    </button>

<script>
    (function () {
            const scrollToTopBtn = document.getElementById("scrollToTopBtn");
            if (!scrollToTopBtn) return;

            const toggleVisibility = () => {
                const isVisible = window.scrollY > 280;
                if (isVisible) {
                    if (scrollToTopBtn.style.display !== "flex") {
                        scrollToTopBtn.style.display = "flex";
                        requestAnimationFrame(() => {
                            scrollToTopBtn.style.opacity = "1";
                            scrollToTopBtn.style.transform = "translateY(0)";
                        });
                    }
                } else {
                    scrollToTopBtn.style.opacity = "0";
                    scrollToTopBtn.style.transform = "translateY(8px)";
                    setTimeout(() => {
                        if (window.scrollY <= 280) {
                            scrollToTopBtn.style.display = "none";
                        }
                    }, 250);
                }
            };

            window.addEventListener("scroll", toggleVisibility, { passive: true });
            scrollToTopBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });

            scrollToTopBtn.addEventListener("mouseenter", () => {
                scrollToTopBtn.style.background = "#07528F";
            });

            scrollToTopBtn.addEventListener("mouseleave", () => {
                scrollToTopBtn.style.background = "#30A14A";
            });

            // Sau load: doc scrollY luc parse ep tinh layout ca trang dai (~320ms CPU x4 tren mobile)
            window.addEventListener("load", toggleVisibility, { once: true });
        })();
</script>
