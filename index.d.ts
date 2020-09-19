type FocusableElement = HTMLElement | SVGElement;

export type TabbableOptions = {
  includeContainer?: boolean;
};

export declare function tabbable(
  container: Element,
  options?: TabbableOptions
): FocusableElement[];

export declare function focusable(
  container: Element,
  options?: TabbableOptions
): FocusableElement[];

export declare function isTabbable(element: Element): boolean;

export declare function isFocusable(element: Element): boolean;
