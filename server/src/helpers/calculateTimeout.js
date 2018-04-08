const rp = require('request-promise');
const takeDecision = require('../helpers/takeDecision');

/**
 * Calculates how many iterations until the decision needs to be changed
 * @param {Object} currentReadings
 * @param {Object} predictedReadings
 * @returns {integer} iterations
 */
const calculateIterations = (currentReadings, predictedReadings) => {
  const { length } = currentReadings.temperature;
  const currentDecision = takeDecision(
    currentReadings.temperature[length - 1],
    currentReadings.moisture[length - 1],
    currentReadings.light[length - 1], 0
  );
  for (let i = 0; i < predictedReadings.temperature.length; i += 1) {
    const decision = takeDecision(
      predictedReadings.temperature[i],
      predictedReadings.moisture[i],
      predictedReadings.light[i], 0
    );
    // console.log(currentDecision, decision);
    if (currentDecision !== decision) {
      return i;
    }
  }
  return predictedReadings.length;
};

/**
 * Calculates how long should the board sleep.
 * @param {object} Object containing last 6 readings
 * @returns {Promise} Number of cycles to sleep (1-6)
*/
const calculateTimeout = (readings) => {
  const slicedQuery = {
    temperature: readings.temperature,
    moisture: readings.moisture,
    light: readings.light
  };

  const options = {
    method: 'POST',
    uri: 'http://localhost:5000',
    body: slicedQuery,
    json: true
  };

  return rp(options)
    .then((predictedReadings) => {
      // console.log(res);
      const iterations = calculateIterations(readings, predictedReadings);
      return String(iterations);
    })
    .catch((err) => {
      console.log(err);
      return '1';
    });
};

module.exports = calculateTimeout;
