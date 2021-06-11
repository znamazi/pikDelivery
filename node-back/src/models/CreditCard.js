const mongoose = require('mongoose')
var mongoose_delete = require('mongoose-delete')
const Business = require('./Business')
const Customer = require('./Customer')
const CreditCardDetector = require('../utils/creditCardDetector')

const COLLECTION_NAME = 'credit-card'

const CreditCardSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Business.COLLECTION_NAME
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Customer.COLLECTION_NAME
  },
  type: {
    type: String,
    enum: Object.keys(CreditCardDetector.blocks),
    required: true
  },
  number: { type: String, required: true, select: false },
  numberFormatted: { type: String, required: true },
  cvv: { type: String, required: true, select: false },
  year: { type: String, required: true },
  month: { type: String, required: true }
})
CreditCardSchema.plugin(mongoose_delete, {
  overrideMethods: true
})

module.exports = mongoose.model(COLLECTION_NAME, CreditCardSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.Types = Object.keys(CreditCardDetector.blocks)
