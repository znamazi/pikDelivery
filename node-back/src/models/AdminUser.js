const mongoose = require('mongoose')
const jsonwebtoken = require('jsonwebtoken')
const passwordUtil = require('../utils/passwordUtil')
const AdminPermissions = require('../api/permisions').AdminUser

const COLLECTION_NAME = 'admin-user'
const Roles = {
  Admin: 'Admin',
  SuperAdmin: 'Super Admin'
}

let adminUserSchema = mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    // TODO [STA]: user or username. look more at document page 32.
    username: { type: String, unique: true, require: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      default: '',
      trim: true,
      select: false
    },
    mobile: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.Admin,
      required: true
    },
    chatOnline: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    permissions: {
      type: Object,
      default: {},
      validate: {
        validator: (permissions) => {
          let availableList = Object.values(AdminPermissions)
          for (let key of Object.keys(permissions)) {
            if (!availableList.includes(key)) return false
            let value = parseInt(permissions[key])
            if (isNaN(value) || value < 1 || value > 3) return false
          }
          return true
        },
        message: (props) => `Invalid admin permission: ${props.value}`
      }
    },
    firebaseToken: { type: String, trim: true }
  },
  {
    timestamps: true
  }
)
adminUserSchema.pre('save', function (next) {
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
      type: 'AdminUser',
      timestamp: Date.now()
    },
    process.env.JWT_AUTH_SECRET
  )
  return sessionToken
}

module.exports = mongoose.model(COLLECTION_NAME, adminUserSchema)
module.exports.COLLECTION_NAME = COLLECTION_NAME
module.exports.Roles = Roles
module.exports.createSessionToken = createSessionToken
