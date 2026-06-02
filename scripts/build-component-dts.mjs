import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { typeStubPackages } from './component-manifest.mjs'

const distDir = path.resolve(process.cwd(), 'dist')
const publicComponentsDir = path.join(distDir, 'components')

for (const { distSegment, components } of typeStubPackages) {
  const sourceRoot = path.join(distDir, distSegment)

  if (!existsSync(sourceRoot)) {
    throw new Error(`Missing expected directory: ${sourceRoot}`)
  }

  for (const { entryName, sourcePath } of components) {
    const sourceIndex = path.join(sourceRoot, sourcePath, 'index.d.ts')
    if (!existsSync(sourceIndex)) {
      continue
    }

    const outputDir = path.join(publicComponentsDir, entryName)
    mkdirSync(outputDir, { recursive: true })

    const relativePath = path.relative(outputDir, sourceIndex)
      .replace(/\\/g, '/')
      .replace(/\.d\.ts$/, '')

    writeFileSync(
      path.join(outputDir, 'index.d.ts'),
      `export * from '${relativePath}';\n`
    )
  }
}
