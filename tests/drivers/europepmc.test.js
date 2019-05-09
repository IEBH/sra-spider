const chai = require('chai');
const EuropepmcDriver = require('../../drivers/europepmc');

const { expect } = chai;

describe('europepmc - spiderCitation', () => {
  const europepmcDriver = EuropepmcDriver();

  it('should return an empty array if the citation does not have a pmid field.', async () => {
    const citation = { title: 'Example' };

    try {
      const chainedCitations = await europepmcDriver.spiderCitation(citation, {
        directions: ['backwards', 'forwards'],
      })
      expect(chainedCitations.length).to.equal(0);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })
  
  it('should return a list of backward citations given a pmid.', async () => {
    const citation = { pmid: '19826172' };

    try {
      const backwardChainedCitation = await europepmcDriver.spiderCitation(citation, {
        directions: ['backwards'],
      });
      expect(backwardChainedCitation.length).to.be.at.least(56);
    } catch (error) {
      expect(error).to.be.not.ok;
    }  
  })

  it('should return a list of forward citations given a pmid.', async () => {
    const citation = { pmid: '19826172' };

    try {
      const forwardChainedCitation = await europepmcDriver.spiderCitation(citation, {
        directions: ['forwards'],
      });
      expect(forwardChainedCitation.length).to.be.at.least(134);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })

  it('should return a list resulting from a multi direction call that is equivalent multiple single direction calls.', async () => {
    const citation = { pmid: '19826172' };

    try {
      const backwardChainedCitations = await europepmcDriver.spiderCitation(citation, {
        directions: ['backwards'],
      })
  
      const forwardChainedCitations = await europepmcDriver.spiderCitation(citation, {
        directions: ['forwards'],
      })
  
      const chainedCitations = await europepmcDriver.spiderCitation(citation, {
        directions: ['backwards', 'forwards'],
      });

      expect(chainedCitations.length).to.equal(backwardChainedCitations.length + forwardChainedCitations.length);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })

})