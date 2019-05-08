/*
* Used for testing purposes only. Driver configurations, especially those with apiKeys should
* be passed directly into the getConnectedDriver function by an external client.
*/
const config = {
  drivers: {
    scopus: {
      /* Do not commit with a valid apiKey. */
      apiKey: '95b32c5ac320f88318b3af2c5c862357',
    }
  }
}

module.exports = config;