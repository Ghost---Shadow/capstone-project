/**
 * Take decision based on readings (TODO)
 * "b000" = FAN-PUMP-LAMP
 * @param {integer} temperature
 * @param {integer} moisture
 * @param {integer} light
 * @param {integer} forced
 * @returns {string} decision
 */
function takeDecision(temperature, moisture, light, forced) {
  let decision = 0;
  /* eslint-disable no-bitwise */
  decision |= temperature > 512 ? (1 << 2) : 0;
  decision |= moisture > 512 ? (1 << 1) : 0;
  decision |= light > 512 ? (1 << 0) : 0;
  decision |= forced;
  /* eslint-enable no-bitwise */
  return `${decision}`;
}

module.exports = takeDecision;
