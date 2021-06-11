const mongoose = require('mongoose')
const Driver = require('./Driver')
const VehicleTypes = require('../constants/VehicleTypes')
const {PointSchema} = require('./Base')

const COLLECTION_NAME = 'driver-online-location'

let modelSchema = mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Driver.COLLECTION_NAME,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleTypes),
      required: true
    },
    busy: {type: Boolean, default: false},
    location: {type: PointSchema, required: true},
  },
  {
    timestamps: true
  }
)
// will remove after 15 minutes
modelSchema.index({updatedAt: 1},{expireAfterSeconds: 30 * 60});
modelSchema.index({location: "2dsphere"});


module.exports = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.setDriverLocation = async (driver, location) => {
}
