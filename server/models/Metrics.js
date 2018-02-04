const mongoose = require('mongoose');

const MetricsSchema = new mongoose.Schema({
  temperature: Number,
  moisture: Number,
  light: Number,
  time: Number,
});
module.exports = mongoose.model('Metrics', MetricsSchema);
