const moment = require('moment')
const mongo = require('mongodb')
const { pick } = require('lodash')
const Json2csvParser = require('json2csv').Parser
const GoogleApi = require('../../../utils/googleApi')
const Order = require('../../../models/Order')
const OrderTrack = require('../../../models/OrderTrack')
const Driver = require('../../../models/Driver')
const Payment = require('../../../models/Payment')
const { userError, Codes } = require('../../../messages/userMessages')
const ObjectId = require('mongoose').Types.ObjectId
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const EventBus = require('../../../eventBus')

const { waitingTime } = require('../../../utils/waitingTime')

module.exports.list = function (req, res, next) {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  const businessId = req.params.id

  // let filterOfFields = pick(filter, ['query', 'queryHeader'])
  // console.log('*************', filterOfFields)
  // let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
  //   if (key === 'query' || key === 'queryHeader') {
  //     if (filterOfFields[key]) {
  //       acc['$or'] = [
  //         { 'receiver.firstName': caseInsensitive(filterOfFields[key]) },
  //         { 'receiver.lastName': caseInsensitive(filterOfFields[key]) },
  //         { 'receiver.mobile': caseInsensitive(filterOfFields[key]) },
  //         { 'receiver.email': caseInsensitive(filterOfFields[key]) },

  //         { 'driver.firstName': caseInsensitive(filterOfFields[key]) },
  //         { 'driver.lastName': caseInsensitive(filterOfFields[key]) },
  //         { 'driver.mobile': caseInsensitive(filterOfFields[key]) },
  //         { 'driver.email': caseInsensitive(filterOfFields[key]) },

  //         { 'delivery.name': caseInsensitive(filterOfFields[key]) },
  //         { 'delivery.phone': caseInsensitive(filterOfFields[key]) },

  //         { 'packages.trackingCode': caseInsensitive(filterOfFields[key]) },
  //         { 'packages.reference': caseInsensitive(filterOfFields[key]) },
  //         { 'packages.description': caseInsensitive(filterOfFields[key]) },

  //         { id: parseInt(filterOfFields[key]) }
  //       ]
  //     }
  //   } else {
  //     if (!!filterOfFields[key]) acc[key] = caseInsensitive(filterOfFields[key])
  //   }
  //   return acc
  // }, {})

  const queryParamsCheck = [
    'receiver.firstName',
    'receiver.lastName',
    'receiver.mobile',
    'receiver.email',

    'driver.firstName',
    'driver.lastName',
    'driver.mobile',
    'driver.email',

    'delivery.name',
    'delivery.phone',

    'packages.trackingCode',
    'packages.reference',
    'packages.description',

    'id'
  ]

  let filterMatch = {}
  let queryString = []
  if (filter.query || filter.queryHeader) {
    queryParamsCheck.forEach((item) => {
      let query = []
      if (filter['query']) {
        query.push({
          [item]:
            item === 'id'
              ? parseInt(filter['query'])
              : caseInsensitive(filter['query'])
        })
      }
      if (filter['queryHeader']) {
        query.push({
          [item]:
            item === 'id'
              ? parseInt(filter['queryHeader'])
              : caseInsensitive(filter['queryHeader'])
        })
      }
      if (query.length > 0) {
        queryString.push({ $or: [...query] })
      }
    })
  }
  if (queryString.length > 0) filterMatch = { $or: [...queryString] }

  if (filter.hasOwnProperty('status') && filter['status'] != '') {
    let statusList = filter['status'].split(',')
    filterMatch = {
      ...filterMatch,
      status: { $in: statusList }
    }
  }
  let hasDateFrom =
      filter.hasOwnProperty('date_from') && filter['date_from'] != '',
    hasDateTo = filter.hasOwnProperty('date_to') && filter['date_to'] != ''
  if (hasDateFrom || hasDateTo) {
    filterMatch = {
      ...filterMatch,
      date: {
        ...(hasDateFrom ? { $gte: new Date(filter['date_from']) } : {}),
        ...(hasDateTo ? { $lte: new Date(filter['date_to']) } : {})
      }
    }
  }

  filterMatch =
    req.locals.userType === 'BusinessUser' || businessId
      ? {
          ...filterMatch,
          sender: businessId
            ? mongo.ObjectID(businessId)
            : req.locals.user.business
        }
      : { ...filterMatch }
  let aggregate = [
    {
      $lookup: {
        from: 'customers',
        localField: 'receiver',
        foreignField: '_id',
        as: 'receiver'
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driver',
        foreignField: '_id',
        as: 'driver'
      }
    },
    {
      $addFields: {
        receiver: {
          $arrayElemAt: ['$receiver', 0]
        },
        driver: {
          $arrayElemAt: ['$driver', 0]
        },
        items: { $size: '$packages' }
      }
    },
    {
      $addFields: {
        name: {
          $toLower: {
            $concat: ['$receiver.firstName', ' ', '$receiver.lastName']
          }
        },
        driverName: {
          $toLower: {
            $concat: ['$driver.firstName', ' ', '$driver.lastName']
          }
        },
        waiting: {
          $cond: [
            {
              $eq: ['$status', 'Pending']
            },
            1,
            0
          ]
        }
      }
    },
    { $match: { ...filterMatch, deleted: false } }
  ]
  if (sortField) {
    let sorting =
      sortField === 'createdAt'
        ? { waiting: -1, [sortField]: ascDeskToNumber(sortOrder) }
        : { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  paginateAggregate(Order, aggregate, pageNumber, pageSize)
    .then(({ data, totalCount }) => {
      res.send({
        success: true,
        orders: data,
        totalCount
      })
    })
    .catch((error) => {
      console.log(error)
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.export = function (req, res, next) {
  let { filter = {}, sortOrder, sortField } = req.body
  let filterOfFields = pick(filter, ['query'])
  let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
    if (key === 'query') {
      if (filterOfFields[key]) {
        acc['$or'] = [
          { 'customer.firstName': caseInsensitive(filterOfFields[key]) },
          { 'customer.lastName': caseInsensitive(filterOfFields[key]) },
          { 'customer.mobile': caseInsensitive(filterOfFields[key]) },
          { 'driver.firstName': caseInsensitive(filterOfFields[key]) },
          { 'driver.lastName': caseInsensitive(filterOfFields[key]) },
          { 'driver.mobile': caseInsensitive(filterOfFields[key]) },
          {
            packages: {
              $elemMatch: {
                trackingCode: caseInsensitive(filterOfFields[key])
              }
            }
          },
          { id: caseInsensitive(filterOfFields[key]) }
        ]
      }
    } else {
      if (!!filterOfFields[key]) acc[key] = caseInsensitive(filterOfFields[key])
    }
    return acc
  }, {})

  if (filter.hasOwnProperty('status') && filter['status'] != '') {
    let statusList = filter['status'].split(',')
    filterMatch = {
      ...filterMatch,
      status: { $in: statusList }
    }
  }

  let hasDateFrom =
      filter.hasOwnProperty('date_from') && filter['date_from'] != '',
    hasDateTo = filter.hasOwnProperty('date_to') && filter['date_to'] != ''
  if (hasDateFrom || hasDateTo) {
    filterMatch = {
      ...filterMatch,
      date: {
        ...(hasDateFrom ? { $gte: new Date(filter['date_from']) } : {}),
        ...(hasDateTo ? { $lte: new Date(filter['date_to']) } : {})
      }
    }
  }

  filterMatch =
    req.locals.userType === 'BusinessUser'
      ? { ...filterMatch, sender: req.locals.user.business }
      : { ...filterMatch }
  let aggregate = [
    {
      $lookup: {
        from: 'customers',
        localField: 'receiver',
        foreignField: '_id',
        as: 'customer'
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driver',
        foreignField: '_id',
        as: 'driver'
      }
    },
    {
      $addFields: {
        customer: {
          $arrayElemAt: ['$customer', 0]
        },
        driver: {
          $arrayElemAt: ['$driver', 0]
        },
        name: { $toLower: { $concat: ['$firstName', ' ', '$lastName'] } },
        items: { $size: '$packages' }
      }
    },
    { $match: filterMatch }
  ]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  Order.aggregate(aggregate)
    .then((data) => {
      let output = data.map((item) => {
        let driver = ''
        if (!item.driver) {
          let waiting = ''

          const result = ['Created', 'Scheduled', 'Reschedule'].includes(
            item.status
          )
          if (!result) {
            const confirmTime =
              row.senderModel === 'business'
                ? row.time.confirm
                : row.time.create
            const pickupTime = new Date()
            waiting = `${waitingTime(confirmTime, pickupTime)} waiting`
          }

          driver = waiting
        } else {
          driver = `${item.driver.firstName} ${item.driver.lastName} ${item.driver.mobile}`
        }
        return {
          ID: item.id,
          'Booking time': moment(item.date).format('LL'),
          Customer: `${item.customer.firstName} ${item.customer.lastName} ${item.customer.mobile}`,
          Driver: driver,
          Vehicle: item.vehicleType,
          Cost: item.cost,
          Status: item.status
        }
      })

      const json2csvParser = new Json2csvParser({ header: true })
      const csvData = json2csvParser.parse(output)
      // fs.writeFile(
      //   './user_files/' + 'download-' + Date.now() + '.csv',
      //   csvData,
      //   function (error) {
      //     if (error) throw error
      //     console.log('Write Orders.csv successfully!')
      //   }
      // )
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="' + 'Order-' + Date.now() + '.csv'
      )

      res.send(csvData)
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.ERROR_ORDER_EXPORT_FAIL)
      })
    })
}

