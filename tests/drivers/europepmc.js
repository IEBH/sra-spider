const chai = require('chai');
const EuropepmcDriver = require('../../drivers/europepmc');

const { expect } = chai;

describe('getConnectedCitations', () => {
  const europepmcDriver = EuropepmcDriver();

  it('should return an empty array if the citation does not have a pmid field.', async () => {
    const citation = { title: 'Example' };

    try {
      const citations = await europepmcDriver.getConnectedCitations(citation, {
        directions: ['backwards', 'forwards'],
      })
      expect(citations.length).to.equal(0);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })

})