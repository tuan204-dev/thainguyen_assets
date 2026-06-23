const heroSwiperEl = document.querySelector("#hero-main-swiper");

if (heroSwiperEl) {
    const swiper = heroSwiperEl.__swiperInstance;
    const sideItems = [...document.querySelectorAll(".hero-side-item")];

    if (swiper && sideItems.length) {
        const tabsPanel = document.querySelector(".multimedia-hero-tabs");

        // Khi panel cuộn (>2 bài), giữ item đang active luôn hiển thị
        const ensureVisible = (item) => {
            if (!tabsPanel || tabsPanel.scrollHeight <= tabsPanel.clientHeight) return;
            const ir = item.getBoundingClientRect();
            const pr = tabsPanel.getBoundingClientRect();
            if (ir.top < pr.top) {
                tabsPanel.scrollBy({ top: ir.top - pr.top, behavior: "smooth" });
            } else if (ir.bottom > pr.bottom) {
                tabsPanel.scrollBy({ top: ir.bottom - pr.bottom, behavior: "smooth" });
            }
        };

        const updateActive = (realIndex) => {
            sideItems.forEach((item, i) => {
                const active = i === realIndex;
                item.classList.toggle("is-active", active);
                if (active) ensureVisible(item);
            });
        };
        swiper.on("slideChange", () => {
            updateActive(swiper.realIndex);
        });
        sideItems.forEach((item, i) => {
            item.addEventListener("click", (e) => {
                if (e.target.closest("a")) return;
                swiper.slideToLoop(i);
            });
        });

        updateActive(swiper.realIndex ?? 0);

        const updateSwiperLayout = () => {
            swiper.update();
            swiper.slideToLoop(swiper.realIndex ?? 0, 0, false);
        };

        window.addEventListener("resize", updateSwiperLayout, { passive: true });
        window.addEventListener("orientationchange", updateSwiperLayout, { passive: true });
        new ResizeObserver(updateSwiperLayout).observe(heroSwiperEl);
        requestAnimationFrame(updateSwiperLayout);
    }
}
