---
'tabbable': patch
---

Use `Node.isConnected` to determine whether a node is attached to the document, replacing the manual shadow host walk. Behavior is unchanged, bundle is ~400 bytes smaller (minified).
