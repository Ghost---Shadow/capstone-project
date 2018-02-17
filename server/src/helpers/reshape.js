/**
 * Converts array of dicts to dict of arrays
 * @param {array} metrics
 */
function reshape(metrics) {
  const result = {
    temperature: [],
    moisture: [],
    light: [],
    time: [],
  };
  for (let i = 0; i < metrics.length; i += 1) {
    result.temperature.push(metrics[i].temperature);
    result.moisture.push(metrics[i].moisture);
    result.light.push(metrics[i].light);
    result.time.push(metrics[i].time);
  }
  return result;
}

module.exports = reshape;
