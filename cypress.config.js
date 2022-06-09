const { defineConfig } = require('cypress');
const setupPlugins = require('./cypress/plugins/index.js');

module.exports = defineConfig({
  viewportHeight: 600,
  viewportWidth: 800,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return setupPlugins(on, config); // DEBUG require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'test/e2e/**/*.e2e.js',
  },
});
