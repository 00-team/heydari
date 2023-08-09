// import TsPaths from 'tsconfig-paths-webpack-plugin'
import { readdirSync } from 'fs'
import { Configuration, EntryObject } from 'webpack'

// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { BASE_DIR, resolve } from './config/path'

const DIR = resolve(BASE_DIR, 'mark/script/')

let entry: EntryObject = {}
readdirSync(DIR)
    .filter(f => f.endsWith('.ts'))
    .forEach(i => {
        let e = i.substring(0, i.lastIndexOf('.'))
        entry[e] = resolve(DIR, i)
    })

const Config: Configuration = {
    mode: 'production',
    entry,
    output: {
        path: resolve(BASE_DIR, 'static/js/mark/'),
        clean: true,
        filename: '[name].js',
        sourceMapFilename: 'source_maps/[file].map',
        assetModuleFilename: 'assets/[hash][ext][query]',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ],
    },
    devtool: 'source-map',
    plugins: [
        // new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 7777 }),
    ],
    resolve: {
        extensions: ['.mjs', '.tsx', '.ts', '.js'],
        plugins: [
            // new TsPaths({ configFile: resolve(APP_DIR, 'tsconfig.json') }),
        ],
    },
    optimization: {
        emitOnErrors: false,
        chunkIds: 'deterministic',
        minimize: true,
        // minimizer: [new CssMinimizer()],
    },
}

export default Config
