import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

// process.env.BUILD_ENV: "esm" | "cjs"

const terserOptions = {
  sourcemap: true,
  output: { comments: false },
  compress: {
    keep_infinity: true,
    pure_getters: true,
    passes: 10,
  },
  ecma: 5,
  toplevel: false,
  warnings: true,
};

const commonPlugins = [
  babel({ exclude: /node_modules/ }),
  resolve({
    mainFields: ['module', 'main', 'browser'],
  }),
  sourceMaps(),
];

const input = 'src/index.js';

const cjs = [
  {
    input,
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      esModule: false,
      sourcemap: true,
    },
  },
  {
    input,
    output: {
      file: 'dist/index.min.js',
      format: 'cjs',
      esModule: false,
      sourcemap: true,
    },
    plugins: [...commonPlugins, terser({ ...terserOptions, toplevel: true })],
  },
];

const esm = [
  {
    input,
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      esModule: true,
      sourcemap: true,
    },
  },
  {
    input,
    output: {
      file: 'dist/index.esm.min.js',
      format: 'esm',
      esModule: true,
      sourcemap: true,
    },
    plugins: [...commonPlugins, terser(terserOptions)],
  },
];

const umd = [
  {
    input,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      esModule: true,
      sourcemap: true,
      name: 'tabbable',
    },
  },
  {
    input,
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      esModule: true,
      sourcemap: true,
      name: 'tabbable',
    },
    plugins: [...commonPlugins, terser(terserOptions)],
  },
];

let config = {};
console.log(process.env.BUILD_ENV);
switch (process.env.BUILD_ENV) {
  case 'cjs':
    config = cjs;
    break;
  case 'esm':
    config = esm;
    break;
  case 'umd':
    config = umd;
    break;
  default:
    throw Error(
      'You must define process.env.BUILD_ENV before building with rollup. Check rollup.config.js for valid options.'
    );
}

export default config;
