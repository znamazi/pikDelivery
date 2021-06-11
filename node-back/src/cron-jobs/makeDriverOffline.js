const CronJob = require('cron').CronJob;
const {EVERY_FIVE} = require('./contants')
const Driver = require('../models/Driver');
const DriverOnlineLocation = require('../models/DriverOnlineLocation');

function makeDriverOffline(){
  DriverOnlineLocation.find({}).select('_id')
    .then(onlineDrivers => {
      let onlineIds = onlineDrivers.map(d => d._id)
      return Driver.updateMany({_id: {$nin: onlineIds}}, {$set:{online: false}})
    })
}

module.exports.start = function () {
  /**
   * constructor(cronTime, onTick, onComplete, start, timezone, context, runOnInit, unrefTimeout)
   */
  new CronJob(`* ${EVERY_FIVE} * * * *`, makeDriverOffline, null, true, 'America/Los_Angeles');
}
