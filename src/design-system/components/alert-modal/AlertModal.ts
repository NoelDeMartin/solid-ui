import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import WebComponent from '../../../primitives/lib/WebComponent'

import '../../../design-system/components/dialog/Dialog'

@customElement('solid-ui-alert-modal')
export default class AlertModal extends WebComponent {
  @property({ type: String, reflect: true })
  accessor message = ''

  protected render () {
    return html`
        <solid-ui-dialog>
            <h1>Alert</h1>
            <p>${this.message}</p>
        </solid-ui-dialog>
    `
  }
}
