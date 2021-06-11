const EventBus = require('./eventBus')
const Order = require('./models/Order')
const OrderTrack = require('./models/OrderTrack')
const OrderSuggest = require('./models/OrderSuggest')
const Payment = require('./models/Payment')
const Driver = require('./models/Driver')
const DriverOnlineLocation = require('./models/DriverOnlineLocation')
const Business = require('./models/Business')
const BusinessInvoice = require('./models/BusinessInvoice')
const Customer = require('./models/Customer')
const {userError, Codes: ErrorCodes} = require('./messages/userMessages')
const PaymentController = require('./controllers/PaymentController')
const NotificationController = require('./controllers/NotificationController')
const SmsController = require('./controllers/SmsController')
const PricingGroup = require('./models/PricingGroup')
const ObjectID = require('mongodb').ObjectID
const PikCache = require('./pik-cache')
const {caseInsensitive} = require('./utils/queryUtils')
const {sleep} = require('./utils/helpers')
const {sendOrderEmail} = require('./controllers/EmailController')

const getOrderDriverId = (order) => {
  if (order.driver) {
    if (order.driver instanceof ObjectID) return order.driver
    else return order.driver._id
  } else {
    return null
  }
}
const getOrderReceiverId = (order) => {
  if (order.receiver) {
    if (order.receiver instanceof ObjectID) return order.receiver
    else return order.receiver._id
  } else {
    return null
  }
}
const getOrderSenderId = (order) => {
  if (order.sender) {
    if (order.sender instanceof ObjectID) return order.sender
    else return order.sender._id
  } else {
    return null
  }
}
const getOrderDriver = async (order) => {
  if (order.driver instanceof ObjectID)
    return Driver.findOne({_id: order.driver})
  else {
    return order.driver
  }
}
const getOrderSender = async (order) => {
  if (order.sender instanceof ObjectID) {
    if (order.senderModel === Business.COLLECTION_NAME)
      return Business.findOne({_id: order.sender})
    else return Customer.findOne({_id: order.sender})
  } else {
    return order.sender
  }
}
const getOrderReceiver = async (order) => {
  if (order.receiver instanceof ObjectID)
    return Customer.findOne({_id: order.receiver})
  else {
    return order.receiver
  }
}

EventBus.on(EventBus.EVENT_CUSTOMER_EMAIL_ASSIGN, async function ({customer}) {
  let nonRegisteredCustomer = await Customer.findOne({
    email: caseInsensitive(customer.email),
    status: Customer.Statuses.NotRegistered
  })

  if (
    nonRegisteredCustomer &&
    nonRegisteredCustomer._id.toString() !== customer._id.toString()
  ) {
    await Customer.deleteOne({_id: nonRegisteredCustomer._id})
    await sleep(200)
    await Order.update(
      {receiver: nonRegisteredCustomer},
      {$set: {receiver: customer}}
    )
  }
})

EventBus.on(EventBus.EVENT_DRIVER_STATUS_CHANGED, async function ({driver}) {
  if (driver.status !== Driver.Status.Approved) {
    await DriverOnlineLocation.deleteMany({driver: driver._id})
    driver.online = false
  }
  let message = '',
    action = ''
  switch (driver.status) {
    case Driver.Status.Recheck:
      message =
        'Your documents has been reviewed.\nPlease recheck your document.'
      action = 'documents_recheck'
      break
    case Driver.Status.Rejected:
      message =
        'Your documents has been reviewed.\nUnfortunately it has been rejected.'
      action = 'documents_reject'
      break
    case Driver.Status.Approved:
      message = 'Congratulation, your documents has been approved.'
      action = 'documents_approve'
      break
  }
  if (!!message) {
    console.log({message, action})
    NotificationController.sendNotificationToUsers(
      [driver._id],
      {
        title: 'PIK Partners',
        body: message
      },
      {
        data: {action}
      }
    )
  }
})

EventBus.on(EventBus.EVENT_ORDER_CREATE, async function ({order}) {
  let sender = await getOrderSender(order)
  let receiver = await getOrderReceiver(order)
  let owner = order.isRequest ? receiver : sender

  order.addLog(`Order created by ${owner.name}`)

  if (receiver.status === Customer.Statuses.Registered) {
    if (order.isRequest) {
      NotificationController.notifyOrderRequest(sender, receiver, order)
    } else {
      if (order.senderModel === Business.COLLECTION_NAME) {
        NotificationController.notifyOrderAvailable(sender, receiver, order)
      } else {
        if (!order.delivery.address) {
          NotificationController.notifyOrderAddressRequest(
            sender,
            receiver,
            order
          )
        } else {
          NotificationController.notifyOrderSend(sender, receiver, order)
        }
      }
    }
  } else {
    if (order.senderModel === Business.COLLECTION_NAME) {
      sendOrderEmail(receiver.email, sender.name)
    } else {
      try {
        await SmsController.sendOrderCreate(order, sender, receiver)
      }
      catch (e) {
        console.error(e)
      }
    }
  }
})

