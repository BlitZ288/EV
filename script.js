const certificatesSwiper = new Swiper(".certificates-swiper", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: {
        nextEl: ".certificates-swiper .swiper-button-next",
        prevEl: ".certificates-swiper .swiper-button-prev",
    },

    pagination: {
        el: ".certificates-swiper .swiper-pagination",
        clickable: true,
    },
});