const forced = {
  value: 0,
};

/**
 * Format
 * /force?f=7
 * b000 to b111
 * FAN - PUMP - LIGHT
 */
const force = (req, res) => {
  try {
    forced.value = parseInt(req.query.f, 10);
    res.send(`${forced.value}`);
    console.log(`Forced: ${forced.value}`);
  } catch (e) {
    forced.value = 0;
    res.send(e);
  }
};

module.exports = {
  force,
  forced,
};
