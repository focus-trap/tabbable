import { find } from './utils'

// An element is "untouchable" if *it or one of its ancestors* has
// `visibility: hidden` or `display: none`.
export default class UntouchabilityChecker {
    constructor(elementDocument) {
        this.doc = elementDocument;
        // Node cache must be refreshed on every check, in case
        // the content of the element has changed. The cache contains tuples
        // mapping nodes to their boolean result.
        this.cache = [];
    }

    // getComputedStyle accurately reflects `visibility: hidden` of ancestors
    // but not `display: none`, so we need to recursively check parents.
    hasDisplayNone(node, nodeComputedStyle) {
        if (node.nodeType !== Node.ELEMENT_NODE) return false;

        // Search for a cached result.
        var cached = find(this.cache, function (item) {
            return item === node;
        });
        if (cached) return cached[1];

        nodeComputedStyle = nodeComputedStyle || this.doc.defaultView.getComputedStyle(node);

        var result = false;

        if (nodeComputedStyle.display === 'none') {
            result = true;
        } else if (node.parentNode) {
            result = this.hasDisplayNone(node.parentNode);
        }

        this.cache.push([node, result]);

        return result;
    }

    isUntouchable(node) {
        if (node === this.doc.documentElement) return false;
        var computedStyle = this.doc.defaultView.getComputedStyle(node);
        if (this.hasDisplayNone(node, computedStyle)) return true;
        return computedStyle.visibility === 'hidden';
    }
}
