import { copyFileSync, existsSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import type { PluginOption, UserConfig } from 'vite'

import babel from './babel'
import { componentCdnEntries } from './components'

const projectRoot = resolve(import.meta.dirname, '..')

const CDN_GLOBALS = {
    rdflib: '$rdf',
    'solid-logic': 'SolidLogic',
    fs: 'null',
    'node-fetch': 'fetch',
    'isomorphic-fetch': 'fetch',
    'text-encoding': 'TextEncoder',
    '@trust/webcrypto': 'crypto',
} as const

function cdnSharedConfig(basePlugins: PluginOption[]): UserConfig {
    const CDN_EXTERNAL_PACKAGES = Object.keys(CDN_GLOBALS)

    return {
        build: {
            target: 'esnext',
            emptyOutDir: false,
            minify: true,
            sourcemap: true,
            rolldownOptions: {
                output: { globals: CDN_GLOBALS },
                external: (id) => {
                    return !id.startsWith('~icons/')
                        && !id.startsWith('@oxc-project/runtime')
                        && !id.startsWith('.')
                        && !isAbsolute(id)
                        && !CDN_EXTERNAL_PACKAGES.includes(id)
                        && !CDN_EXTERNAL_PACKAGES.some((pkg) => id.startsWith(`${pkg}/`))
                },
            },
        },
        plugins: [
            ...basePlugins,
            babel({
                transpileTargets: {
                    browsers: ['> 1%', 'last 3 versions', 'not dead'],
                },
            }),
        ],
    }
}

export function cdnLegacyConfig(basePlugins: PluginOption[]): UserConfig {
    const shared = cdnSharedConfig(basePlugins)

    return {
        ...shared,
        plugins: [
            ...(shared.plugins ?? []),
            {
                name: 'copy-legacy-aliases',
                closeBundle() {
                    const distDir = join(projectRoot, 'dist')
                    const minJs = join(distDir, 'solid-ui.min.js')

                    if (!existsSync(minJs)) {
                        throw new Error(`Expected ${minJs} after cdn-legacy build`)
                    }

                    copyFileSync(minJs, join(distDir, 'solid-ui.js'))

                    const minMap = join(distDir, 'solid-ui.min.js.map')

                    if (existsSync(minMap)) {
                        copyFileSync(minMap, join(distDir, 'solid-ui.js.map'))
                    }
                },
            },
        ],
        build: {
            ...shared.build,
            lib: {
                entry: resolve(projectRoot, 'src/index.ts'),
                name: 'UI',
                formats: ['umd'],
                fileName: () => 'solid-ui.min.js',
            },
            rolldownOptions: shared.build?.rolldownOptions,
        },
    }
}

export function cdnConfig(basePlugins: PluginOption[]): UserConfig {
    const shared = cdnSharedConfig(basePlugins)

    return {
        ...shared,
        plugins: [
            ...(shared.plugins ?? []),
            {
                name: 'copy-deprecated-cdn-aliases',
                closeBundle() {
                    const distDir = join(projectRoot, 'dist')
                    const loader = join(distDir, 'index.js')

                    if (!existsSync(loader)) {
                        throw new Error(`Expected ${loader} after cdn build`)
                    }

                    copyFileSync(loader, join(distDir, 'solid-ui.esm.js'))

                    const loaderMap = join(distDir, 'index.js.map')

                    if (existsSync(loaderMap)) {
                        copyFileSync(loaderMap, join(distDir, 'solid-ui.esm.js.map'))
                    }
                },
            },
        ],
        build: {
            ...shared.build,
            rolldownOptions: {
                ...shared.build?.rolldownOptions,
                input: {
                    loader: resolve(projectRoot, 'src/index.ts'),
                    core: resolve(projectRoot, 'src/core.ts'),
                    ...componentCdnEntries(),
                },
                output: {
                    format: 'es',
                    entryFileNames: (chunk) => {
                        if (chunk.name === 'loader') {
                            return 'index.js'
                        }

                        if (chunk.name === 'core') {
                            return 'core.js'
                        }

                        return 'components/[name]/index.js'
                    },
                    chunkFileNames: 'components/chunks/[name]-[hash].js',
                    globals: CDN_GLOBALS,
                },
            },
        },
    }
}
