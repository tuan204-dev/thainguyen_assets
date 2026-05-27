const projects = [
  ["ct-cum-cong-nghiep-hanh-phuc.png", "Cụm công nghiệp Hạnh Phúc - Xuân Phương", "09:37, 19/09/2025"],
  ["ct-khu-du-lich-ho-nui-coc.png", "Khu du lịch nghỉ dưỡng quốc tế 5 sao hồ Núi Cốc", "18:40, 17/09/2025"],
  ["ct-nha-may-tam-lat-san-pvc.png", "Nhà máy sản xuất tấm lát sàn PVC", "17:56, 17/09/2025"],
  ["ct-san-gon-glory-ho-suoi-lanh.png", "Sân gôn Glory tại khu vực hồ Suối Lạnh, xã Thành Công", "15:33, 17/09/2025"],
  ["ct-khu-van-hoa-van-xuan.jpg", "Khu văn hóa, thể thao, công viên cây xanh phường Vạn Xuân", "10:57, 16/09/2025"],
  ["ct-benh-vien-a.jpg", "Trung tâm Phụ - Sản - Phẫu thuật gây mê hồi sức và thiết bị y tế, Bệnh viện A Thái Nguyên", "16:22, 15/09/2025"],
  ["ct-duong-quang-khe-khang-ninh.jpg", "Dự án xây dựng Tuyến đường Quảng Khê - Khang Ninh", "17:45, 29/08/2025"],
  ["ct-trung-tam-y-te-ngan-son.jpg", "Dự án xây dựng Trung tâm Y tế Ngân Sơn", "17:39, 29/08/2025"],
  ["ct-den-muc-chua-huong-ap.jpg", "Tu bộ, tôn tạo đền Mục và chùa Hương Ấp", "14:18, 06/03/2025"],
  ["ct-tru-so-lam-viec-khoi-co-quan.jpg", "Trụ sở làm việc Khối các cơ quan tỉnh Thái Nguyên", "14:33, 06/03/2025"],
  ["ct-toa-nha-prime-thai-nguyen.jpg", "Tòa nhà Prime Thái Nguyên", "14:47, 06/03/2025"],
  ["ct-duong-vanh-dai-v.jpg", "Đường Vành đai V đoạn qua khu vực tỉnh Thái Nguyên", "14:03, 06/03/2025"],
  ["ct-san-van-dong-tinh.jpg", "Sân vận động tỉnh Thái Nguyên", "14:08, 06/03/2025"],
];

function renderProjects() {
  document.getElementById("projectCards").innerHTML = projects.map(projectCard).join("");
  document.getElementById("projectHero").innerHTML = `
    <img src="./images/${projects[0][0]}" alt="${projects[0][1]}" class="t:w-full t:rounded-lg t:object-cover">
    <div><h1 class="t:text-3xl t:font-bold t:leading-tight">${projects[0][1]}</h1><p class="t:mt-2 t:text-[#667085]">${projects[0][2]}</p></div>`;
  document.getElementById("projectTopGrid").innerHTML = projects.slice(1, 4).map(([img, title, date]) => `
    <article class="t:overflow-hidden t:rounded-lg t:bg-[#fffaf4]">
      <img src="./images/${img}" alt="${title}" class="t:aspect-[16/9] t:w-full t:object-cover">
      <div class="t:p-4"><h2 class="t:text-lg t:font-bold t:leading-snug">${title}</h2><p class="t:mt-1 t:text-sm t:text-[#777]">${date}</p></div>
    </article>`).join("");
  document.getElementById("projectList").innerHTML = projects.slice(4).map(([img, title, date]) => `
    <article class="t:flex t:gap-5 t:border-b t:border-[#eee] t:py-5">
      <img src="./images/${img}" alt="${title}" class="t:aspect-[16/9] t:w-[220px] t:shrink-0 t:rounded-lg t:object-cover">
      <div><h2 class="t:text-lg t:font-bold t:leading-snug">${title}</h2><p class="t:mt-1 t:text-sm t:text-[#777]">${date}</p><p class="t:mt-2 t:text-sm t:leading-6 t:text-[#555]">Công trình trọng điểm chào mừng Đại hội Đảng bộ tỉnh Thái Nguyên nhiệm kỳ 2025-2030.</p></div>
    </article>`).join("") + `<button type="button" class="t:mx-auto t:mt-6 t:border-0 t:bg-transparent t:text-[#f71917]">Xem thêm</button>`;
  document.getElementById("sideNews").innerHTML = projects.slice(0, 3).map(([img, title, date]) => `
    <article class="t:flex t:gap-3">
      <img src="./images/${img}" alt="${title}" class="t:aspect-[16/9] t:w-24 t:shrink-0 t:rounded t:object-cover">
      <div><h4 class="t:text-sm t:font-bold t:leading-snug">${title}</h4><p class="t:mt-1 t:text-xs t:text-[#777]">${date}</p></div>
    </article>`).join("");
}

