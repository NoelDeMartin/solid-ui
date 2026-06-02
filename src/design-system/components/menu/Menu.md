### Native Dropdown Implementation Guide

This guide outlines the core concepts, implementation details, and edge cases to keep in mind when building native dropdown menus using modern web platform features.

---

### 1. The Foundation: Popover API

The Popover API handles all behavioral aspects of the dropdown menu without requiring custom JavaScript event listeners.

* **Top Layer Promotion:** The `popover` attribute moves the element to the browser's Top Layer, guaranteeing it renders above all other elements and completely bypassing standard `z-index` rules.
* **Light Dismiss:** Clicking outside the popover automatically closes it.
* **Keyboard Accessibility:** The `Esc` key natively dismisses the topmost popover.
* **Declarative Trigger:** Use `popovertarget="[id]"` on the button to link it directly to the menu, avoiding JavaScript click handlers.

---

### 2. Positioning: CSS Anchor Positioning

CSS Anchor Positioning handles calculating coordinates and tethering the dropdown to the trigger button.

```css
.avatar-button {
  anchor-name: --avatar-anchor;
}

.dropdown-menu {
  /* Clear default popover margins */
  margin: 0;
  position-anchor: --avatar-anchor;
  top: anchor(bottom);
  right: anchor(right);
}

```

---

### 3. Edge Clipping & Collision Avoidance

To prevent the dropdown from rendering off-screen when the user scrolls or resizes the window, utilize the `position-try-fallbacks` property.

* **Built-in keywords:** The easiest approach is using `flip-block` (flips vertically) and `flip-inline` (flips horizontally).
* **Custom Fallbacks:** For complex adjustments (e.g., shifting margins when flipped), define rules using `@position-try --custom-name { ... }`.

```css
.dropdown-menu {
  /* Tries bottom right, then above, then left */
  position-try-fallbacks: flip-block, flip-inline;
}

```

---

### 4. Modals and Dialog Contexts

When placing a dropdown inside a `<dialog>`, the Popover API is exceptionally powerful, but requires specific DOM placement.

> **Critical DOM Structure:** The `<div popover>` element MUST be placed **inside** the `<dialog>` in your HTML tree. This ensures focus trapping behaves correctly.

* **Escaping Bounds:** Because the popover joins the Top Layer, it will visually break out of the dialog's physical constraints. It will never be clipped by the modal's `overflow: hidden`.
* **Stacking Order:** Popovers opened after the dialog will stack safely on top of it in the Top Layer.
* **Dismissal:** Pressing `Esc` will correctly close only the popover first, leaving the dialog open.

---

### 5. Browser Support & Polyfills

While Popover and Anchor Positioning are standardizing rapidly, older browsers require fallback strategies.

* **Graceful Degradation:** Unsupported browsers will ignore anchor positioning. Natively, they will fall back to standard popover behavior: displaying the menu dead-center on the screen.
* **Progressive Enhancement:** Wrap your modern positioning in a feature query using `@supports (position-anchor: --test) { ... }`.
* **Polyfilling:** If precise anchoring is strictly required on older clients, integrate the **Oddbird CSS Anchor Positioning Polyfill** into your application to calculate the bounds via JavaScript.
