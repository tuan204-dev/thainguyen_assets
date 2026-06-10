document.addEventListener("DOMContentLoaded", () => {
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const headerOffset = 100;

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
});
