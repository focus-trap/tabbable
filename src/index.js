let candidateSelectors = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary',
];
let candidateSelector = /* #__PURE__ */ candidateSelectors.join(',');

let matches =
  typeof Element === 'undefined'
    ? function () {}
    : Element.prototype.matches ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;

function tabbable(el, options) {
  options = options || {};

  let regularTabbables = [];
  let orderedTabbables = [];

  let candidates = el.querySelectorAll(candidateSelector);

  if (options.includeContainer) {
    if (matches.call(el, candidateSelector)) {
      candidates = Array.prototype.slice.apply(candidates);
      candidates.unshift(el);
    }
  }

  let candidate;
  let candidateTabindex;
  for (let i = 0; i < candidates.length; i++) {
    candidate = candidates[i];

    if (!isNodeMatchingSelectorTabbable(candidate)) {
      continue;
    }

    candidateTabindex = getTabindex(candidate);
    if (candidateTabindex === 0) {
      regularTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        node: candidate,
      });
    }
  }

  let tabbableNodes = orderedTabbables
    .sort(sortOrderedTabbables)
    .map((a) => a.node)
    .concat(regularTabbables);

  return tabbableNodes;
}

function isNodeMatchingSelectorTabbable(node) {
  if (
    !isNodeMatchingSelectorFocusable(node) ||
    isNonTabbableRadio(node) ||
    getTabindex(node) < 0
  ) {
    return false;
  }
  return true;
}

function isTabbable(node) {
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, candidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorTabbable(node);
}

function isNodeMatchingSelectorFocusable(node) {
  if (node.disabled || isHiddenInput(node) || isHidden(node)) {
    return false;
  }
  return true;
}

let focusableCandidateSelector = candidateSelectors.concat('iframe').join(',');
function isFocusable(node) {
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorFocusable(node);
}

function getTabindex(node) {
  let tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);

  if (!isNaN(tabindexAttr)) {
    return tabindexAttr;
  }

  // Browsers do not return `tabIndex` correctly for contentEditable nodes;
  // so if they don't have a tabindex attribute specifically set, assume it's 0.
  if (isContentEditable(node)) {
    return 0;
  }

  // in Chrome, <audio controls/> and <video controls/> elements get a default
  //  `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
  //  yet they are still part of the regular tab order; in FF, they get a default
  //  `tabIndex` of 0; since Chrome still puts those elements in the regular tab
  //  order, consider their tab index to be 0
  if (
    (node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO') &&
    node.getAttribute('tabindex') === null
  ) {
    return 0;
  }

  return node.tabIndex;
}

function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex
    ? a.documentOrder - b.documentOrder
    : a.tabIndex - b.tabIndex;
}

function isContentEditable(node) {
  return node.contentEditable === 'true';
}

function isInput(node) {
  return node.tagName === 'INPUT';
}

function isHiddenInput(node) {
  return isInput(node) && node.type === 'hidden';
}

function isRadio(node) {
  return isInput(node) && node.type === 'radio';
}

function isNonTabbableRadio(node) {
  return isRadio(node) && !isTabbableRadio(node);
}

function getCheckedRadio(nodes, form) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
}

function isTabbableRadio(node) {
  if (!node.name) {
    return true;
  }
  const radioScope = node.form || node.ownerDocument;
  let radioSet = radioScope.querySelectorAll(
    'input[type="radio"][name="' + node.name + '"]'
  );
  let checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
}

function isHidden(node) {
  // offsetParent being null will allow detecting cases where an element is invisible or inside an invisible element,
  // as long as the element does not use position: fixed. For them, their visibility has to be checked directly as well.
  return (
    node.offsetParent === null || getComputedStyle(node).visibility === 'hidden'
  );
}

export { tabbable, isTabbable, isFocusable };
