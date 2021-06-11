const Driver = require('../../../models/Driver')
const DriverOnlineLocation = require('../../../models/DriverOnlineLocation')
const Order = require('../../../models/Order')
const { userError, Codes } = require('../../../messages/userMessages')

module.exports.getOnlinedrivers = async (req, res, next) => {
  try {
    // Available: online driver with busy false
    // To Pickup: driver assign but pickup does not complete
    // To Deliver : pickup but not deliver yet
    // All: all online driver
    const available = await DriverOnlineLocation.find({
      busy: false
    }).populate('driver', '_id firstName lastName mobile avatar vehicle')
    const pickup = await Order.find({
      status: 'Progress',
      'time.pickupComplete': { $exists: false }
    })
    const deliver = await Order.find({
      status: 'Progress',
      'time.pickupComplete': { $exists: true },
      'time.deliveryComplete': { $exists: false }
    })
    // const allDrivers = await Driver.find({
    //   hired: true,
    //   status: 'Approved'
    // }).countDocuments()

    const onlineDrivers = await DriverOnlineLocation.find({}).populate(
      'driver',
      '_id firstName lastName mobile avatar vehicle'
    )
    res.send({
      success: true,
      onlineDrivers,
      info: { available, pickup, deliver }
    })
  } catch (error) {
    console.log(error)
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}
