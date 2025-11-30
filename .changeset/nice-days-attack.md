---
'tabbable': minor
---

Enable CSS selector matching for whether an element is in an inert subtree (`[inert] *`).

This was previously disabled due to JSDOM's CSS selector engine being incompatible with this selector, and throwing all the results off. Instead, tabbable would perform manual checks for an element being in an inert subtree. The CSS selector issue appears to have been fixed in recent JSDOM versions (at least 26), so this version reintroduces the selector fast path.
