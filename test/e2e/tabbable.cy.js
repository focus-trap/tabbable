import { tabbable } from '../../src/index.js';
import {
  setupTestDocument,
  getFixtures,
  setupFixture,
  removeAllChildNodes,
  getIdsFromElementsArray,
} from './e2e.helpers';

describe('tabbable', () => {
  let document, fixtures;

  before(() => {
    getFixtures((f) => (fixtures = f));
  });

  beforeEach(() => {
    setupTestDocument((doc) => {
      document = doc;
    });
  });

  afterEach(() => {
    removeAllChildNodes(document.body);
  });

  describe('example fixtures', () => {
    [undefined, 'full', 'legacy-full'].forEach((displayCheck) => {
      [true, false].forEach((inDocument) => {
        it(`correctly identifies tabbable elements in the "basic" example ${
          inDocument ? '(container IN doc' : '(container NOT in doc'
        }, displayCheck=${displayCheck || '<default>'})`, () => {
          let expectedTabbableIds;

          if (inDocument) {
            expectedTabbableIds = [
              'tabindex-hrefless-anchor',
              'contenteditable-true',
              'contenteditable-nesting',
              'contenteditable-NaN-tabindex',
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
              'displaycontents-child',
              'audio-control',
              'audio-control-NaN-tabindex',
              'video-control',
              'video-control-NaN-tabindex',
            ];
          } else if (displayCheck === 'legacy-full') {
            // any node that has 'visibility: hidden' or 'display: hidden|contents'
            //  will be considered visible and so tabbable
            expectedTabbableIds = [
              'tabindex-hrefless-anchor',
              'contenteditable-true',
              'contenteditable-nesting',
              'contenteditable-NaN-tabindex',
              'input',
              'input-readonly',
              'select',
              'select-readonly',
              'href-anchor',
              'textarea',
              'textarea-readonly',
              'button',
              'tabindex-div',
              'displaynone-textarea',
              'visibilityhidden-button',
              'hiddenParent-button',
              'hiddenParentVisible-button',
              'displaycontents',
              'displaycontents-child',
              'displaycontents-child-displaynone',
              'audio-control',
              'audio-control-NaN-tabindex',
              'video-control',
              'video-control-NaN-tabindex',
            ];
          } else {
            // should find nothing because the container will be detached
            expectedTabbableIds = [];
          }

          const container = document.createElement('div');
          container.innerHTML = fixtures.basic;

          if (inDocument) {
            document.body.append(container);
          }

          const tabbableElements = tabbable(container, { displayCheck });

          expect(getIdsFromElementsArray(tabbableElements)).to.eql(
            expectedTabbableIds
          );
        });
      });
    });

    // TODO[ff-inert-support]: FF does not yet (Feb 2023) support the `inert` attribute
    describe('inertness', { browser: '!firefox' }, () => {
      [undefined, 'full', 'legacy-full', 'non-zero-area', 'none'].forEach(
        (displayCheck) => {
          it(`correctly identifies tabbable elements in the "inert" example with displayCheck=${
            displayCheck || '<default>'
          }`, () => {
            const container = document.createElement('div');
            container.innerHTML = fixtures.inert;
            document.body.append(container);

            // non-inert container, but every element inside of it is
            const tabbableElements = tabbable(container, { displayCheck });

            expect(getIdsFromElementsArray(tabbableElements)).to.eql([]);
          });

          it(`correctly identifies tabbable elements in the "basic" example with displayCheck=${
            displayCheck || '<default>'
          } when placed directly inside an inert container`, () => {
            const container = document.createElement('div');
            container.innerHTML = fixtures.basic;
            container.inert = true;
            document.body.append(container);

            // inert container has non-inert children
            const tabbableElements = tabbable(container, { displayCheck });

            expect(getIdsFromElementsArray(tabbableElements)).to.eql([]);
          });

          it(`correctly identifies tabbable elements in the "basic" example with displayCheck=${
            displayCheck || '<default>'
          } when nested inside an inert container`, () => {
            const container = document.createElement('div');
            container.innerHTML = fixtures.basic;
            container.inert = true;

            const parentContainer = document.createElement('div');
            parentContainer.appendChild(container);
            document.body.append(parentContainer);

            // non-inert parent has inert container which has non-inert children
            const tabbableElements = tabbable(parentContainer, {
              displayCheck,
            });

            expect(getIdsFromElementsArray(tabbableElements)).to.eql([]);
          });

          it(`correctly identifies tabbable elements in the "basic" example with displayCheck=${
            displayCheck || '<default>'
          } when deeply nested inside an inert container`, () => {
            const container = document.createElement('div');
            container.innerHTML = fixtures.basic;

            const parentContainer = document.createElement('div');
            parentContainer.inert = true;
            parentContainer.appendChild(container);

            const grandparentContainer = document.createElement('div');
            grandparentContainer.appendChild(parentContainer);
            document.body.append(grandparentContainer);

            // non-inert grandparent has inert parent, which has non-container with children
            const tabbableElements = tabbable(grandparentContainer, {
              displayCheck,
            });

            expect(getIdsFromElementsArray(tabbableElements)).to.eql([]);
          });
        }
      );
    });

    it('correctly identifies tabbable elements in the "nested" example', () => {
      const expectedTabbableIds = ['tabindex-div-2', 'tabindex-div-0', 'input'];

      const container = document.createElement('div');
      container.innerHTML = fixtures.nested;
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    it('correctly identifies tabbable elements in the "jqueryui" example', () => {
      const expectedTabbableIds = [
        // 1
        'formTabindex',
        'visibleAncestor-spanWithTabindex',
        // 10
        'inputTabindex10',
        'spanTabindex10',
        // 0
        'visibleAncestor-inputTypeNone',
        'visibleAncestor-inputTypeText',
        'visibleAncestor-inputTypeCheckbox',
        'visibleAncestor-inputTypeRadio',
        'visibleAncestor-inputTypeButton',
        'visibleAncestor-button',
        'visibleAncestor-select',
        'visibleAncestor-textarea',
        'visibleAncestor-anchorWithHref',
        'positionFixedButton',
        'inputTabindex0',
        'spanTabindex0',
        'dimensionlessParent',
        'dimensionlessParent-dimensionless',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.jqueryui;
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    it('correctly identifies tabbable elements in the "non-linear" example', () => {
      const expectedTabbableIds = [
        // 1
        'input-1',
        'href-anchor-1',
        // 2
        'button-2',
        // 3
        'select-3',
        'tabindex-div-3',
        // 4
        'tabindex-hrefless-anchor-4',
        //12
        'textarea-12',
        // 0
        'input',
        'select',
        'href-anchor',
        'textarea',
        'button',
        'tabindex-div-0',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures['non-linear'];
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    it('correctly identifies tabbable elements in the "changing content" example', () => {
      const expectedTabbableIds = [
        'visible-button-1',
        'visible-button-2',
        'visible-button-3',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures['changing-content'];
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );

      container.querySelector('#initially-hidden').style.display = 'block';

      const expectedTabbableIdsAfterSectionIsUnhidden = [
        'visible-button-1',
        'visible-button-2',
        'visible-button-3',
        'initially-hidden-button-1',
        'initially-hidden-button-2',
      ];

      const tabbableElementsAfterSectionIsUnhidden = tabbable(container);

      expect(
        getIdsFromElementsArray(tabbableElementsAfterSectionIsUnhidden)
      ).to.eql(expectedTabbableIdsAfterSectionIsUnhidden);
    });

    it('correctly identifies tabbable elements in the "svg" example', () => {
      const expectedTabbableIds = ['svg-btn', 'svg-1'];

      const container = document.createElement('div');
      container.innerHTML = fixtures.svg;
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    it('correctly identifies tabbable elements in the "radio" example', () => {
      const expectedTabbableIds = [
        'form1-radioA',
        'form2-radioA',
        'form2-radioB',
        'form3-radioA',
        'form3-radioB',
        'noform-radioA',
        'noform-groupB-radioA',
        'noform-groupB-radioB',
        'noform-groupC-radioA',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.radio;
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    it('correctly identifies tabbable elements in the "radio" example without the `CSS.escape` functionality', () => {
      const actualEscape = CSS.escape;
      CSS.escape = undefined;
      cy.spy(console, 'error');

      const expectedTabbableIds = [
        'form1-radioA',
        'form2-radioA',
        'form2-radioB',
        'form3-radioA',
        'form3-radioB',
        'noform-radioA',
        'noform-groupB-radioA',
        'noform-groupB-radioB',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.radio;
      document.body.append(container);

      const tabbableElements = tabbable(container);

      try {
        expect(getIdsFromElementsArray(tabbableElements)).to.eql(
          expectedTabbableIds
        );
        // eslint-disable-next-line no-console
        expect(console.error).to.have.callCount(2);
      } finally {
        if (actualEscape) {
          CSS.escape = actualEscape;
        }
      }
    });

    it('correctly identifies tabbable elements in the "details" example', () => {
      const expectedTabbableIds = [
        'details-a-summary',
        'details-b-summary',
        'visible-input',
        'details-c',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.details;
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    it('correctly identifies tabbable elements in the "fieldset" example', () => {
      const expectedTabbableIds = [
        'free-enabled-button',
        'fieldset-enabled-legend-button',
        'fieldset-enabled-legend-input',
        'fieldset-enabled-legend-select',
        'fieldset-enabled-legend-textarea',
        'fieldset-enabled-button',
        'fieldset-enabled-input',
        'fieldset-enabled-select',
        'fieldset-enabled-textarea',
        'fieldset-enabled-fieldset-disabled-legend-button',
        'fieldset-enabled-anchor',
        'fieldset-disabled-legend1-button',
        'fieldset-disabled-legend1-input',
        'fieldset-disabled-legend1-select',
        'fieldset-disabled-legend1-textarea',
        'fieldset-disabled-anchor',
      ];

      const container = document.createElement('div');
      container.innerHTML = fixtures.fieldset;
      document.body.append(container);

      const tabbableElements = tabbable(container);

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    it('correctly identifies tabbable elements in the "shadow-dom" example', () => {
      const expectedTabbableIds = ['input'];

      const { container } = setupFixture(fixtures['shadow-dom'], { window });
      const host = container.querySelector('test-shadow');

      const tabbableElements = tabbable(
        host.shadowRoot.querySelector('#container')
      );

      expect(getIdsFromElementsArray(tabbableElements)).to.eql(
        expectedTabbableIds
      );
    });

    describe('options argument', () => {
      it('includes the container element when the `includeContainer` property is true', () => {
        const expectedTabbableIds = [
          'tabindex-div-2',
          'container-div',
          'tabindex-div-0',
          'input',
        ];

        const container = document.createElement('div');
        container.id = 'container-div';
        container.setAttribute('tabindex', '0');
        container.innerHTML = fixtures.nested;
        document.body.append(container);

        const tabbableElements = tabbable(container, {
          includeContainer: true,
        });

        expect(getIdsFromElementsArray(tabbableElements)).to.eql(
          expectedTabbableIds
        );
      });

      it('does not include the container element when the `includeContainer` property is false', () => {
        const expectedTabbableIds = [
          'tabindex-div-2',
          'tabindex-div-0',
          'input',
        ];

        const container = document.createElement('div');
        container.id = 'container-div';
        container.setAttribute('tabindex', '0');
        container.innerHTML = fixtures.nested;
        document.body.append(container);

        const tabbableElements = tabbable(container, {
          includeContainer: false,
        });

        expect(getIdsFromElementsArray(tabbableElements)).to.eql(
          expectedTabbableIds
        );
      });

      describe('displayed check', () => {
        it('return browser visible elements by default ("full" option)', () => {
          const expectedTabbableIds = [
            'displayed-top',
            'displayed-nested',
            'displayed-zero-size',
            'nested-under-displayed-contents',
          ];
          const container = document.createElement('div');
          container.innerHTML = fixtures.displayed;
          document.body.append(container);

          const tabbableElementsDefault = tabbable(container);
          const tabbableElementsFull = tabbable(container, {
            displayCheck: 'full',
          });

          expect(getIdsFromElementsArray(tabbableElementsDefault)).to.eql(
            expectedTabbableIds
          );
          expect(getIdsFromElementsArray(tabbableElementsFull)).to.eql(
            getIdsFromElementsArray(tabbableElementsDefault)
          );
        });
        it('return only elements with size ("non-zero-area" option)', () => {
          const expectedTabbableIds = [
            'displayed-top',
            'displayed-nested',
            'nested-under-displayed-contents',
          ];
          const container = document.createElement('div');
          container.innerHTML = fixtures.displayed;
          document.body.append(container);

          const tabbableElementsWithSize = tabbable(container, {
            displayCheck: 'non-zero-area',
          });

          expect(getIdsFromElementsArray(tabbableElementsWithSize)).to.eql(
            expectedTabbableIds
          );
        });
        it('return elements without checking display ("none" option)', () => {
          const expectedTabbableIds = [
            'displayed-top',
            'displayed-nested',
            'displayed-none-top',
            'nested-under-displayed-none',
            'displayed-zero-size',
            'displayed-contents-top',
            'nested-under-displayed-contents',
          ];
          const container = document.createElement('div');
          container.innerHTML = fixtures.displayed;
          document.body.append(container);

          const tabbableElementsWithSize = tabbable(container, {
            displayCheck: 'none',
          });

          expect(getIdsFromElementsArray(tabbableElementsWithSize)).to.eql(
            expectedTabbableIds
          );
        });
      });
    });
  });
});
