const fixtures = require('../fixtures/fixtures');
const { tabbable, focusable, getTabIndex } = require('../../src/index.js');

const getElementIds = function (elements) {
  return elements.map((el) => el.id);
};

const expectElementsInOrder = function (receivedIds, expectedIds) {
  expect(receivedIds).toStrictEqual(expectedIds);
};

describe('unit tests', () => {
  let options;

  beforeEach(() => {
    // NOTE: in jest, the only display check that's expected to work is 'none' because
    //  jsDom doesn't support the APIs needed to make the other modes work
    options = { displayCheck: 'none' };
  });

  describe('tabbable', () => {
    // NOTE: the attached node check only applies when displayCheck is NOT 'none'
    //  and since that's the only displayCheck we can use in JSDom, we expect to
    //  find the same nodes regardless of whether they're attached or not

    describe('basic example', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = fixtures.basic;
        document.body.append(container);
      });

      it('correctly identifies tabbable elements', () => {
        const elements = tabbable(container, options);

        expectElementsInOrder(getElementIds(elements), [
          'tabindex-hrefless-anchor',
          'contenteditable-true', // JSDom doesn't appear to support contenteditable
          'contenteditable-nesting', // JSDom doesn't appear to support contenteditable
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
          'hiddenParentVisible-button',
          'contentVisibilityHidden-button',
          'contentVisibilityHiddenParent-button',
          'opacityZero-button',
          'opacityZeroParent-button',
          'displaycontents',
          'displaycontents-child',
          'displaycontents-child-displaynone',
          'audio-control',
          'audio-control-NaN-tabindex',
          'video-control',
          'video-control-NaN-tabindex',
        ]);
      });
    });

    describe('inert example', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = fixtures.inert;
        document.body.append(container);
      });

      it('correctly identifies tabbable elements', () => {
        const elements = tabbable(container, options);

        expectElementsInOrder(getElementIds(elements), []);
      });
    });
  });

  describe('focusable', () => {
    // NOTE: the attached node check only applies when displayCheck is NOT 'none'
    //  and since that's the only displayCheck we can use in JSDom, we expect to
    //  find the same nodes regardless of whether they're attached or not

    describe('basic example', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = fixtures.basic;
        document.body.append(container);
      });

      it('correctly identifies focusable elements', () => {
        const elements = focusable(container, options);

        expectElementsInOrder(getElementIds(elements), [
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
          'hiddenParentVisible-button',
          'contentVisibilityHidden-button',
          'contentVisibilityHiddenParent-button',
          'opacityZero-button',
          'opacityZeroParent-button',
          'displaycontents',
          'displaycontents-child',
          'displaycontents-child-displaynone',
          'audio-control',
          'audio-control-NaN-tabindex',
          'video-control',
          'video-control-NaN-tabindex',
        ]);
      });
    });

    describe('inert example', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = fixtures.inert;
        document.body.append(container);
      });

      it('correctly identifies focusable elements', () => {
        const elements = focusable(container, options);

        expectElementsInOrder(getElementIds(elements), []);
      });
    });

    describe('displayCheck option', () => {
      it('falls back to full option if full-native is specified but Element#checkVisibility is unsupported', () => {
        // This test is here as an alternative to testing the fallback in e2e
        // tests. Cypress only supports Chrome or Firefox < 105 (versions
        // without checkVisibility) in their Node 16 docker image
        const container = document.createElement('div');
        const button = document.createElement('button');
        button.innerText = 'foo';
        container.appendChild(button);
        document.body.append(container);

        if (typeof container.checkVisibility !== 'undefined') {
          // a tacit assumption in this test is that checkVisibility() is unsupported in JSDOM
          throw new Error(
            'checkVisibility seems to be supported in this version of JSDOM, making the test invalid. Consider changing to an end-to-end test with sufficiently old browsers.'
          );
        }

        // we use getComputedStyle() as a proxy for manual display checks being made
        const getComputedStyleSpy = jest.spyOn(window, 'getComputedStyle');

        focusable(container, { displayCheck: 'full-native' });

        expect(getComputedStyleSpy).toHaveBeenCalledTimes(1);
        expect(getComputedStyleSpy).toHaveBeenNthCalledWith(1, button);
      });
    });
  });

  describe('getTabIndex', () => {
    describe('tabindex example', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = fixtures.tabindex;
        document.body.append(container);
      });

      it('correctly identifies tab index of elements', () => {
        const results = Array.from(container.children).map((child) => [
          child.id,
          getTabIndex(child),
        ]);

        expect(results).toEqual([
          ['anchor-tabindex-none', 0],
          ['btn-tabindex-1', 1],
          ['contenteditable-tabindex-none', 0],
          ['contenteditable-tabindex-neg', -1],
          ['audio-control-tabindex-none', 0],
          ['audio-nocontrol-tabindex-none', 0],
          ['audio-control-tabindex-invalid', 0],
          ['audio-control-tabindex-2', 2],
          ['video-control-tabindex-none', 0],
          ['video-nocontrol-tabindex-none', 0],
          ['video-control-tabindex-invalid', 0],
          ['video-control-tabindex-3', 3],
          ['details-tabindex-none', 0],
          ['details-tabindex-neg', -1],
        ]);
      });
    });
  });
});
