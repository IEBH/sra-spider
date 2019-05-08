const EuropepmcDriver = require('./drivers/europepmc');
const ScopusDriver = require('./drivers/scopus');

const driversByDatabase = {
  europepmc: EuropepmcDriver,
  scopus: ScopusDriver,
}

/**
 * @param {Object[]} citations
 * @param {Options} options 
 * @param {string[]} options.directions
 * @param {string} options.drivers.database
 * @param {Object} options.drivers.config
 * @returns {Object[]}
 */
const getConnectedCitations = async (citations, options) => {
  const selectedDrivers = options.drivers.map(driver => driversByDatabase[driver.database](driver.config));
  
  console.log(`Started spidering ${citations.length} citations`);

  const connectedCitations = (await Promise.all(citations.map(async (citation, index) => {
    const connectedCitationsByDriver = {};
  
    await Promise.all(selectedDrivers.map(async driver => {
      try {
        connectedCitationsByDriver[driver.database] = await driver.getConnectedCitations(citation, {
          directions: options.directions,
        });
      } catch (error) {
        console.log(error);
      }
    }));

    return Object.values(connectedCitationsByDriver).reduce((a, b) => [...a, ...b], []);
  }))).reduce((a, b) => [...a, ...b], []);

  console.log(`Finished spidering`);

  return connectedCitations;
}

const spider = {
  getConnectedCitations,
}

module.exports = spider;
