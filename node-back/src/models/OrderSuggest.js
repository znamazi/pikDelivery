const mongoose = require('mongoose')
const Order = require('./Order')
const Driver = require('./Driver')

const COLLECTION_NAME = 'order-suggest'

let modelSchema = mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Order.COLLECTION_NAME,
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Driver.COLLECTION_NAME,
      required: true,
    },
    ignored: {
      type: Boolean,
      default: false
    },
    read: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
