var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

var doc = new GoogleSpreadsheet('1WPPUAZ60XPeXfB8TO7Ybi3HczcaFDodZuY5u04DXCFY');

/**
 * Fetches last n entries, sorted by time
 * @param {Number} n Number of entries to fetch
 * @param {function} callback Callback function after fetch
 */
function getLastN(n, callback) {
    doc.useServiceAccountAuth(creds, function (err) {
        doc.getRows(1, {
            orderby: 'time',
            reverse: true,
            limit: n
        }, function (err, rows) {
            callback(rows);
        });
    });
}

/**
 * Inserts a row
 * @param {object} row 
 */
function addRow(row) {
    doc.useServiceAccountAuth(creds, function (err) {
        doc.addRow(1, row, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}

module.exports = {
    "getLastN": getLastN,
    "addRow": addRow
};