---
'tabbable': patch
---

Fix a corner case where a node's root node can be itself, indicating detachment from the DOM, leading to a crash in `isHidden() -> isNodeAttached() -> getRootNode()` if not handled properly ([focus-trap-react #905](https://github.com/focus-trap/focus-trap-react/issues/905))
