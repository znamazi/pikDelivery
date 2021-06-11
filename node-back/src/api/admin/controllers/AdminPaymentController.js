const Payment = require('../../../models/Payment')
const { userError, Codes } = require('../../../messages/userMessages')
const { pick } = require('lodash')
const mongo = require('mongodb')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const Business = require('../../../models/Business')
const ObjectId = require('mongoose').Types.ObjectId
const BusinessInvoice = require('../../../models/BusinessInvoice')
const moment = require('moment')
const Json2csvParser = require('json2csv').Parser

module.exports.list = async (req, res, next) => {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  const businessId = req.params.id

  let filterOfFields = pick(filter, ['query'])

  let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
    if (key === 'query') {
      if (filterOfFields[key]) {
        acc['$or'] = [
          { ownerName: caseInsensitive(filterOfFields[key]) }
          // {
          //   packages: {
          //     $elemMatch: {
          //       trackingCode: caseInsensitive(filterOfFields[key])
          //     }
          //   }
          // },
          // {
          //   _id: mongo.ObjectID.isValid(filterOfFields[key])
          //     ? mongo.ObjectID(filterOfFields[key])
          //     : ''
          // }
          // { id: parseInt(filterOfFields[key]) }
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
      createdAt: {
        ...(hasDateFrom ? { $gte: new Date(filter['date_from']) } : {}),
        ...(hasDateTo ? { $lte: new Date(filter['date_to']) } : {})
      }
    }
  }
  filterMatch =
    req.locals.userType === 'BusinessUser' || businessId
      ? {
          ...filterMatch,
          business: businessId
            ? mongo.ObjectID(businessId)
            : req.locals.user.business
        }
      : { ...filterMatch }
  let options = {
    skip: pageNumber * pageSize,
    limit: pageSize
  }
  if (sortField) {
    let sort = { [sortField]: ascDeskToNumber(sortOrder) }
    options = { ...options, sort }
  }
  const payments = await Payment.find(filterMatch, {}, options)
    .populate('resource', 'id  discount items')
    .populate('user', 'name username email')
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
    const businessId = req.params.id

    let filterOfFields = pick(filter, ['query'])

    let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
      if (key === 'query') {
        if (filterOfFields[key]) {
          acc['$or'] = [
            { ownerName: caseInsensitive(filterOfFields[key]) }
            // {
            //   _id: mongo.ObjectID.isValid(filterOfFields[key])
            //     ? mongo.ObjectID(filterOfFields[key])
            //     : ''
            // }
          ]
        }
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
    let hasDateFrom =
        filter.hasOwnProperty('date_from') && filter['date_from'] != '',
      hasDateTo = filter.hasOwnProperty('date_to') && filter['date_to'] != ''
    if (hasDateFrom || hasDateTo) {
      filterMatch = {
        ...filterMatch,
        createdAt: {
          ...(hasDateFrom ? { $gte: new Date(filter['date_from']) } : {}),
          ...(hasDateTo ? { $lte: new Date(filter['date_to']) } : {})
        }
      }
    }
    filterMatch =
      req.locals.userType === 'BusinessUser' || businessId
        ? {
            ...filterMatch,
            business: businessId
              ? mongo.ObjectID(businessId)
              : req.locals.user.business
          }
        : { ...filterMatch }
    let options = {}
    if (sortField) {
      let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
      options = { ...options, ...sorting }
    }
    const payments = await Payment.find(filterMatch, {}, options)
      .populate('resource', 'id  discount items')
      .populate('user', 'name username email')
    let output = payments.map((item) => {
      return {
        ID: item._id,
        Date: moment(item.createdAt).format('DD/MM/YY h:mm A'),
        'TRANSACTION TYPE': item.transactionType,
        Customer: `${item.ownerName} - ${item.ownerModel}`,
        Amount: item.captureAmount
          ? item.captureAmount.toFixed(2)
          : item.authAmount.toFixed(2),
        'Invoice ID':
          item.resourceModel == BusinessInvoice.COLLECTION_NAME
            ? item.resource.id
            : '',
        Status: item.status,
        By: item.user ? item.user.name : ''
      }
    })

    const json2csvParser = new Json2csvParser({ header: true })
    const csvData = json2csvParser.parse(output)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + 'Transaction-' + Date.now() + '.csv'
    )

    res.send(csvData)
  } catch (error) {
    console.log(error)
    res.send({
      success: false,
      ...userError(Codes.ERROR_TRANSACTION_EXPORT_FAIL)
    })
  }
}

module.exports.create = async (req, res, next) => {
  try {
    let id = req.locals.user.id
    const newData = {
      ...req.body,
      transactionType: 'Bank Transfer',
      status: 'paid',
      resourceModel: BusinessInvoice.COLLECTION_NAME,
      ownerModel: 'business',
      user: id
    }
    const payment = await Payment.create(newData)
    res.send({
      success: true,
      payment,
      user: { id: req.locals.user.id, name: req.locals.user.name }
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
    const allowedUpdate = ['status']
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_PAYMENT_NOT_FOUND)
    }
    const payment = await Payment.findById(id)
    if (!payment) {
      throw userError(Codes.ERROR_PAYMENT_NOT_FOUNDD)
    }

    updates.forEach((update) => (payment[update] = req.body[update]))
    await payment.save()

    res.send({
      success: true,
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
