import { existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const componentsSrcDir = join(projectRoot, 'src/components')

export function discoverPublicComponents(): string[] {
    return readdirSync(componentsSrcDir, { withFileTypes: true })
        .filter(
            (entry) =>
                entry.isDirectory()
                && existsSync(join(componentsSrcDir, entry.name, 'index.ts'))
        )
        .map((entry) => entry.name)
        .sort()
}

export function componentLibEntries(): Record<string, string> {
    return Object.fromEntries(
        discoverPublicComponents().map((name) => [
            `components/${name}/index`,
            `src/components/${name}/index.ts`,
        ])
    )
}

export function componentCdnEntries(): Record<string, string> {
    return Object.fromEntries(
        discoverPublicComponents().map((name) => [
            name,
            join(componentsSrcDir, name, 'index.ts'),
        ])
    )
}
