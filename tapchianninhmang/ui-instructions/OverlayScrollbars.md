# OverlayScrollbars — Reusable Custom Scrollbar System

A data-attribute-driven wrapper around [OverlayScrollbars v2](https://github.com/KingSora/OverlayScrollbars). Add `data-scroll` to any element — no JavaScript required per instance.

---

## Dependencies (CDN)

Include these in `<head>` and before `</body>`:

```html
<!-- CSS (in <head>) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.1/styles/overlayscrollbars.min.css">
<link rel="stylesheet" href="common/style/overlayscrollbar.css">

<!-- JS (before </body>) — only the module script is needed -->
<script type="module" src="common/overlayscrollbar.js"></script>
```

> The JS library is imported via ESM inside `overlayscrollbar.js` — no separate CDN `<script>` tag is required.

---

## Files

| File | Purpose |
|---|---|
| `common/overlayscrollbar.js` | Auto-init logic, MutationObserver, public API |
| `common/style/overlayscrollbar.css` | Custom themes and scrollbar sizing |

---

## Quick Start

Add `data-scroll` to any element with constrained dimensions:

```html
<div data-scroll style="max-height: 300px;">
  <!-- scrollable content here -->
</div>
```

That's it. The scrollbar initializes automatically on page load.

---

## Data Attributes

All configuration is done via HTML attributes. No JS changes needed.

| Attribute | Type | Default | Description |
|---|---|---|---|
| `data-scroll` | marker | — | **Required.** Marks element for initialization |
| `data-scroll-auto-hide` | `"never"` \| `"scroll"` \| `"leave"` \| `"move"` | `"scroll"` | When to auto-hide the scrollbar |
| `data-scroll-auto-hide-delay` | number (ms) | `800` | Delay before auto-hiding |
| `data-scroll-theme` | string (CSS class) | `"os-theme-dark"` | Theme applied to scrollbar |
| `data-scroll-overflow-x` | `"scroll"` \| `"hidden"` \| `"visible"` | `"scroll"` | Horizontal overflow behavior |
| `data-scroll-overflow-y` | `"scroll"` \| `"hidden"` \| `"visible"` | `"scroll"` | Vertical overflow behavior |
| `data-scroll-click-scroll` | `"true"` \| `"false"` | `"false"` | Click on track to jump to position |
| `data-scroll-visibility` | `"auto"` \| `"visible"` \| `"hidden"` | `"auto"` | Scrollbar visibility when axis is scrollable |

### Auto-hide values

| Value | Behavior |
|---|---|
| `"never"` | Always visible |
| `"scroll"` | Hide after user stops scrolling |
| `"leave"` | Hide when cursor leaves the element |
| `"move"` | Hide when cursor stops moving |

---

## Available Themes

| Theme class | Use case |
|---|---|
| `os-theme-dark` | Default. Dark handles on light backgrounds |
| `os-theme-light` | Light handles on dark backgrounds |
| `os-theme-custom` | Semi-transparent dark handles with custom sizing (defined in `overlayscrollbar.css`) |

---

## Usage Examples

### Vertical scroll (default)

```html
<div data-scroll style="max-height: 200px;">
  <p>Long content...</p>
</div>
```

### Horizontal scroll only

```html
<div data-scroll
     data-scroll-overflow-y="hidden"
     style="max-width: 600px;">
  <div style="white-space: nowrap; width: max-content;">
    <!-- wide content -->
  </div>
</div>
```

### Both axes with click-scroll

```html
<div data-scroll
     data-scroll-click-scroll="true"
     data-scroll-auto-hide="move"
     data-scroll-auto-hide-delay="600"
     style="max-height: 300px;">
  <div style="width: 1200px;">
    <!-- wide + tall content -->
  </div>
</div>
```

### Always visible on dark background

```html
<div data-scroll
     data-scroll-auto-hide="never"
     data-scroll-theme="os-theme-light"
     style="max-height: 200px; background: #1e1e2e; color: #cdd6f4;">
  <p>Content on dark background...</p>
</div>
```

### Custom theme

```html
<div data-scroll
     data-scroll-theme="os-theme-custom"
     style="max-height: 400px;">
  <!-- content -->
</div>
```

---

## Dynamic Content

The system uses a `MutationObserver` on `document.body`:

- **Element added to DOM** with `data-scroll` → auto-initialized.
- **Element removed from DOM** → instance destroyed (no memory leaks).
- **`data-scroll` attribute removed** → instance destroyed.
- **`data-scroll` attribute added** → instance initialized.
- **Any `data-scroll-*` attribute changed** → instance destroyed and re-initialized with new config.

No manual calls needed for dynamic content.

---

## JavaScript API (Optional)

The module exports `ScrollManager` for programmatic control:

```js
import ScrollManager from 'common/overlayscrollbar.js';

// Initialize all [data-scroll] inside a container
ScrollManager.init(containerElement);

// Initialize a specific element
ScrollManager.init(element);

// Destroy scrollbar on an element
ScrollManager.destroy(element);

// Re-initialize (destroy + init) after major content changes
ScrollManager.reinit(element);
```

> In most cases you won't need the JS API — the MutationObserver handles everything.

---

## Important Notes

1. **The element must have constrained dimensions** (`max-height`, `height`, `max-width`, or `width`) for scrollbars to appear. Without constraints, the element expands to fit content and no overflow occurs.

2. **Avoid duplicate initialization.** The system tracks instances internally via a property on each element. Calling `init()` on an already-initialized element is a no-op.

3. **The CDN script must load before the module.** Use `defer` on the CDN `<script>` tag to ensure correct load order. The module script (`type="module"`) is deferred by default.

4. **`click-scroll` requires `ClickScrollPlugin`.** This is included in the CDN bundle and registered automatically when `data-scroll-click-scroll="true"` is set.
