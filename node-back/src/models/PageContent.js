const mongoose = require('mongoose')
const COLLECTION_NAME = 'page-content'

let pageContentSchema = mongoose.Schema(
  {
    title: { type: String, trim: true, require: true, unique: true },
    content: { type: String, default: '', trim: true },
    published: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, pageContentSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
