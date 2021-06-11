const mongoose = require('mongoose')
const Driver = require('./Driver')

const COLLECTION_NAME = 'bank-account'


let modelSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Driver.COLLECTION_NAME,
      required: true,
    },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountType: { type: String, required: true },
    accountBank: { type: String, required: true },
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
