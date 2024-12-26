//
// ROOT ESLint Configuration
//

/* eslint-env node */

import js from '@eslint/js';
import globals from 'globals';
import babel from '@babel/eslint-plugin';
import babelParser from '@babel/eslint-parser';
// eslint-disable-next-line import/no-unresolved -- it's there...!!!
import typescript from '@typescript-eslint/eslint-plugin';
// eslint-disable-next-line import/no-unresolved -- it's there...!!!
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';
import jestDom from 'eslint-plugin-jest-dom';
import cypress from 'eslint-plugin-cypress';
import importPlugin from 'eslint-plugin-import';
import testingLibrary from 'eslint-plugin-testing-library';

//
// Base parser options and environments
//

const languageOptions = {
  ecmaVersion: 2019,
};

// @see https://eslint.org/docs/latest/use/configure/language-options#specifying-parser-options
const parserOptions = {
  ecmaFeatures: {
    impliedStrict: true,
  },
  sourceType: 'module',
};

// for use with https://typescript-eslint.io/users/configs#projects-with-type-checking
// @see https://typescript-eslint.io/getting-started/typed-linting
const typedParserOptions = {
  ...parserOptions,
  ecmaFeatures: {
    ...parserOptions.ecmaFeatures,
  },
  project: true,
  tsconfigRootDir: import.meta.dirname,
};

const baseGlobals = {
  ...globals.es2017,
};

const toolingGlobals = {
  ...baseGlobals,
  ...globals.node,
};

const browserGlobals = {
  ...baseGlobals,
  ...globals.browser,
};

const jestGlobals = {
  ...browserGlobals,
  ...globals.jest,
  ...globals.node,
};

// NOTE: these must also be defined in <repo>/src/globals.d.ts referenced in the
//  <repo>/tsconfig.json as well as the `globals` property in <repo>/jest.config.js
const srcGlobals = {
};

//
// Base rules
// @see http://eslint.org/docs/rules/RULE-NAME
//

const baseRules = {
  ...js.configs.recommended.rules,
  'no-regex-spaces': 'off',
  'no-await-in-loop': 'error',
  'no-async-promise-executor': 'error',
  'no-misleading-character-class': 'error',
  'no-unsafe-optional-chaining': 'error',

  //// Best practices

  curly: 'error',
  'default-case': 'error',
  eqeqeq: 'error',
  'guard-for-in': 'error',
  'no-alert': 'error',
  'no-caller': 'error',
  'no-console': 'error',
  'no-else-return': 'error',
  'no-eq-null': 'error',
  'no-eval': 'error',
  'no-lone-blocks': 'error',
  'no-loop-func': 'error',
  'no-multi-spaces': 'error',
  'no-new': 'off',
  'no-new-func': 'error',
  'no-new-wrappers': 'error',
  'no-throw-literal': 'error',
  'no-warning-comments': [
    'error',
    {
      terms: ['DEBUG', 'FIXME', 'HACK'],
      location: 'start',
    },
  ],

  //// Strict mode

  strict: ['error', 'function'],

  //// Variables

  'no-catch-shadow': 'error',
  'no-shadow': 'error',
  'no-unused-vars': [
    'error',
    {
      args: 'none',
      caughtErrors: 'none',
      vars: 'local',
    },
  ],
  'no-use-before-define': 'error',

  //// Stylistic issues

  // NONE: Prettier will take care of these by reformatting the code on commit,
  //  save a few exceptions.

  // Prettier will format using single quotes per .prettierrc.js settings, but
  //  will not require single quotes instead of backticks/template strings
  //  when interpolation isn't used, so this rule will catch those cases
  quotes: [
    'error',
    'single',
    {
      avoidEscape: true,
      allowTemplateLiterals: false,
    },
  ],

  //// ECMAScript 6 (non-stylistic issues only)

  'no-duplicate-imports': ['error', { includeExports: true }],
  'no-useless-constructor': 'error',
  'no-var': 'error',
  'prefer-const': 'error',
};

// TypeScript-specific rules
const typescriptRules = {
  ...typescript.configs['recommended-type-checked'].rules,

  // add overrides here as needed
  ...importPlugin.flatConfigs.typescript.rules,
};

// Test-specific rules
const testRules = {
  //// jest plugin

  'jest/no-disabled-tests': 'error',
  'jest/no-focused-tests': 'error',
  'jest/no-identical-title': 'error',
  'jest/valid-title': 'error',

  // doesn't work well when expect() used with Cypress API
  'jest/valid-expect': 'off',

  //// jest-dom plugin

  // this rule is buggy, and doesn't seem to work well with the Testing Library's queries
  'jest-dom/prefer-in-document': 'off',

  //// RTL plugin

  // this prevents expect(document.querySelector('foo')), which is useful because not
  //  all elements can be found using RTL queries (sticking to RTL queries probably
  //  means less fragile tests, but then there are things we wouldn't be able to
  //  test like whether something renders in Light mode or Dark mode as expected)
  'testing-library/no-node-access': 'off',

  // we use custom queries, which don't get added to `screen` (that's a miss in RTL, IMO),
  //  which means we _must_ destructure the result from `render()` in order to get to
  //  our custom queries
  'testing-library/prefer-screen-queries': 'off',

  // not much value in this one, and it's not sophisticated enough to detect all usage
  //  scenarios so we get false-positives
  'testing-library/await-async-utils': 'off',
};

