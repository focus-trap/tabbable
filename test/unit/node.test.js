const { isFocusable, isTabbable } = require('../../src/index.js');

describe('tabbable unit tests', () => {
  it('should throw with no input node', () => {
    expect(() => isFocusable()).toThrow();
    expect(() => isTabbable()).toThrow();
  });
});
