/*
* Used for testing purposes only. Driver configurations, especially those with apiKeys should
* be passed directly into the getConnectedDriver function by an external client.
*/
const config = {
  drivers: {
    scopus: {
      /* Do not commit with a valid apiKey. */
      apiKey: '',
    }
  }
}

module.exports = config;