(() => {
    const isSwiperAvailable = () => globalThis.Swiper !== undefined;

    /**
     * @param {string} selector
     * @param {import('swiper').SwiperOptions} options
     */
    const initSwiper = (selector, options) => {
        if (!isSwiperAvailable()) return null;
        const el = document.querySelector(selector);
        if (!el) return null;
        return new Swiper(el, options);
    };

    const initProjectsSwiper = () => {
        initSwiper("#projectsSwiper", {
            loop: true,
            speed: 600,
            spaceBetween: 8,
            centeredSlides: false,
            slidesPerView: "auto",
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".projects-swiper .swiper-button-next",
                prevEl: ".projects-swiper .swiper-button-prev",
            },
        });
    };

    const initMobileMenu = () => {
        const menuBtn = document.getElementById("menu-btn");
        const closeMenuBtn = document.getElementById("close-menu-btn");
        const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
        const mobileMenuContent = document.getElementById("mobile-menu-content");

        if (!menuBtn || !closeMenuBtn || !mobileMenuOverlay || !mobileMenuContent) return;

        const openMenu = () => {
            mobileMenuOverlay.classList.remove("invisible", "opacity-0");
            mobileMenuOverlay.classList.add("visible", "opacity-100");
            mobileMenuContent.classList.remove("-translate-x-full");
        };

        const closeMenu = () => {
            mobileMenuOverlay.classList.remove("visible", "opacity-100");
            mobileMenuOverlay.classList.add("invisible", "opacity-0");
            mobileMenuContent.classList.add("-translate-x-full");
        };

        menuBtn.addEventListener("click", openMenu);
        closeMenuBtn.addEventListener("click", closeMenu);

        // Close when clicking outside
        mobileMenuOverlay.addEventListener("click", (e) => {
            if (e.target === mobileMenuOverlay) {
                closeMenu();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", async () => {
        initMobileMenu();
        initProjectsSwiper();
    });
})();
