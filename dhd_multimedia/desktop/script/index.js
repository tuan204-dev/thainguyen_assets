/**
 * Multimedia page – Hero slider ↔ side panel sync
 *
 * common/swiper.js đã chạy initAll() khi module được load,
 * nên tất cả [data-swiper] đã được khởi tạo trước khi script này chạy.
 */

const heroSwiperEl = document.querySelector('#hero-main-swiper');

if (heroSwiperEl) {
    const swiper = heroSwiperEl.__swiperInstance;
    const sideItems = [...document.querySelectorAll('.hero-side-item')];

    if (swiper && sideItems.length) {
        const updateActive = (realIndex) => {
            sideItems.forEach((item, i) => {
                item.classList.toggle('is-active', i === realIndex);
            });
        };

        // Sync side panel when slide changes
        swiper.on('slideChange', () => {
            updateActive(swiper.realIndex);
        });

        // Click on side item → slide to that index
        sideItems.forEach((item, i) => {
            item.addEventListener('click', (e) => {
                // Avoid interfering with links inside the item
                if (e.target.closest('a')) return;
                swiper.slideToLoop(i);
            });
        });

        // Set initial active state
        updateActive(swiper.realIndex ?? 0);
    }
}
