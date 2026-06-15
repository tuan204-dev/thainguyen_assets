document.addEventListener("DOMContentLoaded", () => {
    const headerOffset = 100;
    const LINK_CLASS =
        "t:text-white t:hover:text-[#EC1C23] t:transition-colors t:block sidebar-link";

    // Build the category sidebar from each section's `id` + `data-title-cate`.
    // Clicking an item smooth-scrolls to its section; the scrollspy below keeps
    // the matching item highlighted while scrolling.
    buildCateNav();

    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href");

            if (targetId && targetId.startsWith("#") && targetId.length > 1) {
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    e.preventDefault();
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }
        });
    });

    // ScrollSpy effect: Highlight active link when scrolling
    const sections = [];
    sidebarLinks.forEach((link) => {
        const targetId = link.getAttribute("href");
        if (targetId && targetId.startsWith("#") && targetId.length > 1) {
            try {
                const section = document.querySelector(targetId);
                if (section) sections.push({ link, section });
            } catch (e) {
                console.log(e);
            }
        }
    });

    window.addEventListener("scroll", () => {
        let currentSection = null;
        const triggerOffset = 150;

        sections.forEach(({ section }) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= triggerOffset) {
                currentSection = section;
            }
        });

        sidebarLinks.forEach((link) => {
            link.classList.remove("t:text-[#EC1C23]");
            link.classList.add("t:text-white");
        });

        if (currentSection) {
            try {
                const activeLink = document.querySelector(
                    `.sidebar-link[href="#${currentSection.id}"]`,
                );
                if (activeLink) {
                    activeLink.classList.remove("t:text-white");
                    activeLink.classList.add("t:text-[#EC1C23]");
                }
            } catch (e) {
                console.log(e);
            }
        }
    });

    // Render one sidebar item per `<section data-title-cate>` that also has an id.
    // Order follows the sections' order in the document.
    function buildCateNav() {
        const nav = document.querySelector("[data-cate-nav]");
        if (!nav) return;

        const sections = document.querySelectorAll("section[data-title-cate]");
        const frag = document.createDocumentFragment();

        sections.forEach((section) => {
            const id = section.id;
            const title = (section.getAttribute("data-title-cate") || "").trim();
            if (!id || !title) return;

            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `#${id}`;
            a.className = LINK_CLASS;
            a.textContent = title;
            li.appendChild(a);
            frag.appendChild(li);
        });

        nav.replaceChildren(frag);
    }
});
