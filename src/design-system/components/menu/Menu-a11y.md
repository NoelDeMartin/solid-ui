## Dropdown Menus & The Native Popover API

When building a composite menu pattern (e.g., `<ui-menu>`, `<ui-menu-items>`, and `<ui-menu-item>`) using the native HTML Popover API, Shadow DOM encapsulation presents a specific challenge that requires an orchestrator pattern.

### The Shadow DOM Trap

You cannot link a slotted Light DOM button to a Shadow DOM `<div>` using the standard `popovertarget="id"` attribute. HTML ID references cannot pierce the Shadow DOM boundary, meaning the button will fail to find the popover.

### The Idiomatic Lit Architecture

To connect these elements without breaking encapsulation, divide the responsibilities:

1. **Host as Popover (`<ui-menu-items>`):**
Instead of putting a `<div popover>` inside the Shadow DOM, make the component's host element the popover itself. Call `this.setAttribute('popover', 'auto')` inside `connectedCallback()` and style `:host([popover])`.
2. **The Orchestrator (`<ui-menu>`):**
The root wrapper component manages the relationship. It listens for the `@slotchange` event on its slots to detect when the user injects the markup.
3. **Cross-Boundary Wiring:**
Inside the orchestrator, use `@queryAssignedElements` to capture both the trigger button and the `<ui-menu-items>` component. Link them directly via JavaScript using the object reference property: `trigger.popoverTargetElement = menuItems`.

### Key Benefits

* **No Shadow Piercing:** Avoids writing brittle code to reach inside a child's Shadow DOM.
* **Top-Layer Compatibility:** Placing the `popover` attribute on the Light DOM host element ensures the browser reliably hoists it to the Top Layer without z-index or positioning bugs.
* **Accessibility:** Because the trigger and the popover target exist in the same Light DOM context, screen readers can successfully parse the native relationship.
