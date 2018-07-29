var candidateSelectors = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]',
  'audio[controls]',
  'video[controls]',
];

module.exports = function tabbable(el, options) {
  options = options || {};

  var elementDocument = el.ownerDocument || el;
  var basicTabbables = [];
  var orderedTabbables = [];

  var isHiddenByCss = createIsHiddenByCssChecker(elementDocument);
  var candidates = el.querySelectorAll(candidateSelectors.join(','));

  if (options.includeContainer) {
    var matches = Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

    if (
      candidateSelectors.some(function(candidateSelector) {
        return matches.call(el, candidateSelector);
      })
    ) {
      candidates = Array.prototype.slice.apply(candidates);
      candidates.unshift(el);
    }
  }

  var i, candidate, candidateTabindexAttr, candidateTabindex;
  for (i = 0; i < candidates.length; i++) {
    candidate = candidates[i];
    candidateTabindexAttr = parseInt(candidate.getAttribute('tabindex'), 10)
    candidateTabindex = isNaN(candidateTabindexAttr) ? candidate.tabIndex : candidateTabindexAttr;

    if (
      candidateTabindex < 0
      || isHiddenInput(candidate)
      || isNonTabbableRadio(candidate)
      || candidate.disabled
      || isHiddenByCss(candidate, elementDocument)
    ) {
      continue;
    }

    if (candidateTabindex === 0) {
      basicTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        node: candidate,
      });
    }
  }

  var tabbableNodes = orderedTabbables
    .sort(sortOrderedTabbables)
    .map(function(a) {
      return a.node
    });

  Array.prototype.push.apply(tabbableNodes, basicTabbables);

  return tabbableNodes;
}

function createIsHiddenByCssChecker(elementDocument) {
  // Node cache must be refreshed on every check, in case
  // the content of the element has changed. The cache contains tuples
  // mapping nodes to their boolean result.
  var isHiddenByCssCache = [];

  // getComputedStyle accurately reflects `visiblity: "hidden"`
  // in context but not `display: "none"`, so we need to recursively check parents.

  function hasDisplayNone(node, nodeComputedStyle) {
    if (node === elementDocument.documentElement) return false;

    // Search for a cached result.
    var cached = find(isHiddenByCssCache, function(item) {
      return item === node;
    });
    if (cached) return cached[1];

    nodeComputedStyle = nodeComputedStyle || elementDocument.defaultView.getComputedStyle(node);

    var result = false;

    if (nodeComputedStyle.display === 'none') {
      result = true;
    } else if (node.parentNode) {
      result = hasDisplayNone(node.parentNode);
    }

    isHiddenByCssCache.push([node, result]);

    return result;
  }

  return function isHiddenByCss(innerNode) {
    if (innerNode === elementDocument.documentElement) return false;

    var computedStyle = elementDocument.defaultView.getComputedStyle(innerNode);

    if (hasDisplayNone(innerNode, computedStyle)) return true;

    return computedStyle.visibility === 'hidden';
  }
}

function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
}

// Array.prototype.find not available in IE
function find(list, predicate) {
  for (var i = 0, length = list.length; i < length; i++) {
    if (predicate(list[i])) return list[i];
  }
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

function getCheckedRadio(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked) {
      return nodes[i];
    }
  }
}

function isTabbableRadio(node) {
  if (!node.name) return true;
  var radioSet = node.ownerDocument.querySelectorAll('input[type="radio"][name="' + node.name + '"]');
  var checked = getCheckedRadio(radioSet);
  return !checked || checked === node;
}
