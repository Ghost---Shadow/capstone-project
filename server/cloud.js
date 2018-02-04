const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('./client_secret.json');

const doc = new GoogleSpreadsheet('1WPPUAZ60XPeXfB8TO7Ybi3HczcaFDodZuY5u04DXCFY');

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
        console.log(err);
      }
    });
  });
}

module.exports = {
  getLastN,
  addRow,
};
