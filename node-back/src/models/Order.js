const mongoose = require('mongoose')
const moment = require('moment')
const { PointSchema } = require('./Base')
const AutoInc = require('./plugins/autoIncrement')
const Customer = require('./Customer')
const Business = require('./Business')
const AdminUser = require('./AdminUser')
const BusinessUser = require('./BusinessUser')
const Driver = require('./Driver')
const OrderStatuses = require('../constants/OrderStatuses')
const VehicleTypes = require('../constants/VehicleTypes')
const OrderPayerTypes = require('../constants/OrderPayerTypes')
const mongoose_delete = require('mongoose-delete')
const randomString = require('../utils/randomString')
const EventBus = require('../eventBus')

const COLLECTION_NAME = 'order'

function generateTrackingCode(length = 9) {
  return randomString(length, '0123456789')
}

const PickupSchema = mongoose.Schema(
  {
    name: { type: String },
    location: { type: PointSchema },
    address: { type: Object },
    phone: { type: String },
    note: { type: String },
    senderNote: { type: String }
  },
  { _id: false }
)

const DeliverySchema = mongoose.Schema(
  {
    name: { type: String },
    location: { type: PointSchema },
    address: { type: Object },
    phone: { type: String },
    note: { type: String },
    confirm: { type: Object }
  },
  { _id: false }
)
const HistoryOrder = mongoose.Schema(
  {
    create: { type: Date },
    /** Receiving customer confirm's the order **/
    confirm: { type: Date },
    /** Driver accept order suggest **/
    driverAssign: { type: Date },
    /** Driver arrived to pickup location **/
    pickupArrival: { type: Date },
    /** Driver complete the pickup **/
    pickupComplete: { type: Date },
    /** Driver arrived to delivery location **/
    deliveryArrival: { type: Date },
    /** Driver complete the delivery **/
    deliveryComplete: { type: Date },
    /** Order cancel time **/
    cancel: { type: Date },
    /** Driver starts's returning the order to sender **/
    returnStart: { type: Date },
    /** Driver successfully returned the order to sender **/
    returnComplete: { type: Date }
  },
  { _id: false }
)
const OrderLoggerTypes = {
  Driver: 'Driver',
  Business: 'Business',
  BusinessUser: 'BusinessUser',
  Customer: 'Customer',
  Admin: 'Admin',
  System: 'System'
}

const OrderPackageSchema = mongoose.Schema(
  {
    photos: {
      type: [String],
      default: []
    },
    note: { type: String },
    reference: { type: String },
    description: { type: String },
    trackingCode: {
      type: String,
      default: generateTrackingCode
    },
    trackingConfirmation: { type: Date }
  },
  { _id: false }
)
const OrderCancelSchema = mongoose.Schema(
  {
    cancelerModel: {
      type: String,
      required: true,
      enum: [
        Customer.COLLECTION_NAME,
        Business.COLLECTION_NAME,
        Driver.COLLECTION_NAME,
        AdminUser.COLLECTION_NAME
      ]
    },
    canceler: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'cancelerModel'
    },
    cancelledBy: { type: String },
    customerNoShow: { type: Boolean, default: false },
    reason: { type: String },
    date: { type: Date, default: new Date() }
  },
  { _id: false }
)
const CostSchema = mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    vehicleType: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    businessCoverage: { type: Number, default: 0 },

    cancelFee: { type: Number, default: 0 },
    returnFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 }
  },
  {
    _id: false
  }
)
const OrderScheduleSchema = mongoose.Schema(
  {
    confirmed: { type: Boolean, default: false },
    date: { type: Date },
    from: { type: String },
    to: { type: String }
  },
  {
    _id: false
  }
)
const OrderLogSchema = mongoose.Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true }
})

const FeedbackSchema = mongoose.Schema(
  {
    rate: { type: Number, required: true },
    comment: { type: String }
  },
  { _id: false, timestamps: true }
)

