/**
 * engage.js — đo hành vi đọc (cuộn, chú ý, nhấp) và đếm lượt xem TRANG CHUYÊN MỤC.
 *
 * Một tệp, hai đường ra hoàn toàn tách biệt — cố ý:
 *
 *   1. POST /v1/page-engagement  → analytics.event_page_engagements   (đo hành vi, ẩn danh)
 *   2. POST /v1/event-log        → analytics.event_logs / event_stats (ĐẾM VIEW chuyên mục)
 *
 * Đường 2 là con số TOÀ SOẠN NHÌN THẤY, đường 1 thì không. Chúng dùng endpoint khác nhau, khoá
 * điều khiển khác nhau (`data-cat-view` vs `data-sample`), và một cái hỏng không kéo cái kia theo.
 *
 * ═══ VÌ SAO LÀ FILE RIÊNG, KHÔNG PHẢI THÊM VÀO common.js ═══
 * `common.js` được hơn 80 layout nạp; một lỗi trong đó là lỗi TOÀN SITE. File riêng thì hỏng cũng
 * chỉ hỏng phần đo. Nhúng bằng đúng cách GA4 được nhúng: một thẻ <script async> trong <head>, nên
 * `site-go` KHÔNG bị sửa một dòng nào.
 *
 * ═══ NÚT ĐIỀU KHIỂN NẰM TRÊN THẺ SCRIPT, KHÔNG NẰM TRONG FILE ═══
 *   <script defer src=".../engage.js?v=20260909"
 *           data-api="https://api-public.baothainguyen.vn"
 *           data-sample="1" data-nosnippet></script>
 *
 * ⚠ `defer` chứ KHÔNG phải `async`: #page_info là phần tử ĐẦU TIÊN của <body>, ngay sau thẻ này.
 *   `async` được chạy ngay khi tải xong, tức có thể chạy TRƯỚC khi khối đó tồn tại.
 *
 * ⛔ `data-cat-view="1"` là OPT-IN, và CHỈ dán lên layout CHUYÊN MỤC THẬT.
 *   Trang chủ / tìm kiếm / tag cũng mang category_id, nên chốt trong mã KHÔNG phân biệt được
 *   chúng — đó là việc của danh sách cho phép ở tầng layout. Dán nhầm lên trang chủ là chuyên
 *   mục "Trang chủ" đứng đầu bảng xếp hạng bằng toàn bộ lưu lượng trang chủ.
 *
 * (Không có data-rec / data-rec-sample / data-rrweb trong bản này — xem khối cuối tệp.)
 *
 * ⛔ Đây chỉ là KHUYẾN NGHỊ. Trang đã nằm trong page-cache của site-go vẫn chạy bản cũ, nên nút
 * tắt THẬT nằm ở server. Cờ ở đây chỉ để không phải chờ cache.
 *
 * ═══ BỐN CỬA BAIL CỨNG (áp cho CẢ HAI đường) ═══
 *  1. không đọc được cả article_id lẫn category_id  (404 / RSS / textlink tự loại)
 *  2. đường dẫn xem trước (/preview, /p, /p/m) hoặc URL có ?token=
 *  3. doNotTrack hoặc globalPrivacyControl
 *  4. payload đo hành vi KHÔNG BAO GIỜ chứa location.href, document.referrer hay query string
 *
 * Cửa số 2 quan trọng hơn vẻ ngoài: trang xem trước KHÔNG áp publish gate, nên đo ở đó là đo bản
 * nháp — và là một đường rò token xem trước vào nhật ký đo lường.
 */
