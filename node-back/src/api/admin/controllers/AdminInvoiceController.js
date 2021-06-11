const Invoice = require('../../../models/BusinessInvoice')
const Payment = require('../../../models/Payment')
const { userError, Codes } = require('../../../messages/userMessages')
const { pick, set, differenceWith, isEqual } = require('lodash')
const mongo = require('mongodb')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const Business = require('../../../models/Business')
const ObjectId = require('mongoose').Types.ObjectId
const Order = require('../../../models/Order')
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
  // let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
  //   if (key === 'query') {
  //     if (filterOfFields[key]) {
  //       acc['$or'] = [{ businessName: caseInsensitive(filterOfFields[key]) }]
  //     }
  //   } else {
  //     if (!!filterOfFields[key]) acc[key] = caseInsensitive(filterOfFields[key])
  //   }
  //   return acc
  // }, {})
  let filterMatch = {}

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
        ...(hasDateFrom
          ? { $gte: moment(filter['date_from']).format('YYYY-MM-DD') }
          : {}),
        ...(hasDateTo
          ? { $lte: moment(filter['date_to']).format('YYYY-MM-DD') }
          : {})
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
  const invoices = await Invoice.find(filterMatch, {}, options)

  const totalCount = await Invoice.find(filterMatch).count()
  if (!invoices) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
  let orderIds = []
  for (let index = 0; index < invoices.length; index++) {
    const invoice = invoices[index]
    let result = invoice.items.filter((item) => item.order)
    ids = new set(result.map((item) => item.order))
    orderIds.push(...ids)
  }

  // let filterOrder = {
  //   _id: { $in: orderIds }
  // }
  // filterOrder = filter.query
  //   ? {
  //       ...filterOrder,
  //       $or: [
  //         {
  //           'packages.trackingCode': caseInsensitive(filter.query)
  //         },
  //         { id: parseInt(filter.query) }
  //       ]
  //     }
  //   : filterOrder

  let orders = await Order.find({
    _id: { $in: orderIds }
  })
  let invoiceList = invoices.map((invoice) => {
    for (let index = 0; index < invoice.items.length; index++) {
      let item = invoice.items[index]
      if (item.order) {
        let order = orders.find((order) => order._id.equals(item.order))
        invoice.items[index].order = order
      }
    }
    return invoice
  })

  if (filter.query) {
    const search = new RegExp([filter.query].join(''), 'i')
    invoiceList = invoiceList.filter(
      (invoice) =>
        invoice.items.find((item) => {
          let condition

          if (item.order) {
            condition =
              search.test(invoice.businessName) ||
              checkTrackingCode(item.order.packages, filter.query) ||
              item.order.id == parseInt(filter.query)
          } else {
            condition = search.test(invoice.businessName)
          }
          return condition
        }) || invoice.id == parseInt(filter.query)
    )
  }
  res.send({
    success: true,
    invoices: invoiceList,
    totalCount
  })
}

