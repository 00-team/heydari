import Compression from 'compression-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import CssMinimizer from 'css-minimizer-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'

import Base from './base'
import { APP_DIR, DIST_DIR, resolve } from './config/path'
import { BuildStyle, CssExtract } from './config/style'

const Html = new HtmlPlugin({
    filename: resolve(DIST_DIR, 'index.html'),
    template: resolve(APP_DIR, 'template.html'),
    inject: true,
    publicPath: '/',
    minify: false,
})

const BuildConfig: Configuration = {
    ...Base,
    mode: 'production',
    module: {
        rules: [...Base.module!.rules!, BuildStyle],
    },
    plugins: [
        ...Base.plugins!,
        new CssExtract(),
        new Compression({ exclude: /\.(html)$/ }),
        Html,
        new CopyPlugin({
            patterns: [
                { from: resolve(APP_DIR, 'static/favicon.ico'), to: DIST_DIR },
            ],
        }),
    ],
    optimization: {
        emitOnErrors: false,
        chunkIds: 'deterministic',
        minimize: true,
        minimizer: [new CssMinimizer()],
    },
}

export default BuildConfig
