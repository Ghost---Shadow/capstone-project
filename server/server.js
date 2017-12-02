var express = require('express');
var app = express();

// Listen to port 8080 http port
app.listen(8080, function () {
  console.log('Listening for connections');
});

// Host the public folder 
app.use(express.static('public'));

// Get Handle for MongoDB through mongoose
var mongoose = require('mongoose');

// Use native Node promises
mongoose.Promise = global.Promise;

// connect to MongoDB
mongoose
  .connect('mongodb://localhost/CapstoneProject', { useMongoClient: true })
  .then(() => console.log('Connection succesful'))
  .catch((err) => console.error(err));

// Load the Metrics module
var Metrics = require('./models/Metrics.js');

// Forced on
var forced = 0;

// Take decision based on readings (TODO)
// "0b000" = FAN-PUMP-LAMP
function takeDecision(temperature, moisture, light) {
  var decision = 0;
  decision |= temperature > 512 ? (1 << 2) : 0;
  decision |= moisture > 512 ? (1 << 1) : 0;
  decision |= light > 512 ? (1 << 0) : 0;
  decision |= forced;
  return decision + "";
}

function uploadToDatabase(temperature, moisture, light) {
  var newMetric = new Metrics({
    "temperature": temperature,
    "moisture": moisture,
    "light": light,
    "time": Math.floor(new Date() / 1000)
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

  uploadToDatabase(temperature, moisture, light);
  decision = takeDecision(temperature, moisture, light);

  console.log("T: %d\tM: %d\tL: %d\t%s", temperature, moisture, light, decision);
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
 *  "light":[355,233,...,343],
 * }
 */
app.get('/getJson', function (req, res) {
  var result = {
    "temperature": [],
    "moisture": [],
    "light": [],
    "time": []
  };
  var fetches = 50;
  try {
    fetches = parseInt(req.query.fetches);
  } catch (e) { }

  Metrics
    .find()
    .sort({ "time": -1 })
    .limit(fetches)
    .exec(function (err, metrics) {
      //console.log(metrics);
      for (var i = 0; i < metrics.length; i++) {
        result["temperature"].push(metrics[i].temperature);
        result["moisture"].push(metrics[i].moisture);
        result["light"].push(metrics[i].light);
        result["time"].push(metrics[i].time);
      }
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