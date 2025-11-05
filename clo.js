import { compiler } from 'google-closure-compiler'

import { readdirSync, renameSync } from 'fs'
// import { Configuration, EntryObject } from 'webpack'
import { resolve } from 'path'

const DIR = resolve('./static/script')

for (let f of readdirSync(DIR)) {
    if (!f.endsWith('js')) continue

    let inp = resolve(DIR, f)
    let out = resolve(DIR, f.slice(0, -3) + '.clo.js')

    const c = new compiler({
        js: inp,
        js_output_file: out,
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT_NEXT',
        language_out: 'ECMASCRIPT_2017',
    })

    await new Promise(r => {
        c.run((exit_code, _stdout, stderr) => {
            if (exit_code !== 0) console.error(stderr)
            else {
                console.log(`Optimized: ${f}`)
                // renameSync(out, inp)
            }
            r()
        })
    })
}

// .filter(f => f.endsWith('.ts'))
// .forEach(i => {
//     let e = i.substring(0, i.lastIndexOf('.'))
//     entry[e] = resolve(DIR, i)
// })
