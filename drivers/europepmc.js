const axios = require('axios');

const BASE_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

/**
 * @returns {Object}
 */
const EuropepmcDriver = () => {
  const database = 'europepmc';

  const client = axios.create({
    baseURL: BASE_URL,
  })

  /**
   * @param {string} direction
   * @returns {function}
   */
  const getCitationsFactory = (direction) => {
    switch (direction) {
      case 'backwards': return () => Promise.resolve([]);
      case 'forwards': return () => Promise.resolve([]);
      /* If the direction is not supported,  */
      default: return () => Promise.resolve([]);
    }
  }

  /**
   * @param {Object} citation 
   * @param {Object} options 
   * @param {string[]} options.directions
   * @returns {Promise<Object[]>}
   */
  const getConnectedCitations = async (citation, options) => {
    if (!citation.pmid) return [];

    return (await Promise.all(options.directions.map(async direction => {
      const connectedCitationsInDirection = await getCitationsFactory(direction)(citation.pmid);

      console.log(`pmid: ${citation.pmid}, Database: ${database}, Direction: ${direction}, Total: ${connectedCitationsInDirection.length}`);
      
      return connectedCitationsInDirection;   
    }))).reduce((a, b) => [...a, ...b], []);
  }

  return {
    database,
    getConnectedCitations,
  }
}

module.exports = EuropepmcDriver;
