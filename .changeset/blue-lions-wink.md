---
'tabbable': patch
---

The TypeScript return type of `tabbable` has been fixed: Was `Array<Element>` (an `Element` is technically not focusable), is now `Array<HTMLElement | SVGElement>` (which are both still/also `Element` instances).
