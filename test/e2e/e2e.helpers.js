import { appendHTMLWithShadowRoots } from '../shadow-root-utils';

export function setupTestDocument(done) {
  cy.visit('./cypress/test-sandbox.html');
  cy.document().then(done);
}
export function getFixtures(done) {
  cy.task('getFixtures').then(done);
}
export function getIdsFromElementsArray(elements) {
  return elements.map((el) => el.getAttribute('id'));
}
export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 * @typedef {Object} SetupFixtureOptions
 * @property {Window=} window to setup in (defaults to test context window)
 * @property {string=} caseId subtree element id to render from the fixture
 */

/**
 * Renders a fixture into the body with support for shadow dom hydration
 * @param {string} content html content to be used as fixture
 * @param {SetupFixtureOptions} options
 * @returns {{ container: HTMLDivElement }}
 *  - container: the element the fixture was rendered into
 */
export function setupFixture(content, options = {}) {
  const win = options.window || window;
  const doc = win.document;
  const container = doc.createElement('div');
  appendHTMLWithShadowRoots(container, content, {
    win,
    caseId: options.caseId,
  });
  doc.body.append(container);
  return { container };
}

/**
 * Useful to check whether a `content-visibility: hidden` parent leads to a
 * visible child element in `Element.checkVisibility`. In Firefox < 125, both
 * checkVisibility and native focusability checks seem to consider such an element
 * visible and focusable.
 *
 * @see
 * https://github.com/fpapado/firefox-checkVisibility-with-contentVisibilityHidden
 */
export function isFirefoxLowerThan125() {
  return (
    // NOTE: `browser.name` is lowercase
    // @see https://docs.cypress.io/api/cypress-api/browser#Syntax
    Cypress.browser.name === 'firefox' && Cypress.browser.majorVersion < 125
  );
}
