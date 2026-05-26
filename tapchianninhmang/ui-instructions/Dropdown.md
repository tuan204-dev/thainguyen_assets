# Floating Dropdown

Data-attribute-driven dropdown system built on [Floating UI](https://floating-ui.com/).  
Zero configuration in JS — just write HTML with the correct data attributes and include the script.

---

## Setup

### 1. Include the script

```html
<script type="module" src="../../common/floating-dropdown.js"></script>
```

> The script uses Floating UI via CDN (`@floating-ui/dom@1.6.13`).  
> No `npm install` needed.

### 2. Include the CSS

Add the dropdown styles from `common/style/common.css`.  
Either link it directly:

```html
<link rel="stylesheet" href="../../common/style/common.css">
```

Or import it inside your `source.css`:

```css
@import "../../common/style/common.css";
```

---

## Data Attributes

### Required

| Attribute | Element | Description |
|---|---|---|
| `data-floating-dropdown` | Root wrapper `<div>` | Marks this element as a dropdown instance |
| `data-floating-trigger` | `<button>` (direct child of root) | The button that opens the menu |
| `data-floating-menu` | `<div>` (direct child of root) | The dropdown panel. **Must** have class `is-hidden` initially |

### Submenu (nested)

| Attribute | Element | Description |
|---|---|---|
| `data-floating-submenu` | Wrapper `<div>` inside `[data-floating-menu]` | Groups a submenu trigger + submenu panel |
| `data-floating-submenu-trigger` | `<button>` (direct child of submenu wrapper) | Opens the submenu on hover/click |
| `data-floating-submenu-menu` | `<div>` (direct child of submenu wrapper) | The submenu panel. **Must** have class `is-hidden` initially |

### Configuration (on root `[data-floating-dropdown]`)

| Attribute | Values | Default | Description |
|---|---|---|---|
| `data-placement` | `bottom-start`, `bottom-end`, `top-start`, `top-end`, `right-start`, `left-start`, … | `bottom-start` | Floating UI placement |
| `data-offset` | Any number (px) | `8` | Gap between the trigger and the menu |
| `data-trigger` | `hover` \| `click` | `hover` | How the dropdown is toggled |

---

## CSS Classes

| Class | Purpose |
|---|---|
| `dropdown-block` | Root wrapper |
| `dropdown-trigger` | Trigger button styling |
| `dropdown-menu` | Menu panel styling |
| `dropdown-item` | Individual menu item |
| `dropdown-item danger` | Destructive action item (red) |
| `dropdown-submenu` | Submenu wrapper |
| `submenu-trigger` | Submenu trigger (adds `justify-content: space-between`) |
| `submenu-menu` | Submenu panel (narrower width) |
| `submenu-caret` | Arrow icon `›` for submenu triggers |
| `caret` | Arrow icon `▾` for root triggers |
| `dropdown-separator` | Horizontal divider line between items |
| `is-hidden` | Hides an element (`display: none`) — toggled by JS |

### CSS Hooks (set by JS)

| Attribute | Set on | When |
|---|---|---|
| `data-open="true"` | `[data-floating-menu]`, `[data-floating-submenu-menu]`, root `[data-floating-dropdown]` | Menu is visible |
| `--bridge-pad` | Menu element (inline style) | Dynamically set for hover gap bridging |

Use `[data-open="true"]` for entry animations:

```css
.dropdown-menu[data-open="true"] {
    animation: menu-enter 0.18s ease-out forwards;
}
```

---

## Examples

### Basic dropdown (hover)

```html
<div class="dropdown-block" data-floating-dropdown>
    <button type="button" class="dropdown-trigger" data-floating-trigger>
        Actions
        <span class="caret" aria-hidden="true">▾</span>
    </button>

    <div role="menu" class="dropdown-menu is-hidden" data-floating-menu>
        <button role="menuitem" class="dropdown-item">Edit</button>
        <button role="menuitem" class="dropdown-item">Duplicate</button>
        <div class="dropdown-separator"></div>
        <button role="menuitem" class="dropdown-item danger">Delete</button>
    </div>
</div>
```

### Click mode with custom placement and offset

```html
<div class="dropdown-block" data-floating-dropdown
     data-placement="right-start"
     data-offset="12"
     data-trigger="click">
    <button type="button" class="dropdown-trigger" data-floating-trigger>
        More
        <span class="caret" aria-hidden="true">▾</span>
    </button>

    <div role="menu" class="dropdown-menu is-hidden" data-floating-menu>
        <button role="menuitem" class="dropdown-item">Share</button>
        <button role="menuitem" class="dropdown-item">Archive</button>
        <div class="dropdown-separator"></div>
        <button role="menuitem" class="dropdown-item danger">Remove</button>
    </div>
</div>
```

### Nested submenus (multi-level)

Nesting depth follows the HTML structure — no limit.

```html
<div class="dropdown-block" data-floating-dropdown>
    <button type="button" class="dropdown-trigger" data-floating-trigger>
        Actions
        <span class="caret" aria-hidden="true">▾</span>
    </button>

    <div role="menu" class="dropdown-menu is-hidden" data-floating-menu>
        <button role="menuitem" class="dropdown-item">Edit</button>

        <!-- Level 2: Export -->
        <div class="dropdown-submenu" data-floating-submenu>
            <button role="menuitem" class="dropdown-item submenu-trigger"
                    data-floating-submenu-trigger>
                Export
                <span class="submenu-caret" aria-hidden="true">›</span>
            </button>
            <div role="menu" class="dropdown-menu is-hidden submenu-menu"
                 data-floating-submenu-menu>
                <button role="menuitem" class="dropdown-item">PDF</button>
                <button role="menuitem" class="dropdown-item">CSV</button>

                <!-- Level 3: Image -->
                <div class="dropdown-submenu" data-floating-submenu>
                    <button role="menuitem" class="dropdown-item submenu-trigger"
                            data-floating-submenu-trigger>
                        Image
                        <span class="submenu-caret" aria-hidden="true">›</span>
                    </button>
                    <div role="menu" class="dropdown-menu is-hidden submenu-menu"
                         data-floating-submenu-menu>
                        <button role="menuitem" class="dropdown-item">PNG</button>
                        <button role="menuitem" class="dropdown-item">SVG</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="dropdown-separator"></div>
        <button role="menuitem" class="dropdown-item danger">Delete</button>
    </div>
</div>
```

---

## Behavior Summary

| Feature | Detail |
|---|---|
| **Positioning** | Floating UI `computePosition` with `flip()`, `shift()`, `offset()` |
| **Auto-update** | Position recalculates on scroll/resize while menu is open |
| **Hover mode** | Opens on `mouseenter`, closes after ~250ms delay on `mouseleave` |
| **Click mode** | Toggle on click, close on outside click |
| **Submenus** | Open on hover (with ~180ms close delay), click fallback for touch |
| **Sibling close** | Opening a submenu auto-closes its siblings |
| **Keyboard** | `Escape` closes the menu and returns focus to trigger |
| **Auto-init** | All `[data-floating-dropdown]` elements are initialized on page load |
| **Multiple instances** | Each dropdown is fully independent |

---

## HTML Structure Diagram

```
[data-floating-dropdown]              ← root wrapper
├── [data-floating-trigger]           ← trigger button
└── [data-floating-menu].is-hidden    ← menu panel
    ├── .dropdown-item                ← regular item
    ├── .dropdown-separator           ← divider
    ├── [data-floating-submenu]       ← submenu wrapper
    │   ├── [data-floating-submenu-trigger]   ← submenu trigger
    │   └── [data-floating-submenu-menu].is-hidden  ← submenu panel
    │       ├── .dropdown-item
    │       └── [data-floating-submenu]       ← deeper nesting...
    └── .dropdown-item.danger         ← destructive item
```

---

## File References

| File | Purpose |
|---|---|
| `common/floating-dropdown.js` | JavaScript implementation (auto-init, positioning, interactions) |
| `common/style/common.css` | Shared CSS for dropdown styling |
