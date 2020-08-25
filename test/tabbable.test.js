const assert = require('chai').assert;
const { tabbable, isFocusable, isTabbable } = require('../dist/index.min.js');

const fixtures = require('./fixtures');

let fixtureRoots = [];

function createRootNode(doc, fixtureName) {
  let html = fixtures[fixtureName];
  let root = doc.createElement('div');
  root.innerHTML = html;
  doc.body.appendChild(root);
  return root;
}

function getTabbableIds(node, options) {
  return tabbable(node, options).map(el => el.getAttribute('id'));
}

function fixture(fixtureName) {
  let root = createRootNode(document, fixtureName);
  fixtureRoots.push(root);
  return {
    getTabbableIds: getTabbableIds.bind(null, root),
    getDocument() {
      return document;
    },
  };
}

function fixtureWithIframe(fixtureName) {
  let iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  fixtureRoots.push(iframe);
  return {
    getTabbableIds: getTabbableIds.bind(
      null,
      createRootNode(iframe.contentDocument, fixtureName)
    ),
    getDocument() {
      return iframe.contentDocument;
    },
  };
}

function fixtureWithDocument(fixtureName) {
  let root = createRootNode(document, fixtureName);
  fixtureRoots.push(root);
  return {
    getTabbableIds: getTabbableIds.bind(null, document),
    getDocument() {
      return document;
    },
  };
}

function cleanupFixtures() {
  fixtureRoots.forEach(root => {
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
    { name: "iframe's window", getFixture: fixtureWithIframe },
    { name: 'document', getFixture: fixtureWithDocument },
  ].forEach(assertionSet => {
    describe(assertionSet.name, () => {
      it('basic', () => {
        let actual = assertionSet.getFixture('basic').getTabbableIds();
        let expected = [
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
        let actual = assertionSet.getFixture('nested').getTabbableIds();
        let expected = ['tabindex-div-2', 'tabindex-div-0', 'input'];
        assert.deepEqual(actual, expected);
      });

      it('jqueryui', () => {
        let actual = assertionSet.getFixture('jqueryui').getTabbableIds();
        let expected = [
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
          'inputTabindex0',
          'spanTabindex0',
          'dimensionlessParent',
          'dimensionlessParent-dimensionless',
        ];
        assert.deepEqual(actual, expected);
      });

      it('non-linear', () => {
        let originalSort = Array.prototype.sort;

        // This sort piggy-backs on the default Array.prototype.sort, but always
        // orders elements that were compared to be equal in reverse order of their
        // index in the original array. We do this to simulate browsers who do not
        // use a stable sort algorithm in their implementation.
        // eslint-disable-next-line no-extend-native
        Array.prototype.sort = function(compareFunction) {
          return originalSort.call(this, function(a, b) {
            let comparison = compareFunction ? compareFunction(a, b) : a - b;
            return comparison || this.indexOf(b) - this.indexOf(a);
          });
        };
        let actual = assertionSet.getFixture('non-linear').getTabbableIds();
        // eslint-disable-next-line no-extend-native
        Array.prototype.sort = originalSort;
        let expected = [
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
        let loadedFixture = assertionSet.getFixture('changing-content');
        let actualA = loadedFixture.getTabbableIds();
        let expectedA = [
          'visible-button-1',
          'visible-button-2',
          'visible-button-3',
        ];
        assert.deepEqual(actualA, expectedA);

        loadedFixture
          .getDocument()
          .getElementById('initially-hidden').style.display = 'block';

        let actualB = loadedFixture.getTabbableIds();
        let expectedB = [
          'visible-button-1',
          'visible-button-2',
          'visible-button-3',
          'initially-hidden-button-1',
          'initially-hidden-button-2',
        ];
        assert.deepEqual(actualB, expectedB);
      });

      it('including container', () => {
        let loadedFixture = assertionSet.getFixture('nested');
        let container = loadedFixture
          .getDocument()
          .getElementById('tabindex-div-0');

        let actualFalse = getTabbableIds(container);
        let expectedFalse = ['tabindex-div-2', 'input'];
        assert.deepEqual(actualFalse, expectedFalse);

        let actualTrue = getTabbableIds(container, { includeContainer: true });
        let expectedTrue = ['tabindex-div-2', 'tabindex-div-0', 'input'];
        assert.deepEqual(actualTrue, expectedTrue);
      });

      it('svg', () => {
        let actual = assertionSet.getFixture('svg').getTabbableIds();
        let expected = ['svg-btn', 'svg-1'];
        assert.deepEqual(actual, expected);
      });

      it('radio', () => {
        let actual = assertionSet.getFixture('radio').getTabbableIds();
        let expected = [
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
        let actual = assertionSet.getFixture('details').getTabbableIds();
        let expected = ['details-a-summery', 'details-b-summery'];
        assert.deepEqual(actual, expected);
      });

      it('isTabbable', () => {
        let n1 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('contenteditable-true');
        assert.ok(isTabbable(n1));
        let n2 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('contenteditable-false');
        assert.notOk(isTabbable(n2));
        let n3 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('href-anchor');
        assert.ok(isTabbable(n3));
        let n4 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('hrefless-anchor');
        assert.notOk(isTabbable(n4));
        let n5 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('iframe');
        assert.notOk(isTabbable(n5));
        let n6 = assertionSet
          .getFixture('radio')
          .getDocument()
          .getElementById('formA-radioA');
        assert.ok(isTabbable(n6));
        let n7 = assertionSet
          .getFixture('radio')
          .getDocument()
          .getElementById('formA-radioB');
        assert.notOk(isTabbable(n7));
        let n8 = assertionSet
          .getFixture('details')
          .getDocument()
          .getElementById('details-a-summery');
        assert.ok(isTabbable(n8));
      });

      it('isFocusable', () => {
        let n1 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('contenteditable-true');
        assert.ok(isFocusable(n1));
        let n2 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('contenteditable-false');
        assert.notOk(isFocusable(n2));
        let n3 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('href-anchor');
        assert.ok(isFocusable(n3));
        let n4 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('hrefless-anchor');
        assert.notOk(isFocusable(n4));
        let n5 = assertionSet
          .getFixture('basic')
          .getDocument()
          .getElementById('iframe');
        assert.ok(isFocusable(n5));
        let n6 = assertionSet
          .getFixture('radio')
          .getDocument()
          .getElementById('formA-radioA');
        assert.ok(isFocusable(n6));
        let n7 = assertionSet
          .getFixture('radio')
          .getDocument()
          .getElementById('formA-radioB');
        assert.ok(isFocusable(n7));
        let n8 = assertionSet
          .getFixture('details')
          .getDocument()
          .getElementById('details-a-summery');
        assert.ok(isFocusable(n8));
      });

      it('supports elements in a shadow root', () => {
        let loadedFixture = assertionSet.getFixture('shadow-dom');

        let host = loadedFixture.getDocument().getElementById('shadow-host');
        let template = loadedFixture
          .getDocument()
          .getElementById('shadow-root-template');
        let shadow = host.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        let actual = getTabbableIds(shadow.getElementById('container'));
        let expected = ['input'];
        assert.deepEqual(actual, expected);
      });
    });
  });
});
