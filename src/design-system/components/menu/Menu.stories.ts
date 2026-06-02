import { html } from 'lit'

import '~icons/lucide/external-link'
import './Menu'
import './../menu-item'
import './../menu-items'
import './../button'
import { defineStoryRender } from '../../../storybook'

const meta = {
  title: 'Design System/Menu',
} as const

const render = defineStoryRender(() => html`
    <solid-ui-menu>
        <solid-ui-button slot="trigger">
            Open Menu
        </solid-ui-button>

        <solid-ui-menu-items>
            <solid-ui-menu-item @click=${() => alert('Clicked One!')}>One</solid-ui-menu-item>
            <solid-ui-menu-item @click=${() => alert('Clicked Two!')}>Two</solid-ui-menu-item>
            <solid-ui-menu-item @click=${() => alert('Clicked Three!')}>Three</solid-ui-menu-item>
            <solid-ui-menu-item href="https://solidproject.org">
                <icon-lucide-external-link slot="left-icon"></icon-lucide-external-link>
                External
            </solid-ui-menu-item>
        </solid-ui-menu-items>
    </solid-ui-menu>
`)

export default meta

export const Primary = { render }
