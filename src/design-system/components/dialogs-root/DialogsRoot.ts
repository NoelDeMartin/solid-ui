import { html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import WebComponent from '../../../primitives/lib/WebComponent'
import { DialogController } from '../../lib/dialogs/DialogController'
import { ShowDialogEvent } from '../../lib/dialogs/events/show-dialog'

import '../dialog-provider/DialogProvider'
import { CloseDialogEvent } from '../../lib/dialogs/events/close-dialog'

@customElement('solid-ui-dialogs-root')
export default class DialogsRoot extends WebComponent {
  @state()
  private accessor dialogs: DialogController[] = []

  connectedCallback (): void {
    super.connectedCallback()

    window.addEventListener(ShowDialogEvent.eventName, (event) => {
      event.stopPropagation()

      this.dialogs = this.dialogs.concat([event.controller])
    })

    window.addEventListener(CloseDialogEvent.eventName, (event) => {
      event.stopPropagation()

      this.dialogs = this.dialogs.filter(dialog => dialog.id !== event.id)
    })
  }

  protected render () {
    return html`${this.dialogs.map(dialog => html`<solid-ui-dialog-provider dialogId="${dialog.id}">${dialog.template}</solid-ui-dialog-provider>`)}`
  }
}