module.exports.retrieve = async (req, res, next) => {
  try {
    const id = req.params.id
    if (isNaN(id)) {
      throw userError(Codes.ERROR_INVOICE_NOT_FOUND)
    }
    let invoice = await Invoice.findOne({ id }).populate(
      'logs.user',
      'name username email'
    )
    const payments = await Payment.find({
      resourceModel: 'business-invoice',
      resource: invoice._id
    }).populate('user', 'name username email')
    if (!invoice) {
      throw userError(Codes.ERROR_INVOICE_NOT_FOUND)
    }
    res.send({
      success: true,
      invoice,
      payments
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.businessList = async (req, res, next) => {
  try {
    let businessName = req.body.business
    const businesses = await Business.find(
      {
        $or: [
          { name: caseInsensitive(businessName) },
          { email: caseInsensitive(businessName) }
        ]
      },
      { name: 1, email: 1 }
    ).limit(10)
    if (!businesses) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    res.send({
      success: true,
      businesses
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.create = async (req, res, next) => {
  try {
    const newData = {
      business: req.body.business._id,
      businessName: req.body.business.name,
      items: req.body.items,
      discount: req.body.discount,
      logs: [
        {
          date: Date.now(),
          description: 'Invoice created.',
          user: req.locals.user.id
        }
      ],
      status: req.body.status
    }

    for (let index = 0; index < newData.items.length; index++) {
      const element = newData.items[index]
      const description = `add custom amount ${element.amount}`
      newData.logs = [
        ...newData.logs,
        {
          date: Date.now(),
          description,
          user: req.locals.user.id
        }
      ]
    }

    if (req.body.discount && req.body.discount > 0) {
      newData.logs = [
        ...newData.logs,
        {
          date: Date.now(),
          description: `add discount ${req.body.discount}`,
          user: req.locals.user.id
        }
      ]
    }
    const invoice = await Invoice.create(newData)
    res.send({
      success: true,
      invoice
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
    const allowedUpdate = ['items', 'status', 'discount']
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_INVOICE_NOT_FOUND)
    }
    const invoice = await Invoice.findById(id)
    if (!invoice) {
      throw userError(Codes.ERROR_INVOICE_NOT_FOUNDD)
    }

    // if (req.body.status === 'cancel') {
    //   invoice.logs = [
    //     ...invoice.logs,
    //     {
    //       date: Date.now(),
    //       description: 'Invoice cancelled.',
    //       user: req.locals.user.id
    //     }
    //   ]
    // }
    if (req.body.status !== invoice.status) {
      invoice.logs = [
        ...invoice.logs,
        {
          date: Date.now(),
          description: `Invoice status Changed ${invoice.status} -> ${req.body.status}.`,
          user: req.locals.user.id
        }
      ]
    }
    if (req.body.items) {
      let order = ''
      let editOrder = ''
      let prevItem = ''
      const diff = req.body.items.filter((item) => item.type)
      for (let index = 0; index < diff.length; index++) {
        const element = diff[index]
        if (element.type == 'edit') {
          if (element.order) {
            order = await Order.findById(element.order, { id })
            prevItem = invoice.items
              .filter((item) => item.order)
              .find((item) => item.order.equals(element.order))
            editOrder = `edited order id ${order.id} value ${prevItem.amount} ---> ${element.amount}`
          } else {
            // prevItem = invoice.items.find((item) => item._id == element.id)

            editOrder = `edit custom value ---> ${element.amount}`
          }
        }

        const description =
          element.type == 'edit'
            ? editOrder
            : `add custom amount ${element.amount}`
        invoice.logs = [
          ...invoice.logs,
          {
            date: Date.now(),
            description,
            user: req.locals.user.id
          }
        ]
      }
    }
    if (req.body.discount && req.body.discount !== invoice.discount) {
      invoice.logs = [
        ...invoice.logs,
        {
          date: Date.now(),
          description: `edited discount ${invoice.discount}  --> ${req.body.discount}`,
          user: req.locals.user.id
        }
      ]
    }
    updates.forEach((update) => (invoice[update] = req.body[update]))

    await invoice.save()

    res.send({
      success: true,
      invoice
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

const checkTrackingCode = (packages, query) => {
  const search = new RegExp([query].join(''), 'i')
  for (let index = 0; index < packages.length; index++) {
    const package = packages[index]
    let result = search.test(package.trackingCode)
    if (result) {
      return true
    }
  }
  return false
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

    let filterMatch = {}

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
          ...(hasDateFrom
            ? { $gte: moment(filter['date_from']).format('YYYY-MM-DD') }
            : {}),
          ...(hasDateTo
            ? { $lte: moment(filter['date_to']).format('YYYY-MM-DD') }
            : {})
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
    const invoices = await Invoice.find(filterMatch, {}, options)

    const totalCount = await Invoice.find(filterMatch).count()
    if (!invoices) {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    }
    let orderIds = []
    for (let index = 0; index < invoices.length; index++) {
      const invoice = invoices[index]
      let result = invoice.items.filter((item) => item.order)
      ids = new set(result.map((item) => item.order))
      orderIds.push(...ids)
    }

    let orders = await Order.find({
      _id: { $in: orderIds }
    })
    let invoiceList = invoices.map((invoice) => {
      for (let index = 0; index < invoice.items.length; index++) {
        let item = invoice.items[index]
        if (item.order) {
          let order = orders.find((order) => order._id.equals(item.order))
          invoice.items[index].order = order
        }
      }
      return invoice
    })

    if (filter.query) {
      const search = new RegExp([filter.query].join(''), 'i')
      invoiceList = invoiceList.filter(
        (invoice) =>
          invoice.items.find((item) => {
            let condition

            if (item.order) {
              condition =
                search.test(invoice.businessName) ||
                checkTrackingCode(item.order.packages, filter.query) ||
                item.order.id == parseInt(filter.query)
            } else {
              condition = search.test(invoice.businessName)
            }
            return condition
          }) || invoice.id == parseInt(filter.query)
      )
    }

    let output = invoiceList.map((item) => {
      let sumOfItems = item.items.reduce((acc, i) => acc + i.amount, 0)
      let subTotal = sumOfItems - item.discount
      let itbms = parseFloat((subTotal * 0.07).toFixed(2))
      let total = parseFloat((subTotal + itbms).toFixed(2))

      return {
        ID: item.id,
        Date: moment(item.createdAt).format('DD/MM/YYYY'),
        Amount: total,
        Status: item.status
      }
    })
    const json2csvParser = new Json2csvParser({ header: true })
    const csvData = json2csvParser.parse(output)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + 'Invoice-' + Date.now() + '.csv'
    )

    res.send(csvData)
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.ERROR_ORDER_EXPORT_FAIL)
    })
  }
}
