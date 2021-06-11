const Json2csvParser = require('json2csv').Parser
const mongo = require('mongodb')
const moment = require('moment')
const Driver = require('../../../models/Driver')
const AdminComment = require('../../../models/AdminComment')
const BankAccount = require('../../../models/BankAccount')
const EventBus = require('../../../eventBus')

const { userError, Codes } = require('../../../messages/userMessages')
const ObjectId = require('mongoose').Types.ObjectId
const Order = require('../../../models/Order')
const { pick } = require('lodash')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const CustomValue = require('../../../models/CustomValue')

module.exports.list = async (req, res, next) => {
  try {
    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body
    let filterOfFields = pick(filter, ['query', 'hired'])
    let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
      if (key === 'query') {
        acc['$or'] = [
          { firstName: caseInsensitive(filterOfFields[key]) },
          { lastName: caseInsensitive(filterOfFields[key]) },
          { email: caseInsensitive(filterOfFields[key]) },
          { mobile: caseInsensitive(filterOfFields[key]) }
        ]
      } else {
        acc[key] = filterOfFields[key]
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
    let aggregate = [
      { $match: filterMatch },
      {
        $addFields: {
          name: { $toLower: { $concat: ['$firstName', ' ', '$lastName'] } }
        }
      }
    ]
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
      aggregate.push({ $sort: sorting })
    }
    const orders = await Order.find({ driver: { $exists: true } })
    const driversInfo = await paginateAggregate(
      Driver,
      aggregate,
      pageNumber,
      pageSize
    )
    let drivers = []
    driversInfo.data.forEach((driver) => {
      const driverOrders = orders.filter((order) =>
        order.driver.equals(driver._id)
      )

      let cancel = ''
      if (driverOrders.length > 0) {
        const driverCancel = driverOrders.filter(
          (item) =>
            item.cancel &&
            item.cancel.cancelerModel === Driver.COLLECTION_NAME &&
            item.cancel.canceler.equals(driver._id)
        )

        if (driverCancel.length > 0)
          cancel = (driverCancel.length / driverOrders.length) * 100
      }
      let newData = { ...driver, orders: driverOrders.length, cancel }
      drivers.push(newData)
    })

    res.send({
      success: true,
      drivers,
      totalCount: driversInfo.totalCount
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.export = async (req, res, next) => {
  try {
    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body
    let filterOfFields = pick(filter, ['query', 'hired'])
    let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
      if (key === 'query') {
        acc['$or'] = [
          { firstName: caseInsensitive(filterOfFields[key]) },
          { lastName: caseInsensitive(filterOfFields[key]) },
          { email: caseInsensitive(filterOfFields[key]) },
          { mobile: caseInsensitive(filterOfFields[key]) }
        ]
      } else {
        acc[key] = filterOfFields[key]
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
    let aggregate = [
      { $match: filterMatch },
      {
        $addFields: {
          name: { $toLower: { $concat: ['$firstName', ' ', '$lastName'] } }
        }
      }
    ]
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
      aggregate.push({ $sort: sorting })
    }
    const orders = await Order.find({ driver: { $exists: true } })
    const driversInfo = await paginateAggregate(
      Driver,
      aggregate,
      pageNumber,
      pageSize
    )
    let drivers = []
    driversInfo.data.forEach((driver) => {
      const driverOrders = orders.filter((order) =>
        order.driver.equals(driver._id)
      )

      let cancel = ''
      if (driverOrders.length > 0) {
        const driverCancel = driverOrders.filter(
          (item) =>
            item.cancel &&
            item.cancel.cancelerModel === Driver.COLLECTION_NAME &&
            item.cancel.canceler.equals(driver._id)
        )

        if (driverCancel.length > 0)
          cancel = (driverCancel.length / driverOrders.length) * 100
      }
      let newData = { ...driver, orders: driverOrders.length, cancel }
      drivers.push(newData)
    })
    let output = drivers.map((item) => ({
      Name: `${item.firstName} ${item.lastName} ${item.email}`,
      Phone: item.mobile,
      'Cancel %': item.cancel,
      'Reject %': item.jobs.ignore
        ? ((item.jobs.ignore / item.jobs.total) * 100).toFixed(2)
        : '',
      Status: item.status
    }))
    const json2csvParser = new Json2csvParser({ header: true })
    const csvData = json2csvParser.parse(output)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + 'Driver-' + Date.now() + '.csv'
    )

    res.send(csvData)
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.ERROR_DRIVER_EXPORT_FAIL)
    })
  }
}

