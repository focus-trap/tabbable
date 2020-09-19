# Changelog

## 5.0.0

- Changed code formatting to use dangling commas where ES5 supports them.
- Fixed a bug where `<audio controls />` and `<video controls />` elements *without `tabindex` attribute specified* would be deemed **NOT** tabbable in Chrome, but would be in FireFox, because Chrome has `tabIndex` (the DOM Element property) returning -1 (focusable, but not tabbable), while FireFox has `tabIndex` returning 0 (focusable, and tabbable), yet **both** browsers include these elements in the *regular tab order* (as if `tabIndex` was 0 for both browsers). Now these elements are considered tabbable in Chrome too!
- Add any `<summary>` element directly under a `<details>` element as tabbable and focusable.
- **BREAKING**: Changes to the `isTabbableRadio()` internal function in order to better support nested radio buttons:
  - In case a form parent element exists, include only nested radio inputs from that form.
  - Ignore checked radio elements from forms different from the one the validated node belongs to.
  - NOTE: This may result in *less* radio elements being flagged as tabbable depending on context from the "root" node given to `tabbable()`.
- **BREAKING**: The exports have changed to be all named, and separate, as follows in order to help make the module more compatible with tree shaking:
  - `tabbable` -> `import { tabbable } from 'tabbable';
  - `tabbable.isTabbable` -> `import { isTabbable } from 'tabbable';
  - `tabbable.isFocusable` -> `import { isFocusable } from 'tabbable';
- Also to help with tree shaking, `package.json` now states `sideEffects: false` to mark this module as having no side effects as a result of merely importing it.
- Added new UMD build, see `./dist/index.umd.*`.

## 4.0.0

- Improve performance by changing the method for detecting whether a DOM node is focusable or not. It's expected that this change will *not* affect results; but this is a major version bump as a warning for you to check your edge cases before upgrading.

## 3.1.2

- Fix reference to root element that caused errors within Shadow DOM.

## 3.1.1

- Allow module to be imported by non-browser JavaScript.

## 3.1.0

- Add `tabbable.isFocusable` and `tabbable.isTabbable` functions.

## 3.0.0

- Add `[contenteditable]` elements.

## 2.0.0

- Add `<audio>` and `<video>` elements with `controls` attributes.
- Only consider radio buttons tabbable if they are the `checked` on in their group, or if none in their group are `checked`.

## 1.1.3

- Fix bug causing SVG elements to precede elements they should follow in the tab order in IE.

## 1.1.2

- Ensure `querySelectorAll` receives a string argument.

## 1.1.1

- Fix crash when you call `tabbable(document)` (passing the `document` element).

## 1.1.0

- Add `includeContainer` option.

## 1.0.8

- Allows operation against elements that reside within iframes, by inspecting the element to determine its correct parent `document` (rather than relying on the global `document` object).

## 1.0.7

- Ensure stable sort of `tabindex`ed elements even in browsers that have an unstable `Array.prototype.sort`.

## 1.0.6

- Check `tabindex` attribute (via `getAttribute`), in addition to `node.tabIndex`, to fix handling of SVGs with `tabindex="-1"` in IE.

## 1.0.5

- Children of `visibility: hidden` elements that themselves have `visibility: visible` are considered tabbable.

## 1.0.4

- Fix IE9 compatibility.

## 1.0.3

- Further improvements to caching.

## 1.0.2

- Fix overaggressive caching that would prevent `tabbable` from knowing an element's children had changed.

## 1.0.1

- Fix handling of `<a>` elements with `tabindex="0"`.

## 1.0.0

- Initial release.
