const mongoose = require('mongoose')
const Customer = require('./Customer')
const Business = require('./Business')

const COLLECTION_NAME = 'related-email'

let modelSchema = mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Business.COLLECTION_NAME
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Customer.COLLECTION_NAME
    },
    emails: { type: [String], default: [], lowercase: true }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
