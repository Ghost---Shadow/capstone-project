const { force } = require('./force');
const { getCloud } = require('./getCloud');
const { getJson } = require('./getJson');
const { upload } = require('./upload');

module.exports = (app) => {
  app.get('/force', force);
  app.get('/getCloud', getCloud);
  app.get('/getJson', getJson);
  app.get('/upload', upload);
};
