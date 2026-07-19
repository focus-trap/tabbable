const plugins = [
  '@babel/plugin-transform-nullish-coalescing-operator',
  '@babel/plugin-transform-optional-chaining',
];

const assumptions = {
  arrayLikeIsIterable: true,
  constantReexports: true,
  ignoreFunctionLength: true,
  ignoreToPrimitiveHint: true,
  mutableTemplateObject: true,
  noClassCalls: true,
  noDocumentAll: true,
  objectRestNoSymbols: true,
  privateFieldsAsProperties: true,
  pureGetters: true,
  setClassMethods: true,
  setComputedProperties: true,
  setPublicClassFields: true,
  setSpreadProperties: true,
  skipForOfIteratorClosing: true,
  superIsCallableConstructor: true,
};

const exclude = ['transform-typeof-symbol'];

module.exports = {
  env: {
    es5: {
      // ES5 browsers for CJS and UMD builds
      presets: [
        [
          // NOTE: With no targets specified, @babel/preset-env will transform all
          //  ECMAScript 2015+ code by default, which is the original preset prior
          //  to upgrading to Babel 7
          // @see https://babeljs.io/docs/en/babel-preset-env#targets
          '@babel/preset-env',
          {
            exclude,
          },
        ],
      ],
      assumptions,
      plugins,
    },
    dev: {
      presets: [
        ['@babel/preset-env', { targets: { esmodules: true }, loose: true }],
      ],
      plugins,
    },
    esm: {
      // ESM browsers for ESM builds
      presets: [
        [
          // NOTE: With no targets specified, @babel/preset-env will transform all
          //  ECMAScript 2015+ code by default, which is the original preset prior
          //  to upgrading to Babel 7
          // @see https://babeljs.io/docs/en/babel-preset-env#targets
          '@babel/preset-env',
          {
            modules: false, // preserve ES modules
            exclude,
          },
        ],
      ],
      assumptions,
      plugins,
    },
    test: {
      // Jest/Cypress
      // @see https://github.com/istanbuljs/babel-plugin-istanbul
      plugins: [...plugins, 'istanbul'],
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
  },
};
