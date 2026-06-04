# solid-ui build & CDN plan

Handoff document for continuing work on **solid-ui** publish outputs (`workspaces/solid-ui`). Summarizes goals, discoveries, current implementation, and remaining tasks.

**Related files:** `vite.config.ts`, `src/cdn*.ts`, `src/cdn-components.ts`, `src/cdn-register-v2.ts`, `package.json`, `build-system.md` (short notes only).

**References:**

- [Lit — Publishing](https://lit.dev/docs/tools/publishing/)
- [Web Awesome — Installation / dist vs dist-cdn](https://webawesome.com/docs)
- [Web Awesome build script](https://github.com/shoelace-style/webawesome/blob/v3.7.0/packages/webawesome/scripts/build.js) (esbuild: bundled `dist-cdn`, externalized `dist`)

---

## Goals (three audiences)

| # | Audience | Requirement |
|---|----------|-------------|
| **1** | **Legacy CDN** (classic `<script>` in HTML) | Existing pages keep working: one script tag → `window.UI` + v2 custom elements registered. |
| **2** | **New CDN** (modern browsers) | Single **loader** entry (OK if it only registers all components for now; autoload later). Per-component script tags optional. |
| **3** | **npm** (bundler consumers) | ESM + CJS via `package.json` `exports`, **externalized** deps (`rdflib`, `solid-logic`, …), **no full-library bundle/minify** per [Lit publishing](https://lit.dev/docs/tools/publishing/). |

These are **intentionally separate pipelines** in one `dist/` folder, distinguished by **file extension** (not a separate `dist-cdn/` tree).

---

## File extension convention (implemented)

All outputs live under `dist/`. Extension signals the consumer:

| Extension | Consumer | Examples |
|-----------|----------|----------|
| `*.esm.js` | npm `import` | `dist/index.esm.js`, `dist/v2/.../Button.esm.js` |
| `*.cjs.js` | npm `require` | `dist/index.cjs.js`, `dist/acl/acl.cjs.js` |
| plain `*.js` | **CDN only** (browser ESM) | `dist/index.js`, `dist/core.js`, `dist/components/button/index.js` (chunks under `components/chunks/` are internal) |
| `*.min.js` | **CDN legacy** (UMD) | `dist/solid-ui.min.js` |

**Why:** npm and CDN used to overwrite the same `dist/components/*/index.js`. Splitting extensions lets both coexist in one directory (e.g. `dist/components/button/index.esm.js` + `index.cjs.js` for npm, `index.js` for CDN).

Internal npm imports use matching suffixes (`./ns.esm.js`, `require("./ns.cjs.js")`).

---

## Build commands

```bash
npm run build      # default vite mode → npm (preserveModules, .esm.js + .cjs.js)
npm run build:cdn  # cdn → ESM CDN bundles; cdn-legacy → solid-ui.min.js
npm run build:all  # both (order: npm first, then CDN — prepublishOnly uses this)
```

`npm run build:cdn` runs `vite build --mode cdn` then `vite build --mode cdn-legacy`. The legacy build copies `solid-ui.min.js` → `solid-ui.js` via a `closeBundle` plugin.

`emptyOutDir: false` on CDN modes so npm artifacts are not wiped.

---

## Vite modes (`vite.config.ts`)

### Default (npm)

- **Entry:** `src/index.ts` + one lib entry per `CDN_V2_COMPONENTS` item (`components/<sourceDir>/index` → `src/v2/components/<sourcePath>/index.ts`).
- **Formats:** `es` + `cjs` via dual `rolldownOptions.output` with `preserveModules` / `preserveModulesRoot: 'src'`.
- **External:** everything except `~icons/*`, `@oxc-project/runtime`, and relative/absolute project paths.
- **Babel:** decorator paths only (`design-system`, `primitives`, `storybook`) — **no** `@babel/preset-env` on the whole library.
- **Types:** `unplugin-dts` → `dist/**/*.d.ts`.

### `cdn` (new CDN)

- **Multi-entry ESM** with **code splitting** (one build for all components).
- **Entries:** `src/cdn.ts` (loader) + each v2 component from `cdnComponentEntries()`.
- **Output:**
  - `dist/index.js` — full browser loader (`window.UI` + all v2 elements)
  - `dist/core.js` — `window.UI` only
  - `dist/components/<sourceDir>/index.js` — per-component CDN entry
  - `dist/components/chunks/<name>-<hash>.js` — shared (lit, keyboard helpers, large shared modules, etc.)
- **External globals:** `rdflib` → `$rdf`, `solid-logic` → `SolidLogic`, plus node shims (`fs`, `fetch`, …).
- **Babel:** full browser targets (`> 1%`, `last 3 versions`, `not dead`) + `preset-env` for CDN bundles.
- **Minify:** yes.

### `cdn-legacy` (legacy CDN)

- **Entry:** `src/cdn-legacy.ts` → imports `src/index.ts` + `src/cdn-register-v2.ts`.
- **Output:** single UMD `dist/solid-ui.min.js` (legacy `window.UI` + all v2 custom elements inlined).
- Same CDN externals and babel browser transpilation as `cdn` mode.

---

## Source entries

| File | Role |
|------|------|
| `src/cdn-components.ts` | Canonical list `CDN_V2_COMPONENTS` (used by vite + register) |
| `src/cdn-register-v2.ts` | Side-effect imports registering all v2 elements — **keep in sync** with `cdn-components.ts` |
| `src/cdn-legacy.ts` | Legacy CDN: `index` + `cdn-register-v2` |
| `src/cdn.ts` | ESM CDN loader: only `cdn-register-v2` (no legacy `window.UI`) |
| `src/index.ts` | Legacy library; sets `window.UI` when run in browser |

`src/components/<name>/` (e.g. `button/index.ts`) are thin re-exports for **npm** public paths (`solid-ui/components/*`), not CDN build inputs.

---

## v2 components in CDN (current list)

From `CDN_V2_COMPONENTS`:

- `header`, `loginButton`, `signupButton`, `photoCapture`, `button`, `footer`, `select`, `combobox`

---

## Browser usage (current)

### Legacy (one classic script)

```html
<script src="https://cdn.jsdelivr.net/npm/rdflib/..."></script>
<script src="https://unpkg.com/solid-logic/..."></script>
<script src="…/dist/solid-ui.min.js"></script>
<script>
  const { widgets } = window.UI
</script>
```

### New CDN — all components (loader)

```html
<script src="rdflib + solid-logic as above"></script>
<script type="module" src="…/dist/index.js"></script>
```

### New CDN — one component

```html
<script type="module" src="…/dist/components/button/index.js"></script>
```

Shared chunks load automatically via ESM `import` graph.

### npm

```js
import * as UI from 'solid-ui'           // → dist/index.esm.js
import { Button } from 'solid-ui/v2/components/actions/button'  // paths via exports map
```

```js
const UI = require('solid-ui')           // → dist/index.cjs.js
```

---

## Discoveries & decisions (context for future work)

### 1. IIFE per component caused duplication

Early CDN approach: one Vite build per component (`cdn-component` + loop in `build-cdn.mjs`), IIFE format. Each bundle inlined **Lit** and shared helpers (~27 KB per small component).

**Fix:** Single `cdn` mode build with multiple ESM entries + Rollup/Rolldown code splitting → `dist/components/chunks/lit-*.js` shared across entries.

**Note:** IIFE + code splitting does not work well; ESM + `<script type="module">` is the supported CDN shape.

### 2. `solid-ui.js` UMD loader + dynamic `import()` was broken

An intermediate `src/cdn.ts` injected `<script type="module">` from a **UMD** `solid-ui.js`. Babel `preset-env` rewrote `import()` to `require()` inside the UMD bundle → **broken in browsers**.

**Fix:** Split legacy (UMD all-in-one) vs new CDN (ESM only). No dynamic `import()` from classic scripts.

### 3. `type="module"` vs legacy browserslist

CDN babel targets (`> 1%`, `last 3 versions`, `not dead`) align with **native ES modules**. That is a **stricter** requirement than “syntax transpiled for old browsers”: module scripts need Chrome 61+, Firefox 60+, Safari 11+, etc. Legacy UMD path does not require modules.

### 4. Web Awesome comparison ([docs](https://webawesome.com/docs))

| | Web Awesome `dist-cdn` | solid-ui (current) |
|--|------------------------|---------------------|
| npm tree | `dist/` — deps **external** | `dist/**/*.esm.js` + `*.cjs.js` — deps external |
| CDN tree | `dist-cdn/` — **bundled** | plain `*.js`: `dist/index.js`, `dist/core.js`, `dist/components/*` |
| Loader | `webawesome.loader.js` — autodiscovers `wa-*`, dynamic `import()` | `dist/index.js` — **eager** register-all + `window.UI` |
| Legacy monolith | No separate UMD for old API | `solid-ui.min.js` UMD for `window.UI` |
| CSS | Separate `styles/` links | Mostly shadow DOM + optional CSS variable files |

We **did not** add a separate `dist-cdn/` folder; extension split in `dist/` was chosen instead.

### 5. Lit publishing ([docs](https://lit.dev/docs/tools/publishing/))

- npm: **do not** bundle/minify the library → we use `preserveModules` ✓
- CDN: Lit says put CDN builds **separate** from npm (separate folder or release-only) → we separate by **extension** within `dist/` ✓
- Publish modern ES2021-ish syntax; compile decorators only → npm babel mostly limited to decorator trees ✓
- Self-define custom elements in entry modules ✓

### 6. `build-cdn.mjs` used to scan `src/components/`

Only `button` existed there; so most CDN IIFE builds never ran. **Fixed:** entries driven by `CDN_V2_COMPONENTS` / v2 paths only.

### 7. Webpack still present

`webpack.config.mjs` still builds legacy UMD + per-component IIFE into overlapping paths. **Vite is the intended CDN/npm path** for this plan; webpack `watch:dist` / `build-dist` may still confuse dev workflows until retired or documented as legacy.

---

## Progress by goal

### Goal 1 — Legacy CDN ✅ (mostly complete)

**Done:**

- [x] `cdn-legacy` → `dist/solid-ui.min.js` (UMD, `window.UI` + all v2 via `cdn-register-v2`)
- [x] External `rdflib` / `solid-logic` globals unchanged
- [x] Extension split: npm no longer collides with CDN `components/*/index.js`
- [x] `build-form-examples` copies `solid-ui.min.js`

**Remaining (optional / cleanup):**

- [x] **Unminified `dist/solid-ui.js`** — not produced by Vite publish; documented in README (webpack dev only)
- [x] Update **README** CDN section (three-path layout)
- [x] Update **examples/header** to `solid-ui.min.js` + rdflib
- [x] Update **test/browser/tabs** to `solid-ui.min.js` + deps
- [ ] Update **docs/form-examples** commented refs (low priority; many use mashlib)
- [ ] Audit **mashlib** and other monorepo consumers for script URL
- [ ] **Webpack:** deprecate or gate CDN outputs so Vite is single source of truth

---

### Goal 2 — New CDN loader 🟡 (core done, polish open)

**Done:**

- [x] Multi-entry ESM build with shared chunks
- [x] Loader `dist/index.js`, core `dist/core.js` (`src/index-loader.ts`, `src/index-register.ts`)
- [x] Per-component `dist/components/<name>/index.js`
- [x] Coexists with npm `index.esm.js` / `index.cjs.js` in same folders

**Remaining:**

- [x] **Document loader** — `dist/index.js`, `dist/core.js` in README (no `dist/cdn/` tree; not in `exports`)
- [ ] **Rename loader file** (optional) — e.g. `solid-ui.loader.js` alias for discoverability
- [ ] **Autoloader (later)** — scan DOM for `solid-ui-*`, `import()` per component, `data-solid-ui` base path (Web Awesome pattern)
- [x] Clarify in docs: **ESM CDN does not expose `window.UI`** — legacy API only via `solid-ui.min.js`

---

### Goal 3 — npm (Lit-style) 🟡 (largely done, verify & document)

**Done:**

- [x] `preserveModules` + external deps
- [x] Dual `*.esm.js` / `*.cjs.js` outputs
- [x] `package.json` `exports` / `main` updated
- [x] Babel scoped to decorator directories on default build (no whole-library `preset-env`)

**Remaining:**

- [ ] Set explicit **`build.target`** only if needed — leave Vite/Rolldown default for npm (bundlers compile down)
- [x] Verify **subpath exports** resolve (`solid-ui`, `solid-ui/components/button`, design-system paths)
- [ ] **Types:** confirm `.d.ts` `from '…/index.js'` patterns work with new extensions for consumers
- [ ] **Consumer audit:** mashlib, storybook, solid-web-components — duplicate import / CJS+ESM issues (`build-system.md` TODO)
- [x] **Scripts:** documented in README
- [ ] Remove reliance on stale **`.mjs`** artifacts after clean `build` (old convention; exports no longer use `.mjs`)

---

## Suggested work order

1. ~~**Documentation pass**~~ — README, header example (done Jun 2026).
2. ~~**Legacy filename**~~ — publish uses `solid-ui.min.js` only; webpack dev may still emit `solid-ui.js`.
3. **npm verification** — consumer PRs in monorepo, `.d.ts` import paths, drop stale `.mjs` from dist.
4. **Loader polish** — optional `solid-ui.loader.js` alias; autoloader design.
5. **Webpack retirement plan** — stop overlapping `dist/` outputs in dev watch.

---

## Quick verification checklist

After `npm run build:all`:

```bash
# npm entries
test -f dist/index.esm.js && test -f dist/index.cjs.js
test -f dist/components/button/index.esm.js
test -f dist/components/button/index.cjs.js

# CDN entries (plain .js)
test -f dist/index.js && test -f dist/core.js
test -f dist/components/button/index.js
ls dist/components/chunks/*.js

# legacy
test -f dist/solid-ui.min.js

# no accidental plain .js npm modules (except CDN paths above)
find dist -name '*.js' ! -name '*.esm.js' ! -name '*.cjs.js' ! -name '*.min.js' \
  ! -path 'dist/components/*' ! -name 'index.js' ! -name 'core.js'
```

---

## History (conversation summary)

1. Started from duplicated CDN IIFE component builds and desire for default CDN ≈ loading all component scripts.
2. Moved to single **ESM multi-entry** CDN build with shared chunks.
3. Split **`cdn-legacy`** (monolithic UMD) vs **`cdn`** (ESM loader + components).
4. Rejected separate `dist-cdn/` folder in favor of **`*.esm.js` / `*.cjs.js` / plain `*.js`** in one `dist/`.
5. Compared with **@awesome.me/webawesome** `dist-cdn` + loader autoload pattern for future improvements.

---

*Last updated: documentation pass (README), `./cdn` export, header example → `solid-ui.min.js`.*
