const mongoose = require('mongoose')
const Customer = require('./Customer')
const Driver = require('./Driver')

const COLLECTION_NAME = 'user-device'


let modelSchema = mongoose.Schema(
  {
    ownerModel: {
      type: String,
      required: true,
      enum: [Customer.COLLECTION_NAME, Driver.COLLECTION_NAME]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'ownerModel'
    },
    fcmToken: {type: String},
    deviceName: {type: String},
    model: {type: String},
    systemName: {type: String},
    systemVersion: {type: String},
  },
  {
    timestamps: true,
    strict: false
  }
)

module.exports = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
