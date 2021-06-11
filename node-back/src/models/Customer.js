const mongoose = require('mongoose')
const jsonwebtoken = require('jsonwebtoken')
const mongoose_delete = require('mongoose-delete')

const { AddressSchema } = require('./Base')
const passwordUtil = require('../utils/passwordUtil')
const CustomerStatuses = require('../constants/CustomerStatuses')
const { caseInsensitive } = require('../utils/queryUtils')
// const Order = require('./Order')
const COLLECTION_NAME = 'customer'

let customerSchema = mongoose.Schema(
  {
    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
      trim: true
    },
    emailConfirmCode: { type: String, select: false },
    emailConfirmed: { type: Boolean, default: false },
    mobile: { type: String, default: null },
    mobileConfirmCode: { type: String, select: false },
    mobileConfirmed: { type: Boolean, default: false },
    password: { type: String, default: '', trim: true, select: false },
    avatar: { type: String, default: null, trim: true },
    addresses: { type: [AddressSchema], default: [] },
    status: {
      type: String,
      enum: Object.values(CustomerStatuses),
      default: CustomerStatuses.NotRegistered
    },
    social: { type: Object }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
)
customerSchema.virtual('name').get(function () {
  return (this.firstName + ' ' + this.lastName).trim()
})
customerSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
})
customerSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    user['password'] = passwordUtil.hashPassword(user['password'])
  }
  next()
})

const model = mongoose.model(COLLECTION_NAME, customerSchema)

function createSessionToken(_id) {
  const sessionToken = jsonwebtoken.sign(
    {
      _id,
      type: 'Customer',
      timestamp: Date.now()
    },
    process.env.JWT_AUTH_SECRET
  )
  return sessionToken
}
// customerSchema.set('toJSON', {
//   virtuals: true
// })

function findByEmail(email = '') {
  return model.findOne({ email: caseInsensitive(email.trim()) })
}

function findByMobile(mobile) {
  return model.findOne({ mobile })
}

module.exports = model
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.findByEmail = findByEmail
module.exports.findByMobile = findByMobile
module.exports.Statuses = CustomerStatuses
module.exports.createSessionToken = createSessionToken