EventBus.on(EventBus.EVENT_BUSINESS_UPDATE_ORDER, async function ({order}) {
  NotificationController.sendNotificationToUsers(
    [order.receiver._id],
    {
      title: order.sender.name,
      body: `Your order was edited by ${order.sender.name} Please book again`
    },
    {
      data: {
        order: order._id.toString()
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_RESCHEDULE, async function ({order}) {
  NotificationController.sendNotificationToUsers(
    [getOrderReceiverId(order)],
    {
      title: 'PIK Delivery',
      body: `Sorry, One of your package needs to reschedule.`
    },
    {
      data: {
        order: order._id.toString()
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_SUGGESTION, async function ({order, driver}) {
  await Driver.update({_id: driver._id}, {$inc: {'jobs.total': 1}})
  NotificationController.sendNotificationToUsers(
    [driver._id],
    {
      title: 'PIK Partners',
      body: `New delivery suggestion for you`
    },
    {
      data: {
        action: 'suggestion',
        order: order._id.toString()
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_DRIVER_ASSIGNED, async function ({order}) {
  await Driver.update({_id: getOrderDriverId(order)}, {busy: true})
  await OrderSuggest.deleteMany({order, ignored: false})

  order.addLog(`Order assigned to ${order.driver.name}`)

  if (order.senderModel === Customer.COLLECTION_NAME) {
    NotificationController.sendNotificationToUsers(
      [order.sender._id.toString()],
      {
        title: 'PIK Delivery',
        body: 'Drive assigned to your order.'
      },
      {
        data: {
          order: order._id.toString()
        }
      }
    )
  }
  NotificationController.sendNotificationToUsers(
    [order.receiver._id.toString()],
    {
      title: 'PIK Delivery',
      body: 'Drive assigned to your order.'
    },
    {
      data: {
        order: order._id.toString()
      }
    }
  )
  NotificationController.sendNotificationToUsers(
    [order.driver._id.toString()],
    {
      title: 'PIK Delivery',
      body: 'Order assigned to you.'
    },
    {
      data: {
        action: 'reload_current_job'
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_DRIVER_REMOVE, async function ({order}) {
  await Driver.update({_id: getOrderDriverId(order)}, {busy: false})
  await OrderSuggest.deleteMany({order, driver: order.driver})

  NotificationController.sendNotificationToUsers(
    [order.driver._id.toString()],
    {
      title: 'PIK Delivery',
      body: 'Your current order removed.'
    },
    {
      data: {
        action: 'reload_current_job'
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_PICKUP_ARRIVAL, async function ({order}) {
  await OrderTrack.update(
    {order, driver: getOrderDriverId(order)},
    {timeToArrive: {text: 'On Place', value: 0}}
  )
  order.addLog(`Driver reach point A`)
  if (order.senderModel === Customer.COLLECTION_NAME) {
    NotificationController.sendNotificationToUsers(
      [order.sender._id],
      {
        title: 'PIK Delivery',
        body: 'Drive arrived to your pickup location.'
      },
      {
        data: {
          order: order._id.toString()
        }
      }
    )
  }
  NotificationController.sendNotificationToUsers(
    [order.receiver._id],
    {
      title: 'PIK Delivery',
      body: 'Drive arrived to your orders pickup location.'
    },
    {
      data: {
        order: order._id.toString()
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_PICKUP_COMPLETE, async function ({order}) {
  await OrderTrack.update(
    {order, driver: getOrderDriverId(order)},
    {
      headingTo: 'delivery',
      timeToArrive: {text: '', value: 0}
    }
  )
  order.addLog(`Pickup complete`)
  NotificationController.sendNotificationToUsers(
    [order.receiver._id],
    {
      title: 'PIK Delivery',
      body: 'Drive picked up the package and moved to your location.'
    },
    {
      data: {
        order: order._id.toString()
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_DELIVERY_ARRIVAL, async function ({order}) {
  await OrderTrack.update(
    {order, driver: getOrderDriverId(order)},
    {
      // headingTo: 'delivery',
      timeToArrive: {text: 'On Place', value: 0}
    }
  )
  order.addLog(`Driver reach point B`)
  NotificationController.sendNotificationToUsers(
    [order.receiver._id],
    {
      title: 'PIK Delivery',
      body: 'Drive arrived to deliver your packages.'
    },
    {
      data: {
        order: order._id.toString()
      }
    }
  )
})

EventBus.on(EventBus.EVENT_ORDER_RETURN_START, async function ({order}) {
  await OrderTrack.update(
    {order, driver: getOrderDriverId(order)},
    {
      headingTo: 'return',
      timeToArrive: {text: '', value: 0}
    }
  )
  order.addLog(`Order return to point A started`)
})

EventBus.on(EventBus.EVENT_ORDER_RETURN_COMPLETE, async function ({order}) {
  order.addLog(`Order returned to point A`)
})

EventBus.on(EventBus.EVENT_ORDER_COMPLETED, async function ({order}) {
  let driverId = getOrderDriverId(order)
  await Driver.update({_id: driverId}, {busy: false})

  let sender = await getOrderSender(order)
  let receiver = await getOrderReceiver(order)

  switch (order.receiver.status) {
    case Order.Status.Delivered:
      NotificationController.notifyOrderDelivered(sender, receiver, order)
      break
    case Order.Status.Returned:
      NotificationController.notifyOrderCanceled(sender, receiver, order)
      break
    case Order.Status.Canceled:
      NotificationController.notifyOrderCanceled(sender, receiver, order)
      break
    default:
      break
  }

  NotificationController.notifyDriverOrderComplete(driverId)
  order.time.complete = Date.now()
  order.addLog(`Order complete`)
})

EventBus.on(EventBus.EVENT_DRIVER_ALMOST_ARRIVE, async function ({order}) {
  let customer = null
  if (!order.time.pickupComplete || order.status === Order.Status.Returned) {
    if (order.senderModel === Business.COLLECTION_NAME) return
    if (!!order.time.pickupArrival) return
    customer = await getOrderSender(order)
  } else {
    customer = await getOrderReceiver(order)
  }

  if (
    PikCache.driverArrivingNotification.get(
      `driver-arriving-${order._id}-${customer._id}`
    )
  )
    return
  PikCache.driverArrivingNotification.set(
    `driver-arriving-${order._id}-${customer._id}`,
    true
  )

  console.log(`Driver arriving to ${customer.name}. Order ID: ${order.id}`)
  NotificationController.sendNotificationToUsers(
    [customer._id.toString()],
    {
      title: 'Driver almost arrive',
      body: `Please wait for your driver`
    },
    {
      data: {
        order: order._id.toString()
      }
    }
  )
})

/** =============== Payment Event Handlers =================*/

async function preAuthorizeOrder(order) {
  let {payer} = order
  let nmiCustomerList = await PaymentController.getCustomerInfo(
    order[payer].email
  )
  let customerToCharge = nmiCustomerList.find(
    (c) => c.customer_vault_id === order.creditCard
  )
  if (!customerToCharge)
    throw userError(ErrorCodes.ERROR_CREDIT_CARD_NOT_MATCHED)
  let authResponse = await PaymentController.auth(
    order.creditCard,
    order.cost.total,
    {
      orderid: order.id || order._id,
      orderdescription: 'Order customer fee'
    }
  )
  if (authResponse.response != '1' || !authResponse.transactionid)
    throw userError(
      ErrorCodes.ERROR_PAYMENT_PRE_AUTHORIZATION,
      authResponse.responsetext
    )
  let orderPayment = new Payment({
    resourceModel: 'order',
    resource: order,
    ownerModel: Customer.COLLECTION_NAME,
    owner: order[payer]._id,
    ownerName: order[payer].name,
    type: Payment.Type.OrderFee,
    transactionType: `Credit card ${customerToCharge.cc_number}`,
    email: order[payer].email,
    description: `Order customer fee`,
    authResponse,
    authAmount: order.cost.total,
    status: Payment.Status.Auth
  })
  await orderPayment.save()
}

EventBus.on(EventBus.EVENT_ORDER_PAYMENT_PRE_AUTHORIZE, async function ({order}) {
  await preAuthorizeOrder(order)
})

EventBus.on(EventBus.EVENT_ORDER_PAYMENT_PRICE_CHANGE, async function ({order}) {
  let payment = await Payment.findOne({
    resource: order._id,
    type: Payment.Type.OrderFee,
    status: Payment.Status.Auth
  })
  if (payment) {
    let cancelResponse = await PaymentController.void(
      payment.authResponse.transactionid
    )
    if (cancelResponse.response != '1')
      throw userError(
        ErrorCodes.ERROR_PAYMENT_PRE_AUTHORIZATION,
        cancelResponse.responsetext
      )
    payment.status = Payment.Status.Cancel
    payment.cancelResponse = cancelResponse
    await payment.save()
  }

  await preAuthorizeOrder(order)
})

EventBus.on(EventBus.EVENT_ORDER_PAYMENT_FINALIZE, async function ({order}) {
  switch (order.status) {
    case Order.Status.Delivered: {
      let payment = await Payment.findOne({
        resource: order._id,
        type: Payment.Type.OrderFee,
        status: Payment.Status.Auth
      })
      if (!payment) throw userError(ErrorCodes.ERROR_PAYMENT_CAPTURE)
      let amount = order.cost.total
      if (order.cost.businessCoverage) {
        /** Process business coverage */
        amount -= order.cost.businessCoverage

        let business = await getOrderSender(order)
        let pricingGroup = await PricingGroup.findOne({title: business.group})

        if (pricingGroup && pricingGroup.active && pricingGroup.credit) {
          let businessInvoice = await business.getCurrentInvoice()
          businessInvoice.items.push({
            order: order._id,
            description: `Servicio de entrega ID${order.id}`,
            amount: order.cost.businessCoverage
          })
          businessInvoice.logs.push({
            date: Date.now(),
            description: `Order ${order.id} price ${order.cost.businessCoverage}`
          })
          await businessInvoice.save()
        } else {
          if (!business.creditCard || !business.creditCard.customer_vault_id) {
            console.log('Business has no credit card', business)
            amount += order.cost.businessCoverage
            business.coverageEnabled = false
            await business.save()
          } else {
            let response = null
            try {
              response = await PaymentController.chargeBusinessCoverage(
                business.creditCard.customer_vault_id,
                order.cost.businessCoverage,
                order._id
              )
            }catch (e) {}
            let coveragePayment = new Payment({
              resourceModel: 'order',
              resource: order,
              ownerModel: Business.COLLECTION_NAME,
              owner: business._id,
              ownerName: business.name,
              type: Payment.Type.BusinessCoverage,
              transactionType: `Credit card ${business.creditCard.cc_number}`,
              email: business.email,
              description: `Order's business coverage fee`,
              captureResponse: response,
              captureAmount: order.cost.businessCoverage,
              status:
                (!!response && response['response'] === '1')
                  ? Payment.Status.Paid
                  : Payment.Status.Fail
            })
            await coveragePayment.save()

            let invoice = new BusinessInvoice({
                business,
                businessName: business.name,
              })

            if (response['response'] !== '1') {
              console.log(
                'error on business coverage charge',
                business,
                response
              )
              amount += order.cost.businessCoverage
              business.coverageEnabled = false
              await business.save()
            }
          }
        }
      }
      let captureResponse = await PaymentController.capture(
        payment.authResponse.transactionid,
        amount
      )
      if (captureResponse.response != '1')
        throw userError(
          ErrorCodes.ERROR_PAYMENT_CAPTURE,
          captureResponse.responsetext
        )
      payment.status = Payment.Status.Paid
      payment.captureAmount = amount
      payment.captureResponse = captureResponse
      await payment.save()
      return
    }
    case Order.Status.Canceled:
    case Order.Status.Returned: {
      console.log('==== need to cancel payment')
      let payment = await Payment.findOne({
        resource: order._id,
        status: Payment.Status.Auth
      })
      console.log({payment})
      if (payment) {
        if (!order.driver) {
          console.log('==== totally cancel the payment')
          let cancelResponse = await PaymentController.void(
            payment.authResponse.transactionid
          )
          payment.status = Payment.Status.Cancel
          payment.cancelResponse = cancelResponse
          await payment.save()
        } else {
          console.log('==== partially cancel the payment')
          if (order.cancel.cancelerModel === Driver.COLLECTION_NAME) {
            let cancelResponse = await PaymentController.void(
              payment.authResponse.transactionid
            )
            payment.status = Payment.Status.Cancel
            payment.cancelResponse = cancelResponse
            await payment.save()
          } else {
            let amount = order.cost.cancelFee
            if (!!order.time.pickupComplete) {
              amount =
                Math.floor(
                  (order.cost.deliveryFee + order.cost.returnFee) * 100
                ) / 100
            }
            console.log('capture amount: ', amount)
            let captureResponse = await PaymentController.capture(
              payment.authResponse.transactionid,
              amount
            )
            payment.status = Payment.Status.Paid
            payment.captureAmount = amount
            payment.captureResponse = captureResponse
            await payment.save()
          }
        }
      }
      return
    }
  }
})
