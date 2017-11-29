
module.exports = function(el, options) {
  options = options || {};
  
  var elementDocument = el.ownerDocument || el;
  var basicTabbables = [];
  var orderedTabbables = [];
  
  // A node is "available" if
  // - it's computed style
  var isUnavailable = createIsUnavailable(elementDocument);
  
  var candidateSelectors = [
    'input',
    'select',
    'a[href]',
    'textarea',
    'button',
    '[tabindex]',
  ];
  var candidates = deepQuerySelectorAll(el, candidateSelectors, options.includeContainer);

  var candidate, candidateIndex;
  for (var i = 0; i < candidates.length; i++) {
    candidate = candidates[i];
    candidateIndex = parseInt(candidate.getAttribute('tabindex'), 10) || candidate.tabIndex;

    if (candidateIndex < 0
      || (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
      || candidate.disabled
      || isUnavailable(candidate, elementDocument)
    ) {
      continue;
    }

    if (candidateIndex === 0) {
      basicTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        index: i,
        tabIndex: candidateIndex,
        node: candidate,
      });
    }
  }

  var tabbableNodes = orderedTabbables
    .sort(function(a, b) {
      return a.tabIndex === b.tabIndex ? a.index - b.index : a.tabIndex - b.tabIndex;
    })
    .map(function(a) {
      return a.node
    });

  Array.prototype.push.apply(tabbableNodes, basicTabbables);

  return tabbableNodes;
}

/**
 * Walks the DOM tree starting at a root element and checks if any of its children 
 * match the provided selectors. Similar to the native `querySelectorAll` except
 * that it will traverse the shadow DOM as well as slotted nodes.
 * @param {Element} rootElement The element to start querying from.
 * @param {string[]} selectors An array of CSS selectors.
 * @param {boolean} checkRootElement True if the provided root element is to be matched against the selectors.
 */
function deepQuerySelectorAll(rootElement, selectors, checkRootElement) {
  var nodes = [];

  if (checkRootElement) {
    if (matchesSelectors(rootElement, selectors) && nodes.indexOf(rootElement) === -1) {
      nodes.push(rootElement);
    }
  }

  if (rootElement.tagName === 'SLOT') {
    var slotNodes = rootElement.assignedNodes();
    slotNodes.forEach(function(slottedNode) {
      nodes = nodes.concat(deepQuerySelectorAll(slottedNode, selectors, true));
    });
  } else {
    if (rootElement.shadowRoot) {
      rootElement = rootElement.shadowRoot;
    }

    var node = rootElement.firstElementChild;
    while (node) {
      nodes = nodes.concat(deepQuerySelectorAll(node, selectors, true));
      node = node.nextElementSibling;
    }
  }

  return nodes;
}

function matchesSelectors(el, selectors) {
  try {
    if (el.nodeType === Node.TEXT_NODE) {
      return false;
    }
    var matchesFn = Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    return selectors.some(function(selector) { return matchesFn.call(el, selector); });
  } catch (e) {
    return false;
  }
}

function createIsUnavailable(elementDocument) {
  // Node cache must be refreshed on every check, in case
  // the content of the element has changed
  var isOffCache = [];

  // "off" means `display: none;`, as opposed to "hidden",
  // which means `visibility: hidden;`. getComputedStyle
  // accurately reflects visiblity in context but not
  // "off" state, so we need to recursively check parents.

  function isOff(node, nodeComputedStyle) {
    if (node === elementDocument.documentElement || node instanceof ShadowRoot) return false;

    // Find the cached node (Array.prototype.find not available in IE9)
    for (var i = 0, length = isOffCache.length; i < length; i++) {
      if (isOffCache[i][0] === node) return isOffCache[i][1];
    }

    nodeComputedStyle = nodeComputedStyle || elementDocument.defaultView.getComputedStyle(node);

    var result = false;

    if (nodeComputedStyle.display === 'none') {
      result = true;
    } else if (node.parentNode) {
      result = isOff(node.parentNode);
    }

    isOffCache.push([node, result]);

    return result;
  }

  return function isUnavailable(node) {
    if (node === elementDocument.documentElement) return false;

    var computedStyle = elementDocument.defaultView.getComputedStyle(node);

    if (isOff(node, computedStyle)) return true;

    return computedStyle.visibility === 'hidden';
  }
}
