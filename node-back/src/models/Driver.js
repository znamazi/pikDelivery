const mongoose = require('mongoose')
const jsonwebtoken = require('jsonwebtoken')
const GenderTypes = require('../constants/GenderTypes')
const DriverStatuses = require('../constants/DriverStatuses')
const VehicleTypes = require('../constants/VehicleTypes')
const passwordUtil = require('../utils/passwordUtil')
// const Order = require('./Order')

const COLLECTION_NAME = 'driver'

const PersonalID = mongoose.Schema(
  {
    type: { type: String },
    id: { type: String },
    frontPhoto: { type: String },
    rearPhoto: { type: String },
    approved: { type: Boolean, default: false }
  },
  { _id: false, timestamps: true }
)

const DrivingLicence = mongoose.Schema(
  {
    expire: { type: String },
    frontPhoto: { type: String },
    approved: { type: Boolean, default: false }
  },
  { _id: false, timestamps: true }
)

const CarInsurance = mongoose.Schema(
  {
    document: { type: String },
    approved: { type: Boolean, default: false }
  },
  { _id: false, timestamps: true }
)
const MessageSchema = mongoose.Schema({
  reject: { type: String },
  recheck: { type: String }
},{ _id: false})

const VehicleSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(VehicleTypes), required: true },
    makeModel: { type: String }, // like Toyota prius
    plate: { type: String },
    year: { type: Number },
    color: { type: String },
    photos: { type: [String], default: [] },
    approved: { type: Boolean, default: false }
  },
  { _id: false, timestamps: true }
)

let driverSchema = mongoose.Schema(
  {
    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    avatar: { type: String, default: null, trim: true },
    gender: { type: String, enum: Object.values(GenderTypes) },
    birthDate: { type: Date },
    address: { type: String, default: '' },
    email: { type: String, unique: true, trim: true, lowercase: true },
    emailConfirmed: { type: Boolean, default: false },
    mobile: { type: String },
    mobileConfirmCode: { type: String, select: false },
    mobileConfirmed: { type: Boolean, default: false },
    password: { type: String, default: '', trim: true, select: false },
    profile: { type: String, default: null, trim: true },
    vehicle: { type: VehicleSchema },
    personalId: { type: PersonalID },
    drivingLicence: { type: DrivingLicence },
    carInsurance: { type: CarInsurance },
    message: { type: MessageSchema },
    hired: {type: Boolean, default: false},
    geoLocation: {type: Object, select: false},
    documentSent: {type: Boolean, default: false},
    jobs: {
      /** Total number of suggest*/
      total: {type: Number, default: 0},
      /** Number of jobs that driver canceled it */
      cancel: {type: Number, default: 0},
      /** Number of suggests that driver rejected it */
      ignore: {type: Number, default: 0},
    },
    status: {
      type: String,
      enum: Object.values(DriverStatuses),
      default: DriverStatuses.Pending,
      required: true
    },
    busy: {
      type: Boolean,
      default: false
    },
    online: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
)

driverSchema.virtual('name').get(function () {
  return (this.firstName + ' ' + this.lastName).trim()
})

driverSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    user['password'] = passwordUtil.hashPassword(user['password'])
  }
  next()
})

function createSessionToken(_id) {
  const sessionToken = jsonwebtoken.sign(
    {
      _id,
      type: 'Driver',
      timestamp: Date.now()
    },
    process.env.JWT_AUTH_SECRET
  )
  return sessionToken
}

driverSchema.methods.updateLocation = function(location) {
  this.geoLocation = location
  return mongoose.model('driver-online-location')
    .update({
      driver: this._id,
    },{
      driver: this._id,
      vehicleType: this.vehicle.type,
      location: {
        type: 'Point',
        coordinates: [location.coords.longitude, location.coords.latitude]
      },
      busy: this.busy,
    },{
      upsert: true
    })
};

module.exports = mongoose.model(COLLECTION_NAME, driverSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.GenderType = GenderTypes
module.exports.Status = DriverStatuses
module.exports.createSessionToken = createSessionToken
