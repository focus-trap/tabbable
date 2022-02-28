---
'tabbable': patch
---

Fixed bug in `isDisabledFromFieldset`. The function wasn't checking whether the disabled `<fieldset>` containing `node` is the top-most disabled `<fieldset>` ([#596](https://github.com/focus-trap/tabbable/issues/596)).
