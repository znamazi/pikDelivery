const Customer = require('../../../models/Customer')
const Driver = require('../../../models/Driver')
const BusinessModel = require('../../../models/Business')
const Order = require('../../../models/Order')
const { userError, Codes } = require('../../../messages/userMessages')
const OrderStatuses = require('../../../constants/OrderStatuses')

module.exports.getInfo = async (req, res, next) => {
  try {
    // TODO condition for Income ongoing and other must be check
    // Data box
    const Customers = await Customer.find({ deleted: false }).countDocuments()
    const Drivers = await Driver.find({}).countDocuments()
    const Business = await BusinessModel.find({}).countDocuments()
    const Income = await Order.aggregate([
      { $match: { cost: { $exists: true } } },
      { $group: { _id: null, sum: { $sum: '$cost.total' } } }
    ])
    const total_rides = await Order.find({
      driver: { $exists: true }
    }).countDocuments()
    const on_going = await Order.find({
      driver: { $exists: true },
      $or: [
        { status: 'Progress' },
        // { 'time.deliveryComplete': { $exists: false } },
        { 'time.returnComplete': { $exists: false }, status: 'Returned' }
      ]
    }).countDocuments()
    const Completed = await Order.find({
      driver: { $exists: true },
      'time.deliveryComplete': { $exists: true }
    }).countDocuments()
    const Cancelled = await Order.find({
      driver: { $exists: true },
      cancel: { $exists: true }
    }).countDocuments()

    // Data Chart

    const weekNumber = req.params.weekNumber - 1
    const year = parseInt(req.params.year)
    let aggregate = [
      {
        $addFields: {
          numWeek: { $week: '$createdAt' },
          year: { $year: '$createdAt' }
        }
      },
      {
        $match: {
          numWeek: weekNumber,
          year,
          deleted: false,
          status: {
            $in: [
              OrderStatuses.Delivered,
              OrderStatuses.Pending,
              OrderStatuses.Progress
            ]
          }
        }
      }
    ]

    const orders = await Order.aggregate(aggregate)

    res.send({
      success: true,
      siteInfo: {
        Customers,
        Drivers,
        Business,
        Income: Income.length > 0 ? Income[0].sum : 0
      },
      ridesInfo: { total_rides, on_going, Cancelled, Completed },
      orders
    })
  } catch (error) {
    console.log(error)
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}
