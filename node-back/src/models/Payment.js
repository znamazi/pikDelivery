const mongoose = require('mongoose')

const COLLECTION_NAME = 'payment'

const STATUSES = {
  Auth: 'auth',
  Paid: 'paid',
  Cancel: 'cancel',
  Fail: 'fail'
}

const TYPES = {
  OrderFee: 'order-fee',
  BusinessCoverage: 'business-coverage'
}

let modelSchema = mongoose.Schema(
  {
    /**
     * [Payment.resourceModel] determines that which model (Order/Invoice) this payment is for.
     */
    ownerModel: {
      type: String,
      enum: ['customer', 'business']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'ownerModel',
      required: true
    },
    ownerName: {
      type: String
    },
    /**
     * [Payment.resourceModel] determines that which model (Order/Invoice) this payment is for.
     */
    resourceModel: {
      type: String,
      enum: ['order', 'business-invoice']
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'resourceModel',
      required: true
    },
    /**
     * Any order may have two payments. One payment for customer fee plus one payment for business coverage fee.
     * [Payment.type] used for determining that this payment is for customer fee or business coverage fee
     */
    type: {
      type: String,
      enum: Object.values(TYPES)
    },
    /**
     * possible values: (Credit Card xxxx 4152 / Bank Transfer)
     */
    transactionType: {
      type: String
    },
    /**
     * payer email (customer email or business email)
     */
    email: { type: String },
    description: {
      type: String
    },
    authResponse: { type: Object },
    authAmount: { type: Number },
    captureResponse: { type: Object },
    captureAmount: { type: Number },
    cancelResponse: { type: Object },
    /**
     * null user is PIK System.
     * If user of Payment is null, it means that this Payment is auto generated and added by PIK System.
     * */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin-user'
    },
    status: {
      type: String,
      enum: Object.values(STATUSES)
    }
  },
  {
    timestamps: true
  }
)
// modelSchema.plugin(AutoInc)

module.exports = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.Status = STATUSES
module.exports.Type = TYPES
