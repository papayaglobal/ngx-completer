import sourcemaps from 'rollup-plugin-sourcemaps';
import license from 'rollup-plugin-license';
import commonjs from 'rollup-plugin-commonjs';


const path = require('path');

export default {
    output: {
        format: 'es',
        sourcemap: true
    },
    plugins: [
        sourcemaps(),
        license({
            sourceMap: true,

            banner: {
                file: path.join(__dirname, 'license-banner.txt'),
                encoding: 'utf-8',
            }
        }),
        commonjs({
            namedExports: {
                'node_modules/lodash/lodash.js': [
                    'isEqual',
                    'isNil',
                    'noop'
                ]
            }
        })
    ],
    onwarn: () => { return }
}
