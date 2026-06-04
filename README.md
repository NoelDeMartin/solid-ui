# solid-ui

[![NPM Package](https://img.shields.io/npm/v/solid-ui.svg)](https://www.npmjs.com/package/solid-ui)

User Interface widgets and utilities for Solid (solid-ui)

These are HTML5 widgets which connect to a solid store. Building blocks for solid-based apps.
Vanilla JS. Includes large widgets like chat, table, matrix, form fields, and small widgets.

See [Solid-Ui Storybook](http://solidos.github.io/solid-ui/examples/storybook/) for UI widgets.
See [Solid-UI API](https://solidos.github.io/solid-ui/docs/api/) for UI functions.
See [Forms introduction](./docs/FormsReadme.md) for UI vocabulary implementation.

## Table of Contents
- [Getting Started](#getting-started)
- [How to import](#how-to-import)
- [Install via npm](#install-via-npm)
- [Use in the browser (CDN)](#use-in-the-browser-cdn)
- [Web Components](#web-components)
- [Development](#development)
- [Testing](#adding-tests)
- [Further Documentation](#further-documentation)
- [Generative AI usage](#generative-ai-usage)


## Getting started

Contributions of bug fixes and new functionality, documentation, and tests are
always appreciated.

## How to import

One `dist/` tree serves three consumers. **Pick by how you load the code**, not by guessing from filenames alone.

### By consumer

| How you load | Import / URL | Built from | `dist` output |
|--------------|--------------|------------|---------------|
| **npm** — app or bundler | `import * as UI from 'solid-ui'` | [src/core.ts](./src/core.ts) | `core.esm.js`, `core.cjs.js`, `core.d.ts` |
| **npm** — styles | `import 'solid-ui/styles.css'` | [src/styles.css](./src/styles.css) (published source) | — |
| **npm** — one custom element | `import 'solid-ui/components/<name>'` | `src/components/<name>/index.ts` | `components/<name>/index.esm.js`, `.cjs.js`, `.d.ts` |
| **Browser CDN** — full load | `<script type="module" src="…/index.js">` | [src/index.ts](./src/index.ts) | `index.js` |
| **Browser CDN** — `window.UI` only | `…/core.js` | [src/core.ts](./src/core.ts) | `core.js` |
| **Browser CDN** — one element | `…/components/<name>/index.js` | same component entry | `components/<name>/index.js` |
| **Legacy** — old pages | `solid-ui.min.js`, `solid-ui.js`, `solid-ui.esm.js` | copies / UMD of loader | see [LEGACY.md](./LEGACY.md) |

Load **rdflib** and **solid-logic** before any browser script (CDN or legacy UMD).

### By file extension (in `dist/`)

| Extension | Meaning |
|-----------|---------|
| `*.esm.js` / `*.cjs.js` | **npm** — Node and bundlers (`import` / `require`) |
| Plain `index.js`, `core.js`, `components/*/index.js` | **Browser CDN** — `<script type="module">` |
| `*.min.js` (top-level `solid-ui.*`) | **Legacy** UMD — `<script>` without `type="module"` |

**Naming note:** `dist/index.js` (CDN loader) is **not** the npm package main. Bundlers resolve `solid-ui` to **`core.esm.js`** / **`core.cjs.js`**.

### `package.json` exports (supported public API)

```json
".":              → dist/core.{esm,cjs}.js + core.d.ts
"./styles.css":    → src/styles.css
"./components/*":  → dist/components/*/index.{esm,cjs}.js + .d.ts
```

Deep paths under `dist/` (e.g. `dist/widgets/…`, `dist/lib/…`) come from `preserveModules` for the main build. They are **not** exported and may change; use `solid-ui` or `solid-ui/components/<name>` only.

### Source layout

| File | Role |
|------|------|
| [src/core.ts](./src/core.ts) | Library: `window.UI` + npm main |
| [src/index.ts](./src/index.ts) | Browser loader: core + component registration |
| [src/styles.css](./src/styles.css) | Design-system + primitives CSS variables |
| [src/components/](./src/components/) | Public custom elements (`<name>/index.ts` + [index.ts](./src/components/index.ts) glob registry) |
| [src/lib/](./src/lib/) | Former root modules (`ns`, `style`, `pad`, …) |

## Install via npm

```sh
npm install solid-ui rdflib solid-logic
```

```js
import * as UI from 'solid-ui'           // → dist/core.esm.js
import 'solid-ui/styles.css'             // CSS variables for web components
import 'solid-ui/components/button'      // registers <solid-ui-button>
import * as $rdf from 'rdflib'
import * as SolidLogic from 'solid-logic'

const button = UI.widgets.button(
  document,
  'https://solidproject.org/assets/img/solid-emblem.svg',
  'Click me',
  () => alert('Button clicked!')
)
document.body.appendChild(button)
```

## Use in the browser (CDN)

Always load dependencies first, then one or more solid-ui module scripts.

### Full loader (`index.js`)

Sets `window.UI` and registers every public component under `src/components/`.

```html
<script src="https://cdn.jsdelivr.net/npm/rdflib/dist/rdflib.min.js"></script>
<script src="https://unpkg.com/solid-logic/dist/solid-logic.min.js"></script>
<script type="module" src="https://unpkg.com/solid-ui/dist/index.js"></script>

<solid-ui-button label="Click me"></solid-ui-button>
```

### `core.js` + one component

Use when you only need `window.UI` and a subset of custom elements.

```html
<script src="https://cdn.jsdelivr.net/npm/rdflib/dist/rdflib.min.js"></script>
<script src="https://unpkg.com/solid-logic/dist/solid-logic.min.js"></script>
<script type="module" src="https://unpkg.com/solid-ui/dist/core.js"></script>
<script type="module" src="https://unpkg.com/solid-ui/dist/components/button/index.js"></script>

<solid-ui-button label="Click me"></solid-ui-button>
```

Shared chunks under `dist/components/chunks/` are part of the module graph — do not use them as standalone script URLs.

### Legacy filenames

Older integrations may still reference `solid-ui.min.js`, `solid-ui.js`, or `solid-ui.esm.js`. See **[LEGACY.md](./LEGACY.md)** for what each file is and how to migrate.

## Web Components

Public custom elements are published only from **`src/components/<name>/`**. Each folder is one npm subpath and one CDN script. Importing the module registers the element (Lit + Shadow DOM styles).

Today’s published example:

**Subpath:** `solid-ui/components/button`

```typescript
import 'solid-ui/components/button'
// or: import { Button } from 'solid-ui/components/button'
```

```html
<solid-ui-button label="Click me"></solid-ui-button>
```

**CDN:** `dist/components/button/index.js` (with `core.js` or `index.js` as above).

More elements are added by creating `src/components/<name>/index.ts` and running `npm run build:all` ([config/components.ts](./config/components.ts) discovers folders automatically). Implementations may live under `src/design-system/` or `src/primitives/`; only `src/components/` is part of the stable export surface.

### Build outputs

| Command | Produces |
|---------|----------|
| `npm run build` | `core.{esm,cjs}.js`, `preserveModules` tree, `components/<name>/index.{esm,cjs}.js` |
| `npm run build:cdn` | `index.js`, `core.js`, `components/<name>/index.js`, legacy aliases |
| `npm run build:all` | Both (publish tarball) |

### Adding a public component

1. Add `src/components/<name>/index.ts` (re-export or define the custom element).
2. Run `npm run build:all`.

## Development

| Command | Purpose |
|---------|---------|
| `npm run build` | npm ESM + CJS + types (Vite) |
| `npm run build:cdn` | CDN loader, per-component ESM, legacy UMD |
| `npm run build:all` | Full publish output (npm then CDN) |
| `npm run build-dist` | Legacy webpack (dev; overlaps `dist/`) |
| `npm run watch` | tsc + webpack watch (legacy dev loop) |

When developing a component in solid-ui you can test it in isolation using Storybook:

```
npm run build:all
npm run storybook
```

If there is no story for the component yet, add a new one to `./src/stories`.

When you want to test the component within a solid-pane, you can use the [development mode of solid-panes](https://github.com/solidos/solid-panes#development).

## Adding Tests

One can run extisting tests with:
```
npm run test
```
or with coverage
```
npm run test-coverage
```
The following document gives guidance on how to add and perform testing in solid-ui.
[Testing in solid-ui](https://github.com/SolidOS/solid-ui/blob/18070a02fa8159a2b83d9503ee400f8e046bf1f6/test/unit/README.md)

## GitHub Pages

* The github pages should contain the storybook and further documentation. In order to make sure it is deployed there is a step in the CI (gh-pages). This depends on the previous `build` step. It MUST contain `build-storybook` otherwise the storybook is not being published.

## Further documentation

- [Some code know-how](https://github.com/SolidOS/solidos/wiki/2.-Solid-UI-know-how)

## Generative AI usage
The SolidOS team is using GitHub Copilot integrated in Visual Studio Code. 
We have added comments in the code to make it explicit which parts are 100% written by AI. 

### Prompt usage history:

* Raptor mini: If I want to make the header a web component with a self contained CSS which only consumes CSS variables from a theme, how would I do this? 

* Raptor mini: Go ahead and create a header web component, for backward compatibility keep the current code too.
In the new header component I need to be flexible and receive from consumer - the layout (mobile or desktop) and the theme (light or dark) and its according CSS variables for light to dark.

* Raptor mini: Propose code. how about webpack config for distribution?

* Raptor mini: pls add a readme in the component documenting it usage and test and all

* Raptor mini: the helpMenuList should be menu items inside the help icon drop down menu

* Raptor mini: When I am not logged in I want the header to display: Log in button and Sign Up button.
When the user is logged in, there is only one button, a drop down button called Accounts. The icon of the button is the avatar of the profile and it displays a list of available accounts of the user.
I want this all to be presented flexible in the component.

* Claude Sonnet 4.6: create a LitElement also for the signupButton in the SignupButton.ts based on the signup.js code and wire it into the header like you did the loginButton.

* Raptor mini: when we are on layout mobile we do not want to display the help menu at all.

* Raptor mini: Create for me a footer Lit Component in tsy style of the components I have and under v2. Take the code from this index.ts to start with.

* Raptor mini: Good. Now, I want the footer to be a rectangular with round corners, grey background and it should have an adjustable position.

* Raptor mini: The content of the footer should be different upon loggedin or not.
If not logged in, it should say:
Title Public View
You are viewving this profile as a guest,
And if logged in:
Title: Logged in View
You are logged in as nameOfLoggedIn user.

* Raptor mini: add a readme to the Footer component with example.

* Claude Sonnet 4.6: Make the drop down as a list under the input field and enlarge the pop up, make it higher, adjustable to fit the drop down. And make the drop down arrow area larger

* GPT-5.4 Model: can you wire up the keyboard interactions and aria attributes for Select?

* GPT-5.4 Model: Take the code from /Users/sharon/2025Dev/solid-ui/src/media/media-capture.ts and make it a web component. Make it work in forms as well as not. Make it configurable and follow LoginButton.
