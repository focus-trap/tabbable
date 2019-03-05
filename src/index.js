import UntouchabilityChecker from './UntouchabilityChecker'
import { candidateSelector } from './selectors'
import {
  matches,
  isNodeMatchingSelectorTabbable,
  isTabbable,
  isFocusable,
  getTabindex,
  sortOrderedTabbables,
} from './utils'

function tabbable(node, { includeContainer = false } = {}) {
  var elementDocument = node.ownerDocument || node;
  var regularTabbables = [];
  var orderedTabbables = [];

  var untouchabilityChecker = new UntouchabilityChecker(elementDocument);
  var candidates = node.querySelectorAll(candidateSelector);

  if (includeContainer) {
    if (matches.call(node, candidateSelector)) {
      candidates = Array.prototype.slice.apply(candidates);
      candidates.unshift(node);
    }
  }

  var i, candidate, candidateTabindex;
  for (i = 0; i < candidates.length; i++) {
    candidate = candidates[i];

    if (!isNodeMatchingSelectorTabbable(candidate, untouchabilityChecker))
      continue;

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

  var tabbableNodes = orderedTabbables
    .sort(sortOrderedTabbables)
    .map(a => a.node)
    .concat(regularTabbables);

  return tabbableNodes;
}

export default tabbable;
export { isTabbable, isFocusable }
