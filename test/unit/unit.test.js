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

    describe('containers example', () => {
      let containers;

      beforeEach(() => {
        const fixtureContainer = document.createElement('div');
        fixtureContainer.innerHTML = fixtures.containers;
        document.body.append(fixtureContainer);

        containers = [
          document.getElementById('container1'),
          document.getElementById('container2'),
          document.getElementById('container3'),
        ];
      });

      it('correctly identifies tabbable elements', () => {
        const elements = tabbable(containers, options);

        expectElementsInOrder(getElementIds(elements), [
          'anchor-tabindex-1',
          'btn-tabindex-2',
          'btn-tabindex-3',
          'btn-tabindex-4',
          'btn-tabindex-5',
          'btn-tabindex-6',
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

    describe('containers example', () => {
      let containers;

      beforeEach(() => {
        const fixtureContainer = document.createElement('div');
        fixtureContainer.innerHTML = fixtures.containers;
        document.body.append(fixtureContainer);

        containers = [
          document.getElementById('container1'),
          document.getElementById('container2'),
          document.getElementById('container3'),
        ];
      });

      it('correctly identifies focusable elements', () => {
        const elements = focusable(containers, options);

        expectElementsInOrder(getElementIds(elements), [
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
          'hiddenParentVisible-button',
          'displaycontents',
          'displaycontents-child',
          'displaycontents-child-displaynone',
          'audio-control',
          'audio-control-NaN-tabindex',
          'btn-tabindex-5',
          'video-control',
          'video-control-NaN-tabindex',
        ]);
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
