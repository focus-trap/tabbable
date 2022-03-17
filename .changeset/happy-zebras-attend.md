---
'tabbable': patch
---

Fixed a bug in `getTabIndex`: the tab index of `<audio>`, `<viedo>` and `<details>` was left to the browser default if explicitly set to a value that couldn't be parsed as integer, leading to inconsistent behaviour across browsers. Also slightly modified the function's logic to make it more efficient. Finally added tests to cover the fix.
