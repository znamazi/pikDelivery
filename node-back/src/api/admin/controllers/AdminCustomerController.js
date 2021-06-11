const Customer = require('../../../models/Customer')
const Orders = require('../../../models/Order')
const AdminComment = require('../../../models/AdminComment')
const Payment = require('../../../models/Payment')
const ObjectId = require('mongoose').Types.ObjectId
const mongo = require('mongodb')
const { userError, Codes } = require('../../../messages/userMessages')
const { pick } = require('lodash')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')

module.exports.list = function (req, res, next) {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  const businessId = req.params.id
  let nonRegister = ''
  let filterOfFields = pick(filter, ['query'])

  let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
    if (key === 'query') {
      acc['$or'] = [
        { firstName: caseInsensitive(filterOfFields[key]) },
        { lastName: caseInsensitive(filterOfFields[key]) },
        { email: caseInsensitive(filterOfFields[key]) },
        { mobile: caseInsensitive(filterOfFields[key]) }
      ]
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
    if (statusList.includes('Not Registered'))
      nonRegister = { 'orders.senderModel': 'business' }
  }

  filterMatch =
    req.locals.userType === 'BusinessUser' || businessId
      ? {
          ...filterMatch,
          'orders.sender': businessId
            ? mongo.ObjectID(businessId)
            : req.locals.user.business
        }
      : { ...filterMatch }

  let lookup =
    req.locals.userType === 'BusinessUser' || businessId
      ? {
          from: 'orders',
          let: {
            receiver: '$_id',
            sender: businessId
              ? mongo.ObjectID(businessId)
              : req.locals.user.business
          },

          pipeline: [
            {
              $match: {
                deleted: false,
                $expr: {
                  $and: [
                    { $eq: ['$$sender', '$sender'] },
                    { $eq: ['$$receiver', '$receiver'] }
                  ]
                }
              }
            }
          ],
          as: 'orders'
        }
      : {
          from: 'orders',
          let: {
            receiver: '$_id'
          },
          pipeline: [
            {
              $match: {
                deleted: false,
                $expr: {
                  $and: [{ $eq: ['$$receiver', '$receiver'] }]
                }
              }
            }
          ],
          as: 'orders'
        }
  let aggregate = [
    {
      $lookup: lookup
    },

    { $match: { ...filterMatch, deleted: false, ...nonRegister } },
    {
      $addFields: {
        orders: { $size: '$orders' },
        name: { $toLower: { $concat: ['$firstName', ' ', '$lastName'] } }
      }
    }
  ]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }
  paginateAggregate(Customer, aggregate, pageNumber, pageSize)
    .then(({ data, totalCount }) => {
      res.send({
        success: true,
        customers: data,
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
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
    }
    const customer = await Customer.findById(id)
    if (!customer) {
      throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
    }
    res.send({
      success: true,
      customer
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.getOrder = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
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
        acc['$or'] = [
          { vehicleType: caseInsensitive(filterOfFields[key]) },
          { id: parseInt(filterOfFields[key]) },
          { cost: parseFloat(filterOfFields[key]) }
        ]
      } else {
        if (!!filterOfFields[key])
          acc[key] = caseInsensitive(filterOfFields[key])
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
    if (filter.hasOwnProperty('type') && filter['type'] != '') {
      if (filter['type'] == 'Business') {
        filterMatch = { ...filterMatch, senderModel: 'business' }
      } else if (filter['type'] == 'Customer') {
        filterMatch = { ...filterMatch, senderModel: 'customer' }
      }
    }

    filterMatch =
      req.locals.userType === 'BusinessUser'
        ? { ...filterMatch, sender: req.locals.user.business }
        : { ...filterMatch }

    let aggregate = [
      { $match: { ...filterMatch, receiver: ObjectId(id), deleted: false } },
      {
        $lookup: {
          from: 'businesses',
          localField: 'sender',
          foreignField: '_id',
          as: 'businesses'
        }
      },
      {
        $addFields: {
          countPackages: { $size: '$packages' },
          businesses: {
            $arrayElemAt: ['$businesses', 0]
          }
        }
      }
    ]
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
      aggregate.push({ $sort: sorting })
    }
    paginateAggregate(Orders, aggregate, pageNumber, pageSize)
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

module.exports.changeStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body
    const customer = await Customer.updateOne(
      { _id: id },
      {
        $set: {
          status
        }
      }
    )
    const commentData = {
      comment: `Status updated to ${status}`,
      receiver: id,
      sender: req.locals.user._id,
      receiverModel: 'customer'
    }

    const comment = await AdminComment.create({ ...commentData })
    res.send({
      success: true,
      customer,
      comment
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.ERROR_STATUS_UPDATE_FAIL)
    })
  }
}

module.exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
    }
    let customer = await Customer.findById(id)

    if (!customer) {
      throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
    }
    const userId = ObjectId(req.locals.user._id)
    await customer.delete(userId)
    await Orders.delete({ receiver: id, senderModel: 'business' }, userId)
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

module.exports.addComment = async (req, res, next) => {
  try {
    let data = { ...req.body }
    data.sender = req.locals.user._id
    data.receiverModel = 'customer'
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
      throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
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
    console.log(filterMatch)

    let aggregate = [
      {
        $match: {
          ...filterMatch,
          receiver: ObjectId(id),
          receiverModel: 'customer'
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
      throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
    }
    let {
      filter = {},
      sortOrder,
      sortField,
      pageNumber = 0,
      pageSize = 10
    } = req.body
    let filterMatch = {
      owner: id,
      ownerModel: Customer.COLLECTION_NAME
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
      'id'
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
