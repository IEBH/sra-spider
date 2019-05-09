const EuropepmcDriver = require('./drivers/europepmc');
const ScopusDriver = require('./drivers/scopus');

const driversByDatabase = {
  europepmc: EuropepmcDriver,
  scopus: ScopusDriver,
}

const supportedDirections = ['backwards', 'forwards'];

/**
 * @param {Object[]} citations
 * @param {Options} options 
 * @param {string[]} options.directions
 * @param {string} options.drivers.database
 * @param {Object} options.drivers.config
 * @returns {Object[]}
 */
const spiderCitations = async (citations, options) => {
  if (!options.directions || options.directions.length === 0) {
    throw new Error('At least one direction must be specified.');
  }
  
  if (!options.directions.every(direction => supportedDirections.includes(direction))) {
    throw new Error('Please provide a valid direction.');
  }

  if (!options.drivers || options.drivers.length === 0) {
    throw new Error('At least driver must be specified.');
  } 

  if (!options.drivers.every(driver => Object.keys(driversByDatabase).includes(driver.database))) {
    throw new Error('Please provide a valid driver.');
  }

  const selectedDrivers = options.drivers.map(driver => driversByDatabase[driver.database](driver.config));
  
  console.log(`Started spidering ${citations.length} citations`);

  const chainedCitations = (await Promise.all(citations.map(async (citation, index) => {
    /* 
    * Delays execution for each citation by its index multiplied by a constant number of ms. This allows spidering per citation 
    * to occur asynchronously but with a sequential offset. 
    * 
    * This is kinder to the databases and avoids rate limiting issues.
    * */
    await new Promise((resolve) => {
      setTimeout(resolve, index * 1000);
    })

    const chainedCitationsByDriver = {};
  
    await Promise.all(selectedDrivers.map(async driver => {
      try {
        chainedCitationsByDriver[driver.database] = await driver.spiderCitation(citation, {
          directions: options.directions,
        });
      } catch (error) {
        console.log(error);
      }
    }));

    return Object.values(chainedCitationsByDriver).reduce((a, b) => [...a, ...b], []);
  }))).reduce((a, b) => [...a, ...b], []);

  console.log(`Finished spidering`);

  return chainedCitations;
}

const spider = {
  spiderCitations,
}

module.exports = spider;
