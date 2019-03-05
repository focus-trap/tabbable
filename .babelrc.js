const { NODE_ENV, BABEL_ENV } = process.env
const loose = true
const cjs = BABEL_ENV === 'cjs' || NODE_ENV === 'test'

const presets = [['@babel/preset-env', { loose, modules: false }]]

const plugins = [
    cjs && '@babel/plugin-transform-modules-commonjs',
].filter(Boolean)

module.exports = { presets, plugins }
