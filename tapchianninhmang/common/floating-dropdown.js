import {
    computePosition,
    flip,
    shift,
    offset,
    autoUpdate,
} from "./vendor/floating-ui-dom.mjs";

/**
 * Floating Dropdown — reusable, data-attribute-driven dropdown/submenu system.
 *
 * HTML contract (data attributes):
 *   [data-floating-dropdown]            – root wrapper
 *   [data-floating-trigger]             – button that opens the menu
 *   [data-floating-menu]                – the dropdown panel
 *   [data-floating-submenu]             – wrapper around a submenu pair
 *   [data-floating-submenu-trigger]     – button that opens the submenu
 *   [data-floating-submenu-menu]        – the submenu panel
 *
 * Configuration (on root [data-floating-dropdown]):
 *   data-placement   – Floating UI placement  (default: "bottom-start")
 *   data-offset      – px gap between anchor & menu (default: 8)
 *   data-trigger     – "hover" | "click"       (default: "hover")
 *
 * CSS hooks:
 *   .is-hidden       – hides a menu (toggled by JS)
 *   [data-open]      – set to "true" on visible menus (for CSS animations)
 */

/* ─── constants ──────────────────────────────────────────────── */
const HIDE_CLS = "is-hidden";
const SUBMENU_HOVER_DELAY = 280; // ms before closing submenu on mouse-leave
const ROOT_HOVER_DELAY = 420; // extra grace to bridge trigger -> menu gap

/* ─── helpers ────────────────────────────────────────────────── */

/** Parse a numeric data-attribute, falling back to `fallback`. */
const num = (el, attr, fallback) => {
    const v = el?.dataset[attr];
    return v == null ? fallback : Number(v);
};

/** Show a menu panel and position it via Floating UI. */
function showMenu(menu, reference, opts = {}) {
    menu.classList.remove(HIDE_CLS);
    menu.dataset.open = "true";

    const placement = opts.placement ?? "bottom-start";
    const gap = opts.offset ?? 8;

    // Position once, then auto-update while visible
    const cleanup = autoUpdate(reference, menu, () => {
        computePosition(reference, menu, {
            placement,
            middleware: [offset(gap), flip(), shift({ padding: 8 })],
        }).then(({ x, y }) => {
            Object.assign(menu.style, {
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
            });

            // Add a generous invisible padding zone around the menu
            // so the cursor can travel across the offset gap without losing hover.
            menu.style.setProperty("--bridge-pad", `${gap + 14}px`);
        });
    });

    // Stash cleanup so we can call it on hide
    menu._floatingCleanup = cleanup;
}

/** Hide a menu panel (and any nested submenus). */
function hideMenu(menu) {
    if (!menu || menu.classList.contains(HIDE_CLS)) return;

    menu.classList.add(HIDE_CLS);
    menu.removeAttribute("data-open");

    if (menu._floatingCleanup) {
        menu._floatingCleanup();
        menu._floatingCleanup = null;
    }

    // Recursively close nested submenus
    menu
        .querySelectorAll("[data-floating-submenu-menu]")
        .forEach((sub) => hideMenu(sub));
}

/* ─── per-dropdown instance ──────────────────────────────────── */

function initDropdown(root) {
    const trigger = root.querySelector(":scope > [data-floating-trigger]");
    const menu = root.querySelector(":scope > [data-floating-menu]");
    if (!trigger || !menu) return;

    const placement = root.dataset.placement ?? "bottom-start";
    const gap = num(root, "offset", 8);
    const mode = root.dataset.trigger ?? "hover"; // "hover" | "click"

    let hideTimer = null;
    const clearHide = () => {
        clearTimeout(hideTimer);
        hideTimer = null;
    };

    const open = () => {
        clearHide();
        root.dataset.open = "true";
        showMenu(menu, trigger, { placement, offset: gap });
    };

    const close = () => {
        clearHide();
        root.removeAttribute("data-open");
        hideMenu(menu);
    };

    const scheduleClose = (delay = ROOT_HOVER_DELAY) => {
        clearHide();
        hideTimer = setTimeout(close, delay);
    };

    /* ── hover mode ────── */
    if (mode === "hover") {
        root.addEventListener("mouseenter", open);
        root.addEventListener("mouseleave", () => scheduleClose());
        // Keep open while cursor is inside menu (cancels the leave timer)
        menu.addEventListener("mouseenter", () => {
            clearHide();
        });
        menu.addEventListener("mouseleave", () => scheduleClose());
    }

    /* ── click mode ────── */
    if (mode === "click") {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.contains(HIDE_CLS) ? open() : close();
        });
        // Close on outside click
        document.addEventListener("click", (e) => {
            if (!root.contains(e.target)) close();
        });
    }

    /* ── keyboard close (Escape) ────── */
    root.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            close();
            trigger.focus();
        }
    });

    /* ── nested submenus (event delegation) ────── */
    initSubmenus(menu);
}

/* ─── submenu initialisation (recursive) ─────────────────── */

function initSubmenus(container) {
    const subs = container.querySelectorAll(":scope > [data-floating-submenu]");

    subs.forEach((wrapper) => {
        const subTrigger = wrapper.querySelector(
            ":scope > [data-floating-submenu-trigger]"
        );
        const subMenu = wrapper.querySelector(
            ":scope > [data-floating-submenu-menu]"
        );
        if (!subTrigger || !subMenu) return;

        let subTimer = null;
        const clearSub = () => {
            clearTimeout(subTimer);
            subTimer = null;
        };

        const openSub = () => {
            clearSub();
            // Close sibling submenus first
            container
                .querySelectorAll(":scope > [data-floating-submenu]")
                .forEach((sib) => {
                    if (sib !== wrapper) {
                        const m = sib.querySelector(":scope > [data-floating-submenu-menu]");
                        if (m) hideMenu(m);
                    }
                });
            showMenu(subMenu, subTrigger, {
                placement: "right-start",
                offset: 2,
            });
        };

        const closeSub = () => {
            clearSub();
            hideMenu(subMenu);
        };

        const scheduleCloseSub = () => {
            clearSub();
            subTimer = setTimeout(closeSub, SUBMENU_HOVER_DELAY);
        };

        // Hover
        wrapper.addEventListener("mouseenter", openSub);
        wrapper.addEventListener("mouseleave", scheduleCloseSub);
        subMenu.addEventListener("mouseenter", clearSub);
        subMenu.addEventListener("mouseleave", scheduleCloseSub);

        // Click fallback for touch
        subTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            subMenu.classList.contains(HIDE_CLS) ? openSub() : closeSub();
        });

        // Recurse into deeper levels
        initSubmenus(subMenu);
    });
}

/* ─── auto-init ──────────────────────────────────────────────── */

function init() {
    document
        .querySelectorAll("[data-floating-dropdown]")
        .forEach(initDropdown);
}

// Run on DOMContentLoaded if document isn't ready yet, otherwise run now
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}