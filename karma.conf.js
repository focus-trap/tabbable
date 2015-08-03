module.exports = function(config) {
  config.set({
    frameworks: ['tap'],
    browsers: ['Firefox'],
    files: [
      './test/test-bundle.js',
    ],
  });
};
