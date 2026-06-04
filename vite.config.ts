import dts from 'unplugin-dts/vite'
import { isAbsolute } from 'node:path'
import { defineConfig } from 'vitest/config'
import type { UserConfig } from 'vite'
import babel from './config/babel'
import css from './config/css'
import icons from './config/icons'
import { cdnLegacyConfig, cdnConfig } from './config/cdn'
import { componentLibEntries } from './config/components'

const basePlugins = [
    css(),
    icons(),
]

function defaultConfig(): UserConfig {
    return {
        plugins: [
            ...basePlugins,
            babel(),
            dts({
                tsconfigPath: 'tsconfig.json',
                entryRoot: 'src',
                outDirs: ['dist'],
                insertTypesEntry: true,
            }),
        ],
        build: {
            sourcemap: true,
            lib: {
                entry: {
                    core: 'src/core.ts',
                    ...componentLibEntries(),
                },
                formats: ['es', 'cjs'],
            },
            rolldownOptions: {
                output: [
                    {
                        format: 'es',
                        preserveModules: true,
                        preserveModulesRoot: 'src',
                        entryFileNames: '[name].esm.js',
                        chunkFileNames: 'chunks/[name]-[hash].esm.js',
                    },
                    {
                        format: 'cjs',
                        preserveModules: true,
                        preserveModulesRoot: 'src',
                        entryFileNames: '[name].cjs.js',
                        chunkFileNames: 'chunks/[name]-[hash].cjs.js',
                    },
                ],
                external: (id) => {
                    return !id.startsWith('~icons/')
                        && !id.startsWith('@oxc-project/runtime')
                        && !id.startsWith('.')
                        && !isAbsolute(id)
                },
            },
        },
        test: {
            environment: 'jsdom',
            setupFiles: ['test/helpers/setup.ts'],
            coverage: {
                include: ['src/**/*.[jt]s'],
            },
        },
    }
}

export default defineConfig(({ mode }) => {
    switch (mode) {
        case 'cdn-legacy':
            return cdnLegacyConfig(basePlugins)
        case 'cdn':
            return cdnConfig(basePlugins)
        default:
            return defaultConfig()
    }
})