module.exports.retrieve = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    const driver = await Driver.findById(id)
    if (!driver) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    const bankAccount = await BankAccount.find({ owner: driver._id })

    const orders = await Order.find({ driver: mongo.ObjectID(driver._id) })
    let cancel = 0
    if (orders.length > 0) {
      const driverCancel = orders.filter(
        (item) =>
          item.cancel &&
          item.cancel.cancelerModel === Driver.COLLECTION_NAME &&
          item.cancel.canceler.equals(driver._id)
      )

      if (driverCancel.length > 0)
        cancel = (driverCancel.length / orders.length) * 100
    }
    const feedback = await Order.find(
      {
        driver: mongo.ObjectID(driver._id),
        deleted: false,
        $or: [
          { receiverFeedback: { $exists: true } },
          { senderFeedback: { $exists: true } }
        ]
      },
      {
        id: 1,
        receiverFeedback: 1,
        senderFeedback: 1
      }
    )
    let avgFeedback = ''
    if (feedback.length > 0) {
      let sum = 0,
        count = 0
      for (let index = 0; index < feedback.length; index++) {
        const item = feedback[index]
        if (item.receiverFeedback) {
          count++
          sum = sum + item.receiverFeedback.rate
        }
        if (item.senderFeedback) {
          count++
          sum = sum + item.senderFeedback.rate
        }
      }
      avgFeedback = sum / count
    }
    res.send({
      success: true,
      driver,
      cancel,
      avgFeedback,
      bankAccount
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.getOrders = async (req, res, next) => {
  try {
    const driverId = req.params.id
    if (!ObjectId.isValid(driverId)) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }

    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body
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
        $addFields: {
          customer: {
            $arrayElemAt: ['$customer', 0]
          },
          items: { $size: '$packages' }
        }
      },
      { $match: { driver: mongo.ObjectID(driverId), deleted: false } }
    ]
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
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
        res.send({
          success: false,
          ...userError(Codes.SERVER_SIDE_ERROR)
        })
      })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
