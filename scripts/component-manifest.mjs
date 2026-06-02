import { existsSync, readdirSync } from 'fs'
import path from 'path'

/** @param {string} sourcePath */
function designSystemEntryName (sourcePath) {
  const camel = sourcePath.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  return `ds${camel[0].toUpperCase()}${camel.slice(1)}`
}

function discoverDesignSystemComponents () {
  const root = path.resolve(process.cwd(), 'src/design-system/components')
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => existsSync(path.join(root, name, 'index.ts')))
    .map(sourcePath => {
      const exportNames = [`design-system/${sourcePath}`]
      if (sourcePath === 'button') {
        exportNames.push('components/design-system/button')
      }
      return {
        entryName: designSystemEntryName(sourcePath),
        sourcePath,
        webpackOutputPath: `design-system/components/${sourcePath}`,
        exportNames
      }
    })
}

const v2Package = {
  distSegment: 'v2/components',
  importPrefix: './src/v2/components',
  exportPathPrefix: 'components',
  components: [
    {
      entryName: 'header',
      sourcePath: 'layout/header',
      webpackOutputPath: 'components/header',
      exportNames: ['components/header', 'components/layout/header']
    },
    {
      entryName: 'loginButton',
      sourcePath: 'auth/loginButton',
      webpackOutputPath: 'components/loginButton',
      exportNames: ['components/loginButton', 'components/login-button', 'components/auth/login-button']
    },
    {
      entryName: 'signupButton',
      sourcePath: 'auth/signupButton',
      webpackOutputPath: 'components/signupButton',
      exportNames: ['components/auth/signup-button', 'components/signup-button']
    },
    {
      entryName: 'photoCapture',
      sourcePath: 'media/photoCapture',
      webpackOutputPath: 'components/photoCapture',
      exportNames: ['components/media/photo-capture', 'components/photo-capture']
    },
    {
      entryName: 'button',
      sourcePath: 'actions/button',
      webpackOutputPath: 'components/button',
      exportNames: ['components/actions/button', 'components/button']
    },
    {
      entryName: 'footer',
      sourcePath: 'layout/footer',
      webpackOutputPath: 'components/footer',
      exportNames: ['components/footer', 'components/layout/footer']
    },
    {
      entryName: 'select',
      sourcePath: 'forms/select',
      webpackOutputPath: 'components/select',
      exportNames: ['components/forms/select', 'components/select']
    },
    {
      entryName: 'combobox',
      sourcePath: 'forms/combobox',
      webpackOutputPath: 'components/combobox',
      exportNames: ['components/forms/combobox', 'components/combobox']
    }
  ]
}

const designSystemPackage = {
  distSegment: 'design-system/components',
  importPrefix: './src/design-system/components',
  exportPathPrefix: '',
  components: discoverDesignSystemComponents()
}

const primitivesPackage = {
  distSegment: 'primitives/components',
  importPrefix: './src/primitives/components',
  exportPathPrefix: 'components',
  components: [
    {
      entryName: 'primitiveAvatar',
      sourcePath: 'avatar',
      webpackOutputPath: 'components/primitiveAvatar',
      exportNames: ['components/primitives/avatar']
    },
    {
      entryName: 'primitiveGuard',
      sourcePath: 'guard',
      webpackOutputPath: 'components/primitiveGuard',
      exportNames: ['components/primitives/guard']
    }
  ]
}

/** Packages whose public types live under dist/components/ as re-export stubs. */
export const typeStubPackages = [v2Package, primitivesPackage]

/** @deprecated Use componentPackages */
export const v2Components = v2Package.components

export const componentPackages = [
  v2Package,
  designSystemPackage,
  primitivesPackage
]

export const allComponents = componentPackages.flatMap(({ components, importPrefix }) =>
  components.map(component => ({ importPrefix, ...component }))
)

/** Combined entry consumed by mashlib (both import paths alias here). */
export const mashlibHostEntry = {
  entryName: 'mashlibHost',
  webpackOutputPath: 'mashlib-host'
}

export const componentEntries = {
  [mashlibHostEntry.entryName]: {
    import: './src/entries/mashlib-host.ts'
  },
  ...Object.fromEntries(
    allComponents.map(({ entryName, sourcePath, importPrefix }) => [
      entryName,
      {
        import: `${importPrefix}/${sourcePath}/index.ts`
      }
    ])
  )
}

export const componentOutputPaths = {
  [mashlibHostEntry.entryName]: mashlibHostEntry.webpackOutputPath,
  ...Object.fromEntries(
    allComponents.map(({ entryName, webpackOutputPath }) => [entryName, webpackOutputPath])
  )
}

export const componentExports = Object.fromEntries(
  allComponents.flatMap(({ webpackOutputPath, exportNames }) =>
    exportNames.map(exportName => [
      `./${exportName}`,
      {
        types: `./dist/${webpackOutputPath}/index.d.ts`,
        import: `./dist/${webpackOutputPath}/index.esm.js`,
        require: `./dist/${webpackOutputPath}/index.js`
      }
    ])
  )
)

/** CSS entry points consumed by mashlib and other hosts (not managed by component sync). */
export const styleExports = {
  './styles/design-system-variables.css': './src/design-system/styles/variables.css',
  './styles/primitives-variables.css': './src/primitives/styles/variables.css'
}
