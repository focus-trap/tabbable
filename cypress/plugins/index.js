/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // enable coverage
  require('@cypress/code-coverage/task')(on, config);
  // instrument code
  on(
    'file:preprocessor',
    require('@cypress/code-coverage/use-browserify-istanbul')
  );
  // fetch fixtures
  on('task', {
    getFixtures() {
      return require('../../test/fixtures/index');
    },
  });
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config;
};
