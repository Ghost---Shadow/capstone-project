const { fetchReadingsFromDatabase } = require('../helpers/database');
const { DEFAULT_FETCHES } = require('../constants/defaults');

/**
 * Expected format
 * /getJson?fetches=10
 * fetches: Number of records to fetch
 *
 * Output JSON Format
 * {
 *  "temperature":[355,233,...,343],
 *  "moisture":[355,233,...,343],
 *  "light":[355,233,...,343],
 *  "time":[355,233,...,343],
 * }
 */
const getJson = (req, res) => {
  let fetches = DEFAULT_FETCHES;
  try {
    fetches = parseInt(req.query.fetches, 10);
  } catch (e) {
    // throw e;
    console.log(e);
  }
  fetchReadingsFromDatabase(fetches)
    .then((result) => {
      res.json(result);
    });
};

module.exports.getJson = getJson;
