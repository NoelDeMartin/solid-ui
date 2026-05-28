import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { componentPackages } from './component-manifest.mjs'

const distDir = path.resolve(process.cwd(), 'dist')
const publicComponentsDir = path.join(distDir, 'components')

for (const { distSegment, components } of componentPackages) {
  const sourceRoot = path.join(distDir, distSegment)

  if (!existsSync(sourceRoot)) {
    throw new Error(`Missing expected directory: ${sourceRoot}`)
  }

  for (const { sourceDir, sourcePath = sourceDir } of components) {
    const sourceIndex = path.join(sourceRoot, sourcePath, 'index.d.ts')
    if (!existsSync(sourceIndex)) {
      continue
    }

    const outputDir = path.join(publicComponentsDir, sourceDir)
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
