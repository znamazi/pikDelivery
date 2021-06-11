const mongoose = require('mongoose')
const AdminUser = require('./AdminUser')
const Customer = require('./Customer')
const Business = require('./Business')
const Driver = require('./Driver')
const mongoose_delete = require('mongoose-delete')

const COLLECTION_NAME = 'custom-value'

let modelSchema = mongoose.Schema(
  {
    ownerModel: {
      type: String,
      required: true,
      enum: [
        Customer.COLLECTION_NAME,
        Business.COLLECTION_NAME,
        Driver.COLLECTION_NAME
      ]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'ownerModel'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: AdminUser.COLLECTION_NAME,
      required: true
    },
    date: { type: Date, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true }
  },
  {
    timestamps: true
  }
)
modelSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
})

module.exports = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
