/* eslint-env node */

const { ...testCases } = require('./fixtures/fixtures.js');
const { appendHTMLWithShadowRoots } = require('./shadow-root-utils');
const { tabbable, focusable, getTabIndex } =
  (global.tabbable = require('../src/index.js'));

let root;
let content;
for (const key in testCases) {
  if (!Object.hasOwnProperty.call(testCases, key)) {
    continue;
  }
  root = document.createElement('div');
  content = '<h2>' + key + '</h2>';
  content += testCases[key];
  root.id = key;
  appendHTMLWithShadowRoots(root, content);
  document.body.appendChild(root);
}

// listen to nested shadow dom focus
function onFocusIn({ target }) {
  // collect nested focused elements
  const focusContext = [target];
  while (target && (target.shadowRoot || target.closedShadowRoot)) {
    const shadowRoot = target.shadowRoot || target.closedShadowRoot;
    target = shadowRoot.activeElement;
    if (target) {
      focusContext.push(target);
    }
  }
  // listen to inner shadow dom blur
  // in order to log movement within shadow dom
  if (focusContext.length > 1) {
    const onBlur = (event) => {
      event.target.removeEventListener('blur', onBlur);
      setTimeout(() => {
        if (event.relatedTarget !== document.activeElement) {
          onFocusIn({ target: document.activeElement });
        }
      }, 10);
    };
    focusContext[focusContext.length - 1].addEventListener('blur', onBlur);
  }
  // eslint-disable-next-line no-console
  console.log(...focusContext);
}
document.body.addEventListener('focusin', onFocusIn);

// Add a clear focus style
const styleTag = document.createElement('style');
styleTag.innerHTML = ':focus { outline: 5px solid #b603f6; }';
document.body.appendChild(styleTag);

// Log out tabbable/focusable elements on the page on startup
const allTabbable = tabbable(document.body);
const allFocusable = focusable(document.body);
const focusableNotTabbable = allFocusable.filter(
  (element) => !allTabbable.includes(element)
);

/* eslint-disable no-console */
console.groupCollapsed(
  'Tabbable elements on the page (' + allTabbable.length + ')'
);
allTabbable.forEach((element) =>
  console.log('tabindex ' + getTabIndex(element) + ':', element)
);
console.groupEnd();

console.groupCollapsed(
  'Focusable elements on the page (' + allFocusable.length + ')'
);
allFocusable.forEach((element) =>
  console.log('tabindex ' + getTabIndex(element) + ':', element)
);
console.groupEnd();

console.groupCollapsed(
  'Focusable but not tabbable (' + focusableNotTabbable.length + ')'
);
focusableNotTabbable.forEach((element) =>
  console.log('tabindex ' + getTabIndex(element) + ':', element)
);
console.groupEnd();
/* eslint-enable no-console */
