---
'tabbable': patch
---

Fix JSDom not supporting HTMLElement.inert and HTMLElement.contentEditable APIs, and not supporting CSS selector ':not([inert *])' resulting in no nodes found and "focus-trap must have at least one tabbable node..." error in focus-trap.
