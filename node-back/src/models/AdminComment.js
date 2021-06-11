const mongoose = require('mongoose')
const AdminUser = require('./AdminUser')
const Customer = require('./Customer')
const Business = require('./Business')
const Driver = require('./Driver')

const COLLECTION_NAME = 'admin-comment'


let ModelSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: AdminUser.COLLECTION_NAME
    },
    receiverModel: {
      type: String,
      required: true,
      enum: [Customer.COLLECTION_NAME, Business.COLLECTION_NAME, Driver.COLLECTION_NAME]
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel'
    },
    comment: { type: String},
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, ModelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
