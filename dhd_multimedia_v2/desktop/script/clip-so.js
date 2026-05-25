const featuredCaptions = [
    'Hà Nội FC hòa kịch tính Thể Công Viettel 2-2 ở lượt trận cuối',
    'Giải Tứ hùng: PVF Công an nhân dân 1 - 0 Hoàng Anh Gia Lai',
    'Màn lội ngược dòng bản lĩnh của đội bóng Thủ đô',
    'Diễn biến trận đấu giữa Thể Công Viettel và Hoàng Anh Gia Lai',
    'Chia điểm kịch tính, Thể Công Viettel hòa PVF CAND 1-1',
];

document.addEventListener('DOMContentLoaded', () => {
    initFeaturedSlider();
});

function initFeaturedSlider() {
    const swiperEl = document.getElementById('featuredClipSwiper');
    const captionEl = document.getElementById('featuredCaption');
    const prevBtn = document.getElementById('featPrevBtn');
    const nextBtn = document.getElementById('featNextBtn');

    if (!swiperEl) return;

    const tryConnect = () => {
        const swiper = swiperEl.__swiperInstance;
        if (!swiper) {
            setTimeout(tryConnect, 100);
            return;
        }

        prevBtn?.addEventListener('click', () => swiper.slidePrev());
        nextBtn?.addEventListener('click', () => swiper.slideNext());

        const updateCaption = () => {
            if (captionEl) {
                captionEl.textContent = featuredCaptions[swiper.realIndex] ?? featuredCaptions[0];
            }
        };

        swiper.on('slideChange', updateCaption);
        updateCaption();
    };

    tryConnect();
}
