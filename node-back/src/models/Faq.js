const mongoose = require('mongoose')
const FaqCategories = require('./FaqCategories')
const FaqTypes = require('../constants/FaqTypes')
const COLLECTION_NAME = 'faq'

let faqSchema = mongoose.Schema(
  {
    question: { type: String, trim: true, require: true },
    answer: { type: String, trim: true, require: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: FaqCategories.COLLECTION_NAME
    },
    type: {
      type: String,
      enum: Object.values(FaqTypes),
      trim: true
    },
    published: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, faqSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
