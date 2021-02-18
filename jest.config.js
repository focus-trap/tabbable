module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/src/*.js'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['regenerator-runtime/runtime', './setupTests.js'],
  testMatch: ['<rootDir>/test/**/*.test.js'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
