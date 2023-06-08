import { focusable } from '../../src/index.js';
import {
  setupTestWindow,
  getFixtures,
  setupFixture,
  removeAllChildNodes,
  getIdsFromElementsArray,
} from './e2e.helpers';

describe('focusable', () => {
  let document, fixtures;

  before(() => {
    getFixtures((f) => (fixtures = f));
  });

  beforeEach(() => {
    setupTestWindow((testWindow) => {
      document = testWindow.document;
    });
  });

  afterEach(() => {
    removeAllChildNodes(document.body);
  });

  describe('example fixtures', () => {
    [undefined, 'full', 'legacy-full'].forEach((displayCheck) => {
      [true, false].forEach((inDocument) => {
        it(`correctly identifies focusable elements in the "basic" example ${
          inDocument ? '(container IN doc' : '(container NOT in doc'
        }, displayCheck=${displayCheck || '<default>'})`, () => {
          let expectedFocusableIds;

          if (inDocument) {
            expectedFocusableIds = [
              'contenteditable-true',
              'contenteditable-nesting',
              'contenteditable-negative-tabindex',
              'contenteditable-NaN-tabindex',
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
              'displaycontents-child',
              'audio-control',
              'audio-control-NaN-tabindex',
              'video-control',
              'video-control-NaN-tabindex',
            ];
          } else if (displayCheck === 'legacy-full') {
            expectedFocusableIds = [
              'contenteditable-true',
              'contenteditable-nesting',
              'contenteditable-negative-tabindex',
              'contenteditable-NaN-tabindex',
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
            expectedFocusableIds = [];
          }

          const container = document.createElement('div');
          container.innerHTML = fixtures.basic;

          if (inDocument) {
            document.body.append(container);
          }

          const focusableElements = focusable(container, { displayCheck });

          expect(getIdsFromElementsArray(focusableElements)).to.eql(
            expectedFocusableIds
          );
        });

        it(`correctly identifies focusable elements in the "containers" example ${
          inDocument ? '(container IN doc' : '(container NOT in doc'
        }, displayCheck=${displayCheck || '<default>'})`, () => {
          let expectedFocusableIds;

          if (inDocument) {
            expectedFocusableIds = [
              'contenteditable-true',
              'btn-tabindex-4',
              'btn-tabindex-2',
              'contenteditable-nesting',
              'contenteditable-negative-tabindex',
              'contenteditable-NaN-tabindex',
              'btn-tabindex-6',
              'input',
              'input-readonly',
              'select',
              'select-readonly',
              'href-anchor',
              'anchor-tabindex-1',
              'textarea',
              'textarea-readonly',
              'button',
              'tabindex-div',
              'negative-select',
              'btn-tabindex-3',
              'hiddenParentVisible-button',
              'displaycontents-child',
              'audio-control',
              'audio-control-NaN-tabindex',
              'btn-tabindex-5',
              'video-control',
              'video-control-NaN-tabindex',
            ];
          } else if (displayCheck === 'legacy-full') {
            expectedFocusableIds = [
              'contenteditable-true',
              'btn-tabindex-4',
              'btn-tabindex-2',
              'contenteditable-nesting',
              'contenteditable-negative-tabindex',
              'contenteditable-NaN-tabindex',
              'btn-tabindex-6',
              'input',
              'input-readonly',
              'select',
              'select-readonly',
              'href-anchor',
              'anchor-tabindex-1',
              'textarea',
              'textarea-readonly',
              'button',
              'tabindex-div',
              'negative-select',
              'displaynone-textarea',
              'btn-tabindex-3',
              'visibilityhidden-button',
              'hiddenParent-button',
              'hiddenParentVisible-button',
              'displaycontents',
              'displaycontents-child',
              'displaycontents-child-displaynone',
              'audio-control',
              'audio-control-NaN-tabindex',
              'btn-tabindex-5',
              'video-control',
              'video-control-NaN-tabindex',
            ];
          } else {
            // should find nothing because the container will be detached
            expectedFocusableIds = [];
          }

          const fixtureContainer = document.createElement('div');
          fixtureContainer.innerHTML = fixtures.containers;

          if (inDocument) {
            document.body.append(fixtureContainer);
          }

          const containers = [
            fixtureContainer.querySelector('#container1'),
            fixtureContainer.querySelector('#container2'),
            fixtureContainer.querySelector('#container3'),
          ];

          const focusableElements = focusable(containers, { displayCheck });

          expect(getIdsFromElementsArray(focusableElements)).to.eql(
            expectedFocusableIds
          );
        });
      });
    });

    // TODO[ff-inert-support]: FF does not yet (Feb 2023) support the `inert` attribute
    describe('inertness', { browser: '!firefox' }, () => {
      [undefined, 'full', 'legacy-full', 'non-zero-area', 'none'].forEach(
        (displayCheck) => {
          it(`correctly identifies focusable elements in the "inert" example with displayCheck=${
            displayCheck || '<default>'
          }`, () => {
            const container = document.createElement('div');
            container.innerHTML = fixtures.inert;
            document.body.append(container);

            // non-inert container, but every element inside of it is
            const focusableElements = focusable(container, { displayCheck });

            expect(getIdsFromElementsArray(focusableElements)).to.eql([]);
          });

          it(`correctly identifies focusable elements in the "basic" example with displayCheck=${
            displayCheck || '<default>'
          } when placed directly inside an inert container`, () => {
            const container = document.createElement('div');
            container.innerHTML = fixtures.basic;
            container.inert = true;
            document.body.append(container);

            // inert container has non-inert children
            const focusableElements = focusable(container, { displayCheck });

            expect(getIdsFromElementsArray(focusableElements)).to.eql([]);
          });

          it(`correctly identifies focusable elements in the "basic" example with displayCheck=${
            displayCheck || '<default>'
          } when nested inside an inert container`, () => {
            const container = document.createElement('div');
            container.innerHTML = fixtures.basic;
            container.inert = true;

            const parentContainer = document.createElement('div');
            parentContainer.appendChild(container);
            document.body.append(parentContainer);

            // non-inert parent has inert container which has non-inert children
            const focusableElements = focusable(parentContainer, {
              displayCheck,
            });

            expect(getIdsFromElementsArray(focusableElements)).to.eql([]);
          });

          it(`correctly identifies focusable elements in the "basic" example with displayCheck=${
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
            const focusableElements = focusable(grandparentContainer, {
              displayCheck,
            });

            expect(getIdsFromElementsArray(focusableElements)).to.eql([]);
          });
        }
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

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
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

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
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

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
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

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
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
      ).to.eql(expectedFocusableIdsAfterSectionIsUnhidden);
    });

    it('correctly identifies focusable elements in the "svg" example', () => {
      const expectedFocusableIds = ['svg-btn', 'svg-1', 'svg-2'];

      const container = document.createElement('div');
      container.innerHTML = fixtures.svg;
      document.body.append(container);

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "radio" example', () => {
      const expectedFocusableIds = [
        'form1-radioA',
        'form1-radioB',
        'form2-radioA',
        'form2-radioB',
        'form3-radioA',
        'form3-radioB',
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

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
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

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "fieldset" example', () => {
      const expectedFocusableIds = [
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

      const focusableElements = focusable(container);

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
        expectedFocusableIds
      );
    });

    it('correctly identifies focusable elements in the "shadow-dom" example', () => {
      const expectedFocusableIds = ['input'];

      const { container } = setupFixture(fixtures['shadow-dom'], { window });
      const host = container.querySelector('test-shadow');

      const focusableElements = focusable(
        host.shadowRoot.querySelector('#container')
      );

      expect(getIdsFromElementsArray(focusableElements)).to.eql(
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

        expect(getIdsFromElementsArray(focusableElements)).to.eql(
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

        expect(getIdsFromElementsArray(focusableElements)).to.eql(
          expectedFocusableIds
        );
      });

      describe('displayed check', () => {
        it('return browser visible elements by default ("full" option)', () => {
          const expectedFocusableIds = [
            'displayed-top',
            'displayed-nested',
            'displayed-zero-size',
            'nested-under-displayed-contents',
          ];
          const container = document.createElement('div');
          container.innerHTML = fixtures.displayed;
          document.body.append(container);

          const focusableElementsDefault = focusable(container);
          const focusableElementsFull = focusable(container, {
            displayCheck: 'full',
          });

          expect(getIdsFromElementsArray(focusableElementsDefault)).to.eql(
            expectedFocusableIds
          );
          expect(getIdsFromElementsArray(focusableElementsFull)).to.eql(
            getIdsFromElementsArray(focusableElementsDefault)
          );
        });
        it('return only elements with size ("non-zero-area" option)', () => {
          const expectedFocusableIds = [
            'displayed-top',
            'displayed-nested',
            'nested-under-displayed-contents',
          ];
          const container = document.createElement('div');
          container.innerHTML = fixtures.displayed;
          document.body.append(container);

          const focusableElementsWithSize = focusable(container, {
            displayCheck: 'non-zero-area',
          });

          expect(getIdsFromElementsArray(focusableElementsWithSize)).to.eql(
            expectedFocusableIds
          );
        });
        it('return elements without checking display ("none" option)', () => {
          const expectedFocusableIds = [
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

          const focusableElementsWithSize = focusable(container, {
            displayCheck: 'none',
          });

          expect(getIdsFromElementsArray(focusableElementsWithSize)).to.eql(
            expectedFocusableIds
          );
        });
      });
    });
  });
});
