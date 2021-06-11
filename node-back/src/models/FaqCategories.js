const mongoose = require('mongoose')
const FaqTypes = require('../constants/FaqTypes')

const COLLECTION_NAME = 'faq-categories'

let faqCategoriesSchema = mongoose.Schema(
  {
    category: { type: String, trim: true, require: true },
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
faqCategoriesSchema.index({ category: 1, type: 1 }, { unique: true })
module.exports = mongoose.model(COLLECTION_NAME, faqCategoriesSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