module.exports.retrieve = async (req, res, next) => {
  try {
    const id = req.params.id
    if (isNaN(id) || !id) {
      throw userError(Codes.ERROR_ORDER_NOT_FOUND)
    }
    let order = await Order.findOne({ id })
      .populate('receiver')
      .populate('driver')
    if (!order) {
      throw userError(Codes.ERROR_ORDER_NOT_FOUND)
    }
    let payment = await Payment.find(
      {
        resourceModel: Order.COLLECTION_NAME,
        resource: mongo.ObjectID(order._id)
      },
      { transactionType: 1 }
    )
    res.send({
      success: true,
      order,
      payment
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.assignDriver = async (req, res, next) => {
  try {
    const { orderId, driver } = req.body
    if (!orderId || !ObjectId.isValid(orderId)) {
      throw userError(Codes.ERROR_ORDER_NOT_FOUND)
    }
    if (!driver || !ObjectId.isValid(driver)) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    const updates = Object.keys(req.body)
    const allowedUpdate = ['driver', 'orderId', 'vehicleType']
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )

    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    let driverBusy = await Order.findOne({ driver, status: 'progress' })
    if (driverBusy) {
      throw userError(Codes.ERROR_DDRIVER_BUSY)
    }

    let order = await Order.findOne({ _id: orderId })
    if (!order) {
      throw userError(Codes.ERROR_ORDER_NOT_FOUND)
    }
    if (
      !(
        ['Pending', 'Progress', 'Returned'].includes(order.status) &&
        !order.time.returnComplete
      )
    ) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    await EventBus.emit(EventBus.EVENT_ORDER_DRIVER_REMOVE, { order })
    const time = {
      create: order.time.create,
      confirm: order.time.confirm,
      driverAssign: new Date()
    }
    let newData = { ...req.body, time, status: 'Progress' }
    console.log({newData})
    updates.push('time', 'status')
    updates.forEach((update) => (order[update] = newData[update]))

    await EventBus.emit(EventBus.EVENT_ORDER_DRIVER_ASSIGNED, { order })
    await order.save()

    res.send({
      success: true,
      order
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.getOrderLiveTrack = async (req, res, next) => {
  try {
    const { driverId, orderId } = req.params
    if (
      !driverId ||
      !ObjectId.isValid(driverId) ||
      !orderId ||
      !ObjectId.isValid(orderId)
    ) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    const driver = await Driver.findOne({ _id: driverId }).select(
      '+geoLocation'
    )
    const track = await OrderTrack.findOne({
      driver: driverId,
      order: orderId
    }).populate('order')

    if (!driver) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }

    let direction = null
    if (track) {
      let {
        lat: lat1,
        lng: lng1
      } = track.order.pickup.address.geometry.location
      let {
        lat: lat2,
        lng: lng2
      } = track.order.delivery.address.geometry.location
      try {
        direction = await GoogleApi.directions(
          `${lat1},${lng1}`,
          `${lat2},${lng2}`,
          track.history[track.headingTo].map(
            (i) => `${i.latitude},${i.longitude}`
          )
        )
      } catch (e) {}
    }

    res.send({
      success: true,
      geoLocation: driver.geoLocation,
      direction
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.cancel = async (req, res, next) => {
  try {
    const ids = req.body
    console.log(ids)
    let order
    for (let index = 0; index < ids.length; index++) {
      order = await Order.findById(ids[index])
      // console.log(order)
      if (!order) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      await Order.cancelByAdmin(order, req.locals.user.id, req.locals.user.name)

      await order.save()
    }

    console.log(order)

    res.send({
      success: true,
      order
    })
  } catch (error) {
    console.log('error', error)
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
