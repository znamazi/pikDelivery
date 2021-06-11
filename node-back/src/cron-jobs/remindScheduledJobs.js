const CronJob = require('cron').CronJob;
const moment = require('moment');
const Order = require('../models/Order');
const Business = require('../models/Business');
const {EVERY_FIVE} = require('./contants')
const NotificationController = require('../controllers/NotificationController')

async function remindScheduledJobs() {
  let currentTime = moment();
  let scheduleDate = currentTime.format('YYYY-MM-DD')
  let scheduleTime = currentTime.add(30, 'minutes').format('HH:mm');
  let ordersToRemind = await Order.find({
    senderModel: Business.COLLECTION_NAME,
    status: Order.Status.Scheduled,
    'schedule.date': scheduleDate,
    'schedule.from': {$lte: scheduleTime},
    'schedule.to': {$gte: scheduleTime},
  })

  // console.log(`${ordersToRemind.length} orders need remind now`);
  ordersToRemind.map(o => {
    NotificationController.sendNotificationToUsers(
      [o.receiver],
      {
        title: 'PIK Delivery',
        body: `Your scheduled packages is ready to send. Are you ready to get it?`,
      },
      {
        data: {
          order: o._id.toString()
        }
      }
    )
  })
}

module.exports.start = function () {
  /**
   * constructor(cronTime, onTick, onComplete, start, timezone, context, runOnInit, unrefTimeout)
   */
  new CronJob(`1 ${EVERY_FIVE} * * * *`, remindScheduledJobs, null, true, 'America/Los_Angeles');
}
