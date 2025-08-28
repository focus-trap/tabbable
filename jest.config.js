module.exports = {
  testEnvironment: 'jsdom', // requires separate 'jest-environment-jsdom' package
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/src/*.js'],
  coverageDirectory: '<rootDir>/coverage',
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['./setupTests.js'],
  testMatch: ['<rootDir>/test/**/*.test.js'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
