type Options = {
  includeContainer?: boolean
}

type TabbableDescription = {
  documentOrder: number,
  tabIndex: number | null,
  node: Element
}

export default function tabbable(
  node: Element,
  options?: Options
): TabbableDescription[];

export function isTabbable(node: Element): boolean;
export function isFocusable(node: Element): boolean;
