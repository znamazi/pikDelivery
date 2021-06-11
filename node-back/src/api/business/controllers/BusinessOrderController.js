const moment = require('moment')
const Customer = require('../../../models/Customer')
const Order = require('../../../models/Order')
const OrderTracks = require('../../../models/OrderTrack')
const RelatedEmail = require('../../../models/RelatedEmail')
const Business = require('../../../models/Business')
const AdminUser = require('../../../models/AdminUser')
const Json2csvParser = require('json2csv').Parser
const ObjectId = require('mongoose').Types.ObjectId
const EventBus = require('../../../eventBus')

const fs = require('fs')
const { pick, flatten, difference, intersection } = require('lodash')
const {
  caseInsensitiveContain,
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const {
  sendWelcomeEmail,
  sendOrderEmail
} = require('../../../controllers/EmailController')
const OrderStatuses = require('../../../constants/OrderStatuses')
const { userError, Codes } = require('../../../messages/userMessages')
const BusinessUser = require('../../../models/BusinessUser')
const OrderTrack = require('../../../models/OrderTrack')

module.exports.listName = async (req, res, next) => {
  try {
    const businessId = req.locals.user.business
    const { name } = req.body
    let query = {
      $or: [
        { firstName: caseInsensitiveContain(name) },
        { lastName: caseInsensitiveContain(name) }
      ],
      'orders.sender': businessId
    }
    let aggregate = [
      {
        $lookup: {
          from: 'orders',
          let: {
            receiver: '$_id',
            sender: businessId
          },

          pipeline: [
            {
              $match: {
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
      },
      { $match: { ...query } },
      {
        $addFields: {
          name: { $toLower: { $concat: ['$firstName', ' ', '$lastName'] } }
        }
      },
      { $limit: 10 }
    ]
    let customer = await Customer.aggregate(aggregate)
    res.send({
      success: true,
      customer
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.listEmail = async (req, res, next) => {
  try {
    const businessId = req.locals.user.business
    const { email } = req.body
    let query = {
      email: caseInsensitiveContain(email),
      'orders.sender': businessId
    }
    let aggregate = [
      {
        $lookup: {
          from: 'orders',
          let: {
            receiver: '$_id',
            sender: businessId
          },

          pipeline: [
            {
              $match: {
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
      },
      {
        $addFields: {
          name: { $toLower: { $concat: ['$firstName', ' ', '$lastName'] } }
        }
      },
      { $match: { ...query } },
      { $limit: 10 }
    ]
    let customer = await Customer.aggregate(aggregate)
    if (customer.length === 0) {
      query = {
        emails: { $in: [new RegExp(email, 'i')] }
      }
      let result = await RelatedEmail.find(query).limit(10)
      if (result.length > 0) {
        result.forEach((item) => {
          item.emails.forEach((emailItem) => {
            if (emailItem.includes(email))
              customer.push({
                _id: item.customer,
                email: emailItem
              })
          })
        })
      }
    }

    res.send({
      success: true,
      customer
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.create = async (req, res, next) => {
  try {
    const { email, senderModel, mobile, name, vehicleType, packages } = req.body

    const sender = ObjectId(req.locals.user.business)
    if (!email) throw userError(Codes.ERROR_CUSTOMER_EMAIL_REQUIRE)
    if (!name) throw userError(Codes.ERROR_CUSTOMER_NAME_REQUIRE)
    if (!mobile) throw userError(Codes.ERROR_CUSTOMER_MOBILE_REQUIRE)
    if (!vehicleType) throw userError(Codes.vehicleType)
    if (!sender) throw userError(Codes.ERROR_SENDER_REQUIRE)
    if (!senderModel) throw userError(Codes.ERROR_SENDER_MODEL_REQUIRE)
    const isEmptyPackages = packages.some(
      (x) => x.reference == '' || x.description == ''
    )

    if (!packages || packages.length === 0 || isEmptyPackages)
      throw userError(Codes.ERROR_PACKAGE_REQUIRE)
    let checkKeyPresenceInPackages = packages.every(
      (obj) =>
        Object.keys(obj).includes('reference') &&
        Object.keys(obj).includes('description')
    )
    if (!checkKeyPresenceInPackages)
      throw userError(Codes.ERROR_PACKAGE_ITEM_REQUIRE)
    let customer = await Customer.findOne({
      $or: [
        { email: { $regex: new RegExp('^' + email + '$', 'i') } },
        { mobile }
      ]
    })
    if (!customer) {
      customer = await Customer.create({ email, mobile, firstName: name })

      // sendWelcomeEmail(email)
    }
    if (customer.deleted) {
      await customer.restore()
    }
    let business = await Business.findById(sender)
    if (!business) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    if (!business.address) {
      throw { message: 'Your business has no address' }
    }
    let newOrder = {
      ...req.body,
      sender: business,
      receiver: customer,
      pickup: {
        name: business.name,
        location: business.location,
        address: business.address,
        phone: business.phone
      },
      delivery: {
        name: name,
        phone: mobile
      },
      date: new Date(),
      time: { create: new Date() },
      // TODO-Not Register order (remove it and read not register from customer)

      // status:
      //   customer.status === 'Not Registered' ? 'Not Registered' : 'Created'
      status: 'Created'
    }
    console.log('before send email')
    let order = new Order(newOrder)
    // save before is for generating id
    await order.save()
    await EventBus.emit(EventBus.EVENT_ORDER_CREATE, { order })
    // save after is for storing logs
    await order.save()

    res.send({
      success: true,
      order
    })
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
      errorCode: error.errorCode
    })
  }
}

module.exports.export = (req, res, next) => {
  console.log(req.body)
  let { filter = {}, sortOrder, sortField } = req.body
  let filterOfFields = pick(filter, ['query'])
  let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
    if (key === 'query') {
      if (filterOfFields[key]) {
        acc['$or'] = [
          { 'customer.firstName': caseInsensitive(filterOfFields[key]) },
          { 'customer.lastName': caseInsensitive(filterOfFields[key]) },
          { 'customer.mobile': caseInsensitive(filterOfFields[key]) },
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

  filterMatch = {
    ...filterMatch,
    sender: req.locals.user.business,
    deleted: false
  }
  console.log(filterMatch)
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
      let output = data.map((item) => ({
        ID: item.id,
        Date: moment(item.date).format('LL'),
        Name: `${item.customer.firstName} ${item.customer.lastName}`,
        Email: item.customer.email,
        Phone: item.customer.mobile,
        Items: item.items,
        Vehicle: item.vehicleType,
        Status: item.status,
        'Delivery Date': item.time.deliveryComplete
      }))
      const json2csvParser = new Json2csvParser({ header: true })
      const csvData = json2csvParser.parse(output)
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

module.exports.import = async (req, res, next) => {
  try {
    // let emails = req.body.map((order) => order.email.trim())

    // let customers = await Customer.find({ email: { $in: emails } })
    // let emailList = flatten(customers.map((customer) => customer.email))
    // let differenceEmail = difference(emails, emailList)
    // let infoNewCustomers = []
    // req.body.forEach((order) => {
    //   if (differenceEmail.includes(order.email.trim())) {
    //     let data = {
    //       firstName: order.name,
    //       email: order.email.trim(),
    //       mobile: order.phone
    //     }
    //     infoNewCustomers.push(data)
    //   }
    // })
    // const newCustomersEmail = differenceEmail.join(',')
    // let newCustomers = await Customer.create(infoNewCustomers)
    // if (newCustomers) {
    //   customers = [...customers, ...newCustomers]
    //   // sendWelcomeEmail(newCustomersEmail)
    // }

    let business = await Business.findById(req.locals.user.business)
    let referencesList = flatten(
      req.body.map((order) => order.packages.map((pkg) => pkg.reference))
    )
    referencesList = referencesList.map((r) => (r ? r.toString() : ''))
    let ordersAlredyExist = await Order.find({
      sender: business._id,
      'packages.reference': { $in: referencesList }
    })
    if (ordersAlredyExist.length > 0) {
      let existingReferences = flatten(
        ordersAlredyExist.map((order) =>
          order.packages.map((pkg) => pkg.reference)
        )
      )
      let intersectionItem = intersection(existingReferences, referencesList)
      return res.send({
        success: false,
        ...userError(
          Codes.ERROR_ITEM_IMPORT_ORDER_EXIST,
          `One or more of package reference already exist on the server: 
          ${intersectionItem.join(', ')}`
        ),
        errorData: intersectionItem.join(', '),
        data: {
          intersectionItem
        }
      })
    }
    for (let index = 0; index < req.body.length; index++) {
      const orderItem = req.body[index]
      // let customer = customers.find(
      //   (item) => item.email.trim() == orderItem.email.trim()
      // )
      let customer = await Customer.findOne({
        $or: [
          {
            email: {
              $regex: new RegExp('^' + orderItem.email.trim() + '$', 'i')
            }
          },
          { mobile: orderItem.phone }
        ]
      })
      if (!customer) {
        let data = {
          firstName: orderItem.name,
          email: orderItem.email.trim(),
          mobile: orderItem.phone
        }
        customer = await Customer.create(data)
      }
      let newOrder = {
        ...orderItem,
        senderModel: 'business',
        sender: business,
        receiver: customer,
        pickup: {
          name: business.name,
          location: business.location,
          address: business.address,
          phone: business.phone
        },
        delivery: {
          name: orderItem.name,
          phone: orderItem.phone
        },
        date: new Date(),
        time: { create: new Date() },
        // TODO-Not Register order (remove it and read not register from customer)
        // status:
        //   customer.status === 'Not Registered' ? 'Not Registered' : 'Created'
        status: 'Created'
      }
      const order = new Order({ ...newOrder })
      // save before is for generating id
      await order.save()
      await EventBus.emit(EventBus.EVENT_ORDER_CREATE, { order })
      // save after is for storing logs
      await order.save()
    }

    res.send({
      success: true
    })
  } catch (error) {
    console.log('------------------', error)

    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.cancel = async (req, res, next) => {
  try {
    const business = await Business.findById(req.locals.user.business)
    const ids = req.body
    console.log(ids)
    let order
    for (let index = 0; index < ids.length; index++) {
      order = await Order.findById(ids[index])
      // console.log(order)
      if (!order) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      await Order.cancelByBusiness(order, business, req.locals.user.name)

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

module.exports.update = async (req, res, next) => {
  try {
    const { email, mobile, name } = req.body
    if (!email) {
      throw userError(Codes.ERROR_CUSTOMER_EMAIL_REQUIRE)
    }
    if (!name) {
      throw userError(Codes.ERROR_CUSTOMER_NAME_REQUIRE)
    }
    if (!mobile) {
      throw userError(Codes.ERROR_CUSTOMER_MOBILE_REQUIRE)
    }
    const id = req.params.id
    if (isNaN(id) || !id) {
      throw userError(Codes.ERROR_ORDER_NOT_FOUND)
    }
    let customer = await Customer.findOne({ email })
    if (!customer) {
      customer = await Customer.create({ email, mobile, firstName: name })
      sendWelcomeEmail(email)
    }
    if (
      customer.status === 'Not Registered' &&
      customer.firstName != req.body.name
    ) {
      customer.firstName = req.body.name
      customer.save()
    }
    let newData = {
      ...req.body,
      delivery: {
        name: req.body.name,
        location: { type: 'Point', coordinates: [-77.5, 37.7] },
        address: customer.address,
        phone: req.body.mobile
      },
      receiver: customer._id,

      // TODO-Not Register order (remove it and read not register from customer)

      status: req.body.status ? req.body.status : 'Created'
    }
    const updates = Object.keys(newData)
    const allowedUpdate = [
      'senderModel',
      'email',
      'name',
      'mobile',
      'vehicleType',
      'receiver',
      'packages',
      'delivery',
      'status'
    ]
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }

    const order = await Order.findOne({ id }).populate(['sender', 'receiver'])
    if (!order) {
      throw userError(Codes.ERROR_ORDER_NOT_FOUND)
    }
    if (
      ['Canceled', 'Progress', 'Returned', 'Delivered'].includes(order.status)
    ) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    newData = {
      ...newData,
      schedule: { ...order.schedule, confirmed: false },
      status: 'Reschedule'
    }
    updates.forEach((update) => (order[update] = newData[update]))
    await EventBus.emit(EventBus.EVENT_BUSINESS_UPDATE_ORDER, { order })

    await order.save()

    res.send({
      success: true,
      order
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

module.exports.todayOrders = async (req, res, next) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD')
    const ordersTrack = await OrderTrack.find({
      createdAt: currentDate
    })

    const orders = await Order.find({
      sender: req.locals.user.business,
      schedule: { $exists: true },
      'schedule.date': currentDate,
      deleted: false,
      $or: [
        {
          status: {
            $nin: [
              OrderStatuses.Delivered,
              OrderStatuses.Returned,
              OrderStatuses.Canceled,
              OrderStatuses.Reschedule
            ]
          }
        },
        {
          'time.returnComplete': { $exists: false },
          status: {
            $nin: [
              OrderStatuses.Delivered,
              OrderStatuses.Canceled,
              OrderStatuses.Reschedule
            ]
          }
        }
      ]
    })
      .populate('receiver')
      .populate('driver')

    res.send({
      success: true,
      ordersTrack,
      orders
    })
  } catch (error) {
    console.log(error)
    res.send({ success: false, ...userError(Codes.SERVER_SIDE_ERROR) })
  }
}

module.exports.canceler = async (req, res, next) => {
  try {
    const canceler = await BusinessUser.findById(req.params.canceler)
    if (!canceler) throw userError(Codes.ERROR_USER_NOT_FOUND)
    res.send({
      success: true,
      canceler
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
