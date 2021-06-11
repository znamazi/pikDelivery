const CronJob = require('cron').CronJob;
const moment = require('moment');
const Order = require('../models/Order');
const Business = require('../models/Business');
const {EVERY_FIVE} = require('./contants')
const NotificationController = require('../controllers/NotificationController')
const EventBus = require('../eventBus')

async function rescheduleExpiredJobs() {
  let currentTime = moment();
  let scheduleDate = currentTime.format('YYYY-MM-DD')
  let scheduleTime = currentTime.add(30, 'minutes').format('HH:mm');
  let ordersToReschedule = await Order.find({
    senderModel: Business.COLLECTION_NAME,
    status: Order.Status.Scheduled,
    $or: [
      {
        'schedule.date': {$lt: scheduleDate}
      },
      {
        'schedule.date': scheduleDate,
        'schedule.to': {$lt: scheduleTime},
      }
    ],
  })

  // console.log(`${ordersToReschedule.length} orders with expired schedule`);
  for(let i=0 ; i<ordersToReschedule.length ; i++){
    let order = ordersToReschedule[i]
    await Order.update({_id: order._id}, {status: Order.Status.Reschedule})
    await EventBus.emit(EventBus.EVENT_ORDER_RESCHEDULE, {order})
  }
}

module.exports.start = function () {
  /**
   * constructor(cronTime, onTick, onComplete, start, timezone, context, runOnInit, unrefTimeout)
   */
  new CronJob(`0,15,30,45 * * * * *`, rescheduleExpiredJobs, null, true, 'America/Los_Angeles');
}
