---
'tabbable': patch
---

Small improvements for improving tree-shakeability of this package. A missing `#__PURE__` annotation has been added to allow dropping one of the top-level calls (if its result stays unused) and removed minification of the file referenced as `package.json#module` to avoid dropping the comments (including existing `#__PURE__` annotations).
