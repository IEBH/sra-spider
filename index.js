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
const spiderCitations = async (citations, options) => {
  const selectedDrivers = options.drivers.map(driver => driversByDatabase[driver.database](driver.config));
  
  console.log(`Started spidering ${citations.length} citations`);

  const chainedCitations = (await Promise.all(citations.map(async (citation, index) => {
    /* Simple throttle to delay execution a 1 second multipled by the current index. */
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
