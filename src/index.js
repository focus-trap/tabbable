const candidateSelectors = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]:not(slot)',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary:first-of-type',
  'details',
];
const candidateSelector = /* #__PURE__ */ candidateSelectors.join(',');

const NoElement = typeof Element === 'undefined';

const matches = NoElement
  ? function () {}
  : Element.prototype.matches ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;

const getRootNode =
  !NoElement && Element.prototype.getRootNode
    ? (element) => element.getRootNode()
    : (element) => element.ownerDocument;

/**
 * @param {Element} el container to check in
 * @param {boolean} includeContainer add container to check
 * @param {(node: Element) => boolean} filter filter candidates
 * @returns {Element[]}
 */
const getCandidates = function (el, includeContainer, filter) {
  let candidates = Array.prototype.slice.apply(
    el.querySelectorAll(candidateSelector)
  );
  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }
  candidates = candidates.filter(filter);
  return candidates;
};

/**
 * @callback GetShadowRoot
 * @param {Element} element to check for shadow root
 * @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
 */

/**
 * @typedef {Object} CandidatesScope
 * @property {Element} scope contains inner candidates
 * @property {Element[]} candidates
 */

/**
 * @typedef {Object} IterativeOptions
 * @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
 *  if a function, implies shadow support is enabled and either returns the shadow root of an element
 *  or a boolean stating if it has an undisclosed shadow root
 * @property {(node: Element) => boolean} filter filter candidates
 * @property {boolean} flatten if true then result will flatten any CandidatesScope into the returned list
 */

/**
 * @param {Element[]} elements list of element containers to match candidates from
 * @param {boolean} includeContainer add container list to check
 * @param {IterativeOptions} options
 * @returns {Array.<Element|CandidatesScope>}
 */
const getCandidatesIteratively = function (
  elements,
  includeContainer,
  options
) {
  const candidates = [];
  const elementsToCheck = Array.from(elements);
  while (elementsToCheck.length) {
    const element = elementsToCheck.shift();
    if (element.tagName === 'SLOT') {
      // add shadow dom slot scope (slot itself cannot be focusable)
      const assigned = element.assignedElements();
      const content = assigned.length ? assigned : element.children;
      const nestedCandidates = getCandidatesIteratively(content, true, options);
      if (options.flatten) {
        candidates.push(...nestedCandidates);
      } else {
        candidates.push({
          scope: element,
          candidates: nestedCandidates,
        });
      }
    } else {
      // check candidate element
      const validCandidate = matches.call(element, candidateSelector);
      if (
        validCandidate &&
        options.filter(element) &&
        (includeContainer || !elements.includes(element))
      ) {
        candidates.push(element);
      }

      // iterate over shadow content if possible
      const shadowRoot =
        element.shadowRoot ||
        // check for an undisclosed shadow
        (typeof options.getShadowRoot === 'function' &&
          options.getShadowRoot(element));

      if (shadowRoot) {
        // add shadow dom scope IIF a shadow root node was given; otherwise, an undisclosed
        //  shadow exists, so look at light dom children as fallback BUT create a scope for any
        //  child candidates found because they're likely slotted elements (elements that are
        //  children of the web component element (which has the shadow), in the light dom, but
        //  slotted somewhere _inside_ the undisclosed shadow) -- the scope is created below,
        //  _after_ we return from this recursive call
        const nestedCandidates = getCandidatesIteratively(
          shadowRoot === true ? element.children : shadowRoot.children,
          true,
          options
        );

        if (options.flatten) {
          candidates.push(...nestedCandidates);
        } else {
          candidates.push({
            scope: element,
            candidates: nestedCandidates,
          });
        }
      } else {
        // there's not shadow so just dig into the element's (light dom) children
        //  __without__ giving the element special scope treatment
        elementsToCheck.unshift(...element.children);
      }
    }
  }
  return candidates;
};

