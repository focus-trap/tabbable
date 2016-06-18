var test = require('tape');
var path = require('path');
var fs = require('fs');
var tabbable = require('..');

testFixture(
  'basic',
  fs.readFileSync(path.join(__dirname, '/fixtures/basic.html'), 'utf8'),
  [
    'tabindex-hrefless-anchor',
    'input',
    'select',
    'href-anchor',
    'textarea',
    'button',
    'tabindex-div',
  ]
);

testFixture(
  'nested',
  fs.readFileSync(path.join(__dirname, '/fixtures/nested.html'), 'utf8'),
  [
    'tabindex-div-2',
    'tabindex-div-0',
    'input',
  ]
);

testFixture(
  'jqueryui',
  fs.readFileSync(path.join(__dirname, '/fixtures/jqueryui.html'), 'utf8'),
  [
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
  ]
);

testFixture(
  'nonLinear',
  fs.readFileSync(path.join(__dirname, '/fixtures/non-linear.html'), 'utf8'),
  [
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
  ]
)

function testFixture(name, fixture, expectedTabbableIds) {
  test(name + 'fixture', function(t) {
    var root = document.createElement('div');
    root.innerHTML = fixture;
    document.body.appendChild(root);

    var expectedTabbables = expectedTabbableIds.map(function(id) {
      return document.getElementById(id);
    });

    var actualTabbables = tabbable(root);

    t.deepEqual(actualTabbables, expectedTabbables);

    document.body.removeChild(root);

    t.end();
  });
}

test('changing content', function(t) {
  var root = document.createElement('div');
  root.innerHTML = fs.readFileSync(path.join(__dirname, '/fixtures/changing-content.html'), 'utf8');
  document.body.appendChild(root);

  var initialTabbableIds = [
    'visible-button-1',
    'visible-button-2',
    'visible-button-3',
  ];

  var initialExpectedTabbables = initialTabbableIds.map(function(id) {
    return document.getElementById(id);
  });

  var initialActualTabbables = tabbable(root);

  t.deepEqual(initialActualTabbables, initialExpectedTabbables);

  // Now show the initially hidden stuff via a click
  document.getElementById('initially-hidden').style.display = 'block';

  var nextTabbableIds = initialTabbableIds.concat([
    'initially-hidden-button-1',
    'initially-hidden-button-2',
  ]);

  var nextExpectedTabbables = nextTabbableIds.map(function(id) {
    return document.getElementById(id);
  });

  var nextActualTabbables = tabbable(root);

  t.deepEqual(nextActualTabbables, nextExpectedTabbables);

  t.end();
});
