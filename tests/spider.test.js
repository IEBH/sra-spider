const chai = require('chai');
const spider = require('../index');
const config = require('./config');

const { expect } = chai;

describe('spider - spiderCitations', () => {
  it('should return a list resulting from a multi driver call that is equivalent multiple single driver calls.', async () => {
    const citations = [{ 
      pmid: '19826172',
      eid: '2-s2.0-70349611684',
    }];

    try {
      const europepmcChainedCitations = await spider.spiderCitations(citations, {
        drivers: [
          { database: 'europepmc' },
        ],
        directions: ['backwards', 'forwards'],
      })
  
      const scopusChainedCitations = await spider.spiderCitations(citations, {
        drivers: [
          { database: 'scopus', config: config.drivers.scopus },
        ],
        directions: ['backwards', 'forwards'],
      })
  
      const chainedCitations = await spider.spiderCitations(citations, {
        drivers: [
          { database: 'europepmc' },
          { database: 'scopus', config: config.drivers.scopus },
        ],
        directions: ['backwards', 'forwards'],
      });

      expect(chainedCitations.length).to.equal(europepmcChainedCitations.length + scopusChainedCitations.length);
    } catch (error) {
      console.log(error);
      expect(error).to.be.not.ok;
    }
  })
})