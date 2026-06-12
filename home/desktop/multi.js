const publicApiUrlEl = document.getElementById('public_api_url');
const cdnUrlEl = document.getElementById('cdn_url');

const publicApiUrl = publicApiUrlEl ? publicApiUrlEl.innerHTML : '';
const cdnUrl = cdnUrlEl ? cdnUrlEl.innerHTML : '';


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

(function () {
    const API_BASE = publicApiUrl || 'https://api-public.baothainguyen.vn';
    const CDN_BASE = cdnUrl || 'https://cdn.baothainguyen.vn';
    const CHIP_ACTIVE = ['t:bg-[#30A14A]', 't:text-white', 't:hover:text-white!'];
    const CHIP_INACTIVE = ['t:bg-white', 't:hover:text-inherit'];

    let currentCateId = null;
    let chips = [];
    let articleSwiper = null;

    function setChipActive(chip, active) {
        chip.classList.remove(...(active ? CHIP_INACTIVE : CHIP_ACTIVE));
        chip.classList.add(...(active ? CHIP_ACTIVE : CHIP_INACTIVE));
    }

    function articleImg(article) {
        const fileUrl =
            (article.avatar1 && article.avatar1.file_url) ||
            (article.files && article.files[0] && article.files[0].file_url) ||
            '';
        if (!fileUrl) return '';
        return JoinUrl(CDN_BASE, fileUrl) + '?width=1200&height=-&type=resize';
    }

    function renderArticles(articles) {
        return articles
            .map((a) => {
                const href = escapeHtml(buildArticleHref(a.slug));
                const title = escapeHtml(a.title);
                const img = escapeHtml(articleImg(a));
                return `
                <div class="swiper-slide">
                    <div class="t:relative t:rounded-xl t:overflow-hidden">
                        <figure class="img-block">
                            <a href="${href}">
                                <img src="${img}" alt="${title}" loading="lazy" />
                            </a>
                        </figure>
                        <div
                            class="t:absolute t:bottom-0 t:left-0 t:right-0 t:p-4 t:md:p-6 t:pt-16 t:bg-linear-to-t t:from-[#0B0B11E6] t:via-[#0B0B1199] t:to-transparent"
                        >
                            <h3 class="title l2 t:text-white! t:font-bold">
                                <a href="${href}">${title}</a>
                            </h3>
                        </div>
                    </div>
                </div>`;
            })
            .join('');
    }

    async function fetchArticles(cateId) {
        const url =
            JoinUrl(API_BASE, 'v1/category', String(cateId), 'articles') +
            '?page=1&limit=5';
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        return Array.isArray(json && json.data) ? json.data : [];
    }

    async function changeCategory(cateId, chip) {
        if (cateId === currentCateId) return;
        currentCateId = cateId;
        chips.forEach((c) => setChipActive(c, c === chip));

        try {
            const articles = await fetchArticles(cateId);
            if (cateId !== currentCateId) return;
            if (!articles.length || !articleSwiper) return;

            const wrapper = articleSwiper.querySelector('.swiper-wrapper');
            if (!wrapper) return;

            const sm = window.SwiperManager;
            if (sm) sm.destroy(articleSwiper);
            wrapper.innerHTML = renderArticles(articles);
            if (sm) sm.init(articleSwiper);
        } catch (err) {
            console.error('[multimedia] load failed:', err);
        }
    }

    function init() {
        const section = document.querySelector('.home-multimedia-hero-section');
        if (!section) return;

        // Sub-category chips are <a data-cate-id>; the parent <h2 data-cate-id> is excluded.
        chips = Array.from(section.querySelectorAll('a[data-cate-id]'));
        if (!chips.length) return;

        articleSwiper = Array.from(section.querySelectorAll('[data-swiper]')).find((el) =>
            el.querySelector('.swiper-pagination')
        );

        // Default active = "Multimedia" (parent): no sub-category chip is pre-selected,
        // so the existing static articles stay until the user picks a chuyên mục con.
        chips.forEach((chip) => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                changeCategory(chip.dataset.cateId, chip);
            });
        });

        // Main category ("Multimedia"): load its articles on click without marking any
        // chip active (passing chip = null deactivates all chips in changeCategory).
        const mainCate = section.querySelector('h2[data-cate-id]');
        if (mainCate) {
            const mainLink = mainCate.querySelector('a') || mainCate;
            mainLink.addEventListener('click', (e) => {
                e.preventDefault();
                changeCategory(mainCate.dataset.cateId, null);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
