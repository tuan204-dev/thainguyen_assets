# Overlay

A reusable fullscreen overlay system controlled entirely via HTML `data-*` attributes — no extra JavaScript required.

## Files

| File                       | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `common/overlay.js`        | Logic & event handling (auto-initializes on import) |
| `common/style/overlay.css` | Backdrop, content panel, and animation styles       |

## Quick Start

### 1. Import CSS & JS

```html
<link rel="stylesheet" href="../../common/style/overlay.css" />

<!-- before </body> -->
<script type="module" src="../../common/overlay.js"></script>
```

### 2. Create a trigger

Add `data-overlay-target="<id>"` to any clickable element:

```html
<button data-overlay-target="my-menu">Open Menu</button>
```

### 3. Create the overlay

Add `data-overlay-id="<id>"` matching the trigger. Inside, include `.overlay__backdrop` and `.overlay__content`:

```html
<div class="overlay" data-overlay-id="my-menu">
    <div class="overlay__backdrop"></div>
    <div class="overlay__content">
        <!-- Any content -->
        <h3>Menu</h3>
        <p>Overlay content goes here.</p>
    </div>
</div>
```

> **Note:** Place overlay markup **outside** `<main>`, just before `</body>`.

---

## Variants

Add `data-overlay-variant` on the `.overlay` element to change the display style:

| Variant         | Attribute                            | Description                                 |
| --------------- | ------------------------------------ | ------------------------------------------- |
| **Mega Menu**   | _(default, no attribute needed)_     | Top-aligned panel, slide-up animation       |
| **Modal**       | `data-overlay-variant="modal"`       | Vertically centered dialog, scale animation |
| **Fullscreen**  | `data-overlay-variant="fullscreen"`  | Covers entire viewport, no border-radius    |
| **Slide Right** | `data-overlay-variant="slide-right"` | Panel slides in from the right edge         |

### Examples

```html
<!-- Modal -->
<div class="overlay" data-overlay-id="confirm" data-overlay-variant="modal">
    <div class="overlay__backdrop"></div>
    <div class="overlay__content">
        <h3>Confirm</h3>
        <p>Are you sure?</p>
        <button data-overlay-target="confirm">Close</button>
    </div>
</div>

<!-- Fullscreen -->
<div class="overlay" data-overlay-id="nav" data-overlay-variant="fullscreen">
    <div class="overlay__backdrop"></div>
    <div class="overlay__content">
        <button data-overlay-target="nav">✕</button>
        <nav>...</nav>
    </div>
</div>

<!-- Slide Right -->
<div class="overlay" data-overlay-id="settings" data-overlay-variant="slide-right">
    <div class="overlay__backdrop"></div>
    <div class="overlay__content">
        <button data-overlay-target="settings">✕</button>
        <h3>Settings</h3>
    </div>
</div>
```

---

## Behavior

| Behavior           | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| **Toggle**         | Clicking the same trigger again closes its overlay                            |
| **Switch**         | Clicking a different trigger closes the current overlay and opens the new one |
| **Backdrop close** | Clicking `.overlay__backdrop` closes the overlay                              |
| **ESC key**        | Pressing `Escape` closes the active overlay                                   |
| **Scroll lock**    | Body receives `.overlay-open` class (`overflow: hidden`)                      |
| **Singleton**      | Only one overlay can be open at a time                                        |

---

## JavaScript API

Besides data attributes, you can control overlays programmatically:

```js
import Overlay from "../../common/overlay.js";

Overlay.open("my-menu"); // Open by id
Overlay.close("my-menu"); // Close by id (or Overlay.close() for the active one)
Overlay.toggle("my-menu"); // Toggle open/close
```

---

## Accessibility

- Automatically sets `aria-hidden="true"` on init, switches to `"false"` when opened.
- Supports closing via `Escape` key.

---

## CSS Class Reference

| Class                | Element          | Description                                 |
| -------------------- | ---------------- | ------------------------------------------- |
| `.overlay`           | Outer container  | Fixed, covers viewport, hidden by default   |
| `.overlay.is-active` | Outer container  | Makes the overlay visible                   |
| `.overlay__backdrop` | Background layer | Semi-transparent (`rgba(0,0,0,0.5)`) + blur |
| `.overlay__content`  | Content panel    | White panel with animation                  |
| `.overlay-open`      | `<body>`         | Locks scroll while an overlay is open       |
