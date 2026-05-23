/**
 * Card info modal
 *
 * Mỗi "item" là một thẻ chứa ảnh chân dung (figure > img[alt^="Đồng chí"]).
 * Click vào thẻ -> mở modal hiển thị: ảnh + tên + các chức danh.
 *
 * Thẻ đặc biệt có thuộc tính data-info-url -> dùng ảnh trong attribute đó
 * cho modal (thay vì ảnh nhỏ trên thẻ).
 */
/* ── Mobile menu: accordion mở/đóng submenu (+/−) ──────────── */
(() => {
    document.querySelectorAll("[data-menu-toggle]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const group = btn.closest(".dhd-menu__group");
            if (!group) return;
            const open = group.classList.toggle("is-open");
            btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
    });
})();

(() => {
    const modal = document.getElementById("infoModal");
    if (!modal) return;

    const panelEl = modal.querySelector(".info-modal__panel");
    const imgEl = document.getElementById("infoModalImg");
    const nameEl = document.getElementById("infoModalName");
    const titlesEl = document.getElementById("infoModalTitles");

    /* ── tìm thẻ (card) từ ảnh chân dung và đánh dấu clickable ── */
    const cardSelector = '[class*="t:bg-[#fffaf4]"]';

    const BADGE_SVG =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    document.querySelectorAll('figure img[alt^="Đồng chí"]').forEach((img) => {
        const card = img.closest(cardSelector);
        if (!card) return;
        card.classList.add("info-card");

        // thẻ có data-info-url -> render icon ở góc trên phải
        if (card.dataset.infoUrl && !card.querySelector(".info-card__badge")) {
            card.classList.add("info-card--has-image");
            const badge = document.createElement("span");
            badge.className = "info-card__badge";
            badge.setAttribute("aria-hidden", "true");
            badge.innerHTML = BADGE_SVG;
            card.appendChild(badge);
        }
    });

    /* ── trích xuất thông tin từ một thẻ ───────────────────────── */
    function readCard(card) {
        // ảnh: ưu tiên data-info-url, nếu không thì lấy ảnh chân dung của thẻ
        const portrait = card.querySelector('figure img[alt^="Đồng chí"]');
        const imgSrc = card.dataset.infoUrl || (portrait && portrait.src) || "";
        const imgAlt = (portrait && portrait.getAttribute("alt")) || "";

        // các dòng chữ: phần tử lá (không có element con) có text
        const lines = [];
        card.querySelectorAll("*").forEach((el) => {
            if (el.children.length) return;
            const text = el.textContent.replace(/\s+/g, " ").trim();
            if (text) lines.push(text);
        });

        // dòng 0 = "Đồng chí" (nhãn), dòng 1 = tên, còn lại = chức danh
        const label = lines[0] || "Đồng chí";
        const name = lines[1] || "";
        const titles = lines.slice(2);

        return { imgSrc, imgAlt, label, name, titles };
    }

    /* ── mở / đóng ─────────────────────────────────────────────── */
    function open(card) {
        const { imgSrc, imgAlt, label, name, titles } = readCard(card);
        const imageOnly = Boolean(card.dataset.infoUrl);

        imgEl.src = imgSrc;
        imgEl.alt = imgAlt;
        panelEl.classList.toggle("is-image-only", imageOnly);

        if (!imageOnly) {
            nameEl.textContent = `${label} ${name}`.trim();
            titlesEl.innerHTML = "";
            titles.forEach((t) => {
                const p = document.createElement("p");
                p.textContent = t;
                titlesEl.appendChild(p);
            });
        }

        modal.classList.add("is-active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("info-modal-open");
    }

    function close() {
        modal.classList.remove("is-active");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("info-modal-open");
    }

    /* ── sự kiện ───────────────────────────────────────────────── */
    document.addEventListener("click", (e) => {
        if (e.target.closest("[data-info-close]")) {
            close();
            return;
        }
        const card = e.target.closest(".info-card");
        if (card) open(card);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-active")) close();
    });
})();
