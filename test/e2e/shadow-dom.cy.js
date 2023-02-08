import {
  isTabbable,
  isFocusable,
  tabbable,
  focusable,
} from '../../src/index.js';
import {
  setupTestWindow,
  removeAllChildNodes,
  setupFixture,
  getFixtures,
  getIdsFromElementsArray,
} from './e2e.helpers';

describe('web-components', () => {
  let window, document, fixtures;
  before(() => {
    setupTestWindow((testWindow) => {
      window = testWindow;
      document = testWindow.document;
    });
    getFixtures((f) => (fixtures = f));
  });

  afterEach(() => {
    removeAllChildNodes(document.body);
  });

  describe('isFocusable/isTabbable', () => {
    it('should separate shadow/light radio button groups', () => {
      const { container } = setupFixture(fixtures.shadowDomRadio, { window });
      const shadowRoot = container.querySelector('#webComp').shadowRoot;
      const shadowRadio1 = shadowRoot.querySelector('#shadow-radio1');
      const shadowRadio2 = shadowRoot.querySelector('#shadow-radio2');
      const lightRadio1 = container.querySelector('#light-radio1');
      const radio2Slotted = container.querySelector('#light-radio2-slotted');
      const lightRadio3 = container.querySelector('#light-radio3');

      // always focusable
      expect(isFocusable(shadowRadio1), '(focusable) checked in shadow').to.eql(
        true
      );
      expect(
        isFocusable(shadowRadio2),
        '(focusable) not checked in shadow'
      ).to.eql(true);
      expect(isFocusable(lightRadio1), '(focusable) checked in light').to.eql(
        true
      );
      expect(
        isFocusable(radio2Slotted),
        '(focusable) not checked slotted'
      ).to.eql(true);
      expect(
        isFocusable(lightRadio3),
        '(focusable) not checked in light'
      ).to.eql(true);

      // only the first checked is tabbable
      expect(isTabbable(shadowRadio1), '(tabbable) checked in shadow').to.eql(
        true
      );
      expect(
        isTabbable(shadowRadio2),
        '(tabbable) not checked in shadow'
      ).to.eql(false);
      expect(isTabbable(lightRadio1), '(tabbable) checked in light').to.eql(
        true
      );
      expect(
        isTabbable(radio2Slotted),
        '(tabbable) not checked slotted'
      ).to.eql(false);
      expect(isTabbable(lightRadio3), '(tabbable) not checked in light').to.eql(
        false
      );
    });

    it('should not match elements in shadow root with a "display=none" ancestor', () => {
      const { container } = setupFixture(fixtures.shadowDomDisplay, {
        window,
        caseId: 'light-display-none',
      });
      const shadowRoot = container.querySelector('test-shadow').shadowRoot;
      const shadowInput = shadowRoot.querySelector('#shadow-input');
      const lightInputSlotted = container.querySelector('#light-input-slotted');

      // focusable
      expect(isFocusable(shadowInput), '(focusable) non display shadow').to.eql(
        false
      );
      expect(
        isFocusable(lightInputSlotted),
        '(focusable) non display slotted'
      ).to.eql(false);

      // tabbable
      expect(isTabbable(shadowInput), '(tabbable) non display shadow').to.eql(
        false
      );
      expect(
        isTabbable(lightInputSlotted),
        '(tabbable) non display slotted'
      ).to.eql(false);
    });

    it('should not match elements in a non display slot', () => {
      const { container } = setupFixture(fixtures.shadowDomDisplay, {
        window,
        caseId: 'slot-display-none',
      });
      const lightInputSlotted = container.querySelector('#light-input-slotted');

      expect(isFocusable(lightInputSlotted)).to.eql(false);
      expect(isTabbable(lightInputSlotted)).to.eql(false);
    });

    it('should not match elements in a closed shadow root with inner display="none" (fallback to zero-area-size)', () => {
      const { container } = setupFixture(fixtures.shadowDomDisplay, {
        window,
        caseId: 'slot-display-none-closed-shadow',
      });
      const webComp = container.querySelector('test-shadow');
      const lightDisplayNoneSlotted = container.querySelector(
        '#light-input-slotted'
      );

      // focusable
      expect(
        isFocusable(lightDisplayNoneSlotted),
        'slotted into non-displayed container so not focusable'
      ).to.eql(false);
      expect(
        isFocusable(lightDisplayNoneSlotted, {
          getShadowRoot: (node) => node === webComp,
        }),
        'fallback to zero size check for unreached shadow root but still not focusable'
      ).to.eql(false);

      // tabbable
      expect(
        isTabbable(lightDisplayNoneSlotted),
        'slotted into non-displayed container so not tabbable'
      ).to.eql(false);
      expect(
        isTabbable(lightDisplayNoneSlotted, {
          getShadowRoot: (node) => node === webComp,
        }),
        'fallback to zero size for unreached shadow root but still not tabbable'
      ).to.eql(false);
    });

    it('should not match slot elements', () => {
      const { container } = setupFixture(fixtures.shadowDomQuery, {
        window,
        caseId: 'slots-tab-index',
      });
      const shadowRoot = container.querySelector('test-shadow').shadowRoot;
      const slotWithTabIndex = shadowRoot.querySelector(
        'slot[name="slot-first"]'
      );

      expect(isFocusable(slotWithTabIndex), 'slot not focusable').to.eql(false);
      expect(isTabbable(slotWithTabIndex), 'slot not tabbable').to.eql(false);
    });
  });

  describe('tabbable/focusable', () => {
    [false, true].forEach((inertTest) => {
      describe(`${inertTest ? 'inertness' : 'activeness'}`, () => {
        it(`should${inertTest ? ' not' : ''} find${
          inertTest ? ' inert' : ''
        } elements inside shadow dom`, () => {
          const expected = inertTest
            ? ['light-before', 'light-after']
            : ['light-before', 'shadow-input', 'light-after'];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: inertTest ? 'inert-shadow-input' : 'shadow-input',
          });

          let result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(container, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it(`should${inertTest ? ' not' : ''} find${
          inertTest ? ' inert' : ''
        } tabbable host`, () => {
          const expected = inertTest
            ? ['light-before', 'light-after']
            : ['light-before', 'tabbable-host', 'shadow-input', 'light-after'];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: inertTest ? 'inert-tabbable-host' : 'tabbable-host',
          });

          let result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(container, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        // make sure we're not conflicting with valid `scope` attribute on <th> elements
        //  when we're sorting nodes in tab order (we don't test focusable() because
        //  there's no focus order)
        it(`should${inertTest ? ' not' : ''} find${
          inertTest ? ' inert' : ''
        } tabbable scoped headers`, () => {
          const expected = inertTest
            ? []
            : [
                'header-athlete-col',
                'header-swim-col',
                'header-bike-col',
                'header-run-col',
              ];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: inertTest
              ? 'table-with-inert-tabbable-scoped-headers'
              : 'table-with-tabbable-scoped-headers',
          });

          const result = tabbable(container);
          expect(getIdsFromElementsArray(result), 'tabbable').to.eql(expected);
        });

        it(`should${
          inertTest ? ' not' : ''
        } find elements inside shadow dom when directly querying the${
          inertTest ? ' inert' : ''
        } element with shadow root`, () => {
          const expected = inertTest ? [] : ['shadow-input'];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'shadow-input',
          });
          const shadowElement = container.querySelector('test-shadow');
          shadowElement.inert = inertTest;

          let result = tabbable(shadowElement, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(shadowElement, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it(`should${
          inertTest ? ' not' : ''
        } find elements inside shadow dom when directly querying the${
          inertTest ? ' inert' : ''
        } element with shadow root (include container)`, () => {
          const expected = inertTest ? [] : ['shadow-host', 'shadow-input'];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'shadow-input',
          });
          const shadowElement = container.querySelector('test-shadow');
          shadowElement.setAttribute('id', 'shadow-host');
          shadowElement.setAttribute('tabindex', 0);
          shadowElement.inert = inertTest;

          let result = tabbable(shadowElement, {
            getShadowRoot() {},
            includeContainer: true,
          });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(shadowElement, {
            getShadowRoot: true,
            includeContainer: true,
          });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it('should not find elements inside shadow dom that browsers will skip due to -1 tabindex on host', () => {
          const expected = [];
          const { container } = setupFixture(
            fixtures['shadow-dom-untabbable'],
            {
              window,
            }
          );
          const shadowElement = container.querySelector('test-shadow');

          let result = tabbable(shadowElement, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(shadowElement, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        // NOTE: the inert attribute on a <slot> is either inherited by the slotted element,
        //  or respected by the browser as an inert ancestor (either way, the slotted element
        //  ends-up inert too)
        it(`should${
          inertTest ? ' ignore inert' : ' sort'
        } slots inside shadow dom`, () => {
          const expected = inertTest
            ? ['light-before', 'shadow-input', 'light-after']
            : [
                'light-before',
                'light-slotter-before',
                'shadow-input',
                'light-slotter-after',
                'light-slotter-default',
                'default-slot-input',
                'light-after',
              ];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: inertTest
              ? 'light-shadow-with-inert-slots'
              : 'light-shadow-with-slots',
          });

          let result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(container, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it('should sort shadow and light elements separately', () => {
          const expected = [
            'light-first',
            'light-middle',
            'light-last',
            'shadow-first',
            'shadow-middle',
            'shadow-last',
          ];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'light-shadow-tab-index',
          });

          let result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it('should sort slots content by slots tabindex', () => {
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'slots-tab-index',
          });

          let tabbableList = tabbable(container, { getShadowRoot() {} });
          let focusableList = focusable(container, { getShadowRoot() {} });

          expect(
            getIdsFromElementsArray(tabbableList),
            'tabbable, using `() => {}`'
          ).to.eql([
            'light-1',
            'shadow-1',
            'shadow-2',
            'light-2',
            'shadow-3',
            'light-3',
          ]);
          expect(
            getIdsFromElementsArray(focusableList),
            'focusable, using `() => {}`'
          ).to.eql([
            'shadow-3',
            'light-3',
            'light-2',
            'light-1',
            'shadow-2',
            'shadow-1',
          ]);

          tabbableList = tabbable(container, { getShadowRoot: true });
          focusableList = focusable(container, { getShadowRoot: true });

          expect(
            getIdsFromElementsArray(tabbableList),
            'tabbable, using `true`'
          ).to.eql([
            'light-1',
            'shadow-1',
            'shadow-2',
            'light-2',
            'shadow-3',
            'light-3',
          ]);
          expect(
            getIdsFromElementsArray(focusableList),
            'focusable, using `true`'
          ).to.eql([
            'shadow-3',
            'light-3',
            'light-2',
            'light-1',
            'shadow-2',
            'shadow-1',
          ]);
        });

        it('should insert slots nested content according to slot positions', () => {
          const expected = [
            'light-1',
            'light-2',
            'light-3',
            'shadow-between',
            'light-4',
            'light-5',
            'light-6',
          ];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'slots-nested-tab-index',
          });

          let result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(container, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it(`should query nested shadow doms for slots${
          inertTest ? ' (inert test)' : ''
        }`, () => {
          const expected = inertTest
            ? ['shadow-outter-before', 'shadow-inner', 'shadow-outter-after']
            : [
                'shadow-outter-before',
                'shadow-inner',
                'light-slotted-input',
                'shadow-outter-after',
              ];

          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: inertTest
              ? 'inert-slotted-through-multiple-shadows'
              : 'slotted-through-multiple-shadows',
          });

          let result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(container, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it(`should${inertTest ? ' not' : ''} find elements inside${
          inertTest ? ' inert' : ''
        } slot`, () => {
          const expected = inertTest ? [] : ['light-slotter-before'];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: inertTest
              ? 'light-shadow-with-inert-slots'
              : 'light-shadow-with-slots',
          });
          const shadowElement = container.querySelector('test-shadow');
          const slot = shadowElement.shadowRoot.querySelector(
            'slot[name="before"]'
          );

          let result = tabbable(slot, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(slot, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        // (i.e. slot with tabindex should be ignored; only slotted element should be found)
        it('should not find slot with tabindex', () => {
          const expected = ['light-slotter-before'];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'light-shadow-with-slots',
          });
          const shadowElement = container.querySelector('test-shadow');
          const slot = shadowElement.shadowRoot.querySelector(
            'slot[name="before"]'
          );
          slot.id = 'slot-id';
          slot.tabIndex = '1';

          let result = tabbable(slot, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(slot, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it('should filter un-tabbable elements', () => {
          const expected = [
            'shadow-summary',
            'shadow-details-without-summary',
            'shadow-radio-checked',
          ];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'filter-conditions',
          });

          let result = tabbable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = tabbable(container, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it('should filter un-focusable elements', () => {
          const expected = [
            'shadow-summary',
            'shadow-details-without-summary',
            'shadow-radio-unchecked',
            'shadow-radio-checked',
            'shadow-negative-tabindex',
          ];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'filter-conditions',
          });

          let result = focusable(container, { getShadowRoot() {} });
          expect(getIdsFromElementsArray(result), 'using `() => {}`').to.eql(
            expected
          );

          result = focusable(container, { getShadowRoot: true });
          expect(getIdsFromElementsArray(result), 'using `true`').to.eql(
            expected
          );
        });

        it(`should accept shadow root in order to query closed shadows${
          inertTest ? ' (inert test)' : ''
        }`, () => {
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: inertTest
              ? 'closed-inert-shadow-input'
              : 'closed-shadow-input',
          });

          const providedShadowRoot = tabbable(container, {
            getShadowRoot(node) {
              return node.closedShadowRoot;
            },
          });
          const noKnowlegeOfShadowRootFn = tabbable(container, {
            getShadowRoot(_node) {
              return false;
            },
          });
          const noKnowlegeOfShadowRootTrue = tabbable(container, {
            getShadowRoot: true,
          });
          const undisclosedShadowRoot = tabbable(container, {
            getShadowRoot(_node) {
              return true;
            },
          });

          expect(
            getIdsFromElementsArray(providedShadowRoot),
            'provided shadow root'
          ).to.eql([
            'light-before',
            ...(inertTest ? [] : ['shadow-input']),
            'light-slotted',
            'light-after',
          ]);
          expect(
            getIdsFromElementsArray(noKnowlegeOfShadowRootFn),
            'no knowledge of shadow root, using `() => false`'
          ).to.eql(['light-slotted', 'light-before', 'light-after']);
          expect(
            getIdsFromElementsArray(noKnowlegeOfShadowRootTrue),
            'no knowledge of shadow root, using `true`'
          ).to.eql(getIdsFromElementsArray(noKnowlegeOfShadowRootFn));
          expect(
            getIdsFromElementsArray(undisclosedShadowRoot),
            'undisclosed shadow root'
          ).to.eql(['light-before', 'light-slotted', 'light-after']);
        });

        // NOTE: this test shows that tabbable() and focusable() will not find
        //  query-light-input-slotted whether we give the closed shadow root to look at
        //  or not, because it's slotted into a 'display: none' container inside
        //  the close shadow dom
        it('should not match elements in a non display slot', () => {
          const expected = [];
          const { container } = setupFixture(fixtures.shadowDomQuery, {
            window,
            caseId: 'query-slot-display-none-closed-shadow',
          });

          expect(
            getIdsFromElementsArray(
              focusable(container),
              'focusable no options (shadow support disabled) should not find'
            )
          ).to.eql(expected);

          expect(
            getIdsFromElementsArray(
              focusable(container, {
                getShadowRoot(node) {
                  return node.closedShadowRoot;
                },
              }),
              'focusable with options should not find because slot container is hidden'
            )
          ).to.eql(expected);

          expect(
            getIdsFromElementsArray(
              tabbable(container),
              'tabbable no options (shadow support disabled) should not find'
            )
          ).to.eql(expected);

          expect(
            getIdsFromElementsArray(
              tabbable(container, {
                getShadowRoot(node) {
                  return node.closedShadowRoot;
                },
              }),
              'tabbable with options should not find because slot container is hidden'
            )
          ).to.eql(expected);
        });
      });
    });
  });
});
