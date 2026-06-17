import { customElement, WebComponent } from '@/lib/components'
import { consume } from '@lit/context'
import { html, nothing } from 'lit'
import { property, query } from 'lit/decorators.js'
import { DialogContext, dialogContext } from '@/lib/dialogs/context'
import DialogTrait from '@/lib/components/traits/DialogTrait'

import '~icons/lucide/x'
import '@/components/dialog-header'
import '@/components/button'

import styles from './Dialog.styles.css'

@customElement('solid-ui-dialog')
export default class Dialog extends WebComponent {
  static styles = styles

  @property({ type: String, reflect: true })
  accessor title = ''

  @query('dialog')
  private accessor nativeDialog: HTMLDialogElement | null = null

  @consume({ context: dialogContext, subscribe: true })
  private accessor context!: DialogContext

  private dialogTrait: DialogTrait

  constructor () {
    super()

    this.dialogTrait = this.addTrait(new DialogTrait(this, {
      getContext: () => {
        if (!this.context) {
          throw new Error('Dialog context missing')
        }

        return this.context
      }
    }))
  }

  public close () {
    this.dialogTrait.close()
  }

  protected firstUpdated () {
    if (!this.nativeDialog) {
      return
    }

    this.nativeDialog.showModal()
    this.nativeDialog.addEventListener('close', () => this.close())
  }

  protected render () {
    const header = this.title
      ? html`
        <solid-ui-dialog-header>
            <h1>${this.title}</h1>

            <solid-ui-button variant="ghost" @click=${this.close}>
                <span class="sr-only">Close</span>
                <icon-lucide-x slot="icon"></icon-lucide-x>
            </solid-ui-button>
        </solid-ui-dialog-header>
        `
      : nothing

    return html`
        <dialog>
            <slot name="header">${header}</slot>
            <slot></slot>
            <slot name="footer"></slot>
        </dialog>
    `
  }
}
