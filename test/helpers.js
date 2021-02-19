export function getIdsFromElementsArray(elements) {
  return elements.map((el) => el.getAttribute('id'));
}

export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
