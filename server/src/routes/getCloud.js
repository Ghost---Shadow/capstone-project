const { getLastN } = require('../helpers/cloud');
const reshape = require('../helpers/reshape');
const { DEFAULT_FETCHES } = require('../constants/defaults');

/**
 * Expected format
 * /getCloud?fetches=10
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
const getCloud = (req, res) => {
  let fetches = DEFAULT_FETCHES;
  try {
    fetches = parseInt(req.query.fetches, 10);
  } catch (e) {
    // throw e;
    console.log(e);
  }

  getLastN(fetches, (rows) => {
    const result = reshape(rows);
    res.json(result);
  });
};

module.exports.getCloud = getCloud;
