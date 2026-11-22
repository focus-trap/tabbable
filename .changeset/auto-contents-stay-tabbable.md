---
'tabbable': patch
---

`displayCheck: 'full-native'` no longer drops the contents of `content-visibility: auto` elements while the browser skips them (e.g. when offscreen). Browsers keep those contents focusable and in the tab order.
