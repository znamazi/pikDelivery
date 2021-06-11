const mongoose = require('mongoose')
const Business = require('./Business')
const BusinessUserRoles = require('../constants/BusinessUserRoles')
const passwordUtil = require('../utils/passwordUtil')
const jsonwebtoken = require('jsonwebtoken')
const crypto = require('crypto')

const COLLECTION_NAME = 'business-user'

let businessUserSchema = mongoose.Schema(
  {
    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    userName: { type: String, default: '', trim: true },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Business.COLLECTION_NAME
    },
    role: {
      type: String,
      enum: Object.values(BusinessUserRoles),
      default: BusinessUserRoles.SuperAdmin
    },
    // TODO [STA]: user or username. look more at document page 32.
    email: { type: String, unique: true, trim: true, lowercase: true },
    mobile: { type: String },
    password: { type: String, default: '', trim: true, select: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    enabled: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
)

businessUserSchema.virtual('name').get(function () {
  return (this.firstName + ' ' + this.lastName).trim()
})

businessUserSchema.pre('save', function (next) {
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
      type: 'BusinessUser',
      timestamp: Date.now()
    },
    process.env.JWT_AUTH_SECRET
  )
  return sessionToken
}

businessUserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}

module.exports = mongoose.model(COLLECTION_NAME, businessUserSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.createSessionToken = createSessionToken
