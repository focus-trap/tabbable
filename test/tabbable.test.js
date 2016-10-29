var path = require('path');
var fs = require('fs');
var tabbable = require('..');

function readFixture(fixtureName) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', fixtureName + '.html'), 'utf8');
}

var fixtureRoots = [];

function fixture(fixtureName) {
  var html = readFixture(fixtureName);
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
    ];
    expect(actual).toEqual(expected);
  });

  it('nested', function() {
    var actual = fixture('nested').getTabbableIds();
    var expected = [
      'tabindex-div-2',
      'tabindex-div-0',
      'input',
    ];
    expect(actual).toEqual(expected);
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
    expect(actual).toEqual(expected);
  });

  it('non-linear', function() {
    var actual = fixture('non-linear').getTabbableIds();
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
    expect(actual).toEqual(expected);
  });

  it('changing content', function() {
    var loadedFixture = fixture('changing-content');
    var actualA = loadedFixture.getTabbableIds();
    var expectedA = [
      'visible-button-1',
      'visible-button-2',
      'visible-button-3',
    ];
    expect(actualA).toEqual(expectedA);

    document.getElementById('initially-hidden').style.display = 'block';

    var actualB = loadedFixture.getTabbableIds();
    var expectedB = [
      'visible-button-1',
      'visible-button-2',
      'visible-button-3',
      'initially-hidden-button-1',
      'initially-hidden-button-2',
    ];
    expect(actualB).toEqual(expectedB);
  });
});
