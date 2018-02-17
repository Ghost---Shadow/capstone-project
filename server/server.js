const express = require('express');

const app = express();

// Listen to port 8080 http port
app.listen(8080, () => {
  console.log('Listening for connections');
});

// Host the public folder for testing
app.use(express.static('public'));

// Get Handle for MongoDB through mongoose
const mongoose = require('mongoose');

// Use native Node promises
mongoose.Promise = global.Promise;

// connect to MongoDB
mongoose
  .connect('mongodb://localhost/CapstoneProject', {
    useMongoClient: true,
  })
  .then(() => console.log('Connection succesful'))
  .catch(err => console.error(err));

// Load the Metrics module
const Metrics = require('./models/Metrics');

// Load cloud connection
const cloud = require('./cloud');

// Load decision module
const decisionModule = require('./decision');

// Load the timeout module
const calculateTimeout = require('./calculateTimeout');

// Forced on actuators
let forced = 0;

// Moving average
const averageWindow = 5;
const averages = {
  temperature: [],
  moisture: [],
  light: [],
  time: [],
};

/**
 * Converts array of dicts to dict of arrays
 * @param {array} metrics
 */
function reshape(metrics) {
  const result = {
    temperature: [],
    moisture: [],
    light: [],
    time: [],
  };
  for (let i = 0; i < metrics.length; i += 1) {
    result.temperature.push(metrics[i].temperature);
    result.moisture.push(metrics[i].moisture);
    result.light.push(metrics[i].light);
    result.time.push(metrics[i].time);
  }
  return result;
}

function getAverage(x) {
  return x.reduce((a, b) => a + b) / x.length;
}

/**
 * Takes average of a window length and uploads average to cloud
 * @param {Number} temperature 0-1023
 * @param {Number} moisture 0-1023
 * @param {Number} light 0-1023
 * @param {Number} time Unix Epoch (seconds)
 */
function uploadToCloud(temperature, moisture, light, time) {
  averages.temperature.push(temperature);
  averages.moisture.push(moisture);
  averages.light.push(light);
  averages.time.push(time);

  if (averages.temperature.length > averageWindow) {
    const row = {
      temperature: parseInt(getAverage(averages.temperature), 10),
      moisture: parseInt(getAverage(averages.moisture), 10),
      light: parseInt(getAverage(averages.light), 10),
      time: parseInt(getAverage(averages.time), 10),
    };
    cloud.addRow(row);
    console.log(row);
    averages.temperature = [];
    averages.moisture = [];
    averages.light = [];
    averages.time = [];
  }
}

/**
 * Uploads dict to database
 * @param {Number} temperature 0-1023
 * @param {Number} moisture 0-1023
 * @param {Number} light 0-1023
 * @param {Number} time Unix Epoch (seconds)
 */
function uploadToDatabase(temperature, moisture, light, time) {
  const newMetric = new Metrics({
    temperature,
    moisture,
    light,
    time,
  });
  newMetric.save((err) => {
    if (err) { console.log(err); }
  });
}

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
function fetchReadingsFromDatabase(fetches) {
  return Metrics
    .find()
    .sort({
      time: -1,
    })
    .limit(fetches)
    .exec((err, metrics) => (metrics))
    .then(metrics => reshape(metrics));
}

/**
 * Expected format
 * /upload?t=1023&m=1023&l=1023
 * t : temperature 0 - 1023
 * m : moisture 0 - 1023
 * l : light 0 - 1023
 */
app.get('/upload', (req, res) => {
  const temperature = parseInt(req.query.t, 10);
  const moisture = parseInt(req.query.m, 10);
  const light = parseInt(req.query.l, 10);
  const time = Math.floor(new Date() / 1000);

  uploadToDatabase(temperature, moisture, light, time);
  uploadToCloud(temperature, moisture, light, time);
  const decision = decisionModule.takeDecision(temperature, moisture, light, forced);

  fetchReadingsFromDatabase(6)
    .then(calculateTimeout)
    .then((timeout) => {
      console.log(
        'T: %d\tM: %d\tL: %d\t%s%s - %d',
        temperature, moisture, light, decision, timeout, time,
      );
      res.send(`${decision}${timeout}`);
    });
});


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
app.get('/getJson', (req, res) => {
  let fetches = 10;
  try {
    fetches = parseInt(req.query.fetches, 10);
  } catch (e) {
    throw e;
  }
  fetchReadingsFromDatabase(fetches)
    .then((result) => {
      res.json(result);
    });
});

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
app.get('/getCloud', (req, res) => {
  let fetches = 10;
  try {
    fetches = parseInt(req.query.fetches, 10);
  } catch (e) {
    throw e;
  }

  cloud.getLastN(fetches, (rows) => {
    const result = reshape(rows);
    res.json(result);
  });
});

/**
 * Format
 * /force?f=7
 * b000 to b111
 * FAN - PUMP - LIGHT
 */
app.get('/force', (req, res) => {
  try {
    forced = parseInt(req.query.f, 10);
    res.send(`${forced}`);
    console.log(`Forced: ${forced}`);
  } catch (e) {
    forced = 0;
    res.send(e);
  }
});