const getTabindex = function (node, isScope) {
  if (node.tabIndex < 0) {
    // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
    // `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
    // yet they are still part of the regular tab order; in FF, they get a default
    // `tabIndex` of 0; since Chrome still puts those elements in the regular tab
    // order, consider their tab index to be 0.
    // Also browsers do not return `tabIndex` correctly for contentEditable nodes;
    // so if they don't have a tabindex attribute specifically set, assume it's 0.
    //
    // isScope is positive for custom element with shadow root or slot that by default
    // have tabIndex -1, but need to be sorted by document order in order for their
    // content to be inserted in the correct position
    if (
      (isScope ||
        /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) ||
        node.isContentEditable) &&
      isNaN(parseInt(node.getAttribute('tabindex'), 10))
    ) {
      return 0;
    }
  }

  return node.tabIndex;
};

const sortOrderedTabbables = function (a, b) {
  return a.tabIndex === b.tabIndex
    ? a.documentOrder - b.documentOrder
    : a.tabIndex - b.tabIndex;
};

const isInput = function (node) {
  return node.tagName === 'INPUT';
};

const isHiddenInput = function (node) {
  return isInput(node) && node.type === 'hidden';
};

const isDetailsWithSummary = function (node) {
  const r =
    node.tagName === 'DETAILS' &&
    Array.prototype.slice
      .apply(node.children)
      .some((child) => child.tagName === 'SUMMARY');
  return r;
};

const getCheckedRadio = function (nodes, form) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};

const isTabbableRadio = function (node) {
  if (!node.name) {
    return true;
  }
  const radioScope = node.form || getRootNode(node);
  const queryRadios = function (name) {
    return radioScope.querySelectorAll(
      'input[type="radio"][name="' + name + '"]'
    );
  };

  let radioSet;
  if (
    typeof window !== 'undefined' &&
    typeof window.CSS !== 'undefined' &&
    typeof window.CSS.escape === 'function'
  ) {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        'Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s',
        err.message
      );
      return false;
    }
  }

  const checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};

const isRadio = function (node) {
  return isInput(node) && node.type === 'radio';
};

const isNonTabbableRadio = function (node) {
  return isRadio(node) && !isTabbableRadio(node);
};

const isZeroArea = function (node) {
  const { width, height } = node.getBoundingClientRect();
  return width === 0 && height === 0;
};
const isHidden = function (node, { displayCheck, getShadowRoot }) {
  if (getComputedStyle(node).visibility === 'hidden') {
    return true;
  }

  const isDirectSummary = matches.call(node, 'details>summary:first-of-type');
  const nodeUnderDetails = isDirectSummary ? node.parentElement : node;
  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return true;
  }

  if (!displayCheck || displayCheck === 'full') {
    if (typeof getShadowRoot === 'function') {
      // figure out if we should consider the node to be in an undisclosed shadow and use the
      //  'non-zero-area' fallback
      const originalNode = node;
      while (node) {
        const parentElement = node.parentElement;
        const rootNode = getRootNode(node);
        if (
          parentElement &&
          !parentElement.shadowRoot &&
          getShadowRoot(parentElement) === true // check if there's an undisclosed shadow
        ) {
          // node has an undisclosed shadow which means we can only treat it as a black box, so we
          //  fall back to a non-zero-area test
          return isZeroArea(node);
        } else if (node.assignedSlot) {
          // iterate up slot
          node = node.assignedSlot;
        } else if (!parentElement && rootNode !== node.ownerDocument) {
          // cross shadow boundary
          node = rootNode.host;
        } else {
          // iterate up normal dom
          node = parentElement;
        }
      }
      node = originalNode;
    }
    // else, `getShadowRoot` might be true, but all that does is enable shadow DOM support
    //  (i.e. it does not also presume that all nodes might have undisclosed shadows); or
    //  it might be a falsy value, which means shadow DOM support is disabled

    // didn't find it sitting in an undisclosed shadow (or shadows are disabled) so now we
    //  can just test to see if it would normally be visible or not
    // this works wherever the node is: if there's at least one client rect, it's
    //  somehow displayed; it also covers the CSS 'display: contents' case where the
    //  node itself is hidden in place of its contents; and there's no need to search
    //  up the hierarchy either
    return !node.getClientRects().length;
  } else if (displayCheck === 'non-zero-area') {
    return isZeroArea(node);
  }

  return false;
};

