var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;
var tabbable = require('..');

var fixtures = {
  'basic': fs.readFileSync(path.join(__dirname, 'fixtures/basic.html'), 'utf8'),
  'changing-content': fs.readFileSync(path.join(__dirname, 'fixtures/changing-content.html'), 'utf8'),
  'jqueryui': fs.readFileSync(path.join(__dirname, 'fixtures/jqueryui.html'), 'utf8'),
  'nested': fs.readFileSync(path.join(__dirname, 'fixtures/nested.html'), 'utf8'),
  'non-linear': fs.readFileSync(path.join(__dirname, 'fixtures/non-linear.html'), 'utf8'),
};

var fixtureRoots = [];

function fixture(fixtureName) {
  var html = fixtures[fixtureName];
  var root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  fixtureRoots.push(root);
  return {
    getTabbableIds: function() {
      return tabbable(root).map(function(el) {
        return el.getAttribute('id');
      });
    },
  };
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

  it('basic', function() {
    var actual = fixture('basic').getTabbableIds();
    var expected = [
      'tabindex-hrefless-anchor',
      'input',
      'select',
      'href-anchor',
      'textarea',
      'button',
      'tabindex-div',
      'hiddenParentVisible-button',
    ];
    assert.deepEqual(actual, expected);
  });

  it('nested', function() {
    var actual = fixture('nested').getTabbableIds();
    var expected = [
      'tabindex-div-2',
      'tabindex-div-0',
      'input',
    ];
    assert.deepEqual(actual, expected);
  });

  it('jqueryui', function() {
    var actual = fixture('jqueryui').getTabbableIds();
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
    var actual = fixture('non-linear').getTabbableIds();
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
    var loadedFixture = fixture('changing-content');
    var actualA = loadedFixture.getTabbableIds();
    var expectedA = [
      'visible-button-1',
      'visible-button-2',
      'visible-button-3',
    ];
    assert.deepEqual(actualA, expectedA);

    document.getElementById('initially-hidden').style.display = 'block';

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
});
