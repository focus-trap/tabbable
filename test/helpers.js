export function getIdsFromElementsArray(elements) {
  return elements.map((el) => el.getAttribute('id'));
}

export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 * Mock getBoundingClientRect since tests are
 * running with jsdom and not a real browser
 *
 * By default all elements return a fixed size.
 * Use the attribute "data-jsdom-no-size" to mark an element with zero width/height.
 *
 * @param {HTMLElement} container mock subtree getBoundingClientRect function
 */
export function mockElementsSizes(container) {
  const elements = container.querySelectorAll('*');
  for (const element of elements) {
    const noSize = element.dataset.jsdomNoSize !== undefined;
    const size = noSize ? 0 : 100;
    element.getBoundingClientRect = () => ({
      width: size,
      height: size,
      top: 0,
      left: 0,
      right: size,
      bottom: size,
    });
  }
}
