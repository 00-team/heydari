import { resolve } from 'path'

const BASE_DIR = resolve(__dirname, '../../../')
const APP_DIR = resolve(BASE_DIR, 'app')
const DIST_DIR = resolve(BASE_DIR, 'static/dist/')
const TEMPLATES_DIR = resolve(BASE_DIR, 'mark/tmpl/')

export { BASE_DIR, APP_DIR, DIST_DIR, TEMPLATES_DIR, resolve }
