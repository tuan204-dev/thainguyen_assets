# Swiper

A reusable, data-attribute-driven Swiper slider system — just write HTML, no extra JavaScript needed.

## Files

| File               | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `common/swiper.js` | Auto-initializing Swiper manager (import as ES module) |

**CDN dependencies** (add to your HTML `<head>`):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
```

## Quick Start

### 1. Include CSS & JS

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />

<!-- Before </body> -->
<script type="module" src="../../common/swiper.js"></script>
```

### 2. Create a slider

Add `data-swiper` to a `.swiper` container with standard Swiper markup:

```html
<div class="swiper" data-swiper>
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
    </div>
</div>
```

That's it — the slider initializes automatically on page load.

---

## Data Attributes

All configuration is done via `data-swiper-*` attributes on the `.swiper` container:

| Attribute                     | Type               | Default        | Description                                                               |
| ----------------------------- | ------------------ | -------------- | ------------------------------------------------------------------------- |
| `data-swiper`                 | _(flag)_           | —              | **Required.** Marks element for auto-init                                 |
| `data-swiper-loop`            | `"true"`           | `false`        | Enable infinite loop                                                      |
| `data-swiper-speed`           | number             | `300`          | Transition speed in ms                                                    |
| `data-swiper-slides-per-view` | number \| `"auto"` | `1`            | Visible slides                                                            |
| `data-swiper-space-between`   | number             | `0`            | Gap between slides in px                                                  |
| `data-swiper-autoplay`        | `"true"` \| JSON   | `false`        | Autoplay config                                                           |
| `data-swiper-effect`          | string             | `"slide"`      | `"slide"` `"fade"` `"cube"` `"coverflow"` `"flip"` `"cards"` `"creative"` |
| `data-swiper-direction`       | string             | `"horizontal"` | `"horizontal"` \| `"vertical"`                                            |
| `data-swiper-centered-slides` | `"true"`           | `false`        | Center the active slide                                                   |
| `data-swiper-free-mode`       | `"true"`           | `false`        | Enable free scroll mode                                                   |
| `data-swiper-breakpoints`     | JSON               | —              | Responsive breakpoints                                                    |
| `data-swiper-pagination-type` | string             | `"bullets"`    | `"bullets"` `"fraction"` `"progressbar"`                                  |

---

## Navigation & Pagination

Navigation and pagination are **auto-detected** by the presence of standard Swiper elements inside the `[data-swiper]` container. Each instance scopes its own controls.

### Navigation (prev/next buttons)

Place `.swiper-button-prev` and `.swiper-button-next` inside the container:

```html
<div class="swiper" data-swiper>
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
    </div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
</div>
```

### Pagination

Place `.swiper-pagination` inside the container:

```html
<div class="swiper" data-swiper data-swiper-pagination-type="bullets">
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
    </div>
    <div class="swiper-pagination"></div>
</div>
```

---

## Examples

### Basic with autoplay & loop

```html
<div class="swiper" data-swiper data-swiper-autoplay="true" data-swiper-loop="true">
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
    </div>
</div>
```

### Fade effect with pagination

```html
<div
    class="swiper"
    data-swiper
    data-swiper-effect="fade"
    data-swiper-autoplay='{"delay":4000,"disableOnInteraction":false}'
    data-swiper-loop="true"
>
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
    </div>
    <div class="swiper-pagination"></div>
</div>
```

### Responsive breakpoints

```html
<div
    class="swiper"
    data-swiper
    data-swiper-slides-per-view="1"
    data-swiper-space-between="16"
    data-swiper-breakpoints='{"640":{"slidesPerView":2,"spaceBetween":20},"1024":{"slidesPerView":3,"spaceBetween":24}}'
>
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
        <div class="swiper-slide">Slide 4</div>
    </div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
</div>
```

### Full-featured

```html
<div
    class="swiper"
    data-swiper
    data-swiper-slides-per-view="1"
    data-swiper-space-between="24"
    data-swiper-loop="true"
    data-swiper-speed="500"
    data-swiper-autoplay='{"delay":5000,"disableOnInteraction":false}'
    data-swiper-pagination-type="fraction"
    data-swiper-breakpoints='{"768":{"slidesPerView":2},"1280":{"slidesPerView":3}}'
>
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
        <div class="swiper-slide">Slide 4</div>
        <div class="swiper-slide">Slide 5</div>
    </div>
    <div class="swiper-pagination"></div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
</div>
```

---

## JavaScript API

Besides data attributes, you can control instances programmatically:

```js
import SwiperManager from "../../common/swiper.js";

// Initialize all [data-swiper] under a root
SwiperManager.init(document.getElementById("content"));

// Initialize a specific element
SwiperManager.init(document.querySelector("#my-slider"));

// Destroy
SwiperManager.destroy(document.querySelector("#my-slider"));

// Re-initialize (after config attribute changes)
SwiperManager.reinit(document.querySelector("#my-slider"));
```

---

## Notes & Best Practices

1. **Standard Swiper markup is required** — `.swiper` > `.swiper-wrapper` > `.swiper-slide` hierarchy.
2. **No duplicate init** — each element is guarded by a `__swiperInstance` property.
3. **Scoped controls** — navigation and pagination elements are found _within_ the `[data-swiper]` container, so multiple sliders on a page won't conflict.
4. **JSON attributes** — use single quotes around the attribute value to embed JSON: `data-swiper-autoplay='{"delay":3000}'`.
5. **Fade effect** with multiple slides-per-view doesn't work well — use `slidesPerView: 1` with `"fade"`.
6. **Loop mode** requires enough slides to fill the view — ensure you have more slides than `slidesPerView`.
7. **Swiper CSS** must be loaded via CDN `<link>` — the JS module does not inject styles.
