const rp = require('request-promise');

/**
 * Calculates how long should the board sleep
 * @param {object} Object containing last 6 readings
 * @returns {string} Number of cycles to sleep (1-6)
*/
const calculateTimeout = (readings) => {
  const slicedQuery = {
    temperature: readings.temperature,
    moisture: readings.moisture,
    light: readings.light,
  };

  const options = {
    method: 'POST',
    uri: 'http://localhost:5000',
    body: slicedQuery,
    json: true,
  };

  return rp(options)
    .then((res) => {
      console.log(res);
      return '6';
    })
    .catch((err) => {
      console.log(err);
      return '1';
    });
};

module.exports = calculateTimeout;
