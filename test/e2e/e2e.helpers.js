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
export function setupFixture(content) {
  const container = document.createElement('div');
  container.innerHTML = content;
  document.body.append(container);
  return { container };
}
