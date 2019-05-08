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
   * @param {Object} citation 
   * @param {Object} options 
   * @param {string[]} options.directions
   * @returns {Promise<Object[]>}
   */
  const getConnectedCitations = async (citation, options) => {
    if (!citation.pmid) return [];

    return Promise.resolve([]);
  }

  return {
    getConnectedCitations,
  }
}

module.exports = EuropepmcDriver;
