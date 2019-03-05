var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;
var lib = require('..');
var tabbable = lib.default;
var isFocusable = lib.isFocusable;
var isTabbable = lib.isTabbable;

var fixtures = {
  'basic': fs.readFileSync(path.join(__dirname, 'fixtures/basic.html'), 'utf8'),
  'changing-content': fs.readFileSync(path.join(__dirname, 'fixtures/changing-content.html'), 'utf8'),
  'jqueryui': fs.readFileSync(path.join(__dirname, 'fixtures/jqueryui.html'), 'utf8'),
  'nested': fs.readFileSync(path.join(__dirname, 'fixtures/nested.html'), 'utf8'),
  'non-linear': fs.readFileSync(path.join(__dirname, 'fixtures/non-linear.html'), 'utf8'),
  'svg': fs.readFileSync(path.join(__dirname, 'fixtures/svg.html'), 'utf8'),
  'radio': fs.readFileSync(path.join(__dirname, 'fixtures/radio.html'), 'utf8'),
};

var fixtureRoots = [];

function createRootNode(doc, fixtureName) {
  var html = fixtures[fixtureName];
  var root = doc.createElement('div');
  root.innerHTML = html;
  doc.body.appendChild(root);
  return root;
}

function getTabbableIds(node, options) {
  return tabbable(node, options).map(function(el) {
    return el.getAttribute('id');
  });
}

function fixture(fixtureName) {
  var root = createRootNode(document, fixtureName);
  fixtureRoots.push(root);
  return {
    getTabbableIds: getTabbableIds.bind(null, root),
    getDocument: function() { return document; },
  };
}

function fixtureWithIframe(fixtureName) {
  var iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  fixtureRoots.push(iframe);
  return {
    getTabbableIds: getTabbableIds.bind(null, createRootNode(iframe.contentDocument, fixtureName)),
    getDocument: function() { return iframe.contentDocument; },
  };
}

function fixtureWithDocument(fixtureName) {
  var root = createRootNode(document, fixtureName);
  fixtureRoots.push(root);
  return {
    getTabbableIds: getTabbableIds.bind(null, document),
    getDocument: function() { return document; },
  }
}

function cleanupFixtures() {
  fixtureRoots.forEach(function(root) {
    document.body.removeChild(root);
  });
  fixtureRoots = [];
}

