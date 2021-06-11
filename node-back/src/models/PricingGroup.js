const mongoose = require('mongoose')
const VehicleTypes = require('../constants/VehicleTypes')

const COLLECTION_NAME = 'pricing-group'

const PricingItem = mongoose.Schema(
  {
    basePrice: { type: Number, default: 0 },
    kmPrice: { type: Number, default: 0 }
  },
  { _id: false }
)

let pricingGroupSchema = mongoose.Schema(
  {
    title: { type: String, unique: true, required: true },
    itbms: { type: Number, default: 0.07 },
    cancelFee: {
      type: Number,
      default: 0
    },
    returnFee: {
      type: Number,
      default: 0
    },
    pikCommission: {
      type: Number,
      default: 0
    },
    prices: {
      [VehicleTypes.Motorcycle]: { type: PricingItem },
      [VehicleTypes.Car]: { type: PricingItem },
      [VehicleTypes.Pickup]: { type: PricingItem }
    },
    kmPrice: { type: Number, default: 0 },
    active: {
      type: Boolean,
      default: true
    },
    credit: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION_NAME, pricingGroupSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
