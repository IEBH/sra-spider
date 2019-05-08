const axios = require('axios');

const BASE_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

const europepmcToSraFields = {
  id: 'pmid',
  pmid: 'pmid',
  pmcid: 'pmcid',
  doi: 'doi',
  title: 'title',
  journalTitle: 'journal',
  pageInfo: 'pages',
  journalVolume: 'volume',
  issue: 'number',
  pubType: 'type',
  pubYear: 'date',
  abstractText: 'abstract',
  authorString: 'authors',
}

/**
 * @param {Object} europepmcCitation
 * @returns {Object}
 */
const parseEuropepmcCitationToSra = (europepmcCitation) => {
  if (!europepmcCitation) return null;  

  const sraCitation = {};

  Object.keys(europepmcCitation)
    .filter(field => europepmcToSraFields.hasOwnProperty(field))
    .forEach(field => {
      sraCitation[europepmcToSraFields[field]] = europepmcCitation[field];
    })

  return sraCitation;
}

/**
 * @returns {Object}
 */
const EuropepmcDriver = () => {
  const database = 'europepmc';

  const client = axios.create({
    baseURL: BASE_URL,
  })

  /**
   * @param {string} pmid
   * @returns {Promise<Object[]>}
   */
  const getBackwardsCitations = async (pmid) => {
    const pages = await paginate(async ({ page, pageSize }) => {

      const response = await client.get(`/MED/${pmid}/references`, {
        params: {
          page, pageSize, format: 'JSON',
        }
      })

      const { hitCount } = response.data;
      if (hitCount === 0) {
        return { 
          total: 0, data: [],
        };      
      }
  
      const { reference: europepmcCitations } = response.data.referenceList;
      return {
        total: hitCount,
        data: europepmcCitations,
      };

    }, {
      page: 1, pageSize: 1000,
    });

    return pages.reduce((citations, page) => [...citations, ...page.data.map(parseEuropepmcCitationToSra)], []);
  }

  /**
   * @param {string} pmid
   * @returns {Promise<Object[]>}
   */
  const getForwardCitations = async (pmid) => {
    const pages = await paginate(async ({ page, pageSize }) => {

      const response = await client.get(`/MED/${pmid}/citations`, {
        params: {
          page, pageSize, format: 'JSON',
        }
      })

      const { hitCount } = response.data;
      if (hitCount === 0) {
        return { 
          total: 0, data: [],
        };       
      }
  
      const { citation: europepmcCitations } = response.data.citationList;
      return {
        total: hitCount,
        data: europepmcCitations,
      };

    }, {
      page: 1, pageSize: 1000,
    });

    return pages.reduce((citations, page) => [...citations, ...page.data.map(parseEuropepmcCitationToSra)], []);
  }

  /**
   * @param {string} direction
   * @returns {function}
   */
  const getCitationsFactory = (direction) => {
    switch (direction) {
      case 'backwards': return getBackwardsCitations;
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
