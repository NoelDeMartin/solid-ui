const v2Package = {
  distSegment: 'v2/components',
  importPrefix: './src/v2/components',
  components: [
    {
      sourceDir: 'header',
      sourcePath: 'layout/header',
      exportNames: ['header', 'layout/header']
    },
    {
      sourceDir: 'loginButton',
      sourcePath: 'auth/loginButton',
      exportNames: ['loginButton', 'login-button', 'auth/login-button']
    },
    {
      sourceDir: 'signupButton',
      sourcePath: 'auth/signupButton',
      exportNames: ['auth/signup-button', 'signup-button']
    },
    {
      sourceDir: 'photoCapture',
      sourcePath: 'media/photoCapture',
      exportNames: ['media/photo-capture', 'photo-capture']
    },
    {
      sourceDir: 'button',
      sourcePath: 'actions/button',
      exportNames: ['actions/button', 'button']
    },
    {
      sourceDir: 'footer',
      sourcePath: 'layout/footer',
      exportNames: ['footer', 'layout/footer']
    },
    {
      sourceDir: 'select',
      sourcePath: 'forms/select',
      exportNames: ['forms/select', 'select']
    },
    {
      sourceDir: 'combobox',
      sourcePath: 'forms/combobox',
      exportNames: ['forms/combobox', 'combobox']
    }
  ]
}

const designSystemPackage = {
  distSegment: 'design-system/components',
  importPrefix: './src/design-system/components',
  components: [
    {
      sourceDir: 'designSystemButton',
      sourcePath: 'button',
      exportNames: ['design-system/button']
    }
  ]
}

const primitivesPackage = {
  distSegment: 'primitives/components',
  importPrefix: './src/primitives/components',
  components: [
    {
      sourceDir: 'primitiveAvatar',
      sourcePath: 'avatar',
      exportNames: ['primitives/avatar']
    },
    {
      sourceDir: 'primitiveGuard',
      sourcePath: 'guard',
      exportNames: ['primitives/guard']
    }
  ]
}

/** @deprecated Use componentPackages */
export const v2Components = v2Package.components

export const componentPackages = [
  v2Package,
  designSystemPackage,
  primitivesPackage
]

export const allComponents = componentPackages.flatMap(({ components, ...pkg }) =>
  components.map(component => ({ ...pkg, ...component }))
)

export const componentEntries = Object.fromEntries(
  allComponents.map(({ sourceDir, sourcePath, importPrefix }) => [
    sourceDir,
    {
      import: `${importPrefix}/${sourcePath}/index.ts`
    }
  ])
)

export const componentExports = Object.fromEntries(
  allComponents.flatMap(({ sourceDir, exportNames }) =>
    exportNames.map(exportName => [
      `./components/${exportName}`,
      {
        types: `./dist/components/${sourceDir}/index.d.ts`,
        import: `./dist/components/${sourceDir}/index.esm.js`,
        require: `./dist/components/${sourceDir}/index.js`
      }
    ])
  )
)

/** CSS entry points consumed by mashlib and other hosts (not managed by component sync). */
export const styleExports = {
  './styles/design-system-variables.css': './src/design-system/styles/variables.css',
  './styles/primitives-variables.css': './src/primitives/styles/variables.css'
}
