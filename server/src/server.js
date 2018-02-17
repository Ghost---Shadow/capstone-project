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

// Load all routes
require('./routes')(app);
