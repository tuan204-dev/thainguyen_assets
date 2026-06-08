/**
 * Overlay – reusable overlay system
 *
 * HTML contract:
 *   Trigger  →  data-overlay-target="<id>"
 *   Overlay  →  data-overlay-id="<id>"
 *   Variant  →  data-overlay-variant="mega-menu|modal|fullscreen|slide-right"
 *               (optional — defaults to mega-menu)
 *
 * Overlay markup expected inside each [data-overlay-id]:
 *   .overlay__backdrop   – click-to-close area
 *   .overlay__content    – visible panel
 *
 * CSS classes toggled:
 *   .is-active           – on the overlay element
 *   .overlay-open        – on <body> (scroll lock)
 */

const Overlay = (() => {
    /* ── state ─────────────────────────────────── */
    let activeId = null;

    /* ── helpers ───────────────────────────────── */
    const getOverlay = (id) => document.querySelector(`[data-overlay-id="${id}"]`);

    const getAllOverlays = () => document.querySelectorAll("[data-overlay-id]");

    /* ── core API ──────────────────────────────── */

    /**
     * Open an overlay by id.
     * Closes the currently-open overlay first (if any).
     */
    function open(id) {
        // close whatever is open (skip if same — handled by toggle)
        if (activeId && activeId !== id) close(activeId);

        const el = getOverlay(id);
        if (!el) return;

        el.classList.add("is-active");
        el.setAttribute("aria-hidden", "false");
        document.body.classList.add("overlay-open");
        activeId = id;
    }

    /**
     * Close an overlay by id (or the currently-active one).
     */
    function close(id) {
        const targetId = id ?? activeId;
        if (!targetId) return;

        const el = getOverlay(targetId);
        if (!el) return;

        el.classList.remove("is-active");
        el.setAttribute("aria-hidden", "true");
        document.body.classList.remove("overlay-open");

        if (activeId === targetId) activeId = null;
    }

    /**
     * Toggle: open if closed, close if open.
     */
    function toggle(id) {
        activeId === id ? close(id) : open(id);
    }

    /* ── event delegation ─────────────────────── */

    // Trigger clicks (delegated on document)
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest("[data-overlay-target]");
        if (trigger) {
            e.preventDefault();
            toggle(trigger.dataset.overlayTarget);
            return;
        }

        // Backdrop click → close
        if (activeId && e.target.closest(".overlay__backdrop")) {
            close();
        }
    });

    // ESC key → close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && activeId) close();
    });

    /* ── initialise aria ──────────────────────── */
    getAllOverlays().forEach((el) => el.setAttribute("aria-hidden", "true"));

    /* ── public surface ───────────────────────── */
    return { open, close, toggle };
})();

if (typeof window !== "undefined") window.Overlay = Overlay;

export default Overlay;
