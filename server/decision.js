// Take decision based on readings (TODO)
// "b000" = FAN-PUMP-LAMP
function takeDecision(temperature, moisture, light, forced) {
    var decision = 0;
    decision |= temperature > 512 ? (1 << 2) : 0;
    decision |= moisture > 512 ? (1 << 1) : 0;
    decision |= light > 512 ? (1 << 0) : 0;
    decision |= forced;
    return decision + "";
}

module.exports.takeDecision = takeDecision;