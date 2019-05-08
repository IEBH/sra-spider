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

  const getConnectedCitations = async () => {
    return Promise.resolve([]);
  }

  return {
    getConnectedCitations,
  }
}

module.exports = EuropepmcDriver;
