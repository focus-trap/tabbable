Cypress.Commands.add('setupTestWindow', (done) => {
  cy.visit('./cypress/test-sandbox.html', {
    onLoad: (testWindow) => {
      done({
        testWindow,
        testHelpers: {
          getIdsFromElementsArray(elements) {
            return elements.map((el) => el.getAttribute('id'));
          },
          removeAllChildNodes(parent) {
            while (parent.firstChild) {
              parent.removeChild(parent.firstChild);
            }
          },
          setupFixture(content) {
            const container = document.createElement('div');
            container.innerHTML = content;
            document.body.append(container);
            return { container };
          },
        },
      });
    },
  });
});
