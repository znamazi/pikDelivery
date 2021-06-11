const CronJob = require('cron').CronJob;
const moment = require('moment');
const OrderSuggest = require('../models/OrderSuggest');
const {EVERY_FIVE, EVERY_TWO} = require('./contants')

async function removeSuggest() {
  let timeToExpire = moment().add(-5, 'minutes').toDate()
  let longTimeToExpire = moment().add(-5, 'hours').toDate()
  await OrderSuggest.deleteMany({
    $or: [
      {ignored: false, updatedAt: {$lt: timeToExpire}},
      {updatedAt: {$lt: longTimeToExpire}},
    ]
  })
}

module.exports.start = function () {
  /**
   * constructor(cronTime, onTick, onComplete, start, timezone, context, runOnInit, unrefTimeout)
   */
  new CronJob(`0 ${EVERY_TWO} * * * *`, removeSuggest, null, true, 'America/Los_Angeles');
}
