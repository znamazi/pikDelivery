const { Router } = require('express')
const authRoutes = require('./routes/adminAuthRoutes')
const userRoutes = require('./routes/adminUserRoutes')
const customerRoutes = require('./routes/adminCustomerRoutes')
const driverRoutes = require('./routes/adminDriverRoutes')
const businessRoutes = require('./routes/adminBusinessRoutes')
const orderRoutes = require('./routes/adminOrderRoutes')
const invoiceRoutes = require('./routes/adminInvoiceRoutes')
const paymentRoutes = require('./routes/adminPaymentRoutes')
const settingRoutes = require('./routes/adminSettingRoutes')
const contentManagementRoutes = require('./routes/adminContentManagementRoutes')
const dashboardRoutes = require('./routes/adminDashboardRoutes')
const eagleRoutes = require('./routes/adminEagleRoutes')
const { forceAuthorized: auth } = require('../../middleware/auth')
const adminPerm = require('../../api/permisions').AdminUser

let router = Router()

router.use('/auth', authRoutes)
/**
 * force to have permission of user-management
 */
router.use('/user', auth('AdminUser', adminPerm.Settings), userRoutes)
/**
 * force to have permission of customer-management
 */
router.use(
  '/customer',
  auth('AdminUser', adminPerm.CustomerManagement),
  customerRoutes
)
/**
 * force to have permission of Driver-management
 */
router.use(
  '/driver',
  auth('AdminUser', adminPerm.DriverManagement),
  driverRoutes
)

/**
 * force to have permission of Business-management
 */
router.use(
  '/business',
  auth('AdminUser', adminPerm.BusinessManagement),
  businessRoutes
)

/**
 * force to have permission of Order-management
 */
router.use('/order', auth('AdminUser', adminPerm.OrderManagement), orderRoutes)

/**
 * force to have permission of Invoice-management
 */
router.use(
  '/invoice',
  auth('AdminUser', adminPerm.InvoiceManagement),
  invoiceRoutes
)

/**
 * force to have permission of Payment-management
 */
router.use(
  '/payment',
  auth('AdminUser', adminPerm.PaymentManagement),
  paymentRoutes
)

/**
 * force to have permission of content-management
 */
router.use(
  '/content',
  auth('AdminUser', adminPerm.ContentManagement),
  contentManagementRoutes
)

router.use('/setting', auth('AdminUser', adminPerm.Settings), settingRoutes)

router.use(
  '/dashboard',
  auth('AdminUser', adminPerm.Dashboard),
  dashboardRoutes
)

router.use('/eagle', auth('AdminUser'), eagleRoutes)

module.exports = router
