/* render.js — Logic "Xem thêm" cho portlet "Thông tin liên quan" (lanh_dao_thong_tin_lien_quan).
 *
 * Khi bấm nút "Xem thêm": gọi API public lấy 8 bài tiếp theo cùng chuyên mục
 * (bỏ qua các bài đã render sẵn server-side) rồi chèn thêm vào danh sách.
 *
 * Tham khảo pattern từ client_example.js: đọc config từ DOM, JoinUrl, escapeHtml,
 * fetch + dựng HTML từ string template.
 */
(function () {
    'use strict';

    // ---- Đọc config từ DOM (giống client_example.js) ----
    function readEl(id) {
        var el = document.getElementById(id);
        return el ? el.innerHTML.trim() : '';
    }
    var publicApiUrl = readEl('public_api_url');
    var cdnUrl = readEl('cdn_url');

    var section = document.querySelector('[data-portlet="lanh_dao_thong_tin_lien_quan"]');
    if (!section) return;

    var listEl = section.querySelector('[data-related-list]');
    var moreBtn = section.querySelector('[data-related-more]');
    if (!listEl || !moreBtn) return;

    // Chuyên mục + trạng thái phân trang (render.ejs đổ ra qua data-attr)
    var categoryId = section.getAttribute('data-category-id') || '';
    var pageSize = parseInt(section.getAttribute('data-page-size') || '8', 10) || 8;
    var loaded = parseInt(section.getAttribute('data-loaded') || '0', 10) || 0; // số bài đã hiển thị = offset bắt đầu

    // Copy NGUYÊN class của 2 grid đã render → mỗi batch tái tạo đúng cặp block như UI gốc:
    //   - block trên = class grid 1 (…t:pc:pb-8)
    //   - block dưới = class grid 2 (…t:pc:pt-8)
    // Lấy 1 lần lúc init nên không bị cộng dồn class.
    var existingGrids = listEl.querySelectorAll(':scope > div');
    var gridClassTop = existingGrids.length ? existingGrids[0].className : '';
    var gridClassBottom = existingGrids.length > 1 ? existingGrids[existingGrids.length - 1].className : gridClassTop;
    var cardClass = 't:md:max-pc:px-6 t:pc:px-4';
    var blockSize = 4; // mỗi block 4 card (PC: grid 4 cột) → batch 8 bài = 2 block
    // Khoảng cách phía trên cho block đầu của mỗi batch (PC) → tách với phần phía trên, không dính sát.
    var appendGridExtra = 't:pc:mt-8';

    // ---- Helpers (mirror client_example.js) ----
    function JoinUrl() {
        var args = Array.prototype.slice.call(arguments);
        return args.map(function (part, index) {
            part = String(part == null ? '' : part);
            return index === 0
                ? part.trim().replace(/\/+$/, '')
                : part.trim().replace(/^\/+|\/+$/g, '');
        }).filter(function (part) { return part.length > 0; }).join('/');
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

    function buildArticleHref(slug) {
        if (!slug) return '#';
        return slug.charAt(0) === '/' ? slug : '/' + slug;
    }

    // API có thể trả field rút gọn ('slug','title') hoặc đầy đủ ('article_slug',...) như CATE_ARTICLES.
    function pick(obj) {
        for (var i = 1; i < arguments.length; i++) {
            if (obj && obj[arguments[i]]) return obj[arguments[i]];
        }
        return '';
    }

    function resolveImage(article) {
        // API trả avatar dạng object { file_url } (avatar1/avatar2);
        // vẫn hỗ trợ dạng phẳng avatar1_url/avatar2_url cho chắc.
        var raw = pick(article, 'avatar1_url', 'avatar2_url');
        if (!raw && article) {
            if (article.avatar1 && article.avatar1.file_url) raw = article.avatar1.file_url;
            else if (article.avatar2 && article.avatar2.file_url) raw = article.avatar2.file_url;
        }
        if (!raw) return '';
        // URL đã đầy đủ thì giữ nguyên, ngược lại ghép CDN (giống getImageUrl phía server).
        if (/^https?:\/\//.test(raw) || raw.indexOf('//') === 0) return raw;
        return JoinUrl(cdnUrl, 'w600', raw);
    }

    function renderCard(article) {
        var href = buildArticleHref(pick(article, 'article_slug', 'slug'));
        var title = escapeHtml(pick(article, 'article_brief_title', 'article_title', 'title'));
        var image = resolveImage(article);
        return '' +
            '<div class="' + cardClass + '">' +
                '<figure class="img-block t:rounded t:overflow-hidden">' +
                    '<a href="' + href + '" class="t:block">' +
                        '<img src="' + image + '" alt="' + title + '" />' +
                    '</a>' +
                '</figure>' +
                '<h3 class="title l3 t:mt-2!">' +
                    '<a href="' + href + '">' + title + '</a>' +
                '</h3>' +
            '</div>';
    }

    // Endpoint lấy thêm bài cùng chuyên mục: /v1/category/{id}/articles?offset=&limit=
    function buildEndpoint() {
        return JoinUrl(publicApiUrl, 'v1/category', categoryId, 'articles') +
            '?offset=' + loaded + '&limit=' + pageSize;
    }

    var busy = false;
    var idleLabel = moreBtn.innerHTML;

    function setBusy(state) {
        busy = state;
        if (state) {
            moreBtn.setAttribute('aria-busy', 'true');
            moreBtn.style.pointerEvents = 'none';
            moreBtn.style.opacity = '0.6';
            moreBtn.innerHTML = 'Đang tải...';
        } else {
            moreBtn.removeAttribute('aria-busy');
            moreBtn.style.pointerEvents = '';
            moreBtn.style.opacity = '';
            moreBtn.innerHTML = idleLabel;
        }
    }

    async function loadMore() {
        if (busy || !categoryId) return;
        setBusy(true);
        try {
            var res = await fetch(buildEndpoint());
            if (!res.ok) throw new Error('HTTP ' + res.status);

            var json = await res.json();
            var data = json && Array.isArray(json.data)
                ? json.data
                : (Array.isArray(json) ? json : []);

            var items = data.filter(function (it) {
                return it && typeof it === 'object' && !Array.isArray(it) && (it.article_slug || it.slug);
            });

            if (items.length) {
                // Chia batch thành các block 4 card, lặp lại cặp class trên/dưới như UI gốc.
                for (var c = 0; c < items.length; c += blockSize) {
                    var chunk = items.slice(c, c + blockSize);
                    var blockIndex = c / blockSize;
                    var cls = (blockIndex % 2 === 0) ? gridClassTop : gridClassBottom;
                    if (blockIndex === 0 && appendGridExtra) cls += ' ' + appendGridExtra;
                    var grid = document.createElement('div');
                    grid.className = cls;
                    grid.innerHTML = chunk.map(renderCard).join('');
                    listEl.appendChild(grid);
                }

                loaded += items.length;
                section.setAttribute('data-loaded', String(loaded));
            }

            // Hết bài → ẩn nút. Ưu tiên meta.total; fallback theo số item trả về.
            var total = json && json.meta && typeof json.meta.total === 'number' ? json.meta.total : null;
            var hasMore = total != null ? loaded < total : items.length === pageSize;
            if (!hasMore) {
                moreBtn.parentElement.style.display = 'none';
            }
        } catch (err) {
            console.error('Không tải được bài viết liên quan:', err);
        } finally {
            setBusy(false);
        }
    }

    moreBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loadMore();
    });
})();
