const heroImages = Array.from(document.querySelectorAll("[data-hero-image]"));
const heroTabs = Array.from(document.querySelectorAll("[data-hero-tab]"));
const heroPrev = document.querySelector("[data-hero-prev]");
const heroNext = document.querySelector("[data-hero-next]");

let activeHeroIndex = 0;

const setActiveHero = (nextIndex) => {
    if (!heroImages.length || !heroTabs.length) return;

    activeHeroIndex = (nextIndex + heroImages.length) % heroImages.length;

    heroImages.forEach((image, index) => {
        image.classList.toggle("t:hidden", index !== activeHeroIndex);
        image.classList.toggle("t:block", index === activeHeroIndex);
    });

    heroTabs.forEach((tab, index) => {
        tab.classList.toggle("is-active", index === activeHeroIndex);
    });
};

heroTabs.forEach((tab, index) => {
    tab.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        setActiveHero(index);
    });
});

heroPrev?.addEventListener("click", () => {
    setActiveHero(activeHeroIndex - 1);
});

heroNext?.addEventListener("click", () => {
    setActiveHero(activeHeroIndex + 1);
});

setActiveHero(0);
