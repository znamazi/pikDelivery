const mongoose = require('mongoose')
const AutoInc = require('./plugins/autoIncrement')
const CreditCard = require('./CreditCard')
const Order = require('./Order')
const AdminUser = require('./AdminUser')
const Customer = require('./Customer')
const Business = require('./Business')
const Driver = require('./Driver')
const InvoiceStatuses = require('../constants/InvoiceStatuses')
const TransactionStatuses = require('../constants/TransactionStatuses')
const InvoiceTypes = require('../constants/InvoiceTypes')

const COLLECTION_NAME = 'invoice'

const OrderTransactionSchema = mongoose.Schema(
  {
    creditCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CreditCard.COLLECTION_NAME
    },
    name: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(TransactionStatuses),
      required: true
    },
    reference: { type: String, default: null }
  },
  { _id: false, timestamps: true }
)

const CustomValueSchema = mongoose.Schema(
  {
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: AdminUser.COLLECTION_NAME
    },
    value: { type: Number, required: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true }
  },
  { _id: false }
)

let invoiceSchema = mongoose.Schema(
  {
    ownerModel: {
      type: String,
      required: true,
      enum: [Business.COLLECTION_NAME]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'ownerModel'
    },
    date: { type: String, required: true },
    customValues: [CustomValueSchema],
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: Order.COLLECTION_NAME
    },
    amount: { type: Number },
    status: {
      type: String,
      enum: Object.values(InvoiceStatuses),
      required: true
    },
    transactions: { type: [OrderTransactionSchema], default: [] }
  },
  {
    timestamps: true
  }
)

invoiceSchema.plugin(AutoInc)

module.exports = mongoose.model(COLLECTION_NAME, invoiceSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.InvoiceTypes = InvoiceTypes
module.exports.InvoiceStatuses = InvoiceStatuses
module.exports.TransactionStatuses = TransactionStatuses
