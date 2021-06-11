const mongoose = require('mongoose')
const AdminUser = require('./AdminUser')

const COLLECTION_NAME = 'banner'

let bannerSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    // description: {
    //   type: String,
    //   required: true
    // },
    // discount: {
    //   type: Number,
    //   validate: {
    //     validator: function(v) {
    //       return v >= 0 && v <= 100;
    //     },
    //     message: props => `Banner discount should be in range of [0, 100]`
    //   },
    // },
    file: { type: String, trim: true, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: AdminUser.COLLECTION_NAME
    },
    expiration: { type: Date, required: true },
    published: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, bannerSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
