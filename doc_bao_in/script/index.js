import SwiperManager from "../../common/swiper.js";

/**
 * Chuyên mục báo in. Mỗi chuyên mục = 1 hàng swiper ở cột phải.
 *
 * ⚠ Danh sách này phải khớp với hai khối markup TĨNH trong index.html:
 *    - nav chuyên mục ở cột trái (.baoin-catenav)
 *    - các <section data-cate="..."> ở cột phải
 * Markup để tĩnh (không sinh bằng JS) để trang vẫn có điều hướng + tiêu đề
 * khối khi JS chưa chạy; JS chỉ đổ slide vào .swiper-wrapper.
 */
const categories = [
    { key: "hang-ngay", title: "Báo Thái Nguyên hằng ngày", href: "/doc-bao-in/" },
    {
        key: "van-nghe",
        title: "Văn nghệ Thái Nguyên",
        href: "/doc-bao-in/van-nghe-thai-nguyen/",
    },
    {
        key: "mien-nui",
        title: "Thái Nguyên miền núi - vùng cao",
        href: "/doc-bao-in/thai-nguyen-mien-nui---vung-cao/",
    },
];

const editions = [
    {
        cate: "hang-ngay",
        title: "Số 326 ngày 24/5/2026",
        time: "06:00, 24/05/2026",
        href: "/doc-bao-in/202605/so-326-ngay-2452026-4ab3811/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_326_20260523194607.jpg?width=400&height=-&type=resize",
        /* Số mới nhất được xem trực tiếp ở đầu cột phải. File PDF dùng chung
           với doc_bao_in_chi_tiet — đây là dữ liệu mẫu, giống như ảnh bìa.
           Giải theo import.meta.url để chạy đúng cả ở repo lẫn khi phục vụ
           từ R2 (lúc đó trang nằm ở domain khác với file script). */
        pdf: new URL(
            "../../doc_bao_in_chi_tiet/data/20260426193157so_299_ngay_27-4.pdf",
            import.meta.url,
        ).href,
    },
    {
        cate: "hang-ngay",
        title: "Số 325 ngày 23/5/2026",
        time: "06:02, 23/05/2026",
        href: "/doc-bao-in/202605/so-325-ngay-2352026-27017e7/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_325_20260522211242.jpg?width=400&height=-&type=resize",
    },
    {
        cate: "hang-ngay",
        title: "Số 324 ngày 22/5/2026",
        time: "06:00, 22/05/2026",
        href: "/doc-bao-in/202605/so-324-ngay-2252026-cc23e9f/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_324_20260522002659.jpg?width=400&height=-&type=resize",
    },
    {
        cate: "hang-ngay",
        title: "Số 323 ngày 21/5/2026",
        time: "05:59, 21/05/2026",
        href: "/doc-bao-in/202605/so-323-ngay-2152026-a6f31ba/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_323_20260520211816.jpg?width=400&height=-&type=resize",
    },
    {
        cate: "hang-ngay",
        title: "Số 322 ngày 20/5/2026",
        time: "05:59, 20/05/2026",
        href: "/doc-bao-in/202605/so-322-ngay-2052026-6930d14/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_322_20260519194029.jpg?width=400&height=-&type=resize",
    },
    {
        cate: "hang-ngay",
        title: "Số 321 ngày 19/5/2026",
        time: "06:00, 19/05/2026",
        href: "/doc-bao-in/202605/so-321-ngay-1952026-80036f6/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_321_20260518230306.jpg?width=400&height=-&type=resize",
    },
    {
        cate: "hang-ngay",
        title: "Số 320 ngày 18/5/2026",
        time: "06:00, 18/05/2026",
        href: "/doc-bao-in/202605/so-320-ngay-1852026-8554f37/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_320_20260517194335.jpg?width=400&height=-&type=resize",
    },
    {
        cate: "hang-ngay",
        title: "Số 319 ngày 17/5/2026",
        time: "06:00, 17/05/2026",
        href: "/doc-bao-in/202605/so-319-ngay-1752026-d2f7765/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_319_20260516204454.jpg?width=400&height=-&type=resize",
    },
    {
        cate: "mien-nui",
        title: "Thái Nguyên: Miền núi - Vùng cao số 15",
        time: "09:32, 17/05/2026",
        href: "/doc-bao-in/thai-nguyen-mien-nui---vung-cao/202605/thai-nguyen-mien-nui-vung-cao-so-15-e994c11/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/trang_1-12_20260514154928.jpg?width=400&height=-&type=resize",
    },
];

/* ── Dữ liệu mẫu cho phần còn lại của mỗi chuyên mục ──────────────────
 * Ảnh bìa tái sử dụng từ các số đã có (giống cách trang cũ vẫn làm).
 */

const coverPool = editions.map((item) => item.cover);
const pickCover = (index) => coverPool[index % coverPool.length];

const pad = (n) => String(n).padStart(2, "0");

