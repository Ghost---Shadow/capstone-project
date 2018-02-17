const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../constants/client_secret.json');

const doc = new GoogleSpreadsheet('1WPPUAZ60XPeXfB8TO7Ybi3HczcaFDodZuY5u04DXCFY');

// Moving average
const averageWindow = 5;
const averages = {
  temperature: [],
  moisture: [],
  light: [],
  time: [],
};

function getAverage(x) {
  return x.reduce((a, b) => a + b) / x.length;
}

/**
 * Fetches last n entries, sorted by time
 * @param {Number} n Number of entries to fetch
 * @param {function} callback Callback function after fetch
 */
function getLastN(n, callback) {
  doc.useServiceAccountAuth(creds, (serviceAuthError) => {
    if (serviceAuthError) { throw serviceAuthError; }
    doc.getRows(1, {
      orderby: 'time',
      reverse: true,
      limit: n,
    }, (err, rows) => {
      callback(rows);
    });
  });
}

/**
 * Inserts a row
 * @param {object} row
 */
function addRow(row) {
  doc.useServiceAccountAuth(creds, (serviceAuthError) => {
    if (serviceAuthError) { throw serviceAuthError; }
    doc.addRow(1, row, (err) => {
      if (err) {
        throw err;
      }
    });
  });
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
    addRow(row);
    console.log(row);
    averages.temperature = [];
    averages.moisture = [];
    averages.light = [];
    averages.time = [];
  }
}

module.exports = {
  uploadToCloud,
  getLastN,
};
