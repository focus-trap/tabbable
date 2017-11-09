
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
    'slot',
  ];
  var candidates = el.querySelectorAll(candidateSelectors);
  var matches = Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

  if (options.includeContainer) {
    if (candidateSelectors.some(function(candidateSelector) { return matches.call(el, candidateSelector); })) {
      candidates = Array.prototype.slice.apply(candidates);
      candidates.unshift(el);
    }
  }

  var candidate, candidateIndex;
  for (var i = 0; i < candidates.length; i++) {
    candidate = candidates[i];
    candidateIndex = parseInt(candidate.getAttribute('tabindex'), 10) || candidate.tabIndex;

    if (
      candidate.tagName !== 'SLOT' // To support firefox defaulting the tabindex to -1 for slots
      && (candidateIndex < 0
      || (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
      || candidate.disabled
      || isUnavailable(candidate, elementDocument))
    ) {
      continue;
    }

    if (candidate.tagName === 'SLOT') {
      var slotCandidates = candidate.assignedNodes();
      var slotChildCandidates = [];

      slotCandidates.forEach(function(node) {
        var childMatches;

        if (node.shadowRoot) {
          childMatches = node.shadowRoot.querySelectorAll(candidateSelectors);
        } else {
          childMatches = node.querySelectorAll(candidateSelectors);
        }

        if (childMatches.length) {
          slotChildCandidates = slotChildCandidates.concat(Array.prototype.slice.apply(childMatches));
        }
      });

      slotCandidates = slotCandidates.concat(slotChildCandidates);

      slotCandidates = slotCandidates.filter(function(node) {
        return candidateSelectors.some(function(candidateSelector) {
          return matches.call(node, candidateSelector);
        });
      });

      candidates = Array.prototype.slice.apply(candidates).concat(Array.prototype.slice.apply(slotCandidates));
      continue;
    } else if (candidateIndex === 0) {
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