function fillDaily(count) {
    const items = [];
    const date = new Date("2026-05-16T06:00:00+07:00");

    for (let i = 0, issue = 318; i < count; i += 1, issue -= 1) {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();

        items.push({
            cate: "hang-ngay",
            title: `Số ${issue} ngày ${d}/${m}/${y}`,
            time: `06:00, ${pad(d)}/${pad(m)}/${y}`,
            href: `/doc-bao-in/${y}${pad(m)}/so-${issue}-ngay-${d}${m}${y}/`,
            cover: pickCover(i + 3),
        });

        date.setDate(date.getDate() - 1);
    }

    return items;
}

function fillWeekly(cate, label, slug, count, startIssue, startDate, stepDays) {
    const items = [];
    const date = new Date(startDate);

    for (let i = 0, issue = startIssue; i < count && issue >= 1; i += 1, issue -= 1) {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();

        items.push({
            cate,
            title: `${label} số ${issue}`,
            time: `08:00, ${pad(d)}/${pad(m)}/${y}`,
            href: `/doc-bao-in/${slug}/${y}${pad(m)}/${slug}-so-${issue}/`,
            cover: pickCover(i + 5),
        });

        date.setDate(date.getDate() - stepDays);
    }

    return items;
}

editions.push(
    ...fillDaily(36),
    ...fillWeekly(
        "van-nghe",
        "Văn nghệ Thái Nguyên",
        "van-nghe-thai-nguyen",
        26,
        42,
        "2026-05-22T08:00:00+07:00",
        7,
    ),
    ...fillWeekly(
        "mien-nui",
        "Thái Nguyên miền núi - vùng cao",
        "thai-nguyen-mien-nui---vung-cao",
        19,
        14,
        "2026-04-17T08:00:00+07:00",
        30,
    ),
);

/**
 * Đổ dữ liệu số mới nhất vào khối xem PDF ở đầu cột phải.
 * script/epaper.js đọc data-pdf trên #baoin-viewer để biết nạp file nào.
 */
function renderLatest() {
    const latest = editions[0];
    const viewer = document.getElementById("baoin-viewer");
    if (!latest || !viewer) return;

    const meta = document.getElementById("baoin-latest-meta");
    if (meta) meta.textContent = `${latest.title} · ${latest.time}`;

    const link = document.getElementById("baoin-latest-link");
    if (link) link.href = latest.href;

    const posterImg = document.getElementById("baoin-viewer-poster-img");
    if (posterImg) {
        posterImg.src = latest.cover;
        posterImg.alt = latest.title;
    }

    if (latest.pdf) viewer.setAttribute("data-pdf", latest.pdf);
}

function cardHTML(item) {
    return `
      <article class="t:group t:flex t:h-full t:flex-col">
        <div class="t:mb-3 t:flex t:items-start t:gap-x-3">
          <span class="t:mt-0.5 t:h-9 t:w-1 t:shrink-0 t:bg-[#935F25]" aria-hidden="true"></span>
          <div class="t:min-w-0 t:flex-1">
            <h3 class="title l2 t:mt-0!">
              <a href="${item.href}">${item.title}</a>
            </h3>
            <p class="desc">${item.time}</p>
          </div>
        </div>
        <a href="${item.href}"
          class="t:group/book t:mt-auto t:flex t:aspect-[210/297] t:items-center t:justify-center t:border t:border-[#CFCFCF] t:bg-white t:p-[7%] t:transition t:duration-200 t:[perspective:1200px] t:hover:border-[#935F25] t:hover:shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
          <span class="t:relative t:block t:h-full t:w-full t:[transform-style:preserve-3d]">
            <span aria-hidden="true"
              class="t:absolute t:inset-y-[1.5%] t:left-[27%] t:right-[1%] t:rounded-r-md t:bg-white t:opacity-0 t:shadow-[7px_7px_8px_rgba(0,0,0,0.12)] t:transition-all t:duration-300 t:ease-out t:group-hover/book:left-[42%] t:group-hover/book:opacity-100">
              <img src="${item.cover}" alt="" loading="lazy"
                class="t:h-full t:w-full t:rounded-r-md t:object-cover t:object-right t:opacity-20 t:blur-[2px] t:grayscale" />
              <span class="t:absolute t:inset-0 t:bg-linear-to-r t:from-black/12 t:via-white/75 t:to-white/85"></span>
            </span>
            <span aria-hidden="true"
              class="t:absolute t:inset-y-0 t:left-0 t:z-20 t:w-[3.5%] t:bg-linear-to-r t:from-black/20 t:via-white/20 t:to-transparent t:opacity-80 t:transition-transform t:duration-300 t:group-hover/book:translate-x-[2%]"></span>
            <img src="${item.cover}" alt="${item.title}" loading="lazy"
              class="t:relative t:z-10 t:h-full t:w-full t:origin-left t:rounded-md t:object-contain t:shadow-[7px_7px_8px_rgba(0,0,0,0.14)] t:transition-transform t:duration-300 t:ease-out t:[backface-visibility:hidden] t:group-hover/book:[transform:translateX(-1.5%)_rotateY(-34deg)_scaleX(.62)]" />
          </span>
        </a>
      </article>
    `;
}

/* ── Tải thêm khi vuốt tới cuối hàng ────────────────────────────────── */

