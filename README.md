# tabbable

[![Build Status](https://travis-ci.org/davidtheclark/tabbable.svg?branch=master)](https://travis-ci.org/davidtheclark/tabbable)

Returns an array of all\* tabbable DOM nodes within a containing node, in their actual tab order (cf. [Sequential focus navigation and the tabindex attribute](http://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute)).

<small>\* "all" has some necessary caveats, which you'll learn about by reading below.</small>

The array of tabbable nodes should include the following:

- `<button>`s,
- `<input>`s,
- `<select>`s,
- `<textarea>`s,
- `<a>`s and `<area>`s with `href` attributes,
- `<audio>`s and `<videos>`s with `controls` attributes,
- anything with a non-negative `tabindex`

Any of the above will *not* be added to the array, though, if any of the following are also true about it:

- negative `tabindex`
- `disabled`
- either the node itself *or an ancestor of it* is hidden via `display: none` or `visibility: hidden`
- it's an `<input type="radio">` and a different radio in its group is `checked`.

**If you think a node should be included in your array of tabbables *but it's not*, all you need to do is add `tabindex="0"` to deliberately include it.** This will also result in more consistent cross-browser behavior. For information about why your special node might *not* be included, see ["More details"](#more-details), below.

## Goals

- Accurate
- No dependencies
- Small
- Fast

## Browser Support

Basically IE9+.

Why? It uses [Element.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll) and [Window.getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).

## Installation

```
npm install tabbable
```

Dependencies: *none*.

You'll need to be compiling CommonJS (via browserify or webpack).

## API

```
tabbable(rootNode, [options])
```

Returns an array of ordered tabbable node within the `rootNode`.

Summary of ordering principles:
- First include any nodes with positive `tabindex` attributes (1 or higher), ordered by ascending `tabindex` and source order.
- Then include any nodes with a zero `tabindex` and any element that by default receives focus (listed above) and does not have a positive `tabindex` set, in source order.

### rootNode

Type: `Node`. **Required.**

### options

#### includeContainer

Type: `boolean`. Default: `false`.

If set to `true`, `rootNode` will be included in the returned tabbable node array, if `rootNode` is tabbable.

## More details

- **Tabbable tries to identify elements that are reliably tabbable across (not dead) browsers.** Browsers are stupidly inconsistent in their behavior, though — especially for edge-case elements like `<object>` and `<iframe>` — so this means *some* elements that you *can* tab to in *some* browsers will be left out of the results. (To learn more about that stupid inconsistency, see this [amazing table](https://allyjs.io/data-tables/focusable.html)). To provide better consistency across browsers and ensure the elements you *want* in your tabbables list show up there, **try adding `tabindex="0"` to edge-case elements that Tabbable ignores**.
- (As an example of the above:) Although browsers allow tabbing into elements marked `contenteditable`, outstanding bugs in the `tabIndex` API prevents Tabbable from registering them. If you have `contenteditable` elements that you need included in the array, you'll have to additionally specify `tabindex="0"`. (See [issue #7](https://github.com/davidtheclark/tabbable/issues/7).)
- Although Tabbable tries to deal with positive tabindexes, **you should not use positive tabindexes**. Accessibility experts seem to be in (rare) unanimous and clear consent about this: rely on the order of elements in the document.
- If you're thinking, "Why not just use the right `querySelectorAll`?", you *may* be on to something ... but, as with most "just" statements, you're probably not. For example, a simple `querySelectorAll` approach will not figure out whether an element is *hidden*, and therefore not actually tabbable. (That said, if you do think Tabbable can be simplified or otherwise improved, I'd love to hear your idea.)
- jQuery UI's `:tabbable` selector ignores elements with height and width of `0`. I'm not sure why — because I've found that I can still tab to those elements. So I kept them in. Only elements hidden with `display: none` or `visibility: hidden` are left out.
- Radio groups have some edge cases. *You can avoid these edge cases by always having a `checked` radio in your group* (which is what you should usually do anyway). If there is no `checked` radio in the radio group, *all* of the radios will be considered tabbable. (Some browsers do this, otherwise don't — there's not consistency.)

***Feedback and contributions more than welcome!***
