export type TabbableOptions = {
  includeContainer?: boolean;
};

export declare function tabbable(
  container: Element,
  options?: TabbableOptions
): Element[];

export declare function isTabbable(element: Element): boolean;

export declare function isFocusable(element: Element): boolean;