/** Số ấn phẩm dựng sẵn cho mỗi hàng, và số nạp thêm mỗi lượt. */
const PAGE_SIZE = 8;

/** Nạp trước khi còn cách cuối bấy nhiêu slide, để không bị khựng. */
const PREFETCH_MARGIN = 2;

/** Chờ quá lâu mới hiện slide "đang tải" — tránh nháy khi dữ liệu có sẵn. */
const SPINNER_DELAY = 150;

/**
 * Lấy một trang ấn phẩm của chuyên mục.
 *
 * Hiện đọc từ mảng dựng sẵn trong file này. Khi nối API thật chỉ cần thay
 * thân hàm bằng fetch(...) — phần gọi bên dưới đã là async nên không đổi gì.
 */
async function fetchPage(cate, offset, limit) {
    return editions.filter((item) => item.cate === cate).slice(offset, offset + limit);
}

async function countAll(cate) {
    return editions.filter((item) => item.cate === cate).length;
}

const slideHTML = (item) => `<div class="swiper-slide">${cardHTML(item)}</div>`;

const LOADING_SLIDE = `
  <div class="swiper-slide baoin-slide-loading" aria-hidden="true">
    <span>Đang tải thêm…</span>
  </div>
`;

/**
 * Gắn cơ chế nạp thêm cho một hàng swiper.
 * Kích hoạt khi slide đang xem còn cách cuối <= PREFETCH_MARGIN.
 */
function attachLoadMore(swiper, cate, total, loadedCount) {
    /* Đếm theo số item ĐÃ DỰNG, không lấy swiper.slides.length: instance có thể
       vừa được tạo lúc wrapper còn rỗng nên slides.length chưa phản ánh DOM. */
    let offset = loadedCount;
    let loading = false;
    let done = offset >= total;

    async function loadMore() {
        if (loading || done) return;
        loading = true;

        /* Chỉ hiện chỉ báo nếu nguồn dữ liệu chậm — dữ liệu tại chỗ thì thôi. */
        let spinnerIndex = -1;
        const spinnerTimer = setTimeout(() => {
            swiper.appendSlide(LOADING_SLIDE);
            spinnerIndex = swiper.slides.length - 1;
        }, SPINNER_DELAY);

        try {
            const items = await fetchPage(cate, offset, PAGE_SIZE);

            clearTimeout(spinnerTimer);
            if (spinnerIndex >= 0) swiper.removeSlide(spinnerIndex);

            if (!items.length) {
                done = true;
                return;
            }

            swiper.appendSlide(items.map(slideHTML));
            offset += items.length;
            if (offset >= total) done = true;
        } catch (error) {
            clearTimeout(spinnerTimer);
            if (spinnerIndex >= 0) swiper.removeSlide(spinnerIndex);
            console.error(`[doc_bao_in] Không tải thêm được chuyên mục "${cate}":`, error);
        } finally {
            loading = false;
            swiper.update();
        }
    }

    function maybeLoad() {
        if (done) return;
        /* slidesPerView có thể là số thập phân (1.15 ở mobile) hoặc "auto". */
        const perView = Number(swiper.params.slidesPerView) || 1;
        const lastVisible = swiper.activeIndex + Math.ceil(perView);
        if (lastVisible >= swiper.slides.length - PREFETCH_MARGIN) loadMore();
    }

    swiper.on("slideChange", maybeLoad);
    swiper.on("reachEnd", loadMore);
}

/**
 * Mỗi <section data-cate="..."> nhận đúng các ấn phẩm của chuyên mục đó,
 * đổ vào .swiper-wrapper rồi khởi tạo Swiper.
 *
 * common/swiper.js đã tự init mọi [data-swiper] lúc nạp module — nhưng nó
 * chạy TRƯỚC file này nên lúc đó wrapper còn rỗng. Phải gọi init lại sau khi
 * dựng slide (initElement có cờ __swiperInstance nên không init trùng).
 */
async function renderCategorySections() {
    const sections = [...document.querySelectorAll("[data-cate]")];

    await Promise.all(
        sections.map(async (section) => {
            const cate = section.getAttribute("data-cate");
            const wrapper = section.querySelector(".swiper-wrapper");
            const el = section.querySelector("[data-swiper]");
            if (!wrapper || !el) return;

            const [items, total] = await Promise.all([
                fetchPage(cate, 0, PAGE_SIZE),
                countAll(cate),
            ]);

            if (!items.length) {
                section.hidden = true;
                return;
            }

            wrapper.innerHTML = items.map(slideHTML).join("");

            /* reinit chứ KHÔNG phải init: common/swiper.js đã chạy initAll() lúc
               nạp module, khi wrapper còn rỗng — instance đó có 0 slide và
               init() sẽ bỏ qua vì đã thấy cờ __swiperInstance. Phải huỷ rồi
               tạo lại để Swiper đọc đúng các slide vừa dựng. */
            SwiperManager.reinit(el);
            const swiper = el.__swiperInstance;
            if (swiper) attachLoadMore(swiper, cate, total, items.length);
        }),
    );
}

renderLatest();
renderCategorySections();