describe('tabbable', function() {
  afterEach(function() {
    cleanupFixtures();
  });

  [
    { name: 'window', getFixture: fixture },
    { name: 'iframe\'s window', getFixture: fixtureWithIframe },
    { name: 'document', getFixture: fixtureWithDocument },
  ].forEach(function (assertionSet) {
    describe(assertionSet.name, function() {

      it('basic', function() {
        var actual = assertionSet.getFixture('basic').getTabbableIds();
        var expected = [
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

      it('nested', function() {
        var actual = assertionSet.getFixture('nested').getTabbableIds();
        var expected = [
          'tabindex-div-2',
          'tabindex-div-0',
          'input',
        ];
        assert.deepEqual(actual, expected);
      });

      it('jqueryui', function() {
        var actual = assertionSet.getFixture('jqueryui').getTabbableIds();
        var expected = [
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

      it('non-linear', function() {
        var originalSort = Array.prototype.sort;

        // This sort piggy-backs on the default Array.prototype.sort, but always
        // orders elements that were compared to be equal in reverse order of their
        // index in the original array. We do this to simulate browsers who do not
        // use a stable sort algorithm in their implementation.
        Array.prototype.sort = function(compareFunction) {
          return originalSort.call(this, function(a, b) {
            var comparison = compareFunction ? compareFunction(a, b) : a - b;
            return comparison || this.indexOf(b) - this.indexOf(a);
          })
        };
        var actual = assertionSet.getFixture('non-linear').getTabbableIds();
        Array.prototype.sort = originalSort;
        var expected = [
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

      it('changing content', function() {
        var loadedFixture = assertionSet.getFixture('changing-content');
        var actualA = loadedFixture.getTabbableIds();
        var expectedA = [
          'visible-button-1',
          'visible-button-2',
          'visible-button-3',
        ];
        assert.deepEqual(actualA, expectedA);

        loadedFixture.getDocument().getElementById('initially-hidden').style.display = 'block';

        var actualB = loadedFixture.getTabbableIds();
        var expectedB = [
          'visible-button-1',
          'visible-button-2',
          'visible-button-3',
          'initially-hidden-button-1',
          'initially-hidden-button-2',
        ];
        assert.deepEqual(actualB, expectedB);
      });

      it('including container', function() {
        var loadedFixture = assertionSet.getFixture('nested');
        var container = loadedFixture.getDocument().getElementById('tabindex-div-0')

        var actualFalse = getTabbableIds(container);
        var expectedFalse = [
          'tabindex-div-2',
          'input',
        ];
        assert.deepEqual(actualFalse, expectedFalse);

        var actualTrue = getTabbableIds(container, {includeContainer: true});
        var expectedTrue = [
          'tabindex-div-2',
          'tabindex-div-0',
          'input',
        ];
        assert.deepEqual(actualTrue, expectedTrue);
      });

      it('svg', function() {
        var actual = assertionSet.getFixture('svg').getTabbableIds();
        var expected = [
          'svg-btn',
          'svg-1',
        ];
        assert.deepEqual(actual, expected);
      });

      it('radio', function() {
        var actual = assertionSet.getFixture('radio').getTabbableIds();
        var expected = [
          'radio-a',
          'radio-d',
          'radio-e',
          'radio-f',
        ];
        assert.deepEqual(actual, expected);
      });

      it('isTabbable', function() {
        var n1 = assertionSet.getFixture('basic').getDocument().getElementById('contenteditable-true');
        assert.ok(isTabbable(n1));
        var n2 = assertionSet.getFixture('basic').getDocument().getElementById('contenteditable-false');
        assert.notOk(isTabbable(n2));
        var n3 = assertionSet.getFixture('basic').getDocument().getElementById('href-anchor');
        assert.ok(isTabbable(n3));
        var n4 = assertionSet.getFixture('basic').getDocument().getElementById('hrefless-anchor');
        assert.notOk(isTabbable(n4));
        var n5 = assertionSet.getFixture('basic').getDocument().getElementById('iframe');
        assert.notOk(isTabbable(n5));
        var n6 = assertionSet.getFixture('radio').getDocument().getElementById('radio-a');
        assert.ok(isTabbable(n6));
        var n7 = assertionSet.getFixture('radio').getDocument().getElementById('radio-c');
        assert.notOk(isTabbable(n7));
      });

      it('isFocusable', function() {
        var n1 = assertionSet.getFixture('basic').getDocument().getElementById('contenteditable-true');
        assert.ok(isFocusable(n1));
        var n2 = assertionSet.getFixture('basic').getDocument().getElementById('contenteditable-false');
        assert.notOk(isFocusable(n2));
        var n3 = assertionSet.getFixture('basic').getDocument().getElementById('href-anchor');
        assert.ok(isFocusable(n3));
        var n4 = assertionSet.getFixture('basic').getDocument().getElementById('hrefless-anchor');
        assert.notOk(isFocusable(n4));
        var n5 = assertionSet.getFixture('basic').getDocument().getElementById('iframe');
        assert.ok(isFocusable(n5));
        var n6 = assertionSet.getFixture('radio').getDocument().getElementById('radio-a');
        assert.ok(isFocusable(n6));
        var n7 = assertionSet.getFixture('radio').getDocument().getElementById('radio-c');
        assert.ok(isFocusable(n7));
      });

      it('supports detached elements', function() {
        var doc = assertionSet.getFixture('basic').getDocument();
        var frag = doc.createDocumentFragment();
        var button = doc.createElement('button');
        frag.appendChild(button);

        assert.isTrue(isTabbable(button));
        assert.isTrue(isFocusable(button));
      });
    });
  });
});

