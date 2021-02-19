const { focusable } = require('../src/index.js');
const fixtures = require('./fixtures/index.js');
const {
  getIdsFromElementsArray,
  removeAllChildNodes,
} = require('./helpers.js');

describe('focusable', () => {
  afterEach(() => {
    removeAllChildNodes(document.body);
  });

  describe('example fixtures', () => {
    it('correctly identifies focusable elements in the "basic" example', () => {
      const expectedFocusableIds = [
        'contenteditable-true',
        'contenteditable-nesting',
        'input',
        'input-readonly',
        'select',
        'select-readonly',
        'href-anchor',
        'tabindex-hrefless-anchor',
        'textarea',
        'textarea-readonly',
        'button',
        'tabindex-div',
        'negative-select',
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

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "nested" example', () => {
      const expectedFocusableIds = [
        'tabindex-div-0',
        'tabindex-div-2',
        'input',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.nested;
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "jqueryui" example', () => {
      const expectedFocusableIds = [
        'formTabindex',
        'visibleAncestor-inputTypeNone',
        'visibleAncestor-inputTypeText',
        'visibleAncestor-inputTypeCheckbox',
        'visibleAncestor-inputTypeRadio',
        'visibleAncestor-inputTypeButton',
        'visibleAncestor-button',
        'visibleAncestor-select',
        'visibleAncestor-textarea',
        'visibleAncestor-anchorWithHref',
        'visibleAncestor-spanWithTabindex',
        'visibleAncestor-divWithNegativeTabindex',
        'positionFixedButton',
        'inputTabindex0',
        'inputTabindex10',
        'inputTabindex-1',
        'inputTabindex-50',
        'spanTabindex0',
        'spanTabindex10',
        'spanTabindex-1',
        'spanTabindex-50',
        'dimensionlessParent',
        'dimensionlessParent-dimensionless',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.jqueryui;
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "non-linear" example', () => {
      const expectedFocusableIds = [
        'input',
        'select',
        'href-anchor',
        'textarea',
        'button',
        'tabindex-div-0',
        'input-1',
        'select-3',
        'href-anchor-1',
        'tabindex-hrefless-anchor-4',
        'textarea-12',
        'button-2',
        'tabindex-div-3',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures['non-linear'];
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "changing content" example', () => {
      const expectedFocusableIds = [
        'visible-button-1',
        'visible-button-2',
        'visible-button-3',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures['changing-content'];
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );

      container.querySelector('#initially-hidden').style.display = 'block';

      const expectedFocusableIdsAfterSectionIsUnhidden = [
        'visible-button-1',
        'visible-button-2',
        'visible-button-3',
        'initially-hidden-button-1',
        'initially-hidden-button-2',
      ];

      const focusableElementsAfterSectionIsUnhidden = focusable(container);

      expect(
        getIdsFromElementsArray(focusableElementsAfterSectionIsUnhidden)
      ).toEqual(expectedFocusableIdsAfterSectionIsUnhidden);
    });

    it('correctly identifies focusable elements in the "svg" example', () => {
      const expectedFocusableIds = ['svg-btn', 'svg-1', 'svg-2'];

      const container = document.createElement('div');
      container.innerHTML = fixtures.svg;
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "radio" example', () => {
      const expectedFocusableIds = [
        'formA-radioA',
        'formA-radioB',
        'formB-radioA',
        'formB-radioB',
        'noform-radioA',
        'noform-radioB',
        'noform-groupB-radioA',
        'noform-groupB-radioB',
        'noform-groupC-radioA',
        'noform-groupC-radioB',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.radio;
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "details" example', () => {
      const expectedFocusableIds = [
        'details-a-summary',
        'details-b-summary',
        'visible-input',
        'details-c',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.details;
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "shadow-dom" example', () => {
      const expectedFocusableIds = ['input'];

      const container = document.createElement('div');
      container.innerHTML = fixtures['shadow-dom'];
      document.body.append(container);

      const host = container.querySelector('#shadow-host');
      const template = container.querySelector('#shadow-root-template');

      const shadow = host.attachShadow({ mode: 'open' });
      shadow.appendChild(template.content.cloneNode(true));

      const focusableElements = focusable(shadow.querySelector('#container'));

      expect(getIdsFromElementsArray(focusableElements)).toEqual(
        expectedFocusableIds
      );
    });

    describe('options argument', () => {
      it('includes the container element when the `includeContainer` property is true', () => {
        const expectedFocusableIds = [
          'container-div',
          'tabindex-div-0',
          'tabindex-div-2',
          'input',
        ];

        const container = document.createElement('div');
        container.id = 'container-div';
        container.setAttribute('tabindex', '0');
        container.innerHTML = fixtures.nested;
        document.body.append(container);

        const focusableElements = focusable(container, {
          includeContainer: true,
        });

        expect(getIdsFromElementsArray(focusableElements)).toEqual(
          expectedFocusableIds
        );
      });

      it('does not include the container element when the `includeContainer` property is false', () => {
        const expectedFocusableIds = [
          'tabindex-div-0',
          'tabindex-div-2',
          'input',
        ];

        const container = document.createElement('div');
        container.id = 'container-div';
        container.setAttribute('tabindex', '0');
        container.innerHTML = fixtures.nested;
        document.body.append(container);

        const focusableElements = focusable(container, {
          includeContainer: false,
        });

        expect(getIdsFromElementsArray(focusableElements)).toEqual(
          expectedFocusableIds
        );
      });
    });
  });
});
