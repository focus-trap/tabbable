import UntouchabilityChecker from './UntouchabilityChecker';
import { candidateSelector, focusableCandidateSelector } from './selectors'

export var matches =
  typeof document === 'undefined'
    ? () => {}
    : Element.prototype.matches ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;


export function isNodeMatchingSelectorTabbable(node, untouchabilityChecker) {
    if (
        !isNodeMatchingSelectorFocusable(node, untouchabilityChecker)
        || isNonTabbableRadio(node)
        || getTabindex(node) < 0
    ) {
        return false;
    }
    return true;
}

export function isTabbable(node, untouchabilityChecker) {
    if (!node) throw new Error('No node provided');
    if (matches.call(node, candidateSelector) === false) return false;
    return isNodeMatchingSelectorTabbable(node, untouchabilityChecker);
}

export function isNodeMatchingSelectorFocusable(
    node,
    untouchabilityChecker = new UntouchabilityChecker(node.ownerDocument || node)
) {
    if (
        node.disabled
        || isHiddenInput(node)
        || untouchabilityChecker.isUntouchable(node)
    ) {
        return false;
    }
    return true;
}

export function isFocusable(node, untouchabilityChecker) {
    if (!node) throw new Error('No node provided');
    if (matches.call(node, focusableCandidateSelector) === false) return false;
    return isNodeMatchingSelectorFocusable(node, untouchabilityChecker);
}

export function getTabindex(node) {
    var tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);
    if (!isNaN(tabindexAttr)) return tabindexAttr;
    // Browsers do not return `tabIndex` correctly for contentEditable nodes;
    // so if they don't have a tabindex attribute specifically set, assume it's 0.
    if (isContentEditable(node)) return 0;
    return node.tabIndex;
}

export function sortOrderedTabbables(a, b) {
    return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
}

// Array.prototype.find not available in IE.
export function find(list, predicate) {
    for (var i = 0, length = list.length; i < length; i++) {
        if (predicate(list[i])) return list[i];
    }
}

export function isContentEditable(node) {
    return node.contentEditable === 'true';
}

export function isInput(node) {
    return node.tagName === 'INPUT';
}

export function isHiddenInput(node) {
    return isInput(node) && node.type === 'hidden';
}

export function isRadio(node) {
    return isInput(node) && node.type === 'radio';
}

export function isNonTabbableRadio(node) {
    return isRadio(node) && !isTabbableRadio(node);
}

export function getCheckedRadio(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].checked) {
            return nodes[i];
        }
    }
}

export function isTabbableRadio(node) {
    if (!node.name) return true;
    // This won't account for the edge case where you have radio groups with the same
    // in separate forms on the same page.
    var radioSet = node.ownerDocument.querySelectorAll('input[type="radio"][name="' + node.name + '"]');
    var checked = getCheckedRadio(radioSet);
    return !checked || checked === node;
}
