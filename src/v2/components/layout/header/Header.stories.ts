import { html } from 'lit'
import { defineStoryRender } from '../../../../storybook'

import './index'
import type { Header } from './Header'

const meta = {
  title: 'UI/Header',
  parameters: {
    layout: 'fullscreen',
  },
} as const

const render = defineStoryRender(() => html`<div style="display: flex; flex-direction: column;">
        <solid-ui-header></solid-ui-header>
        <div
        aria-hidden="true"
        style="
            min-height: 12rem;
            border: 1px dashed #d1d5db;
            border-radius: 10px;
            box-sizing: border-box;
            background-color: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem;
        "
        ><span style="font-size: 2rem; font-weight: bold; opacity: 0.2">Page Content</span></div>
    </div>`)

export default meta

export const Primary = { render }
