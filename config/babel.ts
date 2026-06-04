import babel from '@rolldown/plugin-babel'

type BabelOptions = Parameters<typeof babel>[0];

export default function (options: { transpileTargets?: BabelOptions['targets'] } = {}) {
    const presets: BabelOptions['presets'] = []
    const plugins: BabelOptions['plugins'] = []

    if (options.transpileTargets) {
        presets.push(['@babel/preset-env', { targets: options.transpileTargets }])
        presets.push(['@babel/preset-typescript', { allowDeclareFields: true }])
        plugins.push('@babel/plugin-transform-runtime')
    }

    return babel({
        presets,
        plugins,
        overrides: [
            // Configure Lit decorators
            // See https://lit.dev/docs/components/decorators/#using-decorators-with-babel
            {
                include: [
                    'src/design-system',
                    'src/primitives',
                    'src/storybook',
                ],
                assumptions: { setPublicClassFields: false },
                plugins: [
                    '@babel/plugin-transform-class-static-block',
                    ['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
                    ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
                    ['@babel/plugin-transform-class-properties', { loose: true }],
                ],
            },
        ],
    })
}
