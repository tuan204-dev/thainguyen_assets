const detailTabs = Array.from(document.querySelectorAll("[data-detail-tab]"));
const detailPanels = Array.from(document.querySelectorAll("[data-detail-panel]"));

detailTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const tabName = tab.dataset.detailTab;

        detailTabs.forEach((item) => {
            item.classList.toggle("is-active", item.dataset.detailTab === tabName);
        });

        detailPanels.forEach((panel) => {
            const isActive = panel.dataset.detailPanel === tabName;
            panel.classList.toggle("t:hidden", !isActive);
            panel.classList.toggle("t:flex", isActive);
        });
    });
});

document.getElementById("printBtn")?.addEventListener("click", () => {
    window.print();
});

document.getElementById("fbShareBtn")?.addEventListener("click", (event) => {
    event.preventDefault();
    const url = encodeURIComponent(window.location.href);
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank",
        "width=640,height=480",
    );
});
