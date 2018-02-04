// Take decision based on readings (TODO)
// "b000" = FAN-PUMP-LAMP
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

module.exports.takeDecision = takeDecision;
