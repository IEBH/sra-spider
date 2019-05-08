const axios = require('axios');
const paginate = require('../utils/paginate');

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
   * @param {string} eid
   * @returns {Promise<Object[]>}
   */
  const getForwardCitations = async (eid) => {
    const pages = await paginate(async ({ page, pageSize }) => {

      const response = await client.get('/search/scopus', {
        params: {
          /* This is the undocumented query field that enables fetching of forward citations. */
          query: `refeid(${eid})`,
        }
      });
  
      const results = response.data['search-results'];
  
      if (results['opensearch:totalResults'] === "0") {
        return { 
          total: 0, data: [],
        };
      }
  
      const { entry: scopusCitations } = results;
      return {
        total: results['opensearch:totalResults'],
        data: scopusCitations,
      }

    }, {
      page: 0, pageSize: 1000,
    })

    return pages.reduce((citations, page) => [...citations, ...page.data.map(parseScopusCitationToSra)], []);
  }

  /**
   * @param {string} direction
   * @returns {function}
   */
  const getCitationsFactory = (direction) => {
    switch (direction) {
      case 'forwards': return getForwardCitations;
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