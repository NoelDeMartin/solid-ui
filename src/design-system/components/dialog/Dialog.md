--> https://dev.to/ilham-bouktir/the-html-dialog-element-your-native-solution-for-accessible-modals-and-popups-308p
--> https://notesonwork.com/episodes/modals-and-popover-woes

## The Essential `<dialog>` Checklist

### Interaction & JavaScript

* **Always open with `.showModal()`:** Never use `.show()` or toggle the `open` attribute manually. Only `.showModal()` activates focus trapping, background dimming, and the `Esc` key listener.
* **Leverage `method="dialog"`:** Inside the dialog, wrap your close/cancel buttons in a `<form method="dialog">`. Submitting this form closes the dialog automatically without requiring a JavaScript click listener.
* **Check the `returnValue`:** When a `<form method="dialog">` closes the modal, the `value` of the button clicked is saved to `dialog.returnValue`. Use this to easily check if the user clicked "Confirm" or "Cancel".

### Accessibility (a11y)

* **Label the dialog:** Add `aria-labelledby="[heading-id]"` to the `<dialog>` element, pointing to the main title inside. This ensures screen readers announce the modal's purpose immediately upon opening.
* **Always provide a visible close button:** Never rely solely on the `Esc` key or clicking outside to close the modal.
* **Verify focus return:** When the dialog closes, the browser should automatically return focus to the button that opened it. Double-check this behavior if you are rendering the dialog inside a JavaScript framework (like React or Vue) that might tear down the trigger node.

### Styling & Animation

* **Style the background with `::backdrop`:** Use the native `dialog::backdrop` CSS pseudo-element to dim, blur, or style the page background while the modal is active.
* **Animate using modern CSS:** To animate the modal opening and closing smoothly, utilize `@starting-style` and `transition-behavior: allow-discrete`. This allows you to animate the `display` property without JavaScript workarounds.
* **Prevent body scrolling (if needed):** While `<dialog>` blocks interactions with the background, it doesn't automatically stop the background page from scrolling via a mouse wheel. Apply `has(:modal) { overflow: hidden; }` to your `body` tag in CSS to freeze background scrolling cleanly while any modal is open.
