import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

const createConfig = ({ output, browser = false }) => ({
    input: 'src/index.js',
    output: {
        exports: 'named',
        ...output,
    },
    plugins: [
        babel(),
        browser && replace({ 'typeof document': JSON.stringify('object') }),
    ].filter(Boolean),
})

export default [
  createConfig({
    output: { file: pkg.main, format: 'cjs' },
  }),
  createConfig({
    output: { file: pkg.module, format: 'esm' },
  }),
  createConfig({
    output: { file: pkg.browser[pkg.main], format: 'cjs' },
    browser: true,
  }),
  createConfig({
      output: { file: pkg.browser[pkg.module], format: 'esm' },
      browser: true,
  }),
];
