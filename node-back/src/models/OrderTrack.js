const mongoose = require('mongoose')
const Order = require('./Order')
const Driver = require('./Driver')

const COLLECTION_NAME = 'order-track'


const TrackHistoryItemSchema = mongoose.Schema(
  {
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
  },
  { _id: false, timestamps: true }
)

const TrackHistorySchema = mongoose.Schema(
  {
    pickup: {
      type: [TrackHistoryItemSchema],
      default: [],
    },
    delivery: {
      type: [TrackHistoryItemSchema],
      default: [],
    },
    return: {
      type: [TrackHistoryItemSchema],
      default: [],
    },
    current: { type: TrackHistoryItemSchema },
  },
  { _id: false }
)

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
    headingTo: {
      type: String,
      enum: ['pickup', 'delivery', 'return'],
      required: true,
    },
    history: {type: TrackHistorySchema},
    timeToArrive: {
      text: {type: String},
      /** in seconds */
      value: {type: Number},
    },
    arrived: {
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
