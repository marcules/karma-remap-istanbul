const chai = require('chai');

const expect = chai.expect;
const karmaRemapIstanbul = require('../');

describe('karma-remap-istanbul', () => {
  it('should be a test', () => {
    expect(Boolean(karmaRemapIstanbul)).to.equal(true);
  });
});
