import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace'
// import babel   from 'rollup-plugin-babel'
// import es2015 from 'babel-preset-es2015-rollup';
import uglify from 'rollup-plugin-uglify';
// import { minify } from 'uglify-es';

const pkg = require('./package.json');

const bundle = 'index';

console.log(`rollup bindling: '${bundle}'`);

export default {
    entry: `./src/main/${bundle}.ts`,
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        replace({
            '@VERSION@': pkg.version
        }),
        // babel({
        //     presets: [es2015]
        // }),
        uglify({}/*, minify*/)
    ],
    globals: {
        // 'jquery': 'jQuery'
    },
    external: Object.keys(pkg.dependencies),
    targets: [
        {
            dest: `./dist/${bundle}.js`,
            // format: 'iife',
            format: 'umd',
            moduleName: pkg.name,
            sourceMap: true
        // },
        // {
        //     dest: './dist/lib/' + pkg.name + '.js',
        //     format: 'es',
        //     sourceMap: true
        }
    ]
}
