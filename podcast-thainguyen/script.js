/*
 * podcast-thainguyen — render bài viết theo chuyên mục từ public API Báo Thái Nguyên.
 *
 * - Đọc các mục trên subnav (.subnav-inner a): tên = data-cate-name (ưu tiên)
 *   hoặc textContent; ID chuyên mục = data-cat-id (= category_ids của API).
 * - Mỗi mục sinh 1 <section> render đúng template card có sẵn, tự gọi API và
 *   có nút "Xem thêm" (load more).
 *
 * API: GET https://api-public.baothainguyen.vn/v1/article?category_ids=…&page=…&limit=…
 *   → { success, data: [...], meta: { page, limit, total, totalPages } }
 *
 * LƯU Ý về media: danh sách của API trả `content` đã bị strip HTML + cắt ngắn nên
 * KHÔNG có URL mp3/mp4. Vì vậy media được lấy TRỄ (lazy): lúc người dùng bấm vào
 * thẻ mới fetch trang chi tiết rồi bóc <source>/<audio>/<video> trong #content.
 * API và site đều trả CORS mở (Access-Control-Allow-Origin phản chiếu Origin) nên
 * cách này chạy được cả khi host trang ở origin khác (vd R2).
 */
(function () {
    'use strict';

    // ===== Config =====
    var API_ORIGIN = 'https://api-public.baothainguyen.vn';
    var API_BASE = API_ORIGIN + '/v1/article';
    // Trang chi tiết bài (dựng href + fetch bóc media).
    var SITE_ORIGIN = 'https://thainguyen.media-soft.cloud';
    // Ảnh qua CDN ảnh của toà soạn; /wNNN/ là tiền tố resize theo bề rộng.
    var CDN_ORIGIN = 'https://cdn.baothainguyen.vn';
    var IMG_PREFIX = '/w600/';
    // File mp3/mp4 nhúng trong thân bài nằm trên domain gốc.
    var ASSET_ORIGIN = 'https://baothainguyen.vn';
    var PAGE_SIZE = 6;

    // Thư mục gốc của trang (cố định lúc tải) — dùng dựng path cho chuyên mục.
    var BASE_DIR = (function () {
        try { return window.location.pathname.replace(/[^/]*$/, ''); } catch (e) { return '/'; }
    })();

    // Ảnh dự phòng (data-URI, không tạo request lỗi khi thiếu ảnh).
    var PLACEHOLDER_IMG =
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="338" viewBox="0 0 600 338">' +
            '<rect width="600" height="338" fill="#e6e6e6"/>' +
            '<path d="M300 139a26 26 0 1 0 0 52 26 26 0 0 0 0-52zM170 250l66-74 46 50 40-44 78 68z" fill="#cfcfcf"/>' +
            '</svg>'
        );

    // SVG "Podcast" copy nguyên từ template card trong index.html.
    var PODCAST_SVG =
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 4 8v-3a6 6 0 0 1 6-11 6 6 0 0 1 6 11v3a10 10 0 0 0 4-8 10 10 0 0 0-10-10z" />' +
        '</svg>';

    // Icon "video" (tam giác play) cho badge của item video trong danh sách.
    var VIDEO_ICON =
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="M8 5v14l11-7z" />' +
        '</svg>';

    var MSG_STYLE =
        'grid-column:1/-1;padding:24px;text-align:center;color:var(--ink-mute);font-size:14px';

    // ===== Helpers thuần =====
    function absUrl(origin, raw) {
        raw = raw || '';
        if (!raw) return '';
        if (/^https?:\/\//i.test(raw)) return raw;
        return origin + (raw.charAt(0) === '/' ? '' : '/') + raw;
    }

    // Tên chuyên mục → slug không dấu (vd "Thơ, âm nhạc" → "tho-am-nhac").
    function slugify(str) {
        return String(str || '')
            .normalize('NFD').replace(/[̀-ͯ]/g, '') // bỏ dấu thanh
            .replace(/đ/g, 'd').replace(/Đ/g, 'd')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Bỏ thẻ HTML + giải mã entity + gộp khoảng trắng.
    // desc/title của API hay chứa entity tiếng Việt (l&ugrave;i, c&acirc;y, m&aacute;i…)
    // nên phải giải mã cả BẢNG entity, không thể liệt kê tay vài cái.
    function stripHtml(s) {
        var t = String(s == null ? '' : s);
        if (!t) return '';
        try {
            // Parse như HTML → vừa bỏ thẻ vừa giải mã mọi named/numeric entity.
            t = new DOMParser().parseFromString(t, 'text/html').body.textContent || '';
        } catch (e) {
            t = t.replace(/<[^>]*>/g, ' ');
        }
        return t.replace(/\s+/g, ' ').trim(); // \s bao gồm cả &nbsp; (U+00A0)
    }

    // API trả avatar dạng '/e783…/062026/x.jpg' HOẶC 'images/2026-07-21/y.jpg';
    // cả hai đều nối được sau CDN + tiền tố resize.
    function normalizeItem(a) {
        var avatar = a.avatar1_url || a.avatar2_url || '';
        var img = '';
        if (avatar) {
            img = /^https?:\/\//i.test(avatar)
                ? avatar
                : CDN_ORIGIN + IMG_PREFIX + String(avatar).replace(/^\/+/, '');
        }
        // slug thường là full path ('/van-hoa/202606/tra-xua…-4636c05/'); một số
        // ít bài chỉ trả slug trần. Ghép y như baothainguyen tự render link
        // (SITE_ORIGIN + '/' + slug) — vài bài slug trần hiện 404 ngay trên
        // trang chuyên mục gốc, đó là lỗi dữ liệu đầu nguồn chứ không phải ở đây.
        var slug = String(a.slug || '').trim();
        var href = '';
        if (slug) {
            href = /^https?:\/\//i.test(slug)
                ? slug
                : SITE_ORIGIN + '/' + slug.replace(/^\/+/, '');
        }
        return {
            id: a.id,
            title: stripHtml(a.title || ''),
            lead: stripHtml(a.desc || ''),
            avatarApp: img,
            pageUrl: href,
            videoFirst: '', // lazy: bóc từ trang chi tiết khi cần phát
            objectType: '',
            publishDate: a.publish_date || '',
            categoryName: (a.category && a.category.name) || '',
        };
    }

    function imgUrl(item) {
        return item.avatarApp || PLACEHOLDER_IMG;
    }

    function articleUrl(item) {
        return item.pageUrl || '#';
    }

    function mediaUrl(item) {
        // Rỗng với dữ liệu từ API (lazy); vẫn dùng cho card dựng từ #article-info.
        return absUrl(ASSET_ORIGIN, item.videoFirst);
    }

    // Item là VIDEO nếu objectType = 'video' (ưu tiên) hoặc media là .mp4.
    // Lưu ý: API hiện trả objectType rỗng cho mọi bài, nên .mp4 là tín hiệu
    // thực tế; vẫn ưu tiên objectType để tương thích nếu sau này API điền giá trị.
    function isVideoItem(item, media) {
        if (item && String(item.objectType || '').toLowerCase() === 'video') return true;
        return /\.mp4($|\?)/i.test(media || '');
    }

    function buildApiUrl(catId, first) {
        // API phân trang theo `page` (1-based); phần còn lại của file đếm theo
        // offset `first` nên quy đổi tại đây.
        var page = Math.floor(first / PAGE_SIZE) + 1;
        return (
            API_BASE +
            '?category_ids=' + encodeURIComponent(catId) +
            '&page=' + page +
            '&limit=' + PAGE_SIZE +
            '&sortBy=publish_date&sortOrder=DESC'
        );
    }

    // ===== Data =====
    async function fetchPage(catId, first) {
        var res = await fetch(buildApiUrl(catId, first), {
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var json = await res.json();
        if (!json || json.success === false) {
            throw new Error('API ' + ((json && json.message) || 'error'));
        }
        var raw = json.data || [];
        var meta = json.meta || {};
        var items = raw.map(normalizeItem);
        var hasMore = meta.totalPages
            ? (meta.page || 1) < meta.totalPages
            : items.length === PAGE_SIZE;
        return { items: items, hasMore: hasMore };
    }

    // ===== Media lazy-resolve =====
    // Danh sách API không kèm mp3/mp4 → fetch trang chi tiết 1 lần/bài rồi bóc
    // <source>/<audio>/<video> trong #content. Kết quả cache theo URL bài.
    var mediaCache = Object.create(null);

    function applyMedia(card, media) {
        card.dataset.media = media || '';
        if (media) {
            card.dataset.type = /\.mp4($|\?)/i.test(media) ? 'video' : 'audio';
            var mark = card.querySelector('.podcast-mark');
            if (mark) {
                mark.innerHTML = card.dataset.type === 'video'
                    ? (VIDEO_ICON + ' Video')
                    : (PODCAST_SVG + ' Podcast');
            }
        }
        return media || '';
    }

    async function resolveMedia(card) {
        if (!card) return '';
        if (card.dataset.media) return card.dataset.media;
        var url = card.dataset.detailUrl || '';
        if (!url) return '';
        if (mediaCache[url] !== undefined) {
            var cached = await mediaCache[url];
            return applyMedia(card, cached);
        }
        mediaCache[url] = (async function () {
            var res = await fetch(url, { credentials: 'omit' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var html = await res.text();
            var doc = new DOMParser().parseFromString(html, 'text/html');
            // Giới hạn trong thân bài: tránh bắt nhầm <source> của quảng cáo/player khác.
            var scope =
                doc.querySelector('#content') ||
                doc.querySelector('.article-prose') ||
                doc.body;
            return absUrl(ASSET_ORIGIN, extractMediaFromContent(scope));
        })();
        try {
            return applyMedia(card, await mediaCache[url]);
        } catch (e) {
            delete mediaCache[url]; // cho phép thử lại lần sau
            return '';
        }
    }

    // Thẻ có thể phát: đã có media, hoặc còn URL bài để bóc media.
    function hasMediaSource(card) {
        return !!(card && (card.dataset.media || card.dataset.detailUrl));
    }

    // ===== View: card =====
    function buildCard(item, series) {
        var a = document.createElement('a');
        a.className = 'ep-item is-new';
        a.__item = item; // giữ dữ liệu gốc cho trang chi tiết
        var media = mediaUrl(item); // rỗng với dữ liệu API → bóc trễ lúc bấm
        a.dataset.media = media;
        a.dataset.detailUrl = articleUrl(item) === '#' ? '' : articleUrl(item);
        a.dataset.series = series || '';
        // Chưa biết audio hay video cho tới khi bóc được media → mặc định audio
        // (đa số bài trong chuyên mục Podcast là mp3); applyMedia sửa lại sau.
        a.dataset.type = isVideoItem(item, media) ? 'video' : 'audio';
        a.href = articleUrl(item); // giữ link bài cho Ctrl/Cmd/giữa-chuột
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.textDecoration = 'none';
        a.style.color = 'inherit';

        var thumb = document.createElement('div');
        thumb.className = 'ep-item-thumb';

        var img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = '';
        img.src = imgUrl(item);
        img.onerror = function () {
            this.onerror = null; // tránh loop nếu placeholder cũng lỗi
            this.src = PLACEHOLDER_IMG;
        };

        var mark = document.createElement('span');
        mark.className = 'podcast-mark';
        // Video → icon video + "Video"; còn lại giữ badge "Podcast".
        mark.innerHTML = a.dataset.type === 'video' ? (VIDEO_ICON + ' Video') : (PODCAST_SVG + ' Podcast');

        thumb.appendChild(img);
        thumb.appendChild(mark);

        var body = document.createElement('div');
        body.className = 'ep-item-body';
        var inner = document.createElement('div');

        var h3 = document.createElement('h3');
        h3.className = 'ep-item-title';
        h3.textContent = item.title || ''; // textContent → tự an toàn với & < " '

        var p = document.createElement('p');
        p.className = 'ep-item-desc';
        p.textContent = item.lead || '';

        inner.appendChild(h3);
        inner.appendChild(p);
        body.appendChild(inner);

        a.appendChild(thumb);
        a.appendChild(body);
        return a;
    }

    // ===== View: nút thông báo (loading / empty / error) =====
    function messageNode(text) {
        var d = document.createElement('div');
        d.className = 'ep-message';
        d.style.cssText = MSG_STYLE;
        d.textContent = text;
        return d;
    }

    function errorNode(ctx) {
        var d = messageNode('Không tải được nội dung. ');
        var retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'load-more';
        retry.style.cssText = 'display:inline-flex;margin-top:12px';
        retry.innerHTML = '<span class="label-default">Thử lại</span>';
        retry.addEventListener('click', function () {
            renderInitial(ctx);
        });
        var wrap = document.createElement('div');
        wrap.style.cssText = 'grid-column:1/-1;text-align:center';
        wrap.appendChild(d);
        wrap.appendChild(retry);
        return wrap;
    }

    // ===== View: section shell =====
    function buildSection(cat) {
        var section = document.createElement('section');
        section.className = 'section';
        section.dataset.catId = cat.catId; // = ID API để subnav khớp

        var h2 = document.createElement('h2');
        h2.className = 'section-title';
        h2.textContent = cat.name;

        var list = document.createElement('div');
        list.className = 'ep-list';

        var wrap = document.createElement('div');
        wrap.className = 'load-more-wrap';

        var btn = document.createElement('button');
        btn.className = 'load-more';
        btn.type = 'button';
        btn.innerHTML =
            '<span class="spinner" aria-hidden="true"></span>' +
            '<span class="label-default">Xem thêm</span>' +
            '<span class="label-done">Đã hiển thị tất cả</span>';
        wrap.appendChild(btn);

        section.appendChild(h2);
        section.appendChild(list);
        section.appendChild(wrap);

        var ctx = {
            catId: cat.catId,
            name: cat.name,
            sectionEl: section,
            listEl: list,
            btnEl: btn,
            wrapEl: wrap,
            first: 0,
            loading: false,
            done: false,
            loadedAny: false,
        };
        btn.addEventListener('click', function () {
            loadMore(ctx);
        });
        cat.sectionEl = section; // cho subnav cuộn tới
        return ctx;
    }

    // ===== State machine: initial load =====
    async function renderInitial(ctx) {
        if (ctx.loading) return;
        ctx.loading = true;
        ctx.done = false;
        ctx.btnEl.classList.remove('done');
        ctx.wrapEl.style.display = 'none';
        ctx.listEl.innerHTML = '';
        ctx.listEl.appendChild(messageNode('Đang tải…'));

        try {
            var page = await fetchPage(ctx.catId, 0);
            ctx.listEl.innerHTML = '';

            if (!page.items.length) {
                ctx.listEl.appendChild(messageNode('Chưa có bài viết'));
                ctx.wrapEl.style.display = 'none';
                ctx.done = true;
                return;
            }

            page.items.forEach(function (it) {
                ctx.listEl.appendChild(buildCard(it, ctx.name));
            });
            ctx.first = 0;
            ctx.loadedAny = true;
            ctx.wrapEl.style.display = '';
            if (!page.hasMore) {
                ctx.done = true;
                ctx.btnEl.classList.add('done');
            }
        } catch (err) {
            ctx.listEl.innerHTML = '';
            ctx.listEl.appendChild(errorNode(ctx));
            ctx.wrapEl.style.display = 'none';
        } finally {
            ctx.loading = false;
        }
    }

    // ===== State machine: load more =====
    async function loadMore(ctx) {
        if (ctx.loading || ctx.done) return;
        ctx.loading = true;
        ctx.btnEl.classList.add('loading');

        try {
            var next = ctx.first + PAGE_SIZE;
            var page = await fetchPage(ctx.catId, next);
            page.items.forEach(function (it) {
                ctx.listEl.appendChild(buildCard(it, ctx.name));
            });
            ctx.first = next;
            if (!page.hasMore || !page.items.length) {
                ctx.done = true;
                ctx.btnEl.classList.add('done');
            }
        } catch (err) {
            // Lỗi mềm: giữ nút bấm lại được, không kẹt spinner.
        } finally {
            ctx.loading = false;
            ctx.btnEl.classList.remove('loading');
        }
    }

    // ===== Subnav =====
    function readCategories() {
        var links = document.querySelectorAll('.subnav-inner a');
        var cats = [];
        links.forEach(function (a) {
            var catId = a.dataset.catId;
            if (!catId) return;
            // Nhãn subnav có thể xuống dòng trong HTML → gộp khoảng trắng, nếu
            // không tiêu đề section sẽ mang cả thụt đầu dòng.
            var name = (a.dataset.cateName || a.textContent || '').replace(/\s+/g, ' ').trim();
            cats.push({ catId: catId, name: name, linkEl: a, sectionEl: null });
        });
        return cats;
    }

    function headerOffset() {
        var h = 0;
        // Trang dùng header home: thanh nav (desktop/mobile) VÀ subnav đều sticky
        // → cộng dồn chiều cao của mọi thanh đang hiển thị, không chỉ .topbar.
        var bars = document.querySelectorAll(
            '.topbar, .home-header-nav, .home-mobile-header-nav, .subnav'
        );
        Array.prototype.forEach.call(bars, function (el) {
            var cs = getComputedStyle(el);
            if (cs.position !== 'sticky' || cs.display === 'none') return;
            h += el.offsetHeight;
        });
        return h + 12;
    }

    // Cuộn tới 1 section khi mới vào trang (theo path URL). Cuộn ngay khi DOM các
    // section đã dựng (ảnh có sẵn khung aspect-ratio nên không xô lệch chiều cao),
    // rồi HIỆU CHỈNH lại sau khi web-font tải xong / trang load xong — nhưng chỉ
    // khi người dùng CHƯA tự cuộn đi nơi khác (tránh giành cuộn với người dùng).
    var lastAutoScrollTop = -1;
    function scrollToCatOnLoad(sectionEl) {
        if (!sectionEl) return;
        function jump() {
            var top = sectionEl.getBoundingClientRect().top + window.pageYOffset - headerOffset();
            lastAutoScrollTop = Math.max(0, top);
            window.scrollTo({ top: lastAutoScrollTop, behavior: 'auto' });
        }
        function correct() {
            if (lastAutoScrollTop < 0) return;
            if (Math.abs((window.pageYOffset || 0) - lastAutoScrollTop) > 4) return; // người dùng đã tự cuộn
            jump();
        }
        requestAnimationFrame(jump);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { requestAnimationFrame(correct); });
        }
        window.addEventListener('load', function () { requestAnimationFrame(correct); }, { once: true });
    }

    var navCats = []; // tham chiếu chuyên mục cho popstate (back/forward)
    function wireSubnav(cats) {
        navCats = cats;
        cats.forEach(function (cat) {
            if (!cat.linkEl) return;
            cat.linkEl.addEventListener('click', function (e) {
                e.preventDefault();
                // Đang mở player lớn → đóng để hiện lại danh sách rồi mới cuộn.
                if (detailEls && detailEls.overlay && detailEls.overlay.classList.contains('open')) closeDetail();
                cats.forEach(function (c) {
                    if (c.linkEl) c.linkEl.classList.remove('active');
                });
                cat.linkEl.classList.add('active');
                syncUrlToCat(cat); // đổi path trên URL giống khi click vào bài viết
                if (!cat.sectionEl) return;
                var top =
                    cat.sectionEl.getBoundingClientRect().top + window.pageYOffset - headerOffset();
                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });
    }

    // ===== Player (audio thật) =====
    var audio = typeof Audio !== 'undefined' ? new Audio() : null;
    var playerCard = null; // thẻ đang phát
    var playerEls = null;
    var sectionCtxs = []; // controller các section (theo thứ tự subnav)
    var navBusy = false; // chống bấm next/prev chồng nhau khi đang load more
    var playerActivated = false; // đã phát ít nhất 1 bài → mới hiện player dưới
    var bigCardVisible = false; // thẻ lớn overlay đang trong tầm nhìn (observer cập nhật)
    var suppressUrlSync = false; // chặn đẩy URL khi đang đồng bộ ngược từ popstate
    var savedScrollY = 0; // vị trí cuộn của danh sách trước khi mở player lớn

    // Trạng thái overlay chi tiết
    var detailEls = null;
    var detailCat = '';
    var detailFirst = 0;
    var detailLoading = false;
    var detailDone = false;
    var detailIsVideo = false; // thẻ lớn đang ở chế độ VIDEO (player native)
    var SPEEDS = [1, 1.25, 1.5, 1.75, 2];
    var speedIdx = 0;

    function fmtTime(sec) {
        if (!isFinite(sec) || sec < 0) sec = 0;
        sec = Math.floor(sec);
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function getPlayerEls() {
        if (playerEls) return playerEls;
        playerEls = {
            bar: document.getElementById('player-progress'),
            fill: document.getElementById('player-progress-fill'),
            cur: document.getElementById('player-time-current'),
            total: document.getElementById('player-time-total'),
            playBtn: document.getElementById('player-play'),
            thumb: document.getElementById('player-thumb-img'),
            title: document.getElementById('player-title'),
            series: document.getElementById('player-series'),
            speedBtn: document.getElementById('player-speed'),
        };
        return playerEls;
    }

    function setPlaying(on) {
        [getPlayerEls().playBtn, detailEls && detailEls.playBtn].forEach(function (b) {
            if (!b) return;
            b.classList.toggle('playing', on);
            b.setAttribute('aria-label', on ? 'Tạm dừng' : 'Phát');
        });
    }

    // Ẩn player dưới khi: chưa phát bài nào, HOẶC overlay mở và thẻ lớn đang hiện.
    function refreshPlayerBar() {
        var bottomPlayer = document.querySelector('.player');
        if (!bottomPlayer) return;
        var overlayOpen = detailEls && detailEls.overlay && detailEls.overlay.classList.contains('open');
        // Ẩn khi: chưa phát bài nào; HOẶC overlay mở và thẻ lớn audio đang hiện;
        // HOẶC overlay đang ở chế độ VIDEO (player native, không dùng bar dưới).
        var hide = !playerActivated || (overlayOpen && (bigCardVisible || detailIsVideo));
        bottomPlayer.classList.toggle('is-hidden', hide);
        // Chỉ chừa chỗ dưới chân trang khi thanh player ĐANG hiện (nó position: fixed).
        document.body.classList.toggle('has-player', !hide);
    }

    // Sơn thanh tiến trình + thời gian cho CẢ player dưới và overlay chi tiết.
    function playerViews() {
        return [getPlayerEls(), detailEls];
    }
    function paintProgress(zero) {
        if (!audio) return;
        var dur = audio.duration || 0;
        var ct = zero ? 0 : audio.currentTime;
        var pct = dur ? (ct / dur) * 100 : 0;
        var cur = fmtTime(ct);
        playerViews().forEach(function (v) {
            if (!v) return;
            if (v.fill) v.fill.style.width = pct + '%';
            if (v.cur) v.cur.textContent = cur;
        });
    }
    function paintTotal() {
        if (!audio) return;
        var t = fmtTime(audio.duration);
        playerViews().forEach(function (v) {
            if (v && v.total) v.total.textContent = t;
        });
        if (detailEls && detailEls.metaDur) {
            detailEls.metaDur.textContent = Math.max(1, Math.round((audio.duration || 0) / 60)) + ' phút nghe';
        }
    }

    // Nạp nguồn + metadata vào player (KHÔNG tự phát). Trả false nếu thẻ thiếu media.
    // Async: media của bài lấy từ API phải bóc từ trang chi tiết trước khi phát.
    async function loadCard(card) {
        if (!audio) return false;
        var url = card.dataset.media;
        if (!url) {
            card.classList.add('is-resolving');
            try {
                url = await resolveMedia(card);
            } finally {
                card.classList.remove('is-resolving');
            }
        }
        if (!url) {
            showToast('Bài viết này chưa có audio/video để phát.');
            return false;
        }
        // Bóc ra mới biết là video → nhường cho player video, không dùng engine audio.
        if (card.dataset.type === 'video') {
            openDetail(card);
            return false;
        }
        // Bắt đầu phát audio → dừng video chi tiết (nếu đang phát) để khỏi chồng tiếng.
        if (detailEls && detailEls.videoEl) { try { detailEls.videoEl.pause(); } catch (e) { } }
        playerActivated = true;
        var els = getPlayerEls();
        if (playerCard !== card) {
            playerCard = card;
            audio.src = url;
            audio.playbackRate = 1;
            var img = card.querySelector('img');
            var title = card.querySelector('.ep-item-title');
            if (els.thumb && img) els.thumb.src = img.src;
            if (els.title && title) els.title.textContent = title.textContent;
            if (els.series) els.series.textContent = card.dataset.series || '';
            if (els.fill) els.fill.style.width = '0%';
            if (els.cur) els.cur.textContent = '00:00';
            if (els.total) els.total.textContent = '00:00';
            if (els.speedBtn) els.speedBtn.textContent = '1x';
            syncUrlToCard(card);
            updateNowPlaying(card);
        }
        refreshPlayerBar();
        return true;
    }

    async function playCard(card) {
        if (!(await loadCard(card))) return;
        audio.play().catch(function () {
            showToast('Không phát được nội dung này.');
        });
    }

    function togglePlay() {
        if (!audio || !playerCard) return;
        if (audio.paused) audio.play().catch(function () {});
        else audio.pause();
    }

    // Các thẻ CÓ media (audio) trong 1 .ep-list. Bỏ qua video: video phát bằng
    // player native riêng, không tham gia chuỗi tự-chuyển-bài của <audio>.
    function tracksInList(listEl) {
        if (!listEl) return [];
        return Array.prototype.filter.call(listEl.querySelectorAll('.ep-item'), function (c) {
            return hasMediaSource(c) && c.dataset.type !== 'video';
        });
    }

    // Tìm controller (ctx) của section chứa thẻ.
    function sectionOf(card) {
        for (var k = 0; k < sectionCtxs.length; k++) {
            if (sectionCtxs[k].listEl.contains(card)) return sectionCtxs[k];
        }
        return null;
    }

    // Chuyên mục kế tiếp (theo thứ tự subnav) đang có bài để phát.
    function nextSectionWithTracks(ctx) {
        var idx = sectionCtxs.indexOf(ctx);
        for (var k = idx + 1; k < sectionCtxs.length; k++) {
            if (tracksInList(sectionCtxs[k].listEl).length) return sectionCtxs[k];
        }
        return null;
    }

    function gotoCard(card) {
        playCard(card);
        // Khi overlay đang mở: cập nhật luôn thẻ lớn (và đổi "Bài liên quan" nếu khác chuyên mục).
        if (detailEls && detailEls.overlay.classList.contains('open')) {
            populateDetail(card);
            var section = card.closest('section.section');
            var cat = card.dataset.catId || (section ? section.dataset.catId : '') || detailCat;
            if (cat && cat !== detailCat) {
                detailCat = cat;
                loadDetailRelated(true);
            }
            window.scrollTo(0, 0);
        } else if (typeof card.scrollIntoView === 'function') {
            card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    // Tập trước (-1): duyệt trong danh sách hiện tại.
    // Tập sau (+1): hết danh sách → còn bài thì load more; hết hẳn → sang chuyên mục kế tiếp có bài.
    async function playAdjacent(delta) {
        if (!playerCard || navBusy) return false;
        navBusy = true;
        try {
            var ctx = sectionOf(playerCard);
            var list = tracksInList(ctx ? ctx.listEl : playerCard.closest('.ep-list'));
            var i = list.indexOf(playerCard);

            // Thẻ không thuộc list nào (vd mở từ #article-info): next → bài liên quan đầu tiên.
            if (i === -1) {
                if (delta > 0 && detailEls && detailEls.related) {
                    var rel = tracksInList(detailEls.related);
                    if (rel[0]) { gotoCard(rel[0]); return true; }
                }
                return false;
            }

            if (delta < 0) {
                if (list[i - 1]) { gotoCard(list[i - 1]); return true; }
                showToast('Đã ở bài đầu danh sách.');
                return false;
            }

            // Còn bài kế trong danh sách hiện tại.
            if (list[i + 1]) { gotoCard(list[i + 1]); return true; }

            // Cuối danh sách nhưng chuyên mục còn bài → load more rồi phát bài vừa nạp.
            if (ctx && !ctx.done) {
                await loadMore(ctx);
                var more = tracksInList(ctx.listEl);
                var j = more.indexOf(playerCard);
                if (j !== -1 && more[j + 1]) { gotoCard(more[j + 1]); return true; }
            }

            // Hết hẳn danh sách → sang chuyên mục kế tiếp có bài.
            var nextCtx = ctx ? nextSectionWithTracks(ctx) : null;
            var first = nextCtx ? tracksInList(nextCtx.listEl)[0] : null;
            if (first) { gotoCard(first); return true; }
            showToast('Đã hết danh sách.');
            return false;
        } finally {
            navBusy = false;
        }
    }

    function bindSkip(label, delta) {
        document.querySelectorAll('[aria-label="' + label + '"]').forEach(function (b) {
            b.addEventListener('click', function () {
                if (!audio || !audio.duration) return;
                audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta));
            });
        });
    }

    function makeSeek(bar) {
        if (!bar) return;
        var dragging = false;
        function seekToEvent(e) {
            if (!audio || !audio.duration) return;
            var rect = bar.getBoundingClientRect();
            var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.currentTime = pct * audio.duration;
            paintProgress();
        }
        bar.addEventListener('pointerdown', function (e) {
            dragging = true;
            bar.classList.add('dragging');
            if (bar.setPointerCapture) { try { bar.setPointerCapture(e.pointerId); } catch (err) { } }
            seekToEvent(e);
            e.preventDefault();
        });
        bar.addEventListener('pointermove', function (e) {
            if (dragging) seekToEvent(e);
        });
        var end = function () {
            if (!dragging) return;
            dragging = false;
            bar.classList.remove('dragging');
        };
        bar.addEventListener('pointerup', end);
        bar.addEventListener('pointercancel', end);
        // Dự phòng cho trình duyệt không hỗ trợ Pointer Events.
        bar.addEventListener('click', function (e) { if (!dragging) seekToEvent(e); });
    }

    function cycleSpeed() {
        speedIdx = (speedIdx + 1) % SPEEDS.length;
        audio.playbackRate = SPEEDS[speedIdx];
        var label = SPEEDS[speedIdx] + 'x';
        var pe = getPlayerEls();
        if (pe.speedBtn) pe.speedBtn.textContent = label;
        if (detailEls && detailEls.speedBtn) detailEls.speedBtn.textContent = label;
    }

    // ===== Đồng bộ URL với bài đang phát =====
    // Đẩy path của bài (pageUrl) lên thanh địa chỉ — chỉ lấy path vì pushState
    // yêu cầu same-origin (link bài trỏ về thainguyen.media-soft.cloud).
    function syncUrlToCard(card) {
        if (suppressUrlSync || !card || !card.__item || !card.__item.pageUrl) return;
        try {
            var u = new URL(articleUrl(card.__item), window.location.href);
            var path = u.pathname + u.search + u.hash;
            var cur = window.location.pathname + window.location.search + window.location.hash;
            if (path && path !== cur) window.history.pushState({ tnPath: path }, '', path);
        } catch (e) { }
    }

    // Path cho chuyên mục. Ưu tiên href thật của link subnav (production render
    // sẵn đúng path mỗi mục, vd /nhip-song-xu-tuyen/lang-nghe-cuoc-song/). KHÔNG
    // tự ghép BASE_DIR + slug như trước: khi vào trang bằng URL chuyên mục có sẵn
    // (vd .../van-de-goc-nhin/), BASE_DIR là path con nên ghép ra path sai
    // (.../van-de-goc-nhin/lang-nghe-cuoc-song). Chỉ ghép từ slug khi href trống/"#".
    function catPath(cat) {
        if (!cat) return '';
        if (cat.linkEl) {
            var href = cat.linkEl.getAttribute('href') || '';
            if (href && href !== '#') {
                try {
                    var u = new URL(href, window.location.href);
                    return u.pathname + u.search;
                } catch (e) { }
            }
        }
        var slug = slugify(cat.name);
        return slug ? BASE_DIR + slug : '';
    }

    // Đẩy path của chuyên mục lên thanh địa chỉ — tương tự syncUrlToCard.
    function syncUrlToCat(cat) {
        if (suppressUrlSync) return;
        try {
            var path = catPath(cat);
            if (!path) return;
            var cur = window.location.pathname + window.location.search + window.location.hash;
            if (path !== cur) window.history.pushState({ tnCat: cat.catId, tnPath: path }, '', path);
        } catch (e) { }
    }

    // Segment cuối (khác rỗng) của 1 path, đã slug hoá:
    //   "/nhip-song-xu-tuyen/van-de-goc-nhin/" → "van-de-goc-nhin"
    //   "/podcast-thainguyen/index.html"       → "index-html" (không khớp mục nào)
    function pathSegmentSlug(pathname) {
        var parts = String(pathname || '').split('/').filter(Boolean);
        return parts.length ? slugify(parts[parts.length - 1]) : '';
    }

    // Slug ứng viên của 1 chuyên mục: theo tên series (data-cate-name) VÀ theo chữ
    // hiển thị trên subnav (vd mục đầu: "Mới nhất" + "Podcast Thái Nguyên").
    function catSlugs(cat) {
        var out = [];
        if (!cat) return out;
        [cat.name, cat.linkEl && cat.linkEl.textContent].forEach(function (t) {
            var s = slugify(t);
            if (s && out.indexOf(s) === -1) out.push(s);
        });
        return out;
    }

    // Tìm chuyên mục khớp 1 path: so segment cuối của URL với slug từng mục. Khớp
    // theo segment nên đúng cho cả URL production có dấu "/" cuối
    // (/nhip-song-xu-tuyen/van-de-goc-nhin/) lẫn URL nội bộ do pushState đẩy ra.
    function findCatByPath(pathname) {
        var seg = pathSegmentSlug(pathname);
        if (!seg) return null;
        for (var k = 0; k < navCats.length; k++) {
            if (navCats[k].catId && catSlugs(navCats[k]).indexOf(seg) !== -1) return navCats[k];
        }
        return null;
    }

    // Tìm thẻ đã render khớp với 1 path (để đồng bộ khi back/forward).
    function findRenderedCardByPath(targetPath) {
        var cards = document.querySelectorAll('.ep-item');
        for (var k = 0; k < cards.length; k++) {
            var c = cards[k];
            if (!c.__item || !c.__item.pageUrl) continue;
            try {
                var u = new URL(articleUrl(c.__item), window.location.href);
                if (u.pathname + u.search === targetPath) return c;
            } catch (e) { }
        }
        return null;
    }

    // ===== Metadata "đang phát" (title + thumb) + điều khiển nền (MediaSession) =====
    var SITE_NAME = 'Podcast Báo Thái Nguyên';

    function upsertMeta(key, attr, value) {
        var head = document.head || document.documentElement;
        var el = head.querySelector('meta[' + attr + '="' + key + '"]');
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            head.appendChild(el);
        }
        el.setAttribute('content', value);
    }

    // Đổi tiêu đề tab + thumb (favicon/og) + metadata màn hình khoá theo bài đang phát.
    function updateNowPlaying(card) {
        var item = card.__item || {};
        var titleEl = card.querySelector('.ep-item-title');
        var title = ((titleEl ? titleEl.textContent : item.title || '') || '').trim();
        var series = card.dataset.series || '';
        var imgEl = card.querySelector('img');
        var thumb = imgEl ? imgEl.src : '';

        if (title) document.title = title + ' — ' + SITE_NAME;

        if (thumb) {
            var icon = document.querySelector('link[rel="icon"]');
            if (icon) icon.setAttribute('href', thumb);
            upsertMeta('og:image', 'property', thumb);
            upsertMeta('twitter:image', 'name', thumb);
        }
        upsertMeta('og:title', 'property', title || SITE_NAME);
        upsertMeta('twitter:title', 'name', title || SITE_NAME);

        var ms = window.navigator && window.navigator.mediaSession;
        if (ms && typeof MediaMetadata !== 'undefined') {
            try {
                ms.metadata = new MediaMetadata({
                    title: title || SITE_NAME,
                    artist: SITE_NAME,
                    album: series,
                    artwork: thumb ? [
                        { src: thumb, sizes: '256x256' },
                        { src: thumb, sizes: '512x512' },
                    ] : [],
                });
            } catch (e) { }
        }
    }

    function setMediaPlayback(state) {
        var ms = window.navigator && window.navigator.mediaSession;
        if (ms) { try { ms.playbackState = state; } catch (e) { } }
    }

    function updatePositionState() {
        var ms = window.navigator && window.navigator.mediaSession;
        if (!ms || !ms.setPositionState || !audio) return;
        var dur = audio.duration;
        if (!isFinite(dur) || dur <= 0) return;
        try {
            ms.setPositionState({
                duration: dur,
                playbackRate: audio.playbackRate || 1,
                position: Math.max(0, Math.min(audio.currentTime || 0, dur)),
            });
        } catch (e) { }
    }

    // Nút Phát/Dừng, Tập trước/sau, tua… trên màn hình khoá / thông báo điện thoại.
    function setupMediaSession() {
        var ms = window.navigator && window.navigator.mediaSession;
        if (!ms || !ms.setActionHandler) return;
        function set(action, fn) { try { ms.setActionHandler(action, fn); } catch (e) { } }
        set('play', function () { if (audio) audio.play().catch(function () { }); });
        set('pause', function () { if (audio) audio.pause(); });
        set('previoustrack', function () { playAdjacent(-1); });
        set('nexttrack', function () { playAdjacent(1); });
        set('seekto', function (d) {
            if (audio && d && typeof d.seekTime === 'number') { audio.currentTime = d.seekTime; paintProgress(); }
        });

        // iOS chỉ hiện 2 nút phụ trên màn hình khoá: nếu đăng ký tua nhanh thì nó
        // CHIẾM chỗ của Tập trước/Tập sau. → iOS: bỏ tua nhanh để ưu tiên prev/next.
        var ua = (window.navigator && window.navigator.userAgent) || '';
        var isIOS = /iP(hone|ad|od)/.test(ua) ||
            (window.navigator && window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
        if (isIOS) {
            set('seekbackward', null);
            set('seekforward', null);
        } else {
            set('seekbackward', function (d) {
                if (audio && audio.duration) audio.currentTime = Math.max(0, audio.currentTime - ((d && d.seekOffset) || 15));
            });
            set('seekforward', function (d) {
                if (audio && audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + ((d && d.seekOffset) || 30));
            });
        }
    }

    function initPlayer() {
        if (!audio) return;
        var els = getPlayerEls();

        audio.addEventListener('play', function () { setPlaying(true); setMediaPlayback('playing'); });
        audio.addEventListener('pause', function () { setPlaying(false); setMediaPlayback('paused'); });
        audio.addEventListener('ended', function () {
            paintProgress(true);
            // Tự chuyển bài kế (kể cả khi chạy nền / tắt màn hình); hết hẳn → dừng.
            playAdjacent(1).then(function (advanced) {
                if (!advanced) { setPlaying(false); setMediaPlayback('paused'); }
            });
        });
        audio.addEventListener('loadedmetadata', function () { paintTotal(); updatePositionState(); });
        audio.addEventListener('timeupdate', function () { paintProgress(); });
        audio.addEventListener('seeked', updatePositionState);
        audio.addEventListener('ratechange', updatePositionState);

        if (els.playBtn) els.playBtn.addEventListener('click', togglePlay);
        makeSeek(els.bar);
        if (els.speedBtn) els.speedBtn.addEventListener('click', cycleSpeed);
        setupMediaSession();

        // ===== Âm lượng: kéo để chỉnh, click icon để bật/tắt tiếng =====
        var vbar = document.getElementById('player-volume-bar');
        var vfill = document.getElementById('player-volume-fill');
        var vbtn = document.getElementById('player-volume-btn');
        var lastVolume = 1;

        function paintVolume() {
            var silent = audio.muted || audio.volume === 0;
            if (vfill) vfill.style.width = (silent ? 0 : audio.volume * 100) + '%';
            if (vbtn) {
                vbtn.classList.toggle('muted', silent);
                vbtn.setAttribute('aria-label', silent ? 'Bật tiếng' : 'Tắt tiếng');
            }
        }

        function setVolumeFromEvent(e) {
            var rect = vbar.getBoundingClientRect();
            var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.volume = pct;
            audio.muted = false;
            if (pct > 0) lastVolume = pct;
            paintVolume();
        }

        if (vbar && vfill) {
            var vDragging = false;
            var endVolDrag = function () {
                vDragging = false;
                vbar.classList.remove('dragging');
            };
            vbar.addEventListener('pointerdown', function (e) {
                vDragging = true;
                vbar.classList.add('dragging');
                if (vbar.setPointerCapture) {
                    try { vbar.setPointerCapture(e.pointerId); } catch (err) { }
                }
                setVolumeFromEvent(e);
                e.preventDefault();
            });
            vbar.addEventListener('pointermove', function (e) {
                if (vDragging) setVolumeFromEvent(e);
            });
            vbar.addEventListener('pointerup', endVolDrag);
            vbar.addEventListener('pointercancel', endVolDrag);
            // Dự phòng: click trực tiếp (trình duyệt không hỗ trợ Pointer Events).
            vbar.addEventListener('click', function (e) {
                if (!vDragging) setVolumeFromEvent(e);
            });
        }

        if (vbtn) {
            vbtn.addEventListener('click', function () {
                if (audio.muted || audio.volume === 0) {
                    audio.muted = false;
                    if (audio.volume === 0) audio.volume = lastVolume || 0.7;
                } else {
                    lastVolume = audio.volume;
                    audio.muted = true;
                }
                paintVolume();
            });
        }

        paintVolume(); // đồng bộ thanh âm lượng với giá trị thật ngay từ đầu

        bindSkip('Lùi 15 giây', -15);
        bindSkip('Tiến 30 giây', 30);

        document.querySelectorAll('[aria-label="Tập trước"]').forEach(function (b) {
            b.addEventListener('click', function () { playAdjacent(-1); });
        });
        document.querySelectorAll('[aria-label="Tập sau"]').forEach(function (b) {
            b.addEventListener('click', function () { playAdjacent(1); });
        });

        // Back/Forward trình duyệt → đồng bộ bài đang phát/đang xem theo URL.
        window.addEventListener('popstate', function () {
            var card = findRenderedCardByPath(window.location.pathname + window.location.search);
            if (card) {
                if (card === playerCard) return;
                suppressUrlSync = true;
                if (card.dataset.type === 'video') {
                    openDetail(card); // video: mở lại player video theo URL (không qua engine audio)
                } else {
                    gotoCard(card);
                }
                suppressUrlSync = false;
                return;
            }
            // Không khớp bài → thử khớp chuyên mục (back/forward giữa các mục con).
            var cat = findCatByPath(window.location.pathname);
            if (!cat) return;
            if (detailEls && detailEls.overlay && detailEls.overlay.classList.contains('open')) closeDetail();
            navCats.forEach(function (c) { if (c.linkEl) c.linkEl.classList.remove('active'); });
            if (cat.linkEl) cat.linkEl.classList.add('active');
            if (cat.sectionEl) {
                var top = cat.sectionEl.getBoundingClientRect().top + window.pageYOffset - headerOffset();
                window.scrollTo({ top: top, behavior: 'auto' });
            }
        });

        var ptrack = document.querySelector('.player .player-track');
        if (ptrack) {
            ptrack.style.cursor = 'pointer';
            ptrack.addEventListener('click', function () { if (playerCard) openDetail(playerCard); });
        }

        initDetail();
        refreshPlayerBar();
    }

    function showToast(msg) {
        var t = document.createElement('div');
        t.className = 'tn-toast';
        t.textContent = msg;
        t.style.cssText =
            'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);' +
            'background:#212636;color:#fff;padding:12px 18px;border-radius:10px;' +
            'font-size:14px;line-height:1.45;max-width:90%;text-align:center;z-index:9999;' +
            'box-shadow:0 8px 28px rgba(0,0,0,.28);opacity:0;transition:opacity .2s ease';
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.style.opacity = '1'; });
        setTimeout(function () {
            t.style.opacity = '0';
            setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
        }, 2600);
    }

    // ===== Chi tiết bài nghe (overlay trong trang) =====
    function getDetailEls() {
        var o = document.getElementById('detail-overlay');
        if (!o) return null;
        return {
            overlay: o,
            close: document.getElementById('detail-close'),
            thumb: document.getElementById('detail-thumb'),
            series: document.getElementById('detail-series'),
            title: document.getElementById('detail-title'),
            desc: document.getElementById('detail-desc'),
            meta: document.getElementById('detail-meta'),
            metaDur: null,
            bar: document.getElementById('detail-progress'),
            fill: document.getElementById('detail-progress-fill'),
            cur: document.getElementById('detail-current'),
            total: document.getElementById('detail-total'),
            playBtn: document.getElementById('detail-play'),
            speedBtn: document.getElementById('detail-speed'),
            related: document.getElementById('detail-related'),
            relMore: document.getElementById('detail-related-more'),
            // Thẻ lớn dạng VIDEO (player chi tiết native).
            audioCard: o.querySelector('.audio-card'),
            videoCard: document.getElementById('detail-video'),
            videoEl: document.getElementById('detail-video-player'),
            videoOverlay: document.getElementById('detail-video-overlay'),
            videoSeries: document.getElementById('detail-video-series'),
            videoTitle: document.getElementById('detail-video-title'),
            videoDesc: document.getElementById('detail-video-desc'),
            videoMeta: document.getElementById('detail-video-meta'),
            videoMetaDur: null,
        };
    }

    function spanText(text) {
        var s = document.createElement('span');
        s.textContent = text;
        return s;
    }
    function fmtDate(str) {
        var p = String(str || '').slice(0, 10).split('-');
        if (p.length !== 3) return '';
        var y = +p[0], mo = +p[1], d = +p[2];
        return y && mo && d ? d + '/' + mo + '/' + y : '';
    }
    function seriesNameFor(catId) {
        for (var k = 0; k < sectionCtxs.length; k++) {
            if (sectionCtxs[k].catId === catId) return sectionCtxs[k].name;
        }
        return '';
    }

    function populateDetail(card) {
        if (!detailEls) return;
        var item = card.__item || {};
        var titleEl = card.querySelector('.ep-item-title');
        var imgEl = card.querySelector('img');
        if (detailEls.thumb && imgEl) detailEls.thumb.src = imgEl.src;
        if (detailEls.title) detailEls.title.textContent = titleEl ? titleEl.textContent : item.title || '';
        if (detailEls.desc) detailEls.desc.textContent = item.lead || '';
        if (detailEls.series) {
            var icon = detailEls.series.querySelector('svg');
            detailEls.series.textContent = '';
            if (icon) detailEls.series.appendChild(icon);
            detailEls.series.appendChild(document.createTextNode(' ' + (card.dataset.series || 'Podcast').toUpperCase()));
        }
        if (detailEls.meta) {
            detailEls.meta.innerHTML = '';
            var d = fmtDate(item.publishDate);
            if (d) {
                detailEls.meta.appendChild(spanText(d));
                var dot = document.createElement('span');
                dot.className = 'dot';
                detailEls.meta.appendChild(dot);
            }
            detailEls.metaDur = spanText(
                audio && audio.duration ? Math.max(1, Math.round(audio.duration / 60)) + ' phút nghe' : 'Đang tải…'
            );
            detailEls.meta.appendChild(detailEls.metaDur);
        }
        paintTotal();
        paintProgress();
    }

    // Đổ dữ liệu vào thẻ lớn dạng VIDEO + nạp nguồn vào <video> native.
    // Video phát độc lập với engine <audio>; chỉ dùng điều khiển gốc của trình duyệt.
    function populateDetailVideo(card) {
        if (!detailEls || !detailEls.videoEl) return;
        var item = card.__item || {};
        var titleEl = card.querySelector('.ep-item-title');
        var imgEl = card.querySelector('img');
        var v = detailEls.videoEl;

        if (detailEls.videoTitle)
            detailEls.videoTitle.textContent = titleEl ? titleEl.textContent : (item.title || '');
        if (detailEls.videoDesc) detailEls.videoDesc.textContent = item.lead || '';
        if (detailEls.videoSeries) {
            var icon = detailEls.videoSeries.querySelector('svg');
            detailEls.videoSeries.textContent = '';
            if (icon) detailEls.videoSeries.appendChild(icon);
            detailEls.videoSeries.appendChild(
                document.createTextNode(' ' + (card.dataset.series || 'Podcast').toUpperCase())
            );
        }
        // Meta: ngày đăng + thời lượng (điền khi <video> có loadedmetadata).
        if (detailEls.videoMeta) {
            detailEls.videoMeta.innerHTML = '';
            var d = fmtDate(item.publishDate);
            if (d) {
                detailEls.videoMeta.appendChild(spanText(d));
                var dot = document.createElement('span');
                dot.className = 'dot';
                detailEls.videoMeta.appendChild(dot);
            }
            detailEls.videoMetaDur = spanText('Đang tải…');
            detailEls.videoMeta.appendChild(detailEls.videoMetaDur);
        }

        // Nạp poster + nguồn; reset lớp phủ "bấm để phát" và điều khiển native.
        var poster = imgEl ? imgEl.src : '';
        try { v.pause(); } catch (e) { }
        v.removeAttribute('controls');
        if (poster) v.setAttribute('poster', poster); else v.removeAttribute('poster');
        var src = card.dataset.media || '';
        if (v.getAttribute('src') !== src) {
            v.setAttribute('src', src);
            try { v.load(); } catch (e) { }
        }
        try { v.currentTime = 0; } catch (e) { }
        if (detailEls.videoOverlay) detailEls.videoOverlay.classList.remove('hidden');
    }

    // Chọn & đổ dữ liệu đúng loại thẻ lớn (audio / video) theo card.dataset.type.
    function renderDetailCard(card) {
        if (!detailEls) return;
        detailIsVideo = card.dataset.type === 'video';
        if (detailEls.audioCard) detailEls.audioCard.hidden = detailIsVideo;
        if (detailEls.videoCard) detailEls.videoCard.hidden = !detailIsVideo;
        if (detailIsVideo) {
            if (audio) { try { audio.pause(); } catch (e) { } } // dừng audio chung khi xem video
            populateDetailVideo(card);
            syncUrlToCard(card);    // đổi path trên thanh địa chỉ giống item audio
            updateNowPlaying(card); // tiêu đề tab + ảnh chia sẻ + metadata
        } else {
            // Rời chế độ video → dừng <video> để không phát nền.
            if (detailEls.videoEl) { try { detailEls.videoEl.pause(); } catch (e) { } }
            populateDetail(card);
        }
        refreshPlayerBar();
    }

    async function loadDetailRelated(reset) {
        if (!detailEls || !detailEls.related || !detailCat || detailLoading) return;
        if (reset) {
            detailFirst = 0;
            detailDone = false;
            detailEls.related.innerHTML = '';
            if (detailEls.relMore) {
                detailEls.relMore.classList.remove('done');
                detailEls.relMore.style.display = '';
            }
        }
        if (detailDone) return;
        detailLoading = true;
        if (detailEls.relMore) detailEls.relMore.classList.add('loading');
        try {
            var first = reset ? 0 : detailFirst + PAGE_SIZE;
            var page = await fetchPage(detailCat, first);
            detailFirst = first;
            var curItem = playerCard && playerCard.__item ? playerCard.__item : null;
            var curId = curItem ? curItem.id : '';
            var curTitle = (!curId && curItem && curItem.title) ? curItem.title.trim() : '';
            page.items.forEach(function (it) {
                if (curId && it.id === curId) return; // bỏ bài đang phát (theo id)
                if (curTitle && it.title && it.title.trim() === curTitle) return; // hoặc theo title (mở từ #article-info)
                var rc = buildCard(it, seriesNameFor(detailCat));
                rc.dataset.catId = detailCat;
                detailEls.related.appendChild(rc);
            });
            if (!page.hasMore) {
                detailDone = true;
                if (detailEls.relMore) detailEls.relMore.classList.add('done');
            }
        } catch (e) {
            if (reset) detailEls.related.appendChild(messageNode('Không tải được bài liên quan.'));
        } finally {
            detailLoading = false;
            if (detailEls.relMore) detailEls.relMore.classList.remove('loading');
        }
    }

    function openDetail(card) {
        if (!detailEls || !card) return;
        detailEls.overlay.style.transform = ''; // dọn transform còn sót từ cử chỉ kéo
        var section = card.closest('section.section');
        detailCat = card.dataset.catId || (section ? section.dataset.catId : '') || '';
        // Ẩn mục "Bài liên quan" nếu không có chuyên mục (vd: mở từ #article-info).
        var relatedSection = detailEls.related ? detailEls.related.closest('section') : null;
        if (relatedSection) relatedSection.style.display = detailCat ? '' : 'none';
        renderDetailCard(card); // chọn thẻ lớn audio/video theo loại item
        // Player lớn thay chỗ danh sách chính → vẫn thấy header + subnav + footer.
        var container = document.querySelector('.container');
        if (container) container.style.display = 'none';
        detailEls.overlay.classList.add('open');
        detailEls.overlay.setAttribute('aria-hidden', 'false');
        savedScrollY = window.scrollY || window.pageYOffset || 0; // nhớ chỗ đang đọc
        window.scrollTo(0, 0); // lên đầu trang để thấy header + subnav + thẻ lớn
        bigCardVisible = true; // thẻ lớn đang hiện → ẩn player dưới
        refreshPlayerBar();
        loadDetailRelated(true);
    }

    function closeDetail() {
        if (!detailEls) return;
        detailEls.overlay.classList.remove('open');
        detailEls.overlay.setAttribute('aria-hidden', 'true');
        detailEls.overlay.style.transform = '';
        // Dừng video chi tiết khi thu gọn (tránh phát nền).
        if (detailEls.videoEl) { try { detailEls.videoEl.pause(); } catch (e) { } }
        var container = document.querySelector('.container');
        if (container) container.style.display = ''; // hiện lại danh sách chính
        window.scrollTo(0, savedScrollY || 0); // về đúng chỗ đang đọc trước đó
        refreshPlayerBar();
    }

    // Auto Picture-in-Picture cho <video> chi tiết: cuộn ra ngoài → PiP; cuộn vào → thoát.
    // Phân biệt người dùng tự đóng cửa sổ PiP (khoá mở lại) với việc ta tự thoát khi cuộn.
    function setupVideoPip(video) {
        if (!video || !('IntersectionObserver' in window)) return;
        var userClosedPip = false, weInitiatedExit = false, pipBusy = false;
        function pipSupported() { return !!document.pictureInPictureEnabled && !video.disablePictureInPicture; }
        function isInPip() { return document.pictureInPictureElement === video; }
        function tryEnterPip() {
            if (!pipSupported() || isInPip() || pipBusy) return;
            if (video.paused || video.ended || userClosedPip) return;
            pipBusy = true;
            video.requestPictureInPicture()
                .catch(function () { })
                .then(function () { pipBusy = false; }, function () { pipBusy = false; });
        }
        function tryExitPip() {
            if (!isInPip() || pipBusy) return;
            weInitiatedExit = true; pipBusy = true;
            document.exitPictureInPicture()
                .catch(function () { weInitiatedExit = false; })
                .then(function () { pipBusy = false; }, function () { pipBusy = false; });
        }
        video.addEventListener('leavepictureinpicture', function () {
            if (weInitiatedExit) weInitiatedExit = false; else userClosedPip = true;
        });
        video.addEventListener('play', function () { userClosedPip = false; });
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) tryExitPip(); else tryEnterPip();
            });
        }, { threshold: 0.1 }).observe(video);
    }

    function initDetail() {
        detailEls = getDetailEls();
        if (!detailEls) return;
        if (detailEls.playBtn) detailEls.playBtn.addEventListener('click', togglePlay);
        makeSeek(detailEls.bar);
        if (detailEls.speedBtn) detailEls.speedBtn.addEventListener('click', cycleSpeed);
        if (detailEls.close) detailEls.close.addEventListener('click', closeDetail);
        if (detailEls.relMore) detailEls.relMore.addEventListener('click', function () { loadDetailRelated(false); });

        if (detailEls.related) {
            detailEls.related.addEventListener('click', function (e) {
                var rc = e.target.closest('.ep-item');
                if (!rc || !detailEls.related.contains(rc)) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
                e.preventDefault();
                if (rc.dataset.type === 'video') {
                    renderDetailCard(rc); // chuyển thẻ lớn sang video (phát bằng player native)
                } else {
                    playCard(rc);
                    renderDetailCard(rc); // hiện lại thẻ audio (ẩn video) + đổ dữ liệu
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Lướt xuống trong overlay (thẻ lớn ra khỏi tầm nhìn) → hiện player dưới; lướt lên → ẩn.
        var bigCard = detailEls.overlay.querySelector('.audio-card');
        if (bigCard && 'IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { bigCardVisible = en.isIntersecting; });
                refreshPlayerBar();
            }, { threshold: 0.15 }).observe(bigCard);
        }

        // ===== Thẻ lớn VIDEO: bấm lớp phủ để phát (chuyển sang điều khiển native) =====
        if (detailEls.videoOverlay && detailEls.videoEl) {
            detailEls.videoOverlay.addEventListener('click', function () {
                detailEls.videoOverlay.classList.add('hidden');
                detailEls.videoEl.setAttribute('controls', '');
                detailEls.videoEl.play().catch(function () { });
            });
        }
        // Thời lượng video → điền vào meta khi có metadata.
        if (detailEls.videoEl) {
            detailEls.videoEl.addEventListener('loadedmetadata', function () {
                if (detailEls.videoMetaDur) {
                    var mins = Math.max(1, Math.round((detailEls.videoEl.duration || 0) / 60));
                    detailEls.videoMetaDur.textContent = mins + ' phút';
                }
            });
        }
        // Tự bật Picture-in-Picture khi video cuộn ra khỏi tầm nhìn (như video.html).
        setupVideoPip(detailEls.videoEl);

        // Kéo mạnh xuống (từ đỉnh overlay) → thu nhỏ, như bấm "Thu gọn".
        bindPullToDismiss(detailEls.overlay);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && detailEls.overlay.classList.contains('open')) closeDetail();
        });
    }

    // Cử chỉ vuốt xuống để thu nhỏ player lớn. Chỉ kích hoạt khi trang đang ở
    // đỉnh (scrollY<=0) và vuốt xuống; vượt ngưỡng quãng đường HOẶC vận tốc thì đóng.
    function bindPullToDismiss(overlay) {
        if (!overlay) return;
        var SLOP = 8, DIST = 120, VELO = 0.6; // px, px, px/ms
        var startY = 0, lastY = 0, lastT = 0, dy = 0, vy = 0, tracking = false, active = false;

        function point(e) {
            return (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || null;
        }
        function pageY() {
            return window.scrollY || window.pageYOffset || 0;
        }
        function snapBack() {
            overlay.style.transition = 'transform .25s ease';
            overlay.style.transform = 'translateY(0)';
            var done = function () {
                overlay.style.transition = '';
                overlay.style.transform = '';
                overlay.removeEventListener('transitionend', done);
            };
            overlay.addEventListener('transitionend', done);
        }

        overlay.addEventListener('touchstart', function (e) {
            if (!overlay.classList.contains('open') || pageY() > 0) { tracking = false; return; }
            // Không bắt đầu cử chỉ đóng khi chạm vào nút điều khiển / thanh tua.
            if (e.target && e.target.closest && e.target.closest('.ac-controls, .ac-progress, button, a, input')) {
                tracking = false; return;
            }
            var p = point(e); if (!p) return;
            tracking = true; active = false;
            startY = lastY = p.clientY; lastT = e.timeStamp || 0; dy = 0; vy = 0;
        }, { passive: true });

        overlay.addEventListener('touchmove', function (e) {
            if (!tracking) return;
            var p = point(e); if (!p) return;
            dy = p.clientY - startY;
            var dt = (e.timeStamp || 0) - lastT;
            if (dt > 0) { vy = (p.clientY - lastY) / dt; lastT = e.timeStamp || 0; }
            lastY = p.clientY;

            if (!active) {
                if (dy > SLOP && pageY() <= 0) {
                    active = true;
                    overlay.style.transition = 'none';
                } else if (dy < 0) {
                    tracking = false; return; // vuốt lên → để cuộn bình thường
                } else {
                    return;
                }
            }
            if (dy < 0) dy = 0;
            overlay.style.transform = 'translateY(' + dy + 'px)';
            if (e.cancelable) e.preventDefault(); // chặn cuộn/pull-refresh khi đang kéo
        }, { passive: false });

        function finish() {
            if (!tracking) return;
            tracking = false;
            if (!active) return;
            active = false;
            if (dy > DIST || vy > VELO) {
                overlay.style.transition = '';
                overlay.style.transform = '';
                closeDetail(); // thu nhỏ giống bấm "Thu gọn"
            } else {
                snapBack();
            }
        }
        overlay.addEventListener('touchend', finish);
        overlay.addEventListener('touchcancel', finish);
    }

    // ===== Tự mở player lớn từ #article-info (nếu trang dựng sẵn) =====
    // Media URL trích từ <source>/<video>/<audio> bên trong .article-content.
    function extractMediaFromContent(contentEl) {
        if (!contentEl) return '';
        var el =
            contentEl.querySelector('source[src]') ||
            contentEl.querySelector('video[src]') ||
            contentEl.querySelector('audio[src]') ||
            contentEl.querySelector('a[href$=".mp3"], a[href$=".mp4"], a[href$=".m4a"]');
        if (!el) return '';
        return el.getAttribute('src') || el.getAttribute('href') || '';
    }

    function autoOpenFromArticleInfo() {
        var info = document.getElementById('article-info');
        if (!info) return false;

        var titleEl = info.querySelector('#article-title');
        var title = titleEl ? titleEl.textContent.trim() : '';
        var contentEl = info.querySelector('.article-content');
        var media = contentEl ? absUrl(ASSET_ORIGIN, extractMediaFromContent(contentEl)) : '';
        // Bắt buộc có title + media (lọc từ content); thiếu thì bỏ qua.
        if (!title || !media) return false;

        var descEl = info.querySelector('.article-desc');
        var desc = descEl ? descEl.textContent.trim() : '';
        var thumbImg = info.querySelector('.article-thumb img');
        var videoEl = contentEl.querySelector('video');
        var thumb =
            (thumbImg && thumbImg.getAttribute('src')) ||
            (videoEl && videoEl.getAttribute('poster')) ||
            '';
        thumb = absUrl(ASSET_ORIGIN, thumb) || PLACEHOLDER_IMG;

        // Dựng thẻ tổng hợp tương thích loadCard/openDetail (không thuộc list nào).
        var card = document.createElement('a');
        card.className = 'ep-item';
        card.__item = { title: title, lead: desc };
        card.dataset.media = media;
        card.dataset.series = '';
        card.dataset.type = isVideoItem(card.__item, media) ? 'video' : 'audio';
        // "Bài liên quan" lấy theo chuyên mục ĐẦU TIÊN trên subnav.
        var firstCat = document.querySelector('.subnav-inner a[data-cat-id]');
        card.dataset.catId = (firstCat && firstCat.getAttribute('data-cat-id')) || '';

        var thumbWrap = document.createElement('div');
        thumbWrap.className = 'ep-item-thumb';
        var im = document.createElement('img');
        im.alt = '';
        im.src = thumb;
        thumbWrap.appendChild(im);

        var body = document.createElement('div');
        body.className = 'ep-item-body';
        var innerBody = document.createElement('div');
        var h3 = document.createElement('h3');
        h3.className = 'ep-item-title';
        h3.textContent = title;
        var p = document.createElement('p');
        p.className = 'ep-item-desc';
        p.textContent = desc;
        innerBody.appendChild(h3);
        innerBody.appendChild(p);
        body.appendChild(innerBody);

        card.appendChild(thumbWrap);
        card.appendChild(body);

        // Video: bỏ qua loadCard (không dùng engine audio); audio thì nạp sẵn nguồn.
        if (card.dataset.type !== 'video') {
            loadCard(card); // nạp nguồn + metadata, KHÔNG tự phát (autoplay sẽ bị chặn)
        }
        openDetail(card); // mở player lớn ngay
        return true;
    }

    // ===== Bootstrap =====
    function init() {
        var main = document.querySelector('main.main');
        if (!main) return;

        initPlayer();

        // Click 1 thẻ → phát media của thẻ đó (videoFirst); không có thì báo.
        // Giữ Ctrl/Cmd/Shift/giữa-chuột để mở bài viết ở tab mới.
        main.addEventListener('click', async function (e) {
            var card = e.target.closest('.ep-item');
            if (!card || !main.contains(card)) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
            e.preventDefault();
            // Click lại bài đang phát → mở chi tiết (overlay), không phát lại.
            if (card === playerCard) { openDetail(card); return; }
            // Chưa biết loại media → bóc từ trang chi tiết trước khi quyết định.
            if (!card.dataset.media) {
                card.classList.add('is-resolving');
                try {
                    if (!(await resolveMedia(card))) {
                        showToast('Bài viết này chưa có audio/video để phát.');
                        return;
                    }
                } finally {
                    card.classList.remove('is-resolving');
                }
            }
            // Video: mở thẳng player video chi tiết (không dùng engine audio).
            if (card.dataset.type === 'video') { openDetail(card); return; }
            playCard(card);
        });

        var cats = readCategories();
        main.innerHTML = '';

        // Dựng & gắn TẤT CẢ section shell đồng bộ trước → giữ đúng thứ tự DOM bất
        // kể fetch xong lệch nhau; mỗi section sau đó tự tải độc lập.
        var ctxs = cats.map(function (cat) {
            var ctx = buildSection(cat);
            main.appendChild(ctx.sectionEl);
            return ctx;
        });
        sectionCtxs = ctxs;

        var loads = ctxs.map(function (ctx) {
            return renderInitial(ctx);
        });

        wireSubnav(cats);

        // Có sẵn #article-info đầy đủ (title + media trong content) → mở player lớn ngay.
        if (autoOpenFromArticleInfo()) return;

        // Vào trang bằng đúng path 1 chuyên mục → đánh dấu active + tự cuộn tới
        // mục đó (chờ các section tải xong để vị trí cuộn chính xác).
        var urlCat = findCatByPath(window.location.pathname);
        if (urlCat) {
            cats.forEach(function (c) { if (c.linkEl) c.linkEl.classList.remove('active'); });
            if (urlCat.linkEl) urlCat.linkEl.classList.add('active');
            // Mục đầu (Mới nhất — chuyên mục Podcast) đã nằm sẵn ở đầu trang → khỏi cuộn.
            if (urlCat !== cats[0]) {
                Promise.all(loads).then(function () { scrollToCatOnLoad(urlCat.sectionEl); });
            }
        }
    }

    init();
})();
