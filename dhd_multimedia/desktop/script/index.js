const heroSwiperEl = document.querySelector("#hero-main-swiper");

if (heroSwiperEl) {
    const swiper = heroSwiperEl.__swiperInstance;
    const sideItems = [...document.querySelectorAll(".hero-side-item")];

    if (swiper && sideItems.length) {
        const updateActive = (realIndex) => {
            sideItems.forEach((item, i) => {
                item.classList.toggle("is-active", i === realIndex);
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
