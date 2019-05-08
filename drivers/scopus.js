const axios = require('axios');

const BASE_URL = 'https://api.elsevier.com/content';

const scopusToSraFields = {
  'prism:doi': 'doi',
  'dc:title': 'title',
  'prism:publicationName': 'journal',
  eid: 'eid',
  'pubmed-id': 'pmid',
  'prism:pageRange': 'pages',
  'prism:volume': 'volume',
  'prism:aggregationType': 'type',
  'prism:coverDate': 'date',
  'dc:creator': 'authors',
}

/**
 * @param {Object} scopusCitation
 * @returns {Object}
 */
const parseScopusCitationToSra = (scopusCitation) => {
  if (!scopusCitation) return null;  

  const sraCitation = {};

  Object.keys(scopusCitation)
    .filter(field => scopusToSraFields.hasOwnProperty(field))
    .forEach(field => {
      sraCitation[scopusToSraFields[field]] = scopusCitation[field];
    })

  return sraCitation;
}

/**
 * @param {Object} config
 * @param {string} config.apiKey
 * @returns {Object}
 */
const ScopusDriver = (config) => {
  const database = 'scopus';

  if (!config.apiKey) {
    throw new Error('Please provide an api key to access the Scopus api.');
  }

  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-ELS-APIKey': config.apiKey,
    },
  });

  /**
   * @param {string} direction
   * @returns {function}
   */
  const getCitationsFactory = (direction) => {
    switch (direction) {
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
    if (!citation.eid) return [];

    return (await Promise.all(options.directions.map(async direction => {
      const connectedCitationsInDirection = await getCitationsFactory(direction)(citation.eid);

      console.log(`eid: ${citation.eid}, Database: ${database}, Direction: ${direction}, Total: ${connectedCitationsInDirection.length}`);
      
      return connectedCitationsInDirection;   
    }))).reduce((a, b) => [...a, ...b], []);
  }

  return {
    database,
    getConnectedCitations,
  }
}

module.exports = ScopusDriver;