//
// Configuration generator functions
//

/**
 * Project scripts.
 * @param {boolean} isModule
 * @param {boolean} isTypescript Ignored if `isModule=false`
 * @returns {Object} ESLint config.
 */
const createToolingConfig = (isModule = true, isTypescript = false) => ({
  files: isModule ? (isTypescript ? ['**/*.m?ts'] : ['**/*.mjs']) : ['**/*.js'],
  ignores: ['src/**/*.*', 'test/**/*.*'],
  plugins: {
    ...(isModule ? { import: importPlugin } : {}),
  },
  languageOptions: {
    ...languageOptions,
    parser: isTypescript ? typescriptParser : babelParser,
    parserOptions: {
      ...(isModule && isTypescript ? typedParserOptions : parserOptions),
      sourceType: isModule ? 'module' : 'script',
    },
    globals: {
      ...toolingGlobals,
    },
  },
  rules: {
    ...baseRules,
    ...(isModule && isTypescript ? typescriptRules : {}),
    ...(isModule ? importPlugin.flatConfigs.recommended.rules : {}),
    'no-console': 'off',
  },
});

/**
 * JavaScript source files.
 * @returns ESLint config.
 */
const createSourceJSConfig = () => ({
  files: ['src/**/*.js'],
  plugins: {
    '@babel': babel, // @see https://www.npmjs.com/package/@babel/eslint-plugin
    import: importPlugin,
  },
  languageOptions: {
    ...languageOptions,
    parser: babelParser,
    parserOptions,
    globals: {
      ...browserGlobals,
      ...srcGlobals,
    },
  },
  rules: {
    ...baseRules,
    ...importPlugin.flatConfigs.recommended.rules,
  },
});

const createSourceTSConfig = () => ({
  files: ['index.d.ts', 'src/**/*.ts'],
  plugins: {
    '@babel': babel, // @see https://www.npmjs.com/package/@babel/eslint-plugin
    '@typescript-eslint': typescript,
    import: importPlugin,
  },
  languageOptions: {
    ...languageOptions,
    parser: typescriptParser,
    parserOptions: typedParserOptions,
    globals: {
      ...browserGlobals,
      ...srcGlobals,
    },
  },
  rules: {
    ...baseRules,
    ...importPlugin.flatConfigs.recommended.rules,
    ...typescriptRules,
  },
});

const createTestConfig = (isTypescript = false) => ({
  files: isTypescript ? ['test/**/*.ts'] : ['test/**/*.js'],
  plugins: {
    '@babel': babel, // @see https://www.npmjs.com/package/@babel/eslint-plugin
    import: importPlugin,
    jest,
    'jest-dom': jestDom,
    'testing-library': testingLibrary,
    cypress,
    ...(isTypescript ? { '@typescript-eslint': typescript } : {}),
  },
  languageOptions: {
    ...languageOptions,
    parser: isTypescript ? typescriptParser : babelParser,
    parserOptions: {
      ...parserOptions,
      ...(isTypescript ? typedParserOptions : {}),
      ecmaFeatures: {
        ...parserOptions.ecmaFeatures,
        ...(isTypescript ? typedParserOptions.ecmaFeatures : {}),
      },
    },
    globals: {
      ...jestGlobals,
      ...srcGlobals,
      ...cypress.environments.globals.globals,
    },
  },
  rules: {
    ...baseRules,
    ...importPlugin.flatConfigs.recommended.rules,
    ...(isTypescript ? typescriptRules : {}),
    ...testRules,
    ...cypress.configs.recommended.rules,
  },
});

export default [
  // Ignores
  {
    ignores: [
      // third-party
      '**/node_modules/',
      // build output
      'dist/**',
      '**/*-bundle.js',
      // test output
      'coverage/**',
    ],
  },

  // Tooling Configs
  createToolingConfig(false), // CJS scripts
  createToolingConfig(true), // ESM scripts
  createToolingConfig(true, true), // TS scripts

  // Source Configs
  createSourceJSConfig(), // Plain JS source
  createSourceTSConfig(), // Plain TS source

  // Test Configs
  createTestConfig(), // JS tests
  createTestConfig(true), // TS tests

  // Prettier
  // ALWAYS LAST: disable style rules that conflict with prettier
  // @see https://typescript-eslint.io/troubleshooting/formatting#suggested-usage---prettier
  {
    plugins: {
      prettier,
    },
    rules: prettier.rules,
  },
];
