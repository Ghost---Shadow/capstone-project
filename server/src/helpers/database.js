const Metrics = require('../models/Metrics');
const reshape = require('./reshape');

/**
 * Uploads dict to database
 * @param {Number} temperature 0-1023
 * @param {Number} moisture 0-1023
 * @param {Number} light 0-1023
 * @param {Number} time Unix Epoch (seconds)
 */
const uploadToDatabase = (temperature, moisture, light, time) => {
  const newMetric = new Metrics({
    temperature,
    moisture,
    light,
    time,
  });
  newMetric.save((err) => {
    if (err) { throw err; }
  });
};

/**
 * Queries the mongodb server and returns a promise which
 * has the last 6 readings
 *
 * Output JSON Format
 * {
 *  "temperature":[355,233,...,343],
 *  "moisture":[355,233,...,343],
 *  "light":[355,233,...,343],
 *  "time":[355,233,...,343],
 * }
 * @param {integer} fetches
 * @returns {Object}
 */
const fetchReadingsFromDatabase = (fetches) => {
  const databaseFetchPromise = Metrics
    .find()
    .sort({
      time: -1,
    })
    .limit(fetches)
    .exec((err, metrics) => (metrics));
  return databaseFetchPromise
    .then(metrics => reshape(metrics));
};

module.exports = {
  uploadToDatabase,
  fetchReadingsFromDatabase,
};
