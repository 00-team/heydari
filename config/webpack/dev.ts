import HtmlPlugin from 'html-webpack-plugin'
import { Configuration as WConf } from 'webpack'
import { Configuration as DConf } from 'webpack-dev-server'

import Base from './base'
import { APP_DIR, resolve } from './config/path'
import { DevStyle } from './config/style'

interface Configuration extends WConf {
    devServer: DConf
}

let host = ''
if (process.env.local) {
    host = 'http://localhost:7200'
} else {
    host = 'https://heydari-mi.com'
}

console.log('proxy host: ' + host)


const DevConfig: Configuration = {
    ...Base,
    mode: 'development',
    module: {
        rules: [...Base.module!.rules!, DevStyle],
    },
    plugins: [
        ...Base.plugins!,
        new HtmlPlugin({ template: resolve(APP_DIR, 'basic.html') }),
    ],
    devServer: {
        port: 8000,
        hot: true, // true = full reload
        historyApiFallback: true,
        compress: true,
        client: {
            logging: 'none',
            reconnect: 7,
        },
        proxy: [
            {
                context: ['/api', '/static', '/media', '/favicon.ico'],
                target: host,
                changeOrigin: true,
            },
        ],
    },
}

export default DevConfig
