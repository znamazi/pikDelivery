const Business = require('../../../models/Business')
const AdminComment = require('../../../models/AdminComment')
const CustomTimeFrame = require('../../../models/CustomTimeFrame')
const Order = require('../../../models/Order')
const Payment = require('../../../models/Payment')
const { pick } = require('lodash')

const { userError, Codes } = require('../../../messages/userMessages')
const ObjectId = require('mongoose').Types.ObjectId
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const { checkConflict } = require('../../../utils/checkConflictBusinessHours')
const EventBus = require('../../../eventBus')

module.exports.list = function (req, res, next) {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  let filterMatch = Object.keys(filter).reduce((acc, key) => {
    if (key === 'query') {
      acc['$or'] = [
        { name: caseInsensitive(filter[key]) },
        { email: caseInsensitive(filter[key]) },
        { mobile: caseInsensitive(filter[key]) }
      ]
    } else {
      if (!!filter[key]) acc[key] = caseInsensitive(filter[key])
    }
    return acc
  }, {})

  let aggregate = [
    { $match: filterMatch },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'sender',
        as: 'orders'
      }
    },
    // {
    //   $lookup: {
    //     from: 'pricing-groups',
    //     localField: 'group',
    //     foreignField: '_id',
    //     as: 'group'
    //   }
    // },
    {
      $addFields: {
        customers: { $size: { $setDifference: ['$orders.receiver', []] } },
        // group: {
        //   $arrayElemAt: ['$group', 0]
        // },
        orders: { $size: '$orders' }
      }
    }
  ]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  paginateAggregate(Business, aggregate, pageNumber, pageSize)
    .then(({ data, totalCount }) => {
      res.send({
        success: true,
        business: data,
        totalCount
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.retrieve = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id) || !id) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    const business = await Business.findById(id)
    if (!business) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    let customTimeFrames = await CustomTimeFrame.find({
      business: id
    })

    res.send({
      success: true,
      business,
      customTimeFrames
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
    let { customTimeFrames, timeFrames, group, deletedId } = req.body
    const dataUpdate = { timeFrames, group }
    let validateSchedule = true

    const updates = Object.keys(dataUpdate)
    const allowedUpdate = ['timeFrames', 'group']
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    const business = await Business.findById(id)
    if (!business) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    if (
      (timeFrames && timeFrames.length > 0) ||
      (customTimeFrames && customTimeFrames.length > 0) ||
      (deletedId && deletedId.length > 0)
    ) {
      const deletedCustomTimeFrame = await CustomTimeFrame.find({
        id: { $in: deletedId }
      })
      const {
        isValid,
        ordersConflict,
        customTimeFramesConflict,
        customTimeFramesConflictRemove
      } = await checkConflict(
        customTimeFrames,
        deletedCustomTimeFrame,
        deletedId,
        business.timeFrames,
        timeFrames,
        id
      )
      validateSchedule = isValid
      if (!isValid) {
        res.send({
          success: false,
          conflict: true,
          orders: ordersConflict,
          customTimeFramesConflict,
          customTimeFramesConflictRemove
        })
      }
      // const {
      //   isValidTimeFram,
      //   ordersConflictTimeFrame
      // } = await checkConflictTimeFrame(business.timeFrames, timeFrames, id)
      // const deletedCustomTimeFrame = await CustomTimeFrame.find({
      //   id: { $in: deletedId }
      // })
      // const { isValid, ordersConflict } = await checkConflictCustomTime(
      //   customTimeFrames,
      //   deletedCustomTimeFrame,
      //   timeFrames,
      //   id
      // )

      // let ids = new Set(ordersConflict.map((d) => d.id))
      // let mergedConflict = [
      //   ...ordersConflict,
      //   ...ordersConflictTimeFrame.filter((d) => !ids.has(d.id))
      // ]
      // // console.log(mergedConflict)
      // validateSchedule = isValid && isValidTimeFram
      // if (!validateSchedule) {
      //   res.send({
      //     success: false,
      //     conflict: true,
      //     orders: mergedConflict
      //   })
      // }
    }

    if (validateSchedule) {
      updates.forEach(
        (update) =>
          (business[update] = dataUpdate[update]
            ? dataUpdate[update]
            : business[update])
      )
      await business.save()

      if (
        (customTimeFrames && customTimeFrames.length > 0) ||
        (deletedId && deletedId.length > 0)
      ) {
        customTimeFrames = customTimeFrames.map((item) => ({
          ...item,
          business: id
        }))

        await CustomTimeFrame.create(customTimeFrames)
        if (deletedId && deletedId.length > 0)
          await CustomTimeFrame.deleteMany({ id: { $in: deletedId } })
      }
      customTimeFrames = await CustomTimeFrame.find({ business: id })
      res.send({
        success: true,
        business,
        customTimeFrames
      })
    }
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.edit = async (req, res, next) => {
  try {
    let { customTimeFrames, timeFrames, group, deletedId, ordersId } = req.body
    const dataUpdate = { timeFrames, group }
    const updates = Object.keys(dataUpdate)
    const allowedUpdate = ['timeFrames', 'group']
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    const business = await Business.findById(id)
    if (!business) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }

    updates.forEach(
      (update) =>
        (business[update] = dataUpdate[update]
          ? dataUpdate[update]
          : business[update])
    )
    await business.save()

    if (
      (customTimeFrames && customTimeFrames.length > 0) ||
      (deletedId && deletedId.length > 0)
    ) {
      customTimeFrames = customTimeFrames.map((item) => ({
        ...item,
        business: id
      }))

      await CustomTimeFrame.create(customTimeFrames)
      if (deletedId && deletedId.length > 0)
        await CustomTimeFrame.deleteMany({ id: { $in: deletedId } })
    }
    await Order.updateMany(
      { _id: { $in: ordersId } },
      {
        $set: {
          status: 'Reschedule'
        }
      }
    )
    /** Send Reschedule event **/
    let rescheduledOrders = await Order.find({
      _id: { $in: ordersId }
    }).populate(['sender', 'receiver'])
    for (let i = 0; i < rescheduledOrders.length; i++) {
      await EventBus.emit(EventBus.EVENT_ORDER_RESCHEDULE, {
        order: rescheduledOrders[i]
      })
    }
    customTimeFrames = await CustomTimeFrame.find({ business: id })

    res.send({
      success: true,
      business,
      customTimeFrames
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.addComment = async (req, res, next) => {
  try {
    let data = { ...req.body }
    data.sender = req.locals.user._id
    data.receiverModel = 'business'
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
          receiverModel: 'business'
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

module.exports.getPayments = async (req, res, next) => {
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

    let filterMatch = Object.keys(filter).reduce((acc, key) => {
      if (key === 'query') {
        acc['$or'] = [{ transactionType: caseInsensitive(filter[key]) }]
      } else {
        if (!!filter[key]) acc[key] = caseInsensitive(filter[key])
      }
      return acc
    }, {})

    filterMatch = {
      ...filterMatch,
      owner: id,
      ownerModel: Business.COLLECTION_NAME
    }
    let options = {
      skip: pageNumber * pageSize,
      limit: pageSize
    }
    if (sortField) {
      let sort = { [sortField]: ascDeskToNumber(sortOrder) }
      options = { ...options, sort }
    }
    const payments = await Payment.find(filterMatch, {}, options).populate(
      'resource',
      'id discount items'
    )
    const totalCount = await Payment.find(filterMatch).count()
    if (!payments) {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    }
    res.send({
      success: true,
      payments,
      totalCount
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

module.exports.changeStatus = async (req, res, next) => {
  try {
    const id = req.params.id
    console.log(id)
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    const business = await Business.findById(id)
    if (!business) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }

    business.status = req.body.status

    await business.save()

    res.send({
      success: true,
      business
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
