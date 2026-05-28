// https://www.figma.com/design/88xQawSSXzfQprEZPaKplZ/Solid-OS?node-id=1643-5328&t=uR9ygdhiBMAfHFUK-4
// https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/

import { html } from 'lit'

import './LoginModal'
import './../button'
import { defineStoryRender } from '../../../storybook'
import { showDialog } from '../../lib/dialogs'

const meta = {
  title: 'Design System/Login Modal',
} as const

const render = defineStoryRender(() => html`
    <solid-ui-button @click=${() => showDialog(html`<solid-ui-login-modal></solid-ui-login-modal>`)}>Open</solid-ui-button>
`)

export default meta

export const Primary = { render }
