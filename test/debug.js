var fs = require('fs');
var path = require('path');

global.tabbable = require('..');

var testCases = {
  basic: fs.readFileSync(path.join(__dirname, 'fixtures/basic.html'), 'utf8'),
  changingContent: fs.readFileSync(path.join(__dirname, 'fixtures/changing-content.html'), 'utf8'),
  jqueryui: fs.readFileSync(path.join(__dirname, 'fixtures/jqueryui.html'), 'utf8'),
  nested: fs.readFileSync(path.join(__dirname, 'fixtures/nested.html'), 'utf8'),
  nonLinear: fs.readFileSync(path.join(__dirname, 'fixtures/non-linear.html'), 'utf8'),
  svg: fs.readFileSync(path.join(__dirname, 'fixtures/svg.html'), 'utf8'),
  radio: fs.readFileSync(path.join(__dirname, 'fixtures/radio.html'), 'utf8'),
}

var root;
var content;
for (var key in testCases) {
  if (!testCases.hasOwnProperty(key)) continue;
  root = document.createElement('div');
  content = '<h2>' + key + '</h2>';
  content += testCases[key];
  root.id = key;
  root.innerHTML = content;
  document.body.appendChild(root);
}

document.body.addEventListener('focusin', function(event) {
  console.log(event.target); // eslint-disable-line no-console
});

// Add a clear focus style
var styleTag = document.createElement('style');
styleTag.innerHTML = ':focus { outline: 5px solid #b603f6; }';
document.body.appendChild(styleTag);
