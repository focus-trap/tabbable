---
'tabbable': patch
---

Fix a corner case (crash) where the `ownerDocument` could be `null` while checking if a node is attached ([focus-trap-react #905](https://github.com/focus-trap/focus-trap-react/issues/905))
