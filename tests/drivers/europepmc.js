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
  
  it('should return a list of backward citations given a pmid.', async () => {
    const citation = { pmid: '19826172' };

    try {
      const citations = await europepmcDriver.getConnectedCitations(citation, {
        directions: ['backwards'],
      });
      expect(citations.length).to.be.at.least(56);
    } catch (error) {
      expect(error).to.be.not.ok;
    }  
  })

  it('should return a list of forward citations given a pmid.', async () => {
    const citation = { pmid: '19826172' };

    try {
      const citations = await europepmcDriver.getConnectedCitations(citation, {
        directions: ['forwards'],
      });
      expect(citations.length).to.be.at.least(134);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })

  it('should return a list of connected citations using multiple directions matching of the sum of the individual directions.', async () => {
    const citation = { pmid: '19826172' };

    let numberOfConnectedCitations = 0;

    try {
      numberOfConnectedCitations += (await europepmcDriver.getConnectedCitations(citation, {
        directions: ['backwards'],
      })).length;
  
      numberOfConnectedCitations += (await europepmcDriver.getConnectedCitations(citation, {
        directions: ['forwards'],
      })).length;
  
      const citations = await europepmcDriver.getConnectedCitations(citation, {
        directions: ['backwards', 'forwards'],
      });

      expect(citations.length).to.equal(numberOfConnectedCitations);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })

})