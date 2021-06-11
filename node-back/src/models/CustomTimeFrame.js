const mongoose = require('mongoose')
const moment = require('moment')
const mongoose_delete = require('mongoose-delete')
const Business = require('./Business')

const COLLECTION_NAME = 'custom-time-frame'

const ModelSchema = new mongoose.Schema({
  id: { type: String, required: true },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Business.COLLECTION_NAME
  },
  totallyClosed: { type: Boolean, default: false },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  open: {
    type: String,
    validate: {
      validator: function (v) {
        return /([0-2][0123]|[0-1][0-9]):[0-5][0-9]\s*/.test(v)
      },
      message: (props) =>
        `Business CustomTimeFrame open most have this format xx:xx`
    },
    required: function () {
      return this.totallyClosed !== true
    }
  },
  close: {
    type: String,
    validate: {
      validator: function (v) {
        return /([0-2][0123]|[0-1][0-9]):[0-5][0-9]\s*/.test(v)
      },
      message: (props) =>
        `Business CustomTimeFrame close most have this format xx:xx`
    },
    required: function () {
      return this.totallyClosed !== true
    }
  }
})
ModelSchema.plugin(mongoose_delete, {
  overrideMethods: true
})

module.exports = mongoose.model(COLLECTION_NAME, ModelSchema)
module.exports.getBusinessCustomTimeFrames = function (business) {
  let current = moment()
  return mongoose.model(COLLECTION_NAME).find({
    business,
    to: { $gte: current.startOf('day').toDate() },
    close: { $gte: current.format('HH:mm') }
  })
}
module.exports.COLLECTION_NAME = COLLECTION_NAME
