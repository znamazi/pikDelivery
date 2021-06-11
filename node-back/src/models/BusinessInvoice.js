const mongoose = require('mongoose')
const { toFixedNum } = require('../utils/helpers')
const AutoInc = require('./plugins/autoIncrement')

const COLLECTION_NAME = 'business-invoice'

const STATUSES = {
  Open: 'open',
  Unpaid: 'unpaid',
  Paid: 'paid',
  Cancel: 'cancel'
}

const InvoiceItemSchema = new mongoose.Schema(
  {
    // id: { type: String },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order'
    },
    description: { type: String },
    amount: { type: Number, require: true }
  },
  { _id: true }
)

const InvoiceLogSchema = new mongoose.Schema(
  {
    date: { type: Date },
    description: { type: String, require: true },
    /**
     * null user is PIK System.
     * If user of log is null, it means that this log is auto generated and added by PIK System.
     * */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin-user'
    }
  },
  { _id: false }
)

let businessInvoiceSchema = mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'business'
    },
    businessName: { type: String },
    items: {
      type: [InvoiceItemSchema],
      default: []
    },
    date: { type: Date },
    discount: {
      type: Number,
      default: 0
    },
    logs: {
      type: [InvoiceLogSchema],
      default: [
        {
          date: Date.now(),
          description: 'Invoice created.'
        }
      ]
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.Open
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
)

businessInvoiceSchema.virtual('amount').get(function () {
  let sumOfItems = this.items.reduce((acc, i) => acc + i.amount, 0)
  let subTotal = sumOfItems - this.discount
  let itbms = toFixedNum(subTotal * 0.07, 2)
  let total = toFixedNum(subTotal + itbms, 2)

  return {
    subTotal,
    discount: this.discount || 0,
    itbms,
    total
  }
})

businessInvoiceSchema.plugin(AutoInc)

module.exports = mongoose.model(COLLECTION_NAME, businessInvoiceSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.Status = STATUSES
