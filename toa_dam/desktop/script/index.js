// Tọa đàm: mục lục các box Hỏi–Đáp (tự sáng câu đang đọc), thanh mục lục trên mobile, header trên hero.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollBehavior = reduceMotion ? "auto" : "smooth";

const nav = document.querySelector("[data-toc]");
// Box Hỏi–Đáp = template editor "Tọa đàm – Hỏi đáp" (div.td-qa) trong thân bài, bỏ khối TẮT bằng công tắc editor.
// Gắn id cau-N theo ĐÚNG thứ tự mà portlet toa_dam_toc đã đánh khi dựng mục lục ở server.
const sections = Array.from(document.querySelectorAll(".article-prose .td-qa")).filter(
    (el) => (el.getAttribute("data-ms-switch") || "").toLowerCase() !== "off",
);
sections.forEach((section, i) => {
    section.id = `cau-${i + 1}`;
    section.querySelector(".td-qa__q")?.setAttribute("tabindex", "-1");
});
// id chỉ có sau khi script chạy nên trình duyệt đã bỏ lỡ #cau-N trên URL: cuộn lại một lần
if (/^#cau-\d+$/.test(location.hash)) document.querySelector(location.hash)?.scrollIntoView();

if (nav && sections.length) {
    const links = Array.from(nav.querySelectorAll("[data-toc-link]"));
    const list = nav.querySelector("[data-toc-list]");
    const toggle = nav.querySelector("[data-toc-toggle]");
    const barNum = nav.querySelector("[data-toc-bar-num]");
    const barCount = nav.querySelector("[data-toc-bar-count]");
    const barLabel = nav.querySelector("[data-toc-bar-label]");
    let current = null;

    const setCurrent = (index) => {
        if (index === current) return;
        current = index;

        sections.forEach((section, i) => {
            section.classList.toggle("is-current", i === index);
            section.toggleAttribute("data-done", i < index);
        });
        links.forEach((link, i) => {
            if (i === index) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
            link.toggleAttribute("data-done", i < index);
        });

        // Thanh mobile: trước câu 1 thì mời mở danh sách, sau đó báo câu đang đọc
        barNum.hidden = index < 0;
        if (index >= 0) barNum.textContent = index + 1;
        barCount.textContent = index >= 0 ? `Câu ${index + 1}` : "Các câu hỏi";
        barLabel.textContent =
            index >= 0
                ? links[index]?.querySelector(".td-toc__q")?.textContent || ""
                : "Chạm để xem danh sách";

        // Mục lục desktop dài hơn màn hình: cuộn riêng danh sách cho câu đang đọc lọt vào khung
        const active = links[index];
        if (active && list.scrollHeight > list.clientHeight) {
            const top = active.offsetTop - list.offsetTop;
            const bottom = top + active.offsetHeight;
            if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) {
                list.scrollTop = top - list.clientHeight / 3;
            }
        }
    };

    // Câu đang đọc = câu cuối cùng có mép trên đã qua vạch 35% chiều cao màn hình
    let ticking = false;
    const update = () => {
        ticking = false;
        const line = window.innerHeight * 0.35;
        let index = -1;
        sections.forEach((section, i) => {
            if (section.getBoundingClientRect().top <= line) index = i;
        });
        setCurrent(index);
    };
    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    const setOpen = (open) => {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    document.addEventListener("click", (event) => {
        if (!nav.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !nav.classList.contains("is-open")) return;
        setOpen(false);
        toggle.focus();
    });

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const hash = link.getAttribute("href");
            const target = document.querySelector(hash);
            if (!target) return;
            event.preventDefault();
            setOpen(false);
            target.scrollIntoView({ behavior: scrollBehavior, block: "start" });
            history.replaceState(null, "", hash);
            target.querySelector(".td-qa__q")?.focus({ preventScroll: true });
        });
    });
}

// Header E-Magazine: ở đầu trang trong suốt, dùng chung nền với hero; bắt đầu cuộn thì bật nền để logo
// và chữ trắng không đè lên ảnh hero hay chìm vào thân bài nền trắng.
const header = document.querySelector(".mag-header");
if (header) {
    const syncHeader = () => header.classList.toggle("is-solid", window.scrollY > 4);
    window.addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
}

// Form gửi câu hỏi: chỉ kiểm tra và báo thành công tại chỗ, KHÔNG gửi lên server (chưa có API).
const askForm = document.querySelector("[data-ask-form]");
const askDone = document.querySelector("[data-ask-done]");
if (askForm && askDone) {
    const required = Array.from(askForm.querySelectorAll("[required]"));
    const nameField = askForm.querySelector("#ask-name");

    const check = (field) => {
        const ok = field.value.trim() !== "";
        if (ok) field.removeAttribute("aria-invalid");
        else field.setAttribute("aria-invalid", "true");
        document.getElementById(field.getAttribute("aria-describedby")).hidden = ok;
        return ok;
    };

    // Đã báo lỗi thì gõ lại tới đâu xoá lỗi tới đó
    required.forEach((field) =>
        field.addEventListener("input", () => {
            if (field.hasAttribute("aria-invalid")) check(field);
        }),
    );

    askForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const invalid = required.filter((field) => !check(field));
        if (invalid.length) {
            invalid[0].focus();
            return;
        }
        askDone.querySelector("[data-ask-msg]").textContent =
            `Cảm ơn ${nameField.value.trim()}! Ban biên tập đã nhận câu hỏi và sẽ chuyển tới các khách mời.`;
        askForm.hidden = true;
        askDone.hidden = false;
        askDone.querySelector(".td-ask__done-title").focus();
    });

    askDone.querySelector("[data-ask-again]").addEventListener("click", () => {
        askForm.reset();
        askDone.hidden = true;
        askForm.hidden = false;
        nameField.focus();
    });
}

// Nút In (#printBtn): portlet detail_content tự chặn ở pha capture và mở bản in kiểu Dân Trí.

document.getElementById("fbShareBtn")?.addEventListener("click", () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank",
        "noopener,width=640,height=480",
    );
});
