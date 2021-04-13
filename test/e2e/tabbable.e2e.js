import { tabbable } from '../../src/index.js';
import {
  setupTestWindow,
  getFixtures,
  removeAllChildNodes,
  getIdsFromElementsArray,
} from './e2e.helpers';

describe('tabbable', () => {
  let window, document, fixtures;
  before(() => {
    setupTestWindow((testWindow) => {
      // eslint-disable-next-line no-unused-vars
      window = testWindow;
      document = testWindow.document;
    });
    getFixtures((f) => (fixtures = f));
  });

  afterEach(() => {
    removeAllChildNodes(document.body);
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
        // 'tabindex-div',
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

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });
  });
});
