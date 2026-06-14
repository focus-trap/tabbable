---
'tabbable': patch
---

Treat elements with `visibility: collapse` as hidden, the same way `visibility: hidden` is already handled, so they are no longer considered tabbable or focusable. This matches browser behavior, where `collapse` hides an element (outside of table rows/columns) just like `hidden`.
