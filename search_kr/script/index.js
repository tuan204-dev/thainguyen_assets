(function () {
    var pageInfo = document.getElementById('page_info');
    var cfg = function (name) {
        var v = pageInfo ? (pageInfo.getAttribute('data-' + name) || '') : '';
        return v.trim().replace(/\/+$/, '');
    };
    var PUBLIC_API_URL = cfg('public-api-url');
    var CDN_URL = cfg('cdn-url');
    var BASE_IMAGE_URL = CDN_URL + '/w300/';
    var LIMIT = 10;

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function normalizeHref(slug) {
        var s = String(slug || '').trim();
        if (!s) return '#';
        if (/^https?:\/\//i.test(s)) return s;
        return '/' + s.replace(/^\/+/, '');
    }

    function getDateRange(fromdate) {
        var daysMap = { '2': 1, '3': 7, '4': 30, '5': 365 };
        if (!(fromdate in daysMap)) return {};
        var now = new Date();
        var end_date = now.toISOString().slice(0, 10);
        var start_date = new Date(now.getTime() - daysMap[fromdate] * 86400000).toISOString().slice(0, 10);
        return { start_date: start_date, end_date: end_date };
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function formatDate(iso) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' | ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
    }

    function renderArticle(a) {
        var href = normalizeHref(a.slug);
        var img = a.avatar1_url ? (BASE_IMAGE_URL + a.avatar1_url) : '';
        var title = escapeHtml(a.title);
        return '<li class="t:py-4 t:flow-root">' +
            '<figure class="img-block t:float-left lg t:mr-2 t:max-[992px]:w-50!">' +
            '<a href="' + href + '"><img src="' + img + '" alt="' + title + '" loading="lazy" /></a>' +
            '</figure>' +
            '<h3 class="title l3 t:mt-0!"><a href="' + href + '">' + title + '</a></h3>' +
            '<p class="t:text-xs t:text-[#667085] t:mt-1 t:flex t:items-center t:gap-x-1">' +
            '<i class="material-symbols--calendar-month-rounded"></i> ' + formatDate(a.publish_date) +
            '</p>' +
            '<p class="desc">' + escapeHtml(a.desc) + '</p>' +
            '</li>';
    }

    function renderPagination(el, page, totalPages, onClick) {
        if (!el) return;
        if (totalPages <= 1) { el.innerHTML = ''; return; }
        var pages = [];
        var delta = 2;
        var range = [];
        for (var i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) range.push(i);
        if (range.length && range[0] > 2) { pages.push(1, '...'); } else { pages.push(1); }
        pages = pages.concat(range);
        if (range.length && range[range.length - 1] < totalPages - 1) { pages.push('...', totalPages); }
        else if (totalPages > 1) { pages.push(totalPages); }

        var numBtns = pages.map(function (p) {
            if (p === '...') return '<button type="button" disabled>...</button>';
            return '<button type="button" data-page="' + p + '"' + (p === page ? ' aria-current="page"' : '') + '>' + p + '</button>';
        }).join('');

        el.innerHTML =
            '<button type="button" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + ' aria-label="Trang trước"><i class="material-symbols--chevron-left-rounded"></i></button>' +
            numBtns +
            '<button type="button" data-page="' + (page + 1) + '"' + (page >= totalPages ? ' disabled' : '') + ' aria-label="Trang sau"><i class="material-symbols--chevron-right-rounded"></i></button>';

        Array.prototype.forEach.call(el.querySelectorAll('button[data-page]'), function (b) {
            b.addEventListener('click', function () {
                var p = parseInt(b.getAttribute('data-page'), 10);
                if (p >= 1 && p <= totalPages) onClick(p);
            });
        });
    }

    async function doSearch(form, page) {
        page = page || 1;
        var fd = new FormData(form);
        var keyword = (fd.get('key') || '').trim();
        var fromdate = fd.get('fromdate') || '1';
        var searchmore = fd.get('searchmore') || '0';
        var cate = fd.get('cate') || '';
        var latest = fd.get('latest') || 'off';

        var countEl = document.getElementById('search-result-count');
        var listEl = document.getElementById('search-article-list');
        var pagEl = document.getElementById('search-pagination');
        if (!listEl) return;

        var params = new URLSearchParams();
        params.set('search', keyword);
        params.set('page', page);
        params.set('limit', LIMIT);
        if (searchmore === '1') params.set('query_field', 'title');
        else if (searchmore === '2') params.set('query_field', 'content');
        else if (searchmore === '3') params.set('query_field', 'description');
        if (cate) params.set('category_ids', cate);
        var dr = getDateRange(fromdate);
        if (dr.start_date) params.set('start_date', dr.start_date);
        if (dr.end_date) params.set('end_date', dr.end_date);
        if (latest === 'on') { params.set('sortBy', 'publish_date'); params.set('sortOrder', 'DESC'); }

        if (countEl) { countEl.style.display = 'none'; countEl.innerHTML = ''; }
        listEl.innerHTML = '<li class="t:py-8 t:text-center t:text-[#667085]">Đang tìm kiếm...</li>';
        if (pagEl) pagEl.innerHTML = '';

        try {
            var res = await fetch(PUBLIC_API_URL + '/v1/article?' + params.toString());
            var json = await res.json();
            if (!json || !json.success) throw new Error('API error');
            var data = json.data || [];
            var meta = json.meta || {};
            if (!data.length) {
                if (countEl) { countEl.style.display = ''; countEl.innerHTML = 'Không tìm thấy kết quả nào cho từ khóa <strong>' + escapeHtml(keyword) + '</strong>'; }
                listEl.innerHTML = '';
                if (pagEl) pagEl.innerHTML = '';
                return;
            }
            if (countEl) {
                countEl.style.display = '';
                var total = meta.total != null ? meta.total : data.length;
                countEl.innerHTML = 'Tìm thấy <strong>' + total + '</strong> kết quả cho từ khóa <strong>' + escapeHtml(keyword) + '</strong>';
            }
            listEl.innerHTML = data.map(renderArticle).join('');
            var totalPages = meta.totalPages || 1;
            var curPage = meta.page || page;
            renderPagination(pagEl, curPage, totalPages, function (p) {
                var u = new URLSearchParams(window.location.search);
                u.set('page', p);
                history.pushState(null, '', '?' + u.toString());
                doSearch(form, p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        } catch (e) {
            listEl.innerHTML = '<li class="t:py-8 t:text-center t:text-[#C0392B]">Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.</li>';
            if (pagEl) pagEl.innerHTML = '';
        }
    }

    function showNoQuery() {
        var countEl = document.getElementById('search-result-count');
        var listEl = document.getElementById('search-article-list');
        var pagEl = document.getElementById('search-pagination');
        if (countEl) { countEl.style.display = 'none'; countEl.innerHTML = ''; }
        if (listEl) listEl.innerHTML = '<li class="t:py-8 t:text-center t:text-[#667085]">Nhập từ khóa để tìm kiếm.</li>';
        if (pagEl) pagEl.innerHTML = '';
    }

    function populateFromUrl(form) {
        var p = new URLSearchParams(window.location.search);
        function set(name, val) {
            var el = form.querySelector('[name="' + name + '"]');
            if (el != null && val != null) el.value = val;
        }
        set('key', p.get('key') || '');
        if (p.has('fromdate')) set('fromdate', p.get('fromdate'));
        if (p.has('searchmore')) set('searchmore', p.get('searchmore'));
        if (p.has('cate')) set('cate', p.get('cate'));
        var latest = p.get('latest');
        if (latest) {
            var r = form.querySelector('[name="latest"][value="' + latest + '"]');
            if (r) r.checked = true;
        }
        return (p.get('key') || '').trim();
    }

    function initSearch() {
        var form = document.getElementById('search-form');
        if (!form) return;
        var keyword = populateFromUrl(form);
        if (!keyword) {
            showNoQuery();
        } else {
            var page = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
            doSearch(form, page || 1);
        }
        form.addEventListener('submit', function (e) {
            var el = form.querySelector('[name="key"]');
            var kw = (el && el.value ? el.value : '').trim();
            if (!kw) { e.preventDefault(); showNoQuery(); }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSearch);
    else initSearch();
})();
