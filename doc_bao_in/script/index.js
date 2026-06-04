const editions = [
    {
        title: "Số 326 ngày 24/5/2026",
        time: "06:00, 24/05/2026",
        href: "/doc-bao-in/202605/so-326-ngay-2452026-4ab3811/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_326_20260523194607.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 325 ngày 23/5/2026",
        time: "06:02, 23/05/2026",
        href: "/doc-bao-in/202605/so-325-ngay-2352026-27017e7/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_325_20260522211242.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 324 ngày 22/5/2026",
        time: "06:00, 22/05/2026",
        href: "/doc-bao-in/202605/so-324-ngay-2252026-cc23e9f/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_324_20260522002659.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 323 ngày 21/5/2026",
        time: "05:59, 21/05/2026",
        href: "/doc-bao-in/202605/so-323-ngay-2152026-a6f31ba/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_323_20260520211816.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 322 ngày 20/5/2026",
        time: "05:59, 20/05/2026",
        href: "/doc-bao-in/202605/so-322-ngay-2052026-6930d14/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_322_20260519194029.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 321 ngày 19/5/2026",
        time: "06:00, 19/05/2026",
        href: "/doc-bao-in/202605/so-321-ngay-1952026-80036f6/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_321_20260518230306.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 320 ngày 18/5/2026",
        time: "06:00, 18/05/2026",
        href: "/doc-bao-in/202605/so-320-ngay-1852026-8554f37/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_320_20260517194335.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 319 ngày 17/5/2026",
        time: "06:00, 17/05/2026",
        href: "/doc-bao-in/202605/so-319-ngay-1752026-d2f7765/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_319_20260516204454.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Thái Nguyên: Miền núi - Vùng cao số",
        time: "09:32, 17/05/2026",
        href: "/doc-bao-in/thai-nguyen-mien-nui---vung-cao/202605/thai-nguyen-mien-nui-vung-cao-so-15-e994c11/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/trang_1-12_20260514154928.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 318 ngày 16/5/2026",
        time: "06:00, 16/05/2026",
        href: "/doc-bao-in/202605/so-318-ngay-1652026/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_319_20260516204454.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 317 ngày 15/5/2026",
        time: "06:00, 15/05/2026",
        href: "/doc-bao-in/202605/so-317-ngay-1552026/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_320_20260517194335.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 316 ngày 14/5/2026",
        time: "06:00, 14/05/2026",
        href: "/doc-bao-in/202605/so-316-ngay-1452026/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_321_20260518230306.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 315 ngày 13/5/2026",
        time: "06:00, 13/05/2026",
        href: "/doc-bao-in/202605/so-315-ngay-1352026/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_322_20260519194029.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 314 ngày 12/5/2026",
        time: "06:00, 12/05/2026",
        href: "/doc-bao-in/202605/so-314-ngay-1252026/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_323_20260520211816.jpg?width=400&height=-&type=resize",
    },
    {
        title: "Số 313 ngày 11/5/2026",
        time: "06:00, 11/05/2026",
        href: "/doc-bao-in/202605/so-313-ngay-1152026/",
        cover: "https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052026/so_324_20260522002659.jpg?width=400&height=-&type=resize",
    },
];

const coverPool = editions.slice(0, 9).map((item) => item.cover);
const issueDate = new Date("2026-05-10T06:00:00+07:00");

for (let issue = 312; editions.length < 45; issue -= 1) {
    const day = issueDate.getDate();
    const month = issueDate.getMonth() + 1;
    const year = issueDate.getFullYear();
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");

    editions.push({
        title: `Số ${issue} ngày ${day}/${month}/${year}`,
        time: `06:00, ${dd}/${mm}/${year}`,
        href: `/doc-bao-in/${year}${mm}/so-${issue}-ngay-${day}${month}${year}/`,
        cover: coverPool[editions.length % coverPool.length],
    });

    issueDate.setDate(issueDate.getDate() - 1);
}

const perPage = 9;
const list = document.getElementById("print-newspaper-list");
const pagination = document.getElementById("print-newspaper-pagination");
let currentPage = 1;

function renderList() {
    const start = (currentPage - 1) * perPage;
    const pageItems = editions.slice(start, start + perPage);

    list.innerHTML = pageItems
        .map(
            (item) => `
        <article class="t:group">
          <div class="t:mb-3 t:flex t:items-start t:gap-x-3">
            <span class="t:mt-0.5 t:h-9 t:w-1 t:shrink-0 t:bg-[#935F25]" aria-hidden="true"></span>
            <div class="t:min-w-0 t:flex-1">
              <h3 class="title l2 t:mt-0!">
                <a href="${item.href}">${item.title}</a>
              </h3>
              <p class="desc">${item.time}</p>
            </div>
            <a href="${item.href}"
              class="roboto t:mt-0.5 t:shrink-0 t:rounded-[3px] t:bg-[#935F25] t:px-2 t:py-1 t:text-xs t:font-bold t:leading-none t:text-white t:hover:bg-[#7E4F1D]">
              Đọc ngay
            </a>
          </div>
          <a href="${item.href}"
            class="t:group/book t:flex t:aspect-[210/297] t:items-center t:justify-center t:border t:border-[#CFCFCF] t:bg-white t:p-[7%] t:transition t:duration-200 t:[perspective:1200px] t:hover:border-[#935F25] t:hover:shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
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
      `,
        )
        .join("");
}

function renderPagination() {
    const totalPages = Math.ceil(editions.length / perPage);
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    pagination.innerHTML = [
        paginationButton("<", Math.max(1, currentPage - 1), currentPage === 1, false),
        ...pages.map((page) => paginationButton(String(page), page, false, page === currentPage)),
        paginationButton(
            ">",
            Math.min(totalPages, currentPage + 1),
            currentPage === totalPages,
            false,
        ),
    ].join("");

    pagination.querySelectorAll("[data-page]").forEach((button) => {
        button.addEventListener("click", () => {
            const nextPage = Number(button.getAttribute("data-page"));
            if (!nextPage || nextPage === currentPage) return;
            currentPage = nextPage;
            renderList();
            renderPagination();
            document
                .getElementById("print-newspaper-title")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function paginationButton(label, page, disabled, active) {
    const base =
        "t:flex t:size-8 t:items-center t:justify-center t:rounded t:border t:text-sm t:font-bold t:transition";
    const state = active
        ? "t:border-[#935F25] t:bg-[#935F25] t:text-white"
        : "t:border-[#D0D5DD] t:bg-white t:text-[#565656] t:hover:border-[#935F25] t:hover:text-[#935F25]";
    const disabledClass = disabled ? "t:pointer-events-none t:opacity-45" : "";

    return `<button type="button" class="${base} ${state} ${disabledClass}" data-page="${page}" ${
        disabled ? "disabled" : ""
    }>${label}</button>`;
}

if (list && pagination) {
    renderList();
    renderPagination();
}
