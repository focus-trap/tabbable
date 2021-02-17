/* eslint-env node */

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['browserify', 'mocha'],
    files: ['test/**/*.karma.test.js'],
    preprocessors: {
      'test/**/*.karma.test.js': ['browserify'],
    },
    browserify: {
      debug: true,
      transform: ['brfs'],
    },
    mochaReporter: {
      showDiff: true,
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    singleRun: true,
    concurrency: Infinity,
  });
};
