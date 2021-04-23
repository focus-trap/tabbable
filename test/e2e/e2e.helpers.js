import { appendHTMLWithShadowRoots } from '../shadow-root-utils';

export function setupTestWindow(done) {
  cy.visit('./cypress/test-sandbox.html');
  cy.window().then(done);
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
 * Renders a fixture into the body with support for shadow dom hydration
 *
 * @param {string} content        html content to be used as fixture
 * @param {window} options.window window to run the fixture in
 * @param {window} options.caseId subtree element id to render from the fixture
 * @returns {HTMLDivElement} return.container the element the fixture was rendered into
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
