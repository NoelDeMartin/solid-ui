import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { componentExports, styleExports } from './component-manifest.mjs'

const packageJsonPath = path.resolve(process.cwd(), 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

const preservedExports = Object.fromEntries(
  Object.entries(packageJson.exports || {}).filter(
    ([subpath]) =>
      !subpath.startsWith('./components/') &&
      !subpath.startsWith('./styles/') &&
      !subpath.startsWith('./design-system/')
  )
)

const nextExports = {
  ...preservedExports,
  ...styleExports,
  ...componentExports
}

if (JSON.stringify(packageJson.exports || {}) === JSON.stringify(nextExports)) {
  console.log('package.json exports are already in sync')
  process.exit(0)
}

packageJson.exports = nextExports

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
