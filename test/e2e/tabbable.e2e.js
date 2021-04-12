import { tabbable } from '../../src/index.js';

describe('tabbable', () => {
  let fixtures, window, document, helpers;
  before((done) => {
    cy.setupTestWindow(({ testWindow, testHelpers }) => {
      // eslint-disable-next-line no-unused-vars
      window = testWindow;
      document = testWindow.document;
      helpers = testHelpers;
      done();
    });
  });
  before((done) => {
    cy.task('getFixtures').then((f) => {
      fixtures = f;
      done();
    });
  });

  afterEach(() => {
    helpers.removeAllChildNodes(document.body);
  });

  describe('example fixtures', () => {
    it('correctly identifies tabbable elements in the "basic" example', () => {
      const expectedTabbableIds = [
        'tabindex-hrefless-anchor',
        'contenteditable-true',
        'contenteditable-nesting',
        'input',
        'input-readonly',
        'select',
        'select-readonly',
        'href-anchor',
        'textarea',
        'textarea-readonly',
        'button',
        'tabindex-div',
        'hiddenParentVisible-button',
        'audio-control',
        'video-control',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.basic;
      document.body.append(container);

      // JSDOM does not support the `contenteditable` attribute, so we need to fake it
      // https://github.com/jsdom/jsdom/issues/1670
      const editableDiv = container.querySelector('#contenteditable-true');
      const editableNestedDiv = container.querySelector(
        '#contenteditable-nesting'
      );

      editableDiv.contentEditable = 'true';
      editableNestedDiv.contentEditable = 'true';

      const tabbableElements = tabbable(container);

      expect(helpers.getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });
  });
});
