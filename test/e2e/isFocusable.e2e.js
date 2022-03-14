import { isFocusable } from '../../src/index.js';
import {
  setupTestWindow,
  getFixtures,
  removeAllChildNodes,
} from './e2e.helpers';
const { getByTestId, getByText } = require('@testing-library/dom');

describe('isFocusable', () => {
  let document, fixtures;
  before(() => {
    setupTestWindow((testWindow) => {
      document = testWindow.document;
    });
    getFixtures((f) => (fixtures = f));
  });

  afterEach(() => {
    removeAllChildNodes(document.body);
  });

  it('throws an error if no node is provided', () => {
    expect(() => isFocusable()).to.throw();
  });

  describe('returns true', () => {
    it('returns true for a `button` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<button>Click me</button>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Click me'))).to.eql(true);
    });

    it('returns true for an `input` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<input data-testid="testInput" />';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testInput'))).to.eql(true);
    });

    it('returns true for a `select` element', () => {
      const container = document.createElement('div');
      container.innerHTML = `<select data-testid="testSelect">
          <option value="foo">foo</option>
        </select>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testSelect'))).to.eql(true);
    });

    it('returns true for a `textarea` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<textarea data-testId="testTextarea"></textarea>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testTextarea'))).to.eql(true);
    });

    it('returns true for an `a` anchor element with an `href` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML =
        '<a href="https://github.com/focus-trap/tabbable">Focusable</a>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Focusable'))).to.eql(true);
    });

    it('returns true for an `audio` element with a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<audio data-testid="testAudio" controls></audio>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testAudio'))).to.eql(true);
    });

    it('returns true for a `video` element with a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<video data-testid="testVideo" controls></video>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testVideo'))).to.eql(true);
    });

    it('returns true for the first `summary` child element that is a direct descendant of a `details` element', () => {
      const container = document.createElement('div');
      container.innerHTML = `<details data-testid="testDetails">
          <summary>Summary 1</summary>
          <summary>Summary 2</summary>
        </details>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testDetails'))).to.eql(false);
      expect(isFocusable(getByText(container, 'Summary 1'))).to.eql(true);
      expect(isFocusable(getByText(container, 'Summary 2'))).to.eql(false);
    });

    it('returns true for a `details` element without a `summary` child element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<details>Details content</details>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Details content'))).to.eql(true);
    });

    it('returns true for any element with a `contenteditable` attribute with a truthy value', () => {
      const container = document.createElement('div');
      container.innerHTML = `<div contenteditable="true">contenteditable div</div>
        <p contenteditable="true">contenteditable paragraph</p>
        <div contenteditable="true" tabindex="-1">contenteditable div focusable but not tabbable</div>
        <div contenteditable="true" tabindex="NaN">contenteditable div focusable and tabbable</div>`;
      document.body.append(container);

      const editableDiv = getByText(container, 'contenteditable div');
      const editableParagraph = getByText(
        container,
        'contenteditable paragraph'
      );
      const editableDivWithNegativeTabIndex = getByText(
        container,
        'contenteditable div focusable but not tabbable'
      );
      const editableDivWithNanTabIndex = getByText(
        container,
        'contenteditable div focusable and tabbable'
      );

      expect(isFocusable(editableDiv)).to.eql(true);
      expect(isFocusable(editableParagraph)).to.eql(true);
      expect(isFocusable(editableDivWithNegativeTabIndex)).to.eql(true);
      expect(isFocusable(editableDivWithNanTabIndex)).to.eql(true);
    });

    it('returns true for any element with a non-negative `tabindex` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = `<p tabIndex="2">Focusable parapgraph</p>
        <div tabIndex="1">Focusable div</div>
        <span tabIndex="0">Focusable span</span>`;
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Focusable parapgraph'))).to.eql(
        true
      );
      expect(isFocusable(getByText(container, 'Focusable div'))).to.eql(true);
      expect(isFocusable(getByText(container, 'Focusable span'))).to.eql(true);
    });

    it('returns true for any element with a negative `tabindex` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = `<input tabIndex="-1" data-testid="focusableInput" />
        <p tabIndex="-1">Focusable parapgraph</p>
        <div tabIndex="-1">Focusable div</div>
        <span tabIndex="-1">Focusable span</span>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'focusableInput'))).to.eql(
        true
      );
      expect(isFocusable(getByText(container, 'Focusable parapgraph'))).to.eql(
        true
      );
      expect(isFocusable(getByText(container, 'Focusable div'))).to.eql(true);
      expect(isFocusable(getByText(container, 'Focusable span'))).to.eql(true);
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

      expect(isFocusable(getByTestId(container, 'radioA'))).to.eql(true);
      expect(isFocusable(getByTestId(container, 'radioB'))).to.eql(true);
    });
  });

  describe('returns false', () => {
    it('returns false for elements that are generally not Focusable', () => {
      const container = document.createElement('div');
      container.innerHTML = `<p>parapgraph</p>
        <div>div</div>
        <span>span</span>`;
      document.body.append(container);

      expect(isFocusable(getByText(container, 'parapgraph'))).to.eql(false);
      expect(isFocusable(getByText(container, 'div'))).to.eql(false);
      expect(isFocusable(getByText(container, 'span'))).to.eql(false);
    });

    it('returns false for an `a` anchor element without an `href` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<a>Not focusable</a>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Not focusable'))).to.eql(false);
    });

    it('returns false for an `audio` element without a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<audio data-testid="testAudio"></audio>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testAudio'))).to.eql(false);
    });

    it('returns false for a `video` element without a `controls` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = '<video data-testid="testVideo"></video>';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'testVideo'))).to.eql(false);
    });

    it('returns false for a `summary` element that is not a direct descendant of a `details` element', () => {
      const container = document.createElement('div');
      container.innerHTML = '<summary>Summary</summary>';
      document.body.append(container);

      expect(isFocusable(getByText(container, 'Summary'))).to.eql(false);
    });

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

      expect(isFocusable(editableDiv)).to.eql(false);
      expect(isFocusable(editableParagraph)).to.eql(false);
    });

    it('returns false for any element with a `disabled` attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = `<input disabled="true" data-testid="disabledInput" />
        <button disabled="true">Click me</button>`;
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'disabledInput'))).to.eql(
        false
      );
      expect(isFocusable(getByText(container, 'Click me'))).to.eql(false);
    });

    it('returns false for any element that is visually hidden with a `display: none` style', () => {
      const container = document.createElement('div');
      container.innerHTML =
        '<input style="display: none;" data-testid="hiddenInput" />';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'hiddenInput'))).to.eql(false);
    });

    it('returns false for any element that is visually hidden with a `visibility: hidden` style', () => {
      const container = document.createElement('div');
      container.innerHTML =
        '<input style="visibility: hidden;" data-testid="hiddenInput" />';
      document.body.append(container);

      expect(isFocusable(getByTestId(container, 'hiddenInput'))).to.eql(false);
    });

    it('returns false for any element that is a descendant of an ancestor that is visually hidden with a `display: none` style', () => {
      const container = document.createElement('div');
      container.innerHTML = `<div style="display: none;">
          <input data-testid="inputChildOfHiddenAncestor" />
        </div>`;
      document.body.append(container);

      expect(
        isFocusable(getByTestId(container, 'inputChildOfHiddenAncestor'))
      ).to.eql(false);
    });

    it('returns false for any element that is a descendant of an ancestor that is visually hidden with a `visibility: hidden` style', () => {
      const container = document.createElement('div');
      container.innerHTML = `<div style="visibility: hidden;">
          <input data-testid="inputChildOfHiddenAncestor" />
        </div>`;
      document.body.append(container);

      expect(
        isFocusable(getByTestId(container, 'inputChildOfHiddenAncestor'))
      ).to.eql(false);
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

      expect(isFocusable(getByTestId(container, 'closedDetails'))).to.eql(true);
      expect(
        isFocusable(getByTestId(container, 'childInputInClosedDetails'))
      ).to.eql(false);

      expect(isFocusable(getByTestId(container, 'openDetails'))).to.eql(true);
      expect(
        isFocusable(getByTestId(container, 'childInputInOpenDetails'))
      ).to.eql(true);
    });

    it('returns false for any form element inside a disabled fieldset', () => {
      const container = document.createElement('div');
      container.innerHTML = fixtures.fieldset.replaceAll(
        'id="',
        'data-testid="'
      );
      document.body.append(container);

      // in first legend of disabled fieldset: focusable
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-legend1-button'))
      ).to.eql(true);
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-legend1-input'))
      ).to.eql(true);
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-legend1-select'))
      ).to.eql(true);
      expect(
        isFocusable(
          getByTestId(container, 'fieldset-disabled-legend1-textarea')
        )
      ).to.eql(true);

      // in second (or subsequent) legend of disabled fieldset: NOT focusable
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-legend2-button'))
      ).to.eql(false);
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-legend2-input'))
      ).to.eql(false);
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-legend2-select'))
      ).to.eql(false);
      expect(
        isFocusable(
          getByTestId(container, 'fieldset-disabled-legend2-textarea')
        )
      ).to.eql(false);

      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-button'))
      ).to.eql(false);
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-input'))
      ).to.eql(false);
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-select'))
      ).to.eql(false);
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-textarea'))
      ).to.eql(false);

      // nested in enabled fieldset, disabled parent fieldset takes precedence
      expect(
        isFocusable(
          getByTestId(
            container,
            'fieldset-disabled-fieldset-enabled-legend-button'
          )
        )
      ).to.eql(false);
      expect(
        isFocusable(
          getByTestId(container, 'fieldset-disabled-fieldset-enabled-input')
        )
      ).to.eql(false);

      // nested in disabled fieldset, top-most disabled fieldset takes precedence
      expect(
        isFocusable(
          getByTestId(
            container,
            'fieldset-disabled-fieldset-disabled-legend-button'
          )
        )
      ).to.eql(false);
      expect(
        isFocusable(
          getByTestId(container, 'fieldset-disabled-fieldset-disabled-input')
        )
      ).to.eql(false);

      // anchor is not form field so it remains focusable
      expect(
        isFocusable(getByTestId(container, 'fieldset-disabled-anchor'))
      ).to.eql(true);
    });
  });

  describe('display check', () => {
    const fixture = `
      <div data-testid="displayed-top" tabindex="0">
        <div data-testid="displayed-nested" tabindex="0"></div>
        <div
          data-testid="displayed-zero-size"
          tabindex="0"
          style="width: 0; height: 0"
        ></div>
      </div>
      <div
        data-testid="displayed-none-top"
        tabindex="0"
        style="display: none"
      >
        <div data-testid="nested-under-displayed-none" tabindex="0"></div>
      </div>
      <div data-testid="displayed-contents-top" tabindex="0" style="display: contents">
        <div data-testid="nested-under-displayed-contents" tabindex="0"></div>
      </div>
    `;
    function setupDisplayCheck() {
      const container = document.createElement('div');
      container.innerHTML = fixture;
      document.body.append(container);
      return {
        displayedTop: getByTestId(container, 'displayed-top'),
        displayedNested: getByTestId(container, 'displayed-nested'),
        displayedZeroSize: getByTestId(container, 'displayed-zero-size'),
        displayedNoneTop: getByTestId(container, 'displayed-none-top'),
        nestedUnderDisplayedNone: getByTestId(
          container,
          'nested-under-displayed-none'
        ),
        displayedContentsTop: getByTestId(container, 'displayed-contents-top'),
        nestedUnderDisplayedContents: getByTestId(
          container,
          'nested-under-displayed-contents'
        ),
      };
    }

    it('return browser visible elements by default ("full" option)', () => {
      const {
        displayedTop,
        displayedNested,
        displayedZeroSize,
        displayedNoneTop,
        nestedUnderDisplayedNone,
        displayedContentsTop,
        nestedUnderDisplayedContents,
      } = setupDisplayCheck();

      // default
      expect(isFocusable(displayedTop)).to.eql(true);
      expect(isFocusable(displayedNested)).to.eql(true);
      expect(isFocusable(displayedZeroSize)).to.eql(true);
      expect(isFocusable(displayedNoneTop)).to.eql(false);
      expect(isFocusable(nestedUnderDisplayedNone)).to.eql(false);
      expect(isFocusable(displayedContentsTop)).to.eql(false);
      expect(isFocusable(nestedUnderDisplayedContents)).to.eql(true);
      // full
      const options = { displayCheck: 'full' };
      expect(isFocusable(displayedTop, options)).to.eql(true);
      expect(isFocusable(displayedNested, options)).to.eql(true);
      expect(isFocusable(displayedZeroSize, options)).to.eql(true);
      expect(isFocusable(displayedNoneTop, options)).to.eql(false);
      expect(isFocusable(nestedUnderDisplayedNone, options)).to.eql(false);
      expect(isFocusable(displayedContentsTop, options)).to.eql(false);
      expect(isFocusable(nestedUnderDisplayedContents, options)).to.eql(true);
    });

    it('return only elements with size ("non-zero-area" option)', () => {
      const {
        displayedTop,
        displayedNested,
        displayedZeroSize,
        displayedNoneTop,
        nestedUnderDisplayedNone,
        displayedContentsTop,
        nestedUnderDisplayedContents,
      } = setupDisplayCheck();

      const options = { displayCheck: 'non-zero-area' };
      expect(isFocusable(displayedTop, options)).to.eql(true);
      expect(isFocusable(displayedNested, options)).to.eql(true);
      expect(isFocusable(displayedZeroSize, options)).to.eql(false);
      expect(isFocusable(displayedNoneTop, options)).to.eql(false);
      expect(isFocusable(nestedUnderDisplayedNone, options)).to.eql(false);
      expect(isFocusable(displayedContentsTop, options)).to.eql(false);
      expect(isFocusable(nestedUnderDisplayedContents, options)).to.eql(true);
    });
    it('return elements without checking display ("none" option)', () => {
      const {
        displayedTop,
        displayedNested,
        displayedZeroSize,
        displayedNoneTop,
        nestedUnderDisplayedNone,
        displayedContentsTop,
        nestedUnderDisplayedContents,
      } = setupDisplayCheck();

      const options = { displayCheck: 'none' };
      expect(isFocusable(displayedTop, options)).to.eql(true);
      expect(isFocusable(displayedNested, options)).to.eql(true);
      expect(isFocusable(displayedZeroSize, options)).to.eql(true);
      expect(isFocusable(displayedNoneTop, options)).to.eql(true);
      expect(isFocusable(nestedUnderDisplayedNone, options)).to.eql(true);
      expect(isFocusable(displayedContentsTop, options)).to.eql(true);
      expect(isFocusable(nestedUnderDisplayedContents, options)).to.eql(true);
    });
  });
});
