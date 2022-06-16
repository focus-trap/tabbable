const { defineConfig } = require('cypress');
const setupPlugins = require('./cypress/plugins/index.js');

module.exports = defineConfig({
  viewportHeight: 600,
  viewportWidth: 800,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      return setupPlugins(on, config);
    },
    specPattern: 'test/e2e/**/*.cy.js',
  },
});
