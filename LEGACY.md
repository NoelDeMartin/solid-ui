# Legacy CDN artifacts

`solid-ui` publishes a small set of **deprecated filenames** in `dist/` so older HTML pages and CDNs keep working. They are built alongside the modern CDN entrypoints (`index.js`, `core.js`, `components/*/index.js`). See the [README](./README.md) for current usage.

All legacy files are produced by `npm run build:cdn` (Vite `cdn` + `cdn-legacy` modes). Implementation: [config/cdn.ts](./config/cdn.ts).

## Files

| File | What it is | Prefer instead |
|------|------------|----------------|
| **`solid-ui.min.js`** | UMD bundle (minified). Entry: [src/index.ts](./src/index.ts) (full loader: `window.UI` + all public custom elements). Expects globals `window.$rdf` (rdflib) and `window.SolidLogic` (solid-logic) as externals. | `index.js` as `<script type="module">` when you can use ESM |
| **`solid-ui.js`** | Byte-for-byte copy of `solid-ui.min.js` (and `.map` if present). Exists for pages that linked the old unminified **filename**; it is still minified. | `index.js` |
| **`solid-ui.esm.js`** | Byte-for-byte copy of `index.js` (and `.map` if present). Exists for pages that imported the old default ESM URL. | `index.js` |

Source maps: `solid-ui.min.js.map`, `solid-ui.js.map`, `solid-ui.esm.js.map` mirror the files above.

## Behaviour

- **UMD (`solid-ui.min.js` / `solid-ui.js`)** assigns the library to global **`window.UI`** (same object as the modern loader). Load **rdflib** and **solid-logic** before solid-ui so `$rdf` and `SolidLogic` exist.
- **ESM alias (`solid-ui.esm.js`)** is the same module graph as **`index.js`**: imports `./core.js`, registers components under `dist/components/`, and may pull shared chunks from `dist/components/chunks/`.

## Not legacy (do not confuse)

| File | Role |
|------|------|
| `index.js` | Current **browser** full loader (plain `.js`, not npm) |
| `core.js` | Current **browser** `window.UI` only |
| `core.esm.js` / `core.cjs.js` | **npm** package main (`import 'solid-ui'`) |
| `components/<name>/index.js` | Current per-component browser scripts |
| `components/<name>/index.esm.js` | npm subpath `solid-ui/components/<name>` |

The name collision between **`dist/index.js`** (CDN) and an old mental model of “index = npm main” is intentional: **npm uses `core.*` and `*.esm.js` / `*.cjs.js` extensions**; **CDN uses plain `*.js`**.

## Migration

1. **UMD → ESM loader:** replace `<script src=".../solid-ui.min.js">` with rdflib + solid-logic + `<script type="module" src=".../index.js">`.
2. **Old ESM URL → new:** replace `solid-ui.esm.js` with `index.js`.
3. **Split bundles:** use `core.js` plus `components/<name>/index.js` only for the custom elements you need (smaller than the full loader).

No removal date is set; these aliases remain for backward compatibility on the npm package’s `dist/` tarball.
