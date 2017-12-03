var express = require('express');
var app = express();

// Listen to port 8080 http port
app.listen(8080, function () {
  console.log('Listening for connections');
});

// Host the public folder for testing
app.use(express.static('public'));

// Get Handle for MongoDB through mongoose
var mongoose = require('mongoose');

// Use native Node promises
mongoose.Promise = global.Promise;

// connect to MongoDB
mongoose
  .connect('mongodb://localhost/CapstoneProject', {
    useMongoClient: true
  })
  .then(() => console.log('Connection succesful'))
  .catch((err) => console.error(err));

// Load the Metrics module
var Metrics = require('./models/Metrics.js');

// Load cloud connection
var cloud = require('./cloud.js');

// Load decision module
var decisionModule = require('./decision.js');

// Forced on actuators
var forced = 0;

// Moving average
var averageWindow = 5
var averages = {
  "temperature": [],
  "moisture": [],
  "light": [],
  "time": []
};

/**
 * Converts array of dicts to dict of arrays
 * @param {array} metrics 
 */
function reshape(metrics) {
  var result = {
    "temperature": [],
    "moisture": [],
    "light": [],
    "time": []
  };
  for (var i = 0; i < metrics.length; i++) {
    result["temperature"].push(metrics[i].temperature);
    result["moisture"].push(metrics[i].moisture);
    result["light"].push(metrics[i].light);
    result["time"].push(metrics[i].time);
  }
  return result;
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
    r = {
      'temperature': parseInt(getAverage(averages.temperature)),
      'moisture': parseInt(getAverage(averages.moisture)),
      'light': parseInt(getAverage(averages.light)),
      'time': parseInt(getAverage(averages.time))
    };
    cloud.addRow(r);
    console.log(r);
    averages.temperature = [];
    averages.moisture = [];
    averages.light = [];
    averages.time = [];
  }
}

function getAverage(x) {
  return x.reduce(function (a, b) {
    return a + b
  }) / x.length;
}

/**
 * Uploads dict to database
 * @param {Number} temperature 0-1023
 * @param {Number} moisture 0-1023
 * @param {Number} light 0-1023
 * @param {Number} time Unix Epoch (seconds)
 */
function uploadToDatabase(temperature, moisture, light, time) {
  var newMetric = new Metrics({
    "temperature": temperature,
    "moisture": moisture,
    "light": light,
    "time": time
  });
  newMetric.save(function (err) {
    if (err) return console.log(err);
  })
}

/**
 * Expected format
 * /upload?t=1023&m=1023&l=1023
 * t : temperature 0 - 1023
 * m : moisture 0 - 1023
 * l : light 0 - 1023
 */
app.get('/upload', function (req, res) {
  var temperature = parseInt(req.query.t);
  var moisture = parseInt(req.query.m);
  var light = parseInt(req.query.l);
  var time = Math.floor(new Date() / 1000);

  uploadToDatabase(temperature, moisture, light, time);
  uploadToCloud(temperature, moisture, light, time);
  decision = decisionModule.takeDecision(temperature, moisture, light, forced);

  console.log("T: %d\tM: %d\tL: %d\t%s - %d", temperature, moisture, light, decision, time);
  res.send(decision);
});

/**
 * Expected format
 * /getJson?fetches=50
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
app.get('/getJson', function (req, res) {
  var fetches = 50;
  try {
    fetches = parseInt(req.query.fetches);
  } catch (e) {}

  Metrics
    .find()
    .sort({
      "time": -1
    })
    .limit(fetches)
    .exec(function (err, metrics) {
      result = reshape(metrics);
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
app.get('/getCloud', function (req, res) {
  var fetches = 10;
  try {
    fetches = parseInt(req.query.fetches);
  } catch (e) {}

  cloud.getLastN(fetches, function (rows) {
    result = reshape(rows);
    res.json(result);
  });
});

/**
 * Format
 * /force?f=7
 * b000 to b111
 * FAN - PUMP - LIGHT
 */
app.get('/force', function (req, res) {
  try {
    forced = parseInt(req.query.f);
    res.send(forced + "");
    console.log("Forced: " + forced);
  } catch (e) {
    forced = 0;
    res.send(e);
  }
});