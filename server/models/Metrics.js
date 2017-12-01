var mongoose = require('mongoose');
var MetricsSchema = new mongoose.Schema({
  temperature:Number,
  moisture:Number,
  light:Number,
  time:Number
});
module.exports = mongoose.model('Metrics', MetricsSchema);