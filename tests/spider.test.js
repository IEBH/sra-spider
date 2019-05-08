const chai = require('chai');
const spider = require('../index');
const config = require('./config');

const { expect } = chai;

describe('getConnectedCitations', () => {
  it('should return a list of connected citations using multiple drivers matching of the sum of their individual calls.', async () => {
    const citations = [{ 
      pmid: '19826172',
      eid: '2-s2.0-70349611684',
    }];

    let numberOfConnectedCitations = 0;

    try {
      numberOfConnectedCitations += (await spider.getConnectedCitations(citations, {
        drivers: [
          { database: 'europepmc' },
        ],
        directions: ['backwards', 'forwards'],
      })).length;
  
      numberOfConnectedCitations += (await spider.getConnectedCitations(citations, {
        drivers: [
          { database: 'scopus', config: config.drivers.scopus },
        ],
        directions: ['backwards', 'forwards'],
      })).length;

      const connectedCitations = await spider.getConnectedCitations(citations, {
        drivers: [
          { database: 'europepmc' },
          { database: 'scopus', config: config.drivers.scopus },
        ],
        directions: ['backwards', 'forwards'],
      })

      expect(connectedCitations.length).to.equal(numberOfConnectedCitations);
    } catch (error) {
      expect(error).to.be.not.ok;
    }
  })
})