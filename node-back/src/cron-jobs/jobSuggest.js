const CronJob = require('cron').CronJob;
const moment = require('moment');
const _ = require('lodash')
const Order = require('../models/Order');
const OrderSuggest = require('../models/OrderSuggest');
const Driver = require('../models/Driver');
const DriverOnlineLocation = require('../models/DriverOnlineLocation');
const {EVERY_FIVE, EVERY_TEN, EVERY_FIFTEEN} = require('./contants')
const EventBus = require('../eventBus');
const PikCache = require('./../pik-cache')

async function suggestJobToDriver() {
  let suggestes = await OrderSuggest.find({ignored: false})
  let suggestedOrders = {};
  let suggestedDrivers = {};
  suggestes.map(s => {
    suggestedOrders[s.order] = true
    suggestedDrivers[s.driver] = true
  })
  let orders = await Order.find({
    _id: {$nin: Object.keys(suggestedOrders)},
    status: Order.Status.Pending,
  });
  let suggestionCount = 0
  // console.log(`[${orders.length}] order need assign driver. time: ${moment().format('HH:mm:ss')}`);
  for (let i = 0; i < orders.length; i++) {
    // let sugg = new OrderSuggest({})
    let currentOrder = orders[i]

    let ignoreList = await OrderSuggest.find({order: currentOrder._id})
    ignoreList = ignoreList.map(os => os.driver)
    Array.prototype.push.apply(ignoreList, Object.keys(suggestedDrivers))
    // console.log({ignoreList})
    let coordinates = [
      currentOrder.pickup.address.geometry.location.lng,
      currentOrder.pickup.address.geometry.location.lat,
    ]
    let onlines = await DriverOnlineLocation.find({
      busy: false,
      // _id: {$nin: Object.keys(suggestedDrivers)},
      driver: {$nin: ignoreList},
      vehicleType: currentOrder.vehicleType,
      location: {
        $near: {
          $geometry: {type: "Point", coordinates},
          $maxDistance: 10000, // <distance in meters>
        }
      },
    })
      .limit(1)
      .populate('driver')

    if (onlines.length > 0) {
      let driver = onlines[0].driver
      suggestionCount++;
      let sugg = new OrderSuggest({
        driver,
        order: currentOrder,
      })
      await sugg.save()
      suggestedDrivers[driver._id] = true
      EventBus.emit(EventBus.EVENT_ORDER_SUGGESTION, {order: currentOrder, driver: driver}).then(() => {
      })
    }
    else {
      await OrderSuggest.deleteMany({ order: currentOrder._id })
    }
  }
}

module.exports.start = function () {
  /**
   * constructor(cronTime, onTick, onComplete, start, timezone, context, runOnInit, unrefTimeout)
   */
  new CronJob(`${EVERY_FIFTEEN} * * * * *`, suggestJobToDriver, null, true, 'America/Los_Angeles');
}
