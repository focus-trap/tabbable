const assert = require('chai').assert;
const {
  tabbable,
  isTabbable,
  focusable,
  isFocusable,
} = require('../dist/index.js');

const fixtures = require('./fixtures');

let fixtureRoots = [];

function createRootNode(doc, fixtureName) {
  const html = fixtures[fixtureName];
  const root = doc.createElement('div');
  root.innerHTML = html;
  doc.body.appendChild(root);
  return root;
}

function getTabbableIds(node, options) {
  return tabbable(node, options).map((el) => el.getAttribute('id'));
}

function getFocusableIds(node, options) {
  return focusable(node, options).map((el) => el.getAttribute('id'));
}

function fixture(fixtureName) {
  const root = createRootNode(document, fixtureName);
  fixtureRoots.push(root);
  return {
    getTabbableIds: getTabbableIds.bind(null, root),
    getFocusableIds: getFocusableIds.bind(null, root),
    getDocument() {
      return document;
    },
  };
}

function fixtureWithIframe(fixtureName) {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  fixtureRoots.push(iframe);
  const rootNode = createRootNode(iframe.contentDocument, fixtureName);
  return {
    getTabbableIds: getTabbableIds.bind(null, rootNode),
    getFocusableIds: getFocusableIds.bind(null, rootNode),
    getDocument() {
      return iframe.contentDocument;
    },
  };
}

function fixtureWithDocument(fixtureName) {
  const root = createRootNode(document, fixtureName);
  fixtureRoots.push(root);
  return {
    getTabbableIds: getTabbableIds.bind(null, document),
    getFocusableIds: getFocusableIds.bind(null, document),
    getDocument() {
      return document;
    },
  };
}

function cleanupFixtures() {
  fixtureRoots.forEach((root) => {
    document.body.removeChild(root);
  });
  fixtureRoots = [];
}

