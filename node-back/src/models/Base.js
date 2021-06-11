const VehicleTypes = require('../constants/VehicleTypes')
/**
 * Read : https://mongoosejs.com/docs/geojson.html
 */

const mongoose = require('mongoose')

/**
 * Sample
 * {
      "type" : "Point",
      "coordinates" : [
        -122.5,
        37.7
      ]
    }
 */
const PointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  { _id: false }
)

/**
 * Sample
 * {
      "type": "Polygon",
      "coordinates": [[
        [-109, 41],
        [-102, 41],
        [-102, 37],
        [-109, 37],
        [-109, 41]
      ]]
    }
 */
const PolygonSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      required: true
    }
  },
  { _id: false }
)

const AddressSchema = new mongoose.Schema(
  {
    location: { type: PointSchema },
    address: { type: String, trim: true }
  },
  { _id: false }
)

module.exports = {
  PointSchema,
  PolygonSchema,
  AddressSchema,
}
