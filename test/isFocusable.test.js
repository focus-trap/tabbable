const { getByTestId, getByText } = require('@testing-library/dom');
const { isFocusable } = require('../src/index.js');
const { removeAllChildNodes } = require('./helpers.js');

describe('isFocusable', () => {
  afterEach(() => {
    removeAllChildNodes(document.body);
  });

  it('throws an error if no node is provided', () => {
    expect(() => isFocusable()).toThrow();
  });

  describe('returns true', () => {
    it('returns true for a `button` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<button>Click me</button>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Click me'))).toBe(true);
    });

    it('returns true for an `input` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<input data-testid="testInput" />';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testInput'))).toBe(true);
    });

    it('returns true for a `select` element', () => {
      const container = document.createElement('div');
      container.innerHTML = `<select data-testid="testSelect">
          <option value="foo">foo</option>
        </select>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testSelect'))).toBe(true);
    });

    it('returns true for a `textarea` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<textarea data-testId="testTextarea"></textarea>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testTextarea'))).toBe(true);
    });

    it('returns true for an `a` anchor element with an `href` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML =
        '<a href="https://github.com/focus-trap/tabbable">Focusable</a>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Focusable'))).toBe(true);
    });

    it('returns true for an `audio` element with a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<audio data-testid="testAudio" controls></audio>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testAudio'))).toBe(true);
    });

    it('returns true for a `video` element with a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<video data-testid="testVideo" controls></video>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testVideo'))).toBe(true);
    });

    it('returns true for the first `summary` child element that is a direct descendant of a `details` element', () => {
      const container = document.createElement('div');
      container.innerHTML = `<details data-testid="testDetails">
          <summary>Summary 1</summary>
          <summary>Summary 2</summary>
        </details>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testDetails'))).toBe(false);
      expect(isFocusable(getByText(container, 'Summary 1'))).toBe(true);
      expect(isFocusable(getByText(container, 'Summary 2'))).toBe(false);
    });

    it('returns true for a `details` element without a `summary` child element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<details>Details content</details>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Details content'))).toBe(true);
    });

    // JSDOM does not support the `contenteditable` attribute, so we need to fake it
    // https://github.com/jsdom/jsdom/issues/1670
    it('returns true for any element with a `contenteditable` attribute with a truthy value', () => {
      const container = document.createElement('div');
      container.innerHTML = `<div contenteditable="true">contenteditable div</div>
        <p contenteditable="true">contenteditable paragraph</p>`;
      document.body.append(container);

      const editableDiv = getByText(container, 'contenteditable div');
      const editableParagraph = getByText(
        container,
        'contenteditable paragraph'
      );

      editableDiv.contentEditable = 'true';
      editableParagraph.contentEditable = 'true';

      expect(isFocusable(editableDiv)).toBe(true);
      expect(isFocusable(editableParagraph)).toBe(true);
    });

    it('returns true for any element with a non-negative `tabindex` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = `<p tabIndex="2">Focusable parapgraph</p>
        <div tabIndex="1">Focusable div</div>
        <span tabIndex="0">Focusable span</span>`;
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Focusable parapgraph'))).toBe(
        true
      );
      expect(isFocusable(getByText(container, 'Focusable div'))).toBe(true);
      expect(isFocusable(getByText(container, 'Focusable span'))).toBe(true);
    });

    it('returns true for any element with a negative `tabindex` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = `<input tabIndex="-1" data-testid="focusableInput" />
        <p tabIndex="-1">Focusable parapgraph</p>
        <div tabIndex="-1">Focusable div</div>
        <span tabIndex="-1">Focusable span</span>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'focusableInput'))).toBe(true);
      expect(isFocusable(getByText(container, 'Focusable parapgraph'))).toBe(
        true
      );
      expect(isFocusable(getByText(container, 'Focusable div'))).toBe(true);
      expect(isFocusable(getByText(container, 'Focusable span'))).toBe(true);
    });

    it('returns true for all radio `input` elements in a group, regardless of checked status', () => {
      const container = document.createElement('div');
      container.innerHTML = `<form>
          <fieldset>
            <legend>form 1 groupA - initial checked</legend>
            <input type="radio" name="groupA" checked value="a" data-testid="radioA" />
            <input type="radio" name="groupA" value="b" data-testid="radioB" />
          </fieldset>
        </form>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'radioA'))).toBe(true);
      expect(isFocusable(getByTestId(container, 'radioB'))).toBe(true);
    });
  });

  describe('returns false', () => {
    it('returns false for elements that are generally not Focusable', () => {
      const container = document.createElement('div');
      container.innerHTML = `<p>parapgraph</p>
        <div>div</div>
        <span>span</span>`;
      document.body.append(container);

      expect(isFocusable(getByText(container, 'parapgraph'))).toBe(false);
      expect(isFocusable(getByText(container, 'div'))).toBe(false);
      expect(isFocusable(getByText(container, 'span'))).toBe(false);
    });

    it('returns false for an `a` anchor element without an `href` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<a>Not focusable</a>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Not focusable'))).toBe(false);
    });

    it('returns false for an `audio` element without a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<audio data-testid="testAudio"></audio>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testAudio'))).toBe(false);
    });

    it('returns false for a `video` element without a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<video data-testid="testVideo"></video>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testVideo'))).toBe(false);
    });

    it('returns false for a `summary` element that is not a direct descendant of a `details` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<summary>Summary</summary>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Summary'))).toBe(false);
    });

    // JSDOM does not support the `contenteditable` attribute, so we need to fake it
    // https://github.com/jsdom/jsdom/issues/1670
    it('returns false for any element with a `contenteditable` attribute with a falsy value', () => {
      const container = document.createElement('div');
      container.innerHTML = `<div contenteditable="false">contenteditable div</div>
        <p contenteditable="false">contenteditable paragraph</p>`;
      document.body.append(container);

      const editableDiv = getByText(container, 'contenteditable div');
      const editableParagraph = getByText(
        container,
        'contenteditable paragraph'
      );

      editableDiv.contentEditable = 'false';
      editableParagraph.contentEditable = 'false';

      expect(isFocusable(editableDiv)).toBe(false);
      expect(isFocusable(editableParagraph)).toBe(false);
    });

    it('returns false for any element with a `disabled` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = `<input disabled="true" data-testid="disabledInput" />
        <button disabled="true">Click me</button>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'disabledInput'))).toBe(false);
      expect(isFocusable(getByText(container, 'Click me'))).toBe(false);
    });

    it('returns false for any element that is visually hidden with a `display: none` style', () => {
      const container = document.createElement('div');
      container.innerHTML =
        '<input style="display: none;" data-testid="hiddenInput" />';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'hiddenInput'))).toBe(false);
    });

    it('returns false for any element that is visually hidden with a `visibility: hidden` style', () => {
      const container = document.createElement('div');
      container.innerHTML =
        '<input style="visibility: hidden;" data-testid="hiddenInput" />';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'hiddenInput'))).toBe(false);
    });

    it('returns false for any element that is a descendant of an ancestor that is visually hidden with a `display: none` style', () => {
      const container = document.createElement('div');
      container.innerHTML = `<div style="display: none;">
          <input data-testid="inputChildOfHiddenAncestor" />
        </div>`;
      document.body.append(container);

      expect(
        isFocusable(getByTestId(container, 'inputChildOfHiddenAncestor'))
      ).toBe(false);
    });

    it('returns false for any element that is a descendant of an ancestor that is visually hidden with a `visibility: hidden` style', () => {
      const container = document.createElement('div');
      container.innerHTML = `<div style="visibility: hidden;">
          <input data-testid="inputChildOfHiddenAncestor" />
        </div>`;
      document.body.append(container);

      expect(
        isFocusable(getByTestId(container, 'inputChildOfHiddenAncestor'))
      ).toBe(false);
    });

    it('returns false for any non-`summary` element descendants of a closed `details` element', () => {
      const container = document.createElement('div');
      container.innerHTML = `<details data-testid="closedDetails">
          <input data-testid="childInputInClosedDetails" />
        </details>
        <details open data-testid="openDetails">
          <input data-testid="childInputInOpenDetails" />
        </details>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'closedDetails'))).toBe(true);
      expect(
        isFocusable(getByTestId(container, 'childInputInClosedDetails'))
      ).toBe(false);

      expect(isFocusable(getByTestId(container, 'openDetails'))).toBe(true);
      expect(
        isFocusable(getByTestId(container, 'childInputInOpenDetails'))
      ).toBe(true);
    });
  });
});
