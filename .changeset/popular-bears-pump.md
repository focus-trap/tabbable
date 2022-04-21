---
'tabbable': patch
---

Add warnings and help in documentation about running tabbable under JSDom (e.g. with Jest). JSDom is not technically supported, and 5.3.0 introduced some changes that use DOM APIs that JSDom stubs out, which may cause some JSDom-based tests to fail. Also revamp the API docs a bit to make them clearer, and add missing `getShadowRoot` option to `isTabbable()` and `isFocusable()` (docs only; no code changes necessary).
