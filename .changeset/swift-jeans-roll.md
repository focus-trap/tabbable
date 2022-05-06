---
'tabbable': patch
---

Fixed an issue with `displayCheck=full` (default setting) determining all nodes were hidden when the container is not attached to the document. In this case, tabbable will revert to a `displayCheck=none` mode, which is the equivalent legacy behavior. Also updated the `displayCheck` option docs to add warnings about this corner case for the `full` and `non-zero-area` modes. `non-zero-area` behaves differently in the corner case. See the docs for more info.
