module.exports = function(el) {
  var tabbableNodes = [];

  var candidateNodelist = el.querySelectorAll('input, select, a, textarea, button, [tabindex]');
  var candidates = Array.prototype.slice.call(candidateNodelist);

  var candidate;
  for (var i = 0, l = candidates.length; i < l; i++) {
    candidate = candidates[i];

    if (
      candidate.tabIndex < 0
      || (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
      || (candidate.tagName === 'A' && !candidate.href && !candidate.tabIndex)
      || candidate.disabled
      || isHidden(candidate)
    ) {
      continue;
    }

    tabbableNodes.push(candidate);
  }

  return tabbableNodes;
}

var nodeCache = {};
var nodeCacheIndex = 1;
function isHidden(node) {
  if (node === document.documentElement) {
    return false;
  }

  if (node.tabbableCacheIndex) {
    return nodeCache[node.tabbableCacheIndex];
  }

  var result = false;
  var style = window.getComputedStyle(node);
  if (style.visibility === 'hidden' || style.display === 'none') {
    result = true;
  } else if (node.parentNode) {
    result = isHidden(node.parentNode);
  }

  node.tabbableCacheIndex = nodeCacheIndex;
  nodeCache[node.tabbableCacheIndex] = result;
  nodeCacheIndex++;

  return result;
}
