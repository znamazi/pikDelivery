const { Router } = require('express')
const authRoutes = require('./routes/businessAuthRoutes')
const customerRoutes = require('./routes/businessCustomerRoutes')
const orderRoutes = require('./routes/businessOrderRoutes')
const invoiceRoutes = require('./routes/businessInvoiceRoutes')
const setupRoutes = require('./routes/businessSetupRoutes')
const userRoutes = require('./routes/businessUserRoutes')
const helpRoutes = require('./routes/businessHelpRoutes')
const { forceAuthorized: auth } = require('../../middleware/auth')
const businessPerm = require('../../api/permisions').BusinessUser

let router = Router()

router.use('/auth', authRoutes)
router.use('/customer', auth('BusinessUser'), customerRoutes)
router.use('/order', auth('BusinessUser'), orderRoutes)
router.use('/invoice', auth('BusinessUser'), invoiceRoutes)
router.use('/user', auth('BusinessUser'), userRoutes)
router.use('/help', auth('BusinessUser'), helpRoutes)

router.use('/setup', setupRoutes)
module.exports = router
