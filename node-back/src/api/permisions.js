/**
 * List of all available permissions
 * each user can have a list of this permissions
 * read permission have value of (1) and write permission have value of (2).
 * read and write permission have value of (read + write = 3)
 *
 * sample permission filed on the user model:
 * {
 *     'super-admin': 3,    read & write permission of super admin
 *     'user-management': 2,    only write permission of user management
 *     'settings': 1,   only read permission of settings
 * }
 */

module.exports = {
  AdminUser: {
    Dashboard: 'dashbord-management',
    CustomerManagement: 'customer-management',
    DriverManagement: 'driver-management',
    BusinessManagement: 'business-management',
    OrderManagement: 'order-management',
    InvoiceManagement: 'invoice-management',
    PaymentManagement: 'payment-management',
    ContentManagement: 'content-management',
    Settings: 'settings'
    // Eagle: 'eagle-management'
  },
  BusinessUser: {},
  Customer: {},
  Driver: {}
}