// form fields (nested) inside a disabled fieldset are not focusable/tabbable
//  unless they are in the _first_ <legend> element of the top-most disabled
//  fieldset
const isDisabledFromFieldset = function (node) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
    let parentNode = node.parentElement;
    // check if `node` is contained in a disabled <fieldset>
    while (parentNode) {
      if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
        // look for the first <legend> among the children of the disabled <fieldset>
        for (let i = 0; i < parentNode.children.length; i++) {
          const child = parentNode.children.item(i);
          // when the first <legend> (in document order) is found
          if (child.tagName === 'LEGEND') {
            // if its parent <fieldset> is not nested in another disabled <fieldset>,
            // return whether `node` is a descendant of its first <legend>
            return matches.call(parentNode, 'fieldset[disabled] *')
              ? true
              : !child.contains(node);
          }
        }
        // the disabled <fieldset> containing `node` has no <legend>
        return true;
      }
      parentNode = parentNode.parentElement;
    }
  }

  // else, node's tabbable/focusable state should not be affected by a fieldset's
  //  enabled/disabled state
  return false;
};

const isNodeMatchingSelectorFocusable = function (options, node) {
  if (
    node.disabled ||
    isHiddenInput(node) ||
    isHidden(node, options) ||
    // For a details element with a summary, the summary element gets the focus
    isDetailsWithSummary(node) ||
    isDisabledFromFieldset(node)
  ) {
    return false;
  }
  return true;
};

const isNodeMatchingSelectorTabbable = function (options, node) {
  if (
    isNonTabbableRadio(node) ||
    getTabindex(node) < 0 ||
    !isNodeMatchingSelectorFocusable(options, node)
  ) {
    return false;
  }
  return true;
};

/**
 * @param {Array.<Element|CandidatesScope>} candidates
 * @returns Element[]
 */
const sortByOrder = function (candidates) {
  const regularTabbables = [];
  const orderedTabbables = [];
  candidates.forEach(function (item, i) {
    const isScope = !!item.scope;
    const element = isScope ? item.scope : item;
    const candidateTabindex = getTabindex(element, isScope);
    const elements = isScope ? sortByOrder(item.candidates) : element;
    if (candidateTabindex === 0) {
      isScope
        ? regularTabbables.push(...elements)
        : regularTabbables.push(element);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        item: item,
        isScope: isScope,
        content: elements,
      });
    }
  });

  return orderedTabbables
    .sort(sortOrderedTabbables)
    .reduce((acc, sortable) => {
      sortable.isScope
        ? acc.push(...sortable.content)
        : acc.push(sortable.content);
      return acc;
    }, [])
    .concat(regularTabbables);
};

const tabbable = function (el, options) {
  options = options || {};

  let candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([el], options.includeContainer, {
      filter: isNodeMatchingSelectorTabbable.bind(null, options),
      flatten: false,
      getShadowRoot: options.getShadowRoot,
    });
  } else {
    candidates = getCandidates(
      el,
      options.includeContainer,
      isNodeMatchingSelectorTabbable.bind(null, options)
    );
  }
  return sortByOrder(candidates);
};

const focusable = function (el, options) {
  options = options || {};

  let candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([el], options.includeContainer, {
      filter: isNodeMatchingSelectorFocusable.bind(null, options),
      flatten: true,
      getShadowRoot: options.getShadowRoot,
    });
  } else {
    candidates = getCandidates(
      el,
      options.includeContainer,
      isNodeMatchingSelectorFocusable.bind(null, options)
    );
  }

  return candidates;
};

const isTabbable = function (node, options) {
  options = options || {};
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, candidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorTabbable(options, node);
};

const focusableCandidateSelector = /* #__PURE__ */ candidateSelectors
  .concat('iframe')
  .join(',');

const isFocusable = function (node, options) {
  options = options || {};
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorFocusable(options, node);
};

export { tabbable, focusable, isTabbable, isFocusable };