function projectCard([img, title]) {
  return `
    <div class="swiper-slide">
      <a href="/dhd/ky-dhd/dhdb-tn/cttd/" class="avatar1">
        <img src="./images/${img}" alt="${title}" loading="lazy">
      </a>
      <div class="title_bg">
        <a href="/dhd/ky-dhd/dhdb-tn/cttd/" class="title2">${title}</a>
      </div>
    </div>`;
}

function setTab(tab, shouldScroll = true) {
  const tabHeader = document.getElementById("dhdTabHeader");
  const projectsPage = document.getElementById("projectsPage");
  const leadersPage = document.getElementById("leadersPage");
  leadersPage.classList.toggle("t:hidden", tab === "projects");
  projectsPage.classList.toggle("t:hidden", tab !== "projects");
  tabHeader.classList.toggle("t:hidden", tab === "projects");

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("t:text-[#e60000]", "t:font-semibold");
    button.classList.add("t:text-[#c28214]");
  });

  if (tab === "leaders") {
    history.replaceState(null, "", "#leaders");
    document.getElementById("leadersSection").classList.remove("t:hidden");
    if (shouldScroll) {
      document.getElementById("leadersSection").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (tab === "standing") {
    history.replaceState(null, "", "#standing");
    document.getElementById("leadersSection").classList.add("t:hidden");
    if (shouldScroll) {
      document.getElementById("standingSection").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (tab === "committee") {
    history.replaceState(null, "", "#committee");
    document.getElementById("leadersSection").classList.add("t:hidden");
    if (shouldScroll) {
      document.getElementById("committeeSection").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (tab === "projects") {
    history.replaceState(null, "", "#projects");
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }
}

renderProjects();
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

document.querySelectorAll("[data-tab]:not(.tab-button)").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    setTab(trigger.dataset.tab);
    closeMobileMenu();
  });
});

const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuOpen = document.getElementById("mobileMenuOpen");

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  document.body.classList.add("mobile-menu-open");
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("mobile-menu-open");
}

mobileMenuOpen?.addEventListener("click", openMobileMenu);
document.querySelectorAll("[data-mobile-menu-close]").forEach((button) => {
  button.addEventListener("click", closeMobileMenu);
});

document.querySelectorAll("[data-mobile-submenu]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".mobile-menu-panel__group");
    const isOpen = group.classList.toggle("is-open");
    button.textContent = isOpen ? "-" : "+";
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});

const initialTab = window.location.hash.replace("#", "");
if (["leaders", "standing", "committee", "projects"].includes(initialTab)) {
  setTimeout(() => setTab(initialTab, false), 0);
}

// ------ Leader Info Modal Logic ------
(() => {
  const modal = document.getElementById("infoModal");
  if (!modal) return;

  const panelEl = modal.querySelector(".info-modal__panel");
  const imgEl = document.getElementById("infoModalImg");
  const nameEl = document.getElementById("infoModalName");
  const titlesEl = document.getElementById("infoModalTitles");
  const cardSelector = '[class*="t:bg-[#fffaf4]"]';
  const BADGE_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  document.querySelectorAll('figure img').forEach((img) => {
    if (img.closest(".info-modal")) return;
    const card = img.closest(cardSelector);
    if (!card) return;
    card.classList.add("info-card");
    if (card.dataset.infoUrl && !card.querySelector(".info-card__badge")) {
      card.classList.add("info-card--has-image");
      const badge = document.createElement("span");
      badge.className = "info-card__badge";
      badge.setAttribute("aria-hidden", "true");
      badge.innerHTML = BADGE_SVG;
      card.appendChild(badge);
    }
  });
  function readCard(card) {
    const portrait = card.querySelector('figure img');
    const imgSrc = card.dataset.infoUrl || (portrait && portrait.src) || "";
    const imgAlt = (portrait && portrait.getAttribute("alt")) || "";

    const lines = [];
    card.querySelectorAll("*").forEach((el) => {
      if (el.children.length) return;
      if (el.closest(".info-card__badge")) return;
      const text = el.textContent.replace(/\s+/g, " ").trim();
      if (text) lines.push(text);
    });

    const label = lines[0] || "Đồng chí";
    const name = lines[1] || "";
    const titles = lines.slice(2);

    return { imgSrc, imgAlt, label, name, titles };
  }

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
