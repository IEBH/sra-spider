const chai = require('chai');
const ScopusDriver = require('../../drivers/scopus');
const config = require('../config');

/* NOTE: These tests will fail if the config for this driver has not been defined. */

const { expect } = chai;

describe('getConnectedCitations', () => {
  const scopusDriver = ScopusDriver(config.drivers.scopus);

  it('should return an empty array if the citation does not have an eid field.', async () => {
    const citation = { title: 'Example' };

    try {
      const citations = await scopusDriver.getConnectedCitations(citation, {
        directions: ['forwards'],
      })
      expect(citations.length).to.equal(0);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })

});