describe('tabbable', () => {
  afterEach(() => {
    cleanupFixtures();
  });

  [
    { name: 'window', getFixture: fixture },
    { name: 'iframe window', getFixture: fixtureWithIframe },
    { name: 'document', getFixture: fixtureWithDocument },
  ].forEach((assertionSet) => {
    describe(assertionSet.name, () => {
      describe('#tabbable', () => {
        it('basic', () => {
          const actual = assertionSet.getFixture('basic').getTabbableIds();
          const expected = [
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
          assert.deepEqual(actual, expected);
        });

        it('nested', () => {
          const actual = assertionSet.getFixture('nested').getTabbableIds();
          const expected = ['tabindex-div-2', 'tabindex-div-0', 'input'];
          assert.deepEqual(actual, expected);
        });

        it('jqueryui', () => {
          const actual = assertionSet.getFixture('jqueryui').getTabbableIds();
          const expected = [
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
          assert.deepEqual(actual, expected);
        });

        it('non-linear', () => {
          const originalSort = Array.prototype.sort;

          // This sort piggy-backs on the default Array.prototype.sort, but always
          // orders elements that were compared to be equal in reverse order of their
          // index in the original array. We do this to simulate browsers who do not
          // use a stable sort algorithm in their implementation.
          // eslint-disable-next-line no-extend-native
          Array.prototype.sort = function (compareFunction) {
            return originalSort.call(this, function (a, b) {
              const comparison = compareFunction
                ? compareFunction(a, b)
                : a - b;
              return comparison || this.indexOf(b) - this.indexOf(a);
            });
          };
          const actual = assertionSet.getFixture('non-linear').getTabbableIds();
          // eslint-disable-next-line no-extend-native
          Array.prototype.sort = originalSort;
          const expected = [
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
          assert.deepEqual(actual, expected);
        });

        it('changing content', () => {
          const loadedFixture = assertionSet.getFixture('changing-content');
          const actualA = loadedFixture.getTabbableIds();
          const expectedA = [
            'visible-button-1',
            'visible-button-2',
            'visible-button-3',
          ];
          assert.deepEqual(actualA, expectedA);

          loadedFixture
            .getDocument()
            .getElementById('initially-hidden').style.display = 'block';

          const actualB = loadedFixture.getTabbableIds();
          const expectedB = [
            'visible-button-1',
            'visible-button-2',
            'visible-button-3',
            'initially-hidden-button-1',
            'initially-hidden-button-2',
          ];
          assert.deepEqual(actualB, expectedB);
        });

        it('including container', () => {
          const loadedFixture = assertionSet.getFixture('nested');
          const container = loadedFixture
            .getDocument()
            .getElementById('tabindex-div-0');

          const actualFalse = getTabbableIds(container);
          const expectedFalse = ['tabindex-div-2', 'input'];
          assert.deepEqual(actualFalse, expectedFalse);

          const actualTrue = getTabbableIds(container, {
            includeContainer: true,
          });
          const expectedTrue = ['tabindex-div-2', 'tabindex-div-0', 'input'];
          assert.deepEqual(actualTrue, expectedTrue);
        });

        it('svg', () => {
          const actual = assertionSet.getFixture('svg').getTabbableIds();
          const expected = ['svg-btn', 'svg-1'];
          assert.deepEqual(actual, expected);
        });

        it('radio', () => {
          const actual = assertionSet.getFixture('radio').getTabbableIds();
          const expected = [
            'formA-radioA',
            'formB-radioA',
            'formB-radioB',
            'noform-radioA',
            'noform-other-group-radioA',
            'noform-other-group-radioB',
          ];
          assert.deepEqual(actual, expected);
        });

        it('details', () => {
          const actual = assertionSet.getFixture('details').getTabbableIds();
          const expected = [
            'details-a-summary',
            'details-b-summary',
            'visible-input',
            'details-c',
          ];
          assert.deepEqual(actual, expected);
        });

        it('supports elements in a shadow root', () => {
          const loadedFixture = assertionSet.getFixture('shadow-dom');

          const host = loadedFixture
            .getDocument()
            .getElementById('shadow-host');
          const template = loadedFixture
            .getDocument()
            .getElementById('shadow-root-template');
          const shadow = host.attachShadow({ mode: 'open' });
          shadow.appendChild(template.content.cloneNode(true));

          const actual = getTabbableIds(shadow.getElementById('container'));
          const expected = ['input'];
          assert.deepEqual(actual, expected);
        });
      });

      describe('#focusable', () => {
        it('basic', () => {
          const actual = assertionSet.getFixture('basic').getFocusableIds();
          const expected = [
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
            'negative-select',
          ];
          assert.deepEqual(actual.sort(), expected.sort());
        });

        it('nested', () => {
          const actual = assertionSet.getFixture('nested').getFocusableIds();
          const expected = ['tabindex-div-2', 'tabindex-div-0', 'input'];
          assert.deepEqual(actual.sort(), expected.sort());
        });

        it('jqueryui', () => {
          const actual = assertionSet.getFixture('jqueryui').getFocusableIds();
          const expected = [
            'formTabindex',
            'visibleAncestor-spanWithTabindex',
            'inputTabindex0',
            'inputTabindex10',
            'inputTabindex-1',
            'inputTabindex-50',
            'spanTabindex0',
            'spanTabindex10',
            'positionFixedButton',
            'spanTabindex-1',
            'spanTabindex-50',
            'visibleAncestor-inputTypeNone',
            'visibleAncestor-inputTypeText',
            'visibleAncestor-inputTypeCheckbox',
            'visibleAncestor-inputTypeRadio',
            'visibleAncestor-inputTypeButton',
            'visibleAncestor-button',
            'visibleAncestor-select',
            'visibleAncestor-textarea',
            'visibleAncestor-anchorWithHref',
            'visibleAncestor-divWithNegativeTabindex',
            'dimensionlessParent',
            'dimensionlessParent-dimensionless',
          ];
          assert.deepEqual(actual.sort(), expected.sort());
        });

        it('non-linear', () => {
          const actual = assertionSet
            .getFixture('non-linear')
            .getFocusableIds();
          const expected = [
            'input-1',
            'href-anchor-1',
            'button-2',
            'select-3',
            'tabindex-div-3',
            'tabindex-hrefless-anchor-4',
            'textarea-12',
            'input',
            'select',
            'href-anchor',
            'textarea',
            'button',
            'tabindex-div-0',
          ];
          assert.deepEqual(actual.sort(), expected.sort());
        });

        it('changing content', () => {
          const loadedFixture = assertionSet.getFixture('changing-content');
          const actualA = loadedFixture.getFocusableIds();
          const expectedA = [
            'visible-button-1',
            'visible-button-2',
            'visible-button-3',
          ];
          assert.deepEqual(actualA.sort(), expectedA.sort());

          loadedFixture
            .getDocument()
            .getElementById('initially-hidden').style.display = 'block';

          const actualB = loadedFixture.getFocusableIds();
          const expectedB = [
            'visible-button-1',
            'visible-button-2',
            'visible-button-3',
            'initially-hidden-button-1',
            'initially-hidden-button-2',
          ];
          assert.deepEqual(actualB.sort(), expectedB.sort());
        });

        it('including container', () => {
          const loadedFixture = assertionSet.getFixture('nested');
          const container = loadedFixture
            .getDocument()
            .getElementById('tabindex-div-0');

          const actualFalse = getFocusableIds(container);
          const expectedFalse = ['tabindex-div-2', 'input'];
          assert.deepEqual(actualFalse.sort(), expectedFalse.sort());

          const actualTrue = getFocusableIds(container, {
            includeContainer: true,
          });
          const expectedTrue = ['tabindex-div-2', 'tabindex-div-0', 'input'];
          assert.deepEqual(actualTrue.sort(), expectedTrue.sort());
        });

        it('svg', () => {
          const actual = assertionSet.getFixture('svg').getFocusableIds();
          const expected = ['svg-btn', 'svg-1', 'svg-2'];
          assert.deepEqual(actual.sort(), expected.sort());
        });

        it('radio', () => {
          const actual = assertionSet.getFixture('radio').getFocusableIds();
          const expected = [
            'formA-radioA',
            'formA-radioB',
            'formB-radioA',
            'formB-radioB',
            'noform-radioA',
            'noform-radioB',
            'noform-other-group-radioA',
            'noform-other-group-radioB',
          ];
          assert.deepEqual(actual.sort(), expected.sort());
        });

        it('details', () => {
          const actual = assertionSet.getFixture('details').getFocusableIds();
          const expected = [
            'details-a-summary',
            'details-b-summary',
            'visible-input',
            'details-c',
          ];
          assert.deepEqual(actual.sort(), expected.sort());
        });

        it('supports elements in a shadow root', () => {
          const loadedFixture = assertionSet.getFixture('shadow-dom');

          const host = loadedFixture
            .getDocument()
            .getElementById('shadow-host');
          const template = loadedFixture
            .getDocument()
            .getElementById('shadow-root-template');
          const shadow = host.attachShadow({ mode: 'open' });
          shadow.appendChild(template.content.cloneNode(true));

          const actual = getFocusableIds(shadow.getElementById('container'));
          const expected = ['input'];
          assert.deepEqual(actual.sort(), expected.sort());
        });
      });

      describe('#isTabbable', () => {
        it('isTabbable', () => {
          const n1 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('contenteditable-true');
          assert.ok(isTabbable(n1));
          const n2 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('contenteditable-false');
          assert.notOk(isTabbable(n2));
          const n3 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('href-anchor');
          assert.ok(isTabbable(n3));
          const n4 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('hrefless-anchor');
          assert.notOk(isTabbable(n4));
          const n5 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('iframe');
          assert.notOk(isTabbable(n5));
          const n6 = assertionSet
            .getFixture('radio')
            .getDocument()
            .getElementById('formA-radioA');
          assert.ok(isTabbable(n6));
          const n7 = assertionSet
            .getFixture('radio')
            .getDocument()
            .getElementById('formA-radioB');
          assert.notOk(isTabbable(n7));
          const n8 = assertionSet
            .getFixture('details')
            .getDocument()
            .getElementById('details-a-summary');
          assert.ok(isTabbable(n8));
          const n9 = assertionSet
            .getFixture('details')
            .getDocument()
            .getElementById('details-c');
          assert.ok(isTabbable(n9));
        });
      });

      describe('#isFocusable', () => {
        it('isFocusable', () => {
          const n1 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('contenteditable-true');
          assert.ok(isFocusable(n1));
          const n2 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('contenteditable-false');
          assert.notOk(isFocusable(n2));
          const n3 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('href-anchor');
          assert.ok(isFocusable(n3));
          const n4 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('hrefless-anchor');
          assert.notOk(isFocusable(n4));
          const n5 = assertionSet
            .getFixture('basic')
            .getDocument()
            .getElementById('iframe');
          assert.ok(isFocusable(n5));
          const n6 = assertionSet
            .getFixture('radio')
            .getDocument()
            .getElementById('formA-radioA');
          assert.ok(isFocusable(n6));
          const n7 = assertionSet
            .getFixture('radio')
            .getDocument()
            .getElementById('formA-radioB');
          assert.ok(isFocusable(n7));
          const n8 = assertionSet
            .getFixture('details')
            .getDocument()
            .getElementById('details-a-summary');
          assert.ok(isFocusable(n8));
          const n9 = assertionSet
            .getFixture('details')
            .getDocument()
            .getElementById('details-c');
          assert.ok(isFocusable(n9));
        });
      });
    });
  });
});
