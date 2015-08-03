var test = require('tape');
var fs = require('fs');
var tabbable = require('..');

testFixture(
  'basic',
  fs.readFileSync(__dirname + '/fixtures/basic.html', 'utf8'),
  [
    'input',
    'select',
    'href-anchor',
    'tabindex-hrefless-anchor',
    'textarea',
    'button',
    'tabindex-div',
  ]
);

testFixture(
  'nested',
  fs.readFileSync(__dirname + '/fixtures/nested.html', 'utf8'),
  [
    'tabindex-div-1',
    'tabindex-div-2',
    'input',
  ]
);

testFixture(
  'jqueryui',
  fs.readFileSync(__dirname + '/fixtures/jqueryui.html', 'utf8'),
  [
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
    'inputTabindex0',
    'inputTabindex10',
    'spanTabindex0',
    'spanTabindex10',
    'dimensionlessParent',
    'dimensionlessParent-dimensionless',
  ]
);

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
