const mongoose = require('mongoose')
const jsonwebtoken = require('jsonwebtoken')
const moment = require('moment');
const GenderTypes = require('../constants/GenderTypes')
const BusinessInvoice = require('./BusinessInvoice')
const BusinessStatuses = require('../constants/BusinessStatuses')
const {PointSchema} = require('./Base')
const Group = require('./PricingGroup')
const {getDateScheduleTimes, expandCustomTimeFrames} = require('../utils/helpers')

const COLLECTION_NAME = 'business'

function isInteger(num) {
  return num % 1 === 0
}

const TimeFrameSchema = new mongoose.Schema(
  {
    open: {
      type: String,
      validate: {
        validator: function (v) {
          return /([0-2][0123]|[0-1][0-9]):[0-5][0-9]\s*/.test(v)
        },
        message: (props) =>
          `Business TimeFrame start most have this format xx:xx`
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
        message: (props) => `Business TimeFrame end most have this format xx:xx`
      },
      required: function () {
        return this.totallyClosed !== true
      }
    },
    totallyClosed: {type: Boolean, default: false}
  },
  {_id: false}
)

let businessSchema = mongoose.Schema(
  {
    name: {type: String, default: '', trim: true},
    phone: {type: String},
    mobile: {type: String},
    email: {type: String, default: '', trim: true, lowercase: true},
    logo: {type: String, default: null, trim: true},
    website: {type: String, default: null, trim: true},
    address: {type: mongoose.Mixed},
    location: {type: PointSchema, default: null},
    timeFrames: {
      type: [TimeFrameSchema],
      validate: {
        validator: function (v) {
          return v === null || v.length === 7
        },
        message: (props) => `${props.value} is not a valid timeFrame!`
      }
    },
    about: {type: String, default: ''},
    status: {
      type: String,
      enum: Object.values(BusinessStatuses),
      required: true
    },
    coverageMaxValue: {type: Number, default: 0},
    coverageEnabled: {type: Boolean, default: false},
    creditCard: {type: Object, default: null},
    enabled: {type: Boolean, default: false},
    group: {type: String, default: 'Standard'}
  },
  {
    timestamps: true
  }
)

businessSchema.methods.getCustomTimeFrames = async function (candidateDate) {
  let currentDay = moment().format('YYYY-MM-DD')

  if(candidateDate === undefined){
    /** Return all active CTF **/
    return mongoose.model('custom-time-frame').find({
      business: this._id,
      to: {$gte: currentDay}
    })
  }
  else{
    /** Return all active CTF in candidate Date **/
    return mongoose.model('custom-time-frame').find({
      business: this._id,
      $and: [
        {to: {$gte: currentDay}},
        {to: {$gte: candidateDate}},
      ],
      from: {$lte: candidateDate}
    })
  }
};

businessSchema.methods.validateSchedule = async function (dateStr, timeStr) {
  let timeFrames = this.timeFrames;
  let customTimeFrames = await this.getCustomTimeFrames(dateStr);
  customTimeFrames = expandCustomTimeFrames(customTimeFrames);
  let timeItems = getDateScheduleTimes(dateStr, timeFrames, customTimeFrames)

  let matchedItem = timeItems.find(time => time.value === timeStr)
  return !!matchedItem
};

businessSchema.methods.getCurrentInvoice = async function () {
  let invoice = await BusinessInvoice.findOne({business: this, status: BusinessInvoice.Status.Open})
  if(!invoice){
    invoice = new BusinessInvoice({
      business: this,
      businessName: this.name,
    })
  }
  return invoice;
};

function createSessionToken(_id) {
  const sessionToken = jsonwebtoken.sign(
    {
      _id,
      timestamp: Date.now()
    },
    process.env.JWT_AUTH_SECRET
  )
  return sessionToken
}

module.exports = mongoose.model(COLLECTION_NAME, businessSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.GenderType = GenderTypes
module.exports.Status = BusinessStatuses
module.exports.createSessionToken = createSessionToken