(function () {
    'use strict';

    // ⚠ `document.currentScript` CHỈ đúng khi đọc đồng bộ ở thân script. Trong một callback nó là
    // null, nên phải chộp NGAY ở đây — trước bất kỳ lệnh hoãn nào bên dưới.
    var self = document.currentScript;
    if (!self) {
        var all = document.querySelectorAll('script[src*="engage.js"]');
        self = all.length ? all[all.length - 1] : null;
    }
    if (!self) return;

    // ── Cửa 3: tín hiệu riêng tư. Đây là tín hiệu DUY NHẤT tồn tại trong stack này ──
    if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;

    // ── Cửa 2: xem trước ──
    var path = location.pathname;
    // ⚠ Danh sách này phải khớp `isPreviewRoute` trong site-go/internal/router/proxy.go — kể cả
    // `/pv`, hiện chưa gắn nhưng đã được khai ở đó. Hai danh sách nằm ở hai repo khác nhau, sau
    // một CDN cache 30 ngày; lệch nhau là đo nhầm bản nháp và ghi token xem trước vào nhật ký.
    if (path === '/p' || path === '/pv' || path === '/preview' ||
        path.indexOf('/p/') === 0 || path.indexOf('/pv/') === 0 ||
        path.indexOf('/preview/') === 0 || location.search.indexOf('token=') >= 0) return;

    /**
     * ⭐ HOÃN TỚI KHI #page_info TỒN TẠI — đây là chỗ bản đầu tiên suýt hỏng im lặng.
     *
     * Đã đo trên layout thật của Thái Nguyên (09/09/2026): `</head>` kết thúc ở byte 3575 của
     * layout 253 và `<portlet name="cate_page_info">` bắt đầu ở 3636 — tức `#page_info` là thứ
     * ĐẦU TIÊN trong <body>, nằm NGAY SAU thẻ script này. Với `async`, trình duyệt được phép chạy
     * script ngay khi tải xong, và một tệp 4 KB lấy từ cache đĩa thì gần như luôn xong trước khi
     * bộ phân tích cú pháp đi hết phần còn lại của trang.
     *
     * Bản không hoãn sẽ đọc `getElementById('page_info')` ra null, bail ở cửa 1, và KHÔNG ghi gì —
     * không lỗi, không log, không dấu vết. Triệu chứng duy nhất là một bảng số liệu trống, thứ
     * không phân biệt được với "chưa có lưu lượng".
     */
    if (!document.getElementById('page_info') && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    function boot() {

    // ── Ngữ cảnh trang, lấy từ khối #page_info đã có sẵn ─────────────────────────────────
    //
    // ⚠ HAI DẠNG, và cả hai đều đang chạy thật — đã đo 08/09/2026:
    //   · thainguyen: thuộc tính trên chính khối  → <div id="page_info" data-article-id="123">
    //   · cms_dev:    phần tử con mang giá trị    → <div id="page_info"><div id="article_id">123</div>
    // Chỉ đọc một dạng là ở tenant kia script bail ở cửa 1 và KHÔNG ghi gì. Nên đọc cả hai.
    var info = document.getElementById('page_info');

    /**
     * ⛔ PHẠM VI TRA CỨU LÀ MỘT CHỐT AN TOÀN, KHÔNG PHẢI CHI TIẾT CÀI ĐẶT.
     *
     * Khi #page_info TỒN TẠI, chỉ được tra BÊN TRONG nó. Bản trước rơi thẳng ra
     * `document.getElementById(key)` khi thuộc tính rỗng — mà trên Thái Nguyên trang chuyên mục
     * LUÔN có `data-article-id` RỖNG, nên nhánh đó chạy trên MỌI lượt xem chuyên mục.
     *
     * Từ khi thân script hoãn tới DOMContentLoaded, toàn bộ <body> đã dựng xong lúc tra. Chỉ cần
     * một portlet danh sách bài render `<div id="article_id">` là trang chuyên mục bị đọc thành
     * trang BÀI ⇒ bộ đếm chuyên mục im lặng vĩnh viễn VÀ hành vi đọc bị gán nhầm sang bài đó.
     * Đo 09/09/2026 trên /rao-vat/: hiện 0 phần tử như vậy — nên đây là bẫy chưa nổ, không phải
     * lỗi đang chảy máu. Bịt vì nó rẻ và vì triệu chứng của nó là một bảng trống.
     */
    function readInfo(key) {
        if (info) {
            var attr = info.getAttribute('data-' + key.replace(/_/g, '-'));
            if (attr !== null && attr !== '') return attr;
            // Dạng cms_dev: phần tử CON mang giá trị. Vẫn nằm TRONG khối.
            var kid = info.querySelector ? info.querySelector('#' + key) : null;
            return kid ? (kid.textContent || '').trim() : '';
        }
        // Không có #page_info: đây là lối DUY NHẤT được phép tra toàn tài liệu.
        var el = document.getElementById(key);
        return el ? (el.textContent || '').trim() : '';
    }

    var articleId = parseInt(readInfo('article_id'), 10);
    var categoryId = parseInt(readInfo('category_id'), 10);

    // ── Cửa 1 ──
    var targetType, targetId;
    if (articleId > 0) { targetType = 'ARTICLE'; targetId = articleId; }
    else if (categoryId > 0) { targetType = 'CATEGORY'; targetId = categoryId; }
    else return;

    // `data-api` trên chính thẻ script được ưu tiên (luôn có); `#page_info` là bản dự phòng —
    // cùng nguồn mà portlet event_count đang dùng, và cũng đọc được cả hai dạng.
    var api = (self.getAttribute('data-api') || readInfo('public_api_url') || '').replace(/\/+$/, '');
    if (!api) return;

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ĐƯỜNG 2 — ĐẾM LƯỢT XEM TRANG CHUYÊN MỤC  (POST /v1/event-log)
    // ═══════════════════════════════════════════════════════════════════════════════════════
    //
    // ⭐ CHẠY TRƯỚC CỔNG LẤY MẪU, CÓ CHỦ Ý. `data-sample` làm thưa phép ĐO HÀNH VI, nhưng đây là
    // một BỘ ĐẾM: hạ nó xuống 0,1 thì lượt xem chuyên mục cũng tụt còn một phần mười, và không có
    // gì trên màn hình nói rằng con số đã bị chia. Hai khoá, hai ý nghĩa, không được dính nhau.
    //
    // ⛔ Trang BÀI đã do portlet `event_count` (id 36) đếm rồi. Bỏ chốt `targetType==='CATEGORY'`
    // là đếm đôi MỌI lượt xem bài của toà soạn.
    countCategoryView();

    function countCategoryView() {
        if (self.getAttribute('data-cat-view') !== '1') return;
        if (targetType !== 'CATEGORY') return;

        // Chỉ trang 1. `/xa-hoi/?page=2` là cùng một chuyên mục được cuộn tiếp, không phải một
        // lượt xem mới — đếm nó là thưởng điểm cho chuyên mục nào có nhiều trang nhất.
        // Chặn theo hướng DƯƠNG: chỉ đếm khi đây là trang gốc của chuyên mục. Bản trước chỉ
        // nhìn đúng tham số `page` trong query string, nên `?page_index=2` hay `/xa-hoi/trang-2`
        // vẫn đếm — thưởng điểm cho chuyên mục nào nhiều trang nhất.
        var pg = /[?&](?:page|p|trang|page_index)=(\d+)/i.exec(location.search);
        if (pg && parseInt(pg[1], 10) !== 1) return;
        if (/\/(?:trang|page)[-/]\d+\/?$/i.test(path)) return;

        setTimeout(function () {
            // Tab mở ngầm (mở-trong-tab-mới, khôi phục phiên) không phải một lượt đọc.
            if (document.visibilityState === 'hidden') return;

            // ⚠ DÙNG CHUNG khoá 'user_id' với portlet `event_count`, và dùng ĐÚNG bộ sinh của nó.
            // Lệch bộ sinh thì cùng một bạn đọc mang hai danh tính giữa trang bài và trang chuyên
            // mục — `count(DISTINCT anon_id)` phồng lên mà không ai biết vì sao.
            var uid = '';
            try {
                uid = localStorage.getItem('user_id') || '';
                if (!uid) {
                    uid = 'user_' + Math.random().toString(36).slice(2, 11);
                    localStorage.setItem('user_id', uid);
                }
            } catch (e) {
                // Chế độ riêng tư chặn localStorage. Vẫn đếm — bộ đếm này đo LƯỢT XEM, không đo
                // người; bỏ qua họ là ngầm giảm số của chuyên mục theo cấu hình trình duyệt.
                uid = 'user_' + Math.random().toString(36).slice(2, 11);
            }

            var headers = { 'Content-Type': 'application/json' };
            var dept = readInfo('department_id');
            if (dept) headers['x-department-id'] = dept;

            try {
                fetch(api + '/v1/event-log', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        target_id: targetId,
                        target_type: 'CATEGORY',
                        event_type: 'VIEW',
                        anon_id: uid
                        // ⛔ KHÔNG gửi sub_target_id: trên hàng ARTICLE nó CHỞ category_id, nên
                        // đặt nó ở đây làm hỏng chính phép thống kê "bài theo chuyên mục".
                    })
                })['catch'](function () {});
            } catch (e) { /* rời trang giữa chừng */ }
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ĐƯỜNG 1 — ĐO HÀNH VI  (POST /v1/page-engagement)
    // ═══════════════════════════════════════════════════════════════════════════════════════

    var sample = parseFloat(self.getAttribute('data-sample'));
    if (isNaN(sample)) sample = 1;
    if (sample < 1 && Math.random() >= sample) return;

    // ── Trạng thái tích luỹ ─────────────────────────────────────────────────────────────
    var COLS = 20, ROWS = 50, DECILES = 10;
    var attention = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var clicks = {};
    var maxDepth = 0, engaged = 0, rage = 0, dead = 0, sent = false;
    var lastInput = Date.now();
    var lastCell = -1, lastCellAt = 0, sameCell = 0;

    function docHeight() {
        var b = document.body, e = document.documentElement;
        return Math.max(b ? b.scrollHeight : 0, e ? e.scrollHeight : 0, 1);
    }

    function markInput() { lastInput = Date.now(); }

    // ── Chú ý: 1 Hz, KHÔNG rAF, KHÔNG mousemove ────────────────────────────────────────
    // Một `setInterval` mỗi giây là thứ rẻ nhất trả lời được "người đọc đang nhìn đoạn nào".
    // rAF chạy 60 lần/giây để trả lời cùng câu hỏi, còn theo dõi mousemove thì vừa tốn vừa
    // dựng lại được quỹ đạo con trỏ — thứ bảng dữ liệu này cố ý không chứa.
    var timer = setInterval(function () {
        if (document.visibilityState !== 'visible') return;
        if (Date.now() - lastInput > 30000) return;   // tab mở nhưng người đã bỏ đi
        engaged++;
        var h = docHeight();
        var centre = (window.pageYOffset || 0) + (window.innerHeight || 0) / 2;
        var i = Math.floor((centre / h) * DECILES);
        if (i < 0) i = 0; if (i >= DECILES) i = DECILES - 1;
        if (attention[i] < 255) attention[i]++;
    }, 1000);

    // ── Độ sâu cuộn: passive + tiết lưu 200 ms ─────────────────────────────────────────
    var scrollAt = 0;
    function onScroll() {
        markInput();
        var now = Date.now();
        if (now - scrollAt < 200) return;
        scrollAt = now;
        var h = docHeight();
        var d = Math.round((((window.pageYOffset || 0) + (window.innerHeight || 0)) / h) * 100);
        if (d > maxDepth) maxDepth = d > 100 ? 100 : d;
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('keydown', markInput, { passive: true });
    addEventListener('touchstart', markInput, { passive: true });

    // ── Nhấp/chạm: MỘT listener uỷ quyền ở pha capture ─────────────────────────────────
    // Pha capture để không bị một handler nào đó gọi stopPropagation làm mất. Chạm phát ra
    // `click`, nên "touch heatmap" chính là cột `device` — 0 byte phát sinh.
    addEventListener('click', function (ev) {
        markInput();
        var h = docHeight();
        var x = ev.pageX, y = ev.pageY;
        if (typeof x !== 'number' || typeof y !== 'number') return;
        var w = document.documentElement.clientWidth || 1;
        var col = Math.floor((x / w) * COLS);
        var row = Math.floor((y / h) * ROWS);
        if (col < 0) col = 0; if (col >= COLS) col = COLS - 1;
        if (row < 0) row = 0; if (row >= ROWS) row = ROWS - 1;
        var cell = row * COLS + col;

        clicks[cell] = (clicks[cell] || 0) + 1;

        var now = Date.now();
        if (cell === lastCell && now - lastCellAt < 1000) {
            sameCell++;
            if (sameCell === 3) rage++;   // đúng MỘT lần cho mỗi cụm, không cộng dồn mãi
        } else {
            sameCell = 1;
        }
        lastCell = cell; lastCellAt = now;

        var t = ev.target;
        if (t && t.closest && !t.closest('a,button,input,select,textarea,label,[role=button],[onclick]')) dead++;
    }, true);

    // ── Gửi ─────────────────────────────────────────────────────────────────────────────
    function device() {
        var w = window.innerWidth || 0;
        if (w > 0 && w < 768) return 'm';
        if (w >= 768 && w < 1024) return 't';
        return 'd';
    }

    /**
     * Nguồn vào, gói trong ĐÚNG MỘT KÝ TỰ.
     * ⚠ `document.referrer` đầy đủ là URL trang trước của một người cụ thể. Nó không rời khỏi
     * trình duyệt; chỉ phân loại của nó thì có.
     */
    function referrerKind() {
        var r = document.referrer;
        if (!r) return 'd';
        var host = '';
        try { host = new URL(r).hostname; } catch (e) { return 'o'; }
        if (host === location.hostname) return 'i';
        if (/(^|\.)(google|bing|yahoo|duckduckgo|coccoc|yandex|baidu)\./i.test(host)) return 's';
        return 'o';
    }

    /** Giữ 24 ô nặng nhất. Server cũng cắt lần nữa — đây chỉ để beacon khỏi phình. */
    function topClicks() {
        var keys = Object.keys(clicks);
        if (keys.length <= 24) return clicks;
        keys.sort(function (a, b) { return clicks[b] - clicks[a] || (a < b ? -1 : 1); });
        var out = {};
        for (var i = 0; i < 24; i++) out[keys[i]] = clicks[keys[i]];
        return out;
    }

    function send() {
        if (sent) return;
        sent = true;
        clearInterval(timer);

        var payload = {
            target_type: targetType,
            target_id: targetId,
            // Chỉ có nghĩa trên hàng ARTICLE ("bài này thuộc chuyên mục nào"). Trên hàng
            // CATEGORY nó chỉ lặp lại target_id, khiến `WHERE sub_target_id = X` gộp nhầm lượt
            // xem TRANG chuyên mục vào hành vi đọc BÀI của chuyên mục đó.
            sub_target_id: (targetType === 'ARTICLE' && categoryId > 0) ? categoryId : null,
            device: device(),
            vw: Math.round((window.innerWidth || 0) / 10),
            vh: Math.round((window.innerHeight || 0) / 10),
            page_h: docHeight(),
            engaged_sec: engaged > 1800 ? 1800 : engaged,
            max_depth: maxDepth,
            attention: attention,
            clicks: topClicks(),
            rage: rage,
            dead: dead,
            referrer_kind: referrerKind()
        };

        // `text/plain` là CỐ Ý: nó biến request thành "CORS simple", nên trình duyệt gửi thẳng
        // không cần preflight — và một beacon lúc rời trang thì không còn thời gian cho hai
        // vòng request. Cùng khuôn với site-go/internal/report.
        var url = api + '/v1/page-engagement';
        var body = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
        if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return;
        try {
            fetch(url, { method: 'POST', body: body, keepalive: true,
                headers: { 'Content-Type': 'text/plain' } })['catch'](function () {});
        } catch (e) { /* rời trang giữa chừng — không có gì để cứu, và cũng không cần */ }
    }

    // ⛔ KHÔNG dùng `beforeunload`: chỉ cần đăng ký nó là trang mất quyền vào bfcache, tức là
    // đổi hiệu năng điều hướng của bạn đọc để lấy một con số đo lường. `pagehide` +
    // `visibilitychange` phủ đủ mọi đường rời trang, kể cả chuyển sang app khác trên di động.
    addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') send();
    });
    addEventListener('pagehide', send);

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ⛔ GHI PHIÊN (rrweb): CỐ Ý KHÔNG CÓ TRONG BẢN CỦA THÁI NGUYÊN
    // ═══════════════════════════════════════════════════════════════════════════════════════
    //
    // Bản `tcanm-assets/common/engage.js` có móc nạp rrweb; bản này thì không, và đó là một
    // QUYẾT ĐỊNH chứ không phải một thiếu sót lúc chép tệp.
    //
    // Ba lý do, xếp theo sức nặng:
    //
    //  1. ⛔ CỔNG CỦA CON NGƯỜI CHƯA MỞ. Hồ sơ DPIA (NĐ 13/2023 Điều 24) còn là bản thảo chưa ký
    //     và trang thông báo riêng tư chưa đăng. Ghi phiên chép lại CÂY DOM, nên ảnh chụp đầu
    //     tiên serialise cả tên và nội dung bình luận của những ĐỘC GIẢ KHÁC — họ không phải chủ
    //     thể của phiên đó và không có cách nào biết. Đây là báo Đảng cấp tỉnh thuộc sở hữu nhà
    //     nước; đó là rủi ro pháp lý, không phải rủi ro kỹ thuật.
    //
    //  2. Mã không bật được thì là mã chết. `data-rec="0"` ở cả 90 layout, và cổng thật nằm ở
    //     server (`engagement_settings.record_enabled`, mặc định false). Giữ lại nghĩa là mọi bạn
    //     đọc tải ~1,2 KB cho một nhánh không thể chạy.
    //
    //  3. Nó vừa đẩy tệp vượt ngân sách byte (5.361 B > 5.120 B). Cổng đó tự viết sẵn câu trả
    //     lời: "vượt trần lần nữa thì TÁCH TỆP, đừng nâng trần."
    //
    // ⇒ Ngày DPIA được ký, hãy thêm lại thành MỘT TỆP RIÊNG chỉ nạp khi trúng mẫu — đừng nhét
    //   ngược vào đây. Bản đầy đủ còn nguyên trong `tcanm-assets` để chép sang.

    } // end boot
})();
