import { consume } from '@lit/context'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import commonStyles from '../../styles/common.styles.css'

import WebComponent from '../../lib/WebComponent'

import { authContext, AuthContext, DEFAULT_AUTH_CONTEXT } from '../../lib/auth/context'

@customElement('solid-logout-button')
export default class LogoutButton extends WebComponent {
  static styles = commonStyles

  @consume({ context: authContext, subscribe: true })
  private accessor auth: AuthContext = DEFAULT_AUTH_CONTEXT

  protected render () {
    return html`
      <slot name="trigger" @click=${this.onClick}>
        <button type="button">
            <slot>
                Log Out
            </slot>
        </button>
      </slot>
    `
  }

  private onClick (e: MouseEvent) {
    e.preventDefault()

    this.auth.logout()
  }
}