module.exports.getBalance = async (req, res, next) => {
  try {
    const driverId = req.params.id
    if (!ObjectId.isValid(driverId)) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body

    let aggregate = [
      {
        $match: {
          driver: mongo.ObjectID(driverId),
          status: { $in: ['Canceled', 'Returned', 'Delivered'] }
        }
      }
      // {
      //   $project: {
      //     numWeek: { $week: '$time.create' },
      //     year: { $year: '$time.create' },
      //     cost: 1,
      //   }
      // },
      // {
      //   $group: {
      //     _id: { year: '$year', numWeek: '$numWeek' },
      //     costValue: {
      //       $sum: '$cost.total'
      //     },
      //     countOrder: { $sum: 1 }
      //   }
      // }
    ]
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
      aggregate.push({ $sort: sorting })
    }
    let aggregateCustomValue = [
      { $match: { owner: mongo.ObjectID(driverId), deleted: false } },
      {
        $project: {
          numWeek: { $week: '$date' },
          year: { $year: '$date' },
          amount: 1
        }
      },
      {
        $group: {
          _id: { year: '$year', numWeek: '$numWeek' },
          amountValue: { $sum: '$amount' }
        }
      }
    ]

    const customValues = await paginateAggregate(
      CustomValue,
      aggregateCustomValue,
      pageNumber,
      pageSize
    )
    const balance = await paginateAggregate(
      Order,
      aggregate,
      pageNumber,
      pageSize
    )
    res.send({
      success: true,
      balance: balance.data,
      totalCount: balance.totalCount,
      customValue: customValues.data
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.getCustomValue = async (req, res, next) => {
  try {
    const driverId = req.params.id
    const date = req.params.date
    if (!ObjectId.isValid(driverId)) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body

    var aggregate = [
      {
        $match: {
          owner: mongo.ObjectID(driverId),
          date: new Date(date),
          deleted: false
        }
      },
      {
        $lookup: {
          from: 'admin-users',
          localField: 'addedBy',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $addFields: {
          admin: {
            $arrayElemAt: ['$admin', 0]
          }
        }
      }
    ]
    paginateAggregate(CustomValue, aggregate, pageNumber, pageSize)
      .then(({ data, totalCount }) => {
        res.send({
          success: true,
          customValue: data,
          totalCount
        })
      })
      .catch((error) => {
        res.send({
          success: false,
          ...userError(Codes.SERVER_SIDE_ERROR)
        })
      })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.addCustomValue = async (req, res, next) => {
  try {
    let { driverId, date, description, amount } = req.body
    const ownerModel = 'driver'
    const addedBy = req.locals.user._id
    const newData = {
      ownerModel,
      owner: driverId,
      amount,
      description,
      addedBy,
      date
    }
    const customValue = await CustomValue.create(newData)
    res.send({
      success: true,
      customValue: {
        ...newData,
        _id: customValue._id,

        admin: { name: req.locals.user.name }
      }
    })
  } catch (error) {}
}

module.exports.deleteCustomValue = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_ITEM_NOT_FOUND)
    }
    let customValue = await CustomValue.findById(id)

    if (!customValue) {
      throw userError(Codes.ERROR_ITEM_NOT_FOUND)
    }
    const userId = ObjectId(req.locals.user._id)
    await customValue.delete(userId)
    res.send({
      success: true
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.update = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdate = [
      'personalId',
      'vehicle',
      'drivingLicence',
      'carInsurance',
      'status',
      'message'
    ]
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )

    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    const driver = await Driver.findById(id)
    if (!driver) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    if (req.body.personalId) {
      const existPersonalID = await Driver.findOne({
        'personalId.id': req.body.personalId.id,
        'personalId.approved': true,
        hired: true,
        _id: { $ne: id }
      })
      if (existPersonalID)
        throw userError(Codes.ERROR_DRIVER_PERSONAL_ID_DUPLICATE)
    }
    let statusChanged = false
    if (driver.status !== req.body.status) {
      statusChanged = true
    }

    updates.forEach((update) => (driver[update] = req.body[update]))
    if (req.body.status === 'Approved') {
      driver.hired = true
      driver.personalId.approved = true
      driver.vehicle.approved = true
      driver.drivingLicence.approved = true
      driver.carInsurance.approved = true
    }
    if (req.body.status === 'Rejected' && driver.hired) {
      driver.status = 'Disabled'
      driver.documentSent = false
    }
    if (req.body.status === 'Recheck') {
      driver.documentSent = false
    }
    if (statusChanged) {
      await EventBus.emit(EventBus.EVENT_DRIVER_STATUS_CHANGED, { driver })
    }

    await driver.save()

    res.send({
      success: true,
      driver
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.getDrivers = async (req, res, next) => {
  try {
    const { query } = req.body
    let filterMatch = {
      $or: [
        { firstName: caseInsensitive(query) },
        { lastName: caseInsensitive(query) },
        { email: caseInsensitive(query) },
        { mobile: caseInsensitive(query) }
      ],
      hired: true,
      status: 'Approved',
      busy: false
    }
    const driver = await Driver.find(filterMatch).limit(10)

    res.send({
      success: true,
      driver
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.addComment = async (req, res, next) => {
  try {
    let data = { ...req.body }
    data.sender = req.locals.user._id
    data.receiverModel = 'driver'
    const comment = await AdminComment.create({ ...data })

    res.send({
      success: true,
      comment,
      sender: { name: req.locals.user.name }
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.listComment = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body
    let filterOfFields = pick(filter, ['query'])

    let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
      if (key === 'query') {
        acc['$or'] = [{ comment: caseInsensitive(filterOfFields[key]) }]
      } else {
        if (!!filterOfFields[key])
          acc[key] = caseInsensitive(filterOfFields[key])
      }
      return acc
    }, {})

    let aggregate = [
      {
        $match: {
          ...filterMatch,
          receiver: ObjectId(id),
          receiverModel: 'driver'
        }
      },
      {
        $lookup: {
          from: 'admin-users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $addFields: {
          sender: {
            $arrayElemAt: ['$sender', 0]
          }
        }
      }
    ]
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
      aggregate.push({ $sort: sorting })
    }
    paginateAggregate(AdminComment, aggregate, pageNumber, pageSize)
      .then(({ data, totalCount }) => {
        res.send({
          success: true,
          comments: data,
          totalCount
        })
      })
      .catch((error) => {
        res.send({
          success: false,
          ...userError(Codes.SERVER_SIDE_ERROR)
        })
      })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.getFeedback = async (req, res, next) => {
  try {
    const driverId = req.params.id
    if (!ObjectId.isValid(driverId)) {
      throw userError(Codes.ERROR_DRIVER_NOT_FOUND)
    }
    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body

    // let aggregateAvg = [
    //   {
    //     $match: {
    //       driver: mongo.ObjectID(driverId),
    //       deleted: false,
    //       $or: [
    //         { receiverFeedback: { $exists: true } },
    //         { senderFeedback: { $exists: true } }
    //       ]
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       averageReceiver: { $avg: '$receiverFeedback.rate' },
    //       averageSender: { $avg: '$senderFeedback.rate' }
    //     }
    //   }
    // ]

    // const avg = await Order.aggregate(aggregateAvg)

    let aggregate = [
      {
        $match: {
          driver: mongo.ObjectID(driverId),
          deleted: false,
          $or: [
            { receiverFeedback: { $exists: true } },
            { senderFeedback: { $exists: true } }
          ]
        }
      },
      // {
      //   $group: {
      //     _id: null,
      //     average: { $avg: '$receiverFeedback.rate' }
      //   }
      // },

      {
        $project: {
          id: 1,
          receiverFeedback: 1,
          senderFeedback: 1
        }
      }
    ]
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
      aggregate.push({ $sort: sorting })
    }

    paginateAggregate(Order, aggregate, pageNumber, pageSize)
      .then(({ data, totalCount }) => {
        res.send({
          success: true,
          orders: data,
          totalCount
          // avgFeedback: avg
        })
      })
      .catch((error) => {
        console.log(error)
        res.send({
          success: false,
          ...userError(Codes.SERVER_SIDE_ERROR)
        })
      })
  } catch (error) {
    console.log(error)
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
