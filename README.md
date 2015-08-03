# tabbable

Returns an array of all tabbable DOM nodes within a containing node.

This should include

- `<input>`s,
- `<select>`s,
- `<textarea>`s,
- `<button>`s,
- `<a>`s with `href` attributes *or* non-negative `tabindex`es,
- anything else with a non-negative `tabindex`

Any of the above will *not* count, though, if any of the following are also true about it:
- negative `tabindex`
- `disabled`
- either the node itself *or an ancestor of it* is hidden via `display: none` or `visibility: hidden`

## Goals
- Accurate
- No dependencies
- Small
- Fast

## Browser Support

IE9+

Why? It uses [Element.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll) and [Window.getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).

## Installation

```
npm install tabbable
```

You'll need to be compiling CommonJS (via browserify or webpack).

## Usage

```js
var tabbable = require('tabbable');
var arrayOfTabbableNodesInFoo = tabbable(document.getElementById('foo'));
```

## Differences from jQuery UI's [`:tabbable` selector](https://api.jqueryui.com/tabbable-selector/)

Doesn't need jQuery. Also: doesn't support all the old IE's.

Also: jQuery UI's `:tabbable` selector ignores elements with height and width of `0`. I'm not sure why — because I've found that I can still tab to those elements. So I kept them in. Only elements hidden with `display: none` or `visibility: hidden` are left out.

Also: This plugin ignores the rarely used `<area>` and `<object>` elements, which are focusable in some circumstances. (If you need them, maybe PR?)

*Feedback more than welcome!*
