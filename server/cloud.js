var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

var doc = new GoogleSpreadsheet('1WPPUAZ60XPeXfB8TO7Ybi3HczcaFDodZuY5u04DXCFY');

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
    "getLastN":getLastN,
    "addRow":addRow
};
/*
addRow({
    'temperature': 2,
    'moisture': 2,
    'light': 2,
    'time': 2
})
getLastN(2,callback);

function callback(rows) {
    for (var i = 0; i < rows.length; i++) {
        console.log(rows[i].temperature + " " +
            rows[i].moisture + " " +
            rows[i].light + " " +
            rows[i].time);
    }
}*/