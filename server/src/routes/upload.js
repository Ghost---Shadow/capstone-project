const { uploadToDatabase, fetchReadingsFromDatabase } = require('../helpers/database');
const { uploadToCloud } = require('../helpers/cloud');
const takeDecision = require('../helpers/takeDecision');
const calculateTimeout = require('../helpers/calculateTimeout');

const { forced } = require('./force');

/**
 * Expected format
 * /upload?t=1023&m=1023&l=1023
 * t : temperature 0 - 1023
 * m : moisture 0 - 1023
 * l : light 0 - 1023
 */
const upload = (req, res) => {
  const temperature = parseInt(req.query.t, 10);
  const moisture = parseInt(req.query.m, 10);
  const light = parseInt(req.query.l, 10);
  const time = Math.floor(new Date() / 1000);

  // Asynchronously uploads the readings to the database
  uploadToDatabase(temperature, moisture, light, time);

  // Asynchronously uploads the moving average to the cloud
  uploadToCloud(temperature, moisture, light, time);

  // Take the decision
  const decision = takeDecision(temperature, moisture, light, forced.value);

  fetchReadingsFromDatabase(6)
    .then(calculateTimeout)
    .then((timeout) => {
      console.log(
        'T: %d\tM: %d\tL: %d\t%s%s - %d',
        temperature, moisture, light, decision, timeout, time,
      );
      res.send(`${decision}${timeout}`);
    });
};

module.exports.upload = upload;
