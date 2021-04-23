import { isTabbable, isFocusable } from '../../src/index.js';
import {
  setupTestWindow,
  removeAllChildNodes,
  setupFixture,
  getFixtures,
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
      expect(isFocusable(shadowRadio1), 'checked in shadow').to.eql(true);
      expect(isFocusable(shadowRadio2), 'not checked in shadow').to.eql(true);
      expect(isFocusable(lightRadio1), 'checked in light').to.eql(true);
      expect(isFocusable(radio2Slotted), 'not checked slotted').to.eql(true);
      expect(isFocusable(lightRadio3), 'not checked in light').to.eql(true);
      // only the first checked is tabbable
      expect(isTabbable(shadowRadio1), 'checked in shadow').to.eql(true);
      expect(isTabbable(shadowRadio2), 'not checked in shadow').to.eql(false);
      expect(isTabbable(lightRadio1), 'checked in light').to.eql(true);
      expect(isTabbable(radio2Slotted), 'not checked slotted').to.eql(false);
      expect(isTabbable(lightRadio3), 'not checked in light').to.eql(false);
    });
  });
});
