const STICKY_THRESHOLD = 100;

const headerMain = document.querySelector(".header-main");
const logoHeader = document.querySelector(".logo-header");

if (headerMain && logoHeader) {
    const originalBodyPaddingTop = document.body.style.paddingTop;
    let isSticky = false;

    const setStickyState = (nextStickyState) => {
        if (isSticky === nextStickyState) return;
        isSticky = nextStickyState;

        headerMain.classList.toggle("header-main--sticky", isSticky);
        logoHeader.classList.toggle("logo-header--compact", isSticky);

        if (isSticky) {
            document.body.style.paddingTop = `${headerMain.offsetHeight}px`;
            return;
        }

        document.body.style.paddingTop = originalBodyPaddingTop;
    };

    const syncStickyState = () => {
        setStickyState(window.scrollY >= STICKY_THRESHOLD);
    };

    window.addEventListener("scroll", syncStickyState, { passive: true });
    window.addEventListener("resize", () => {
        if (!isSticky) return;
        document.body.style.paddingTop = `${headerMain.offsetHeight}px`;
    });

    syncStickyState();
}
