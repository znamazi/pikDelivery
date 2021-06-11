const NodeCache = require("node-cache");

// keep for 10 minutes
const passwordCache = new NodeCache({stdTTL: 10 * 60});
// keep for 5 minutes
const mobileCache = new NodeCache({stdTTL: 5 * 60});
// keep for 5 hours
const suggestIgnoreCache = new NodeCache({stdTTL: 5 * 60 * 60});
// keep for 30 minutes
const driverArrivingNotification = new NodeCache({stdTTL: 30 * 60});

module.exports = {
  passwordCache,
  mobileCache,
  suggestIgnoreCache,
  driverArrivingNotification,
}
