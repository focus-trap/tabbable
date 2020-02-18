const { 'shadow-dom': _, ...testCases } = require('./fixtures');
global.tabbable = require('../dist/index.min.js');

let root;
let content;
for (let key in testCases) {
  if (!Object.hasOwnProperty.call(testCases, key)) {
    continue;
  }
  root = document.createElement('div');
  content = '<h2>' + key + '</h2>';
  content += testCases[key];
  root.id = key;
  root.innerHTML = content;
  document.body.appendChild(root);
}

document.body.addEventListener('focusin', event => {
  console.log(event.target);
});

// Add a clear focus style
let styleTag = document.createElement('style');
styleTag.innerHTML = ':focus { outline: 5px solid #b603f6; }';
document.body.appendChild(styleTag);
