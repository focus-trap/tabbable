module.exports = function(el) {
  var basicTabbables = [];
  var orderedTabbables = [];
  var isHidden = createIsHidden();

  var candidates = el.querySelectorAll('input, select, a[href], textarea, button, [tabindex]');

  var candidate, candidateIndex;
  for (var i = 0, l = candidates.length; i < l; i++) {
    candidate = candidates[i];
    candidateIndex = candidate.tabIndex;

    if (
      candidateIndex < 0
      || (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
      || candidate.disabled
      || isHidden(candidate)
    ) {
      continue;
    }

    if (candidateIndex === 0) {
      basicTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        tabIndex: candidateIndex,
        node: candidate,
      });
    }
  }

  var tabbableNodes = orderedTabbables
    .sort(function(a, b) {
      return a.tabIndex - b.tabIndex;
    })
    .map(function(a) {
      return a.node
    });

  Array.prototype.push.apply(tabbableNodes, basicTabbables);

  return tabbableNodes;
}

function createIsHidden() {
  // Node cache must be refreshed on every check, in case
  // the content of the element has changed
  var nodeCache = [];

  return function isHidden(node) {
    if (node === document.documentElement) return false;

    // Find the cached node (Array.prototype.find not available in IE9)
    for (var i = 0, length = nodeCache.length; i < length; i++) {
      if (nodeCache[i][0] === node) return nodeCache[i][1];
    }

    var result = false;
    var style = window.getComputedStyle(node);
    if (style.visibility === 'hidden' || style.display === 'none') {
      result = true;
    } else if (node.parentNode) {
      result = isHidden(node.parentNode);
    }

    nodeCache.push([node, result]);

    return result;
  }
}
