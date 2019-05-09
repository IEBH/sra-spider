const chai = require('chai');
const ScopusDriver = require('../../drivers/scopus');
const config = require('../config');

/* NOTE: These tests will fail if the config for this driver has not been defined. */

const { expect } = chai;

describe('scopus - spiderCitation', () => {
  const scopusDriver = ScopusDriver(config.drivers.scopus);

  it('should return an empty array if the citation does not have an eid field.', async () => {
    const citation = { title: 'Example' };

    try {
      const forwardChainedCitations = await scopusDriver.spiderCitation(citation, {
        directions: ['forwards'],
      })
      expect(forwardChainedCitations.length).to.equal(0);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })

  it('should return an empty list when requesting the non-supported backwards direction.', async () => {
    const citation = { eid: '2-s2.0-70349611684' };

    try {
      const backwardChainedCitations = await scopusDriver.spiderCitation(citation, {
        directions: ['backwards'],
      });
      expect(backwardChainedCitations.length).to.equal(0);
    } catch (error) {
      expect(error).to.be.not.ok;
    }  
  })

  it('should return a list of forward citations given an eid.', async () => {
    const citation = { eid: '2-s2.0-70349611684' };

    try {
      /* This citation has 50 forward references according to scopus. */
      const forwardChainedCitations = await scopusDriver.spiderCitation(citation, {
        directions: ['forwards'],
      });
      expect(forwardChainedCitations.length).to.equal(50);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })
})