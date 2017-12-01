var express = require('express');
var app = express();

// Listen to port 8080 http port
app.listen(8080, function () {
  console.log('Listening for connections');
});

// Host the public folder 
app.use(express.static('public'));

// Take decision based on readings (TODO)
function takeDecision(temperature, moisture, light) {
  var decision = "";
  decision += temperature > 512 ? "1" : "0";
  decision += moisture > 512 ? "1" : "0";
  decision += light > 512 ? "1" : "0";
  return decision;
}

function uploadToDatabase(temperature, moisture, light) {
  // TODO
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
 * JSON Format
 * {
 *  "temperature":[353,434,545,...,343],
 *  "moisture":[353,434,545,...,343],
 *  "light":[353,434,545,...,343],
 * }
 */
app.get('/getJson', function (req, res) {
  // TODO: Load from database
  data = {
    "temperature": [353, 434, 545, 343],
    "moisture": [353, 434, 545, 343],
    "light": [353, 434, 545, 343],
  };
  res.send(JSON.stringify(data));
});