let orderSchema = mongoose.Schema(
  {
    senderModel: {
      type: String,
      required: true,
      enum: [Customer.COLLECTION_NAME, Business.COLLECTION_NAME]
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel'
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Customer.COLLECTION_NAME,
      required: true
    },
    isRequest: { type: Boolean, default: false },
    packages: { type: [OrderPackageSchema], required: true },
    schedule: { type: OrderScheduleSchema },
    pickup: { type: PickupSchema },
    delivery: { type: DeliverySchema },
    direction: { type: Object, default: null },
    payer: {
      type: String,
      enum: Object.values(OrderPayerTypes),
      default: OrderPayerTypes.Receiver
    },
    creditCard: { type: String },
    date: { type: Date, required: true },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleTypes),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(OrderStatuses),
      default: OrderStatuses.Created
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Driver.COLLECTION_NAME
    },
    time: { type: HistoryOrder },
    confirmationCode: { type: String, default: () => generateTrackingCode(4) },
    cost: { type: CostSchema },
    logs: { type: [OrderLogSchema], default: [] },
    cancel: { type: OrderCancelSchema },
    receiverFeedback: { type: FeedbackSchema },
    senderFeedback: { type: FeedbackSchema }
  },
  {
    timestamps: true
  }
)

orderSchema.plugin(AutoInc)
orderSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
})
orderSchema.methods.addLog = function (text) {
  this.logs.push({ date: Date.now(), text })
}

module.exports = mongoose.model(COLLECTION_NAME, orderSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.PayerType = OrderPayerTypes
module.exports.VehicleType = VehicleTypes
module.exports.Status = OrderStatuses
module.exports.generateTrackingCode = generateTrackingCode
module.exports.cancelByBusiness = async (order, business, businessUser) => {
  // console.log({ order, business, businessUser })
  let isReturn = !!order.time.pickupComplete
  order.status = isReturn
    ? (order.status = OrderStatuses.Returned)
    : OrderStatuses.Canceled
  order.cancel = {
    canceler: business._id,
    cancelerModel: Business.COLLECTION_NAME,
    cancelledBy: businessUser,
    date: Date.now()
  }
  console.log(order)
  await EventBus.emit(EventBus.EVENT_ORDER_CANCELED, { order })
  if (!isReturn) {
    await EventBus.emit(EventBus.EVENT_ORDER_COMPLETED, { order })
  }
}
module.exports.cancelByCustomer = async (order, customer) => {
  let isReturn = !!order.time.pickupComplete

  order.status = isReturn
    ? (order.status = OrderStatuses.Returned)
    : OrderStatuses.Canceled
  order.cancel = {
    canceler: customer._id,
    cancelerModel: Customer.COLLECTION_NAME,
    date: Date.now()
  }
  await EventBus.emit(EventBus.EVENT_ORDER_CANCELED, { order })
  if (!isReturn) {
    await EventBus.emit(EventBus.EVENT_ORDER_COMPLETED, { order })
  }
}
module.exports.cancelByDriver = async (
  order,
  driver,
  customerNoShow,
  cancelingReason
) => {
  let isReturn = !!order.time.pickupComplete
  customerNoShow = parseBoolean(customerNoShow)

  if (!isReturn) {
    if (customerNoShow) {
      order.status = OrderStatuses.Canceled
      order.cancel = {
        canceler: order.sender._id,
        cancelerModel: order.senderModel,
        date: Date.now(),
        customerNoShow: true,
        reason: cancelingReason
      }
    } else {
      order.status = OrderStatuses.Pending
      order.time.driverAssign = undefined
      order.driver = undefined
    }
    order.time.cancel = Date.now()
  } else {
    order.status = OrderStatuses.Returned
    order.cancel = {
      canceler: customerNoShow ? order.sender._id : driver._id,
      cancelerModel: customerNoShow
        ? order.senderModel
        : Driver.COLLECTION_NAME,
      date: Date.now(),
      customerNoShow: customerNoShow,
      reason: cancelingReason
    }
    order.time.returnStart = Date.now()
    await EventBus.emit(EventBus.EVENT_ORDER_RETURN_START, { order })
    await EventBus.emit(EventBus.EVENT_ORDER_CANCELED, { order })
    await EventBus.emit(EventBus.EVENT_ORDER_COMPLETED, { order })
  }
}

module.exports.cancelByAdmin = async (order, adminUser, adminName) => {
  // console.log({ order, business, businessUser })
  let isReturn = !!order.time.pickupComplete
  order.status = isReturn
    ? (order.status = OrderStatuses.Returned)
    : OrderStatuses.Canceled
  order.cancel = {
    canceler: adminUser,
    cancelerModel: AdminUser.COLLECTION_NAME,
    cancelledBy: adminName,
    date: Date.now()
  }
  console.log(order)
  await EventBus.emit(EventBus.EVENT_ORDER_CANCELED, { order })
  if (!isReturn) {
    await EventBus.emit(EventBus.EVENT_ORDER_COMPLETED, { order })
  }
}
