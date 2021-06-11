const Codes = require('./messageCodes')

const userMessages = {
  [Codes.ERROR_DDRIVER_BUSY]: 'This Driver is busy choose another one',
  [Codes.ERROR_BANNER_NOT_FOUND]: 'Banner not found',
  [Codes.ERROR_NOT_PERMISSION]: 'You Dont have Permission for this act',
  [Codes.ERROR_TRANSACTION_EXPORT_FAIL]: 'Export transaction failed',
  [Codes.ERROR_PAYMENT_NOT_FOUND]: 'Transaction not found',
  [Codes.SOCIAL_INVALID_TYPE]:
    'Invalid social type. Type can only be facebook or google.',
  [Codes.SOCIAL_AUTH_ERROR]: 'Error when authenticating social login',
  [Codes.ERROR_CREDIT_CARD]: 'Credit Card is not valid',
  [Codes.ERROR_MOBILE_INVALID]: 'Invalid mobile number',
  [Codes.PERMISSION_DENIED]: 'Permission denied',
  [Codes.MISSING_RESOURCE]: 'Resource not found',
  [Codes.MISSING_REQUEST_PARAMS]: 'Missing request params',
  [Codes.INVALID_REQUEST_PARAMS]: 'Invalid request params',
  [Codes.ERROR_LOGIN_REQUIRE]: 'username and password required',
  [Codes.ERROR_LOGIN_NOT_MATCH]: 'username or password not matched',
  [Codes.ERROR_EMAIL_PASSWORD_REQUIRE]: 'Email and password required',
  [Codes.ERROR_USER_NOT_LOGIN]: 'User not logged in',
  [Codes.ERROR_BUSINESS_NOT_FOUND]: 'business not found',
  [Codes.ERROR_INVALID_UPDATE]: 'Invalid Updates!',
  [Codes.ERROR_CUSTOMER_NOT_FOUND]: 'customer not found',
  [Codes.ERROR_ITEM_NOT_FOUND]: 'item not found',
  [Codes.ERROR_DRIVER_NOT_FOUND]: 'driver not found',
  [Codes.ERROR_INVOICE_NOT_FOUND]: 'invoice not found',
  [Codes.ERROR_ORDER_NOT_FOUND]: 'order not found',
  [Codes.ERROR_GROUP_NOT_FOUND]: 'group not found',
  [Codes.ERROR_USER_NOT_FOUND]: 'user not found',
  [Codes.ERROR_PAGE_NOT_FOUND]: 'page not found',
  [Codes.ERROR_FAQ_NOT_FOUND]: 'faq not found',
  [Codes.ERROR_FAQ_CATEGORY_NOT_FOUND]: 'faq categories not found',
  [Codes.ERROR_CAN_NOT_REMOVE_FAQ_CATEGORY_WITH_CHILD]:
    "You can't remove this Category beacause it has faq",
  [Codes.ERROR_STATUS_UPDATE_FAIL]: 'Status updated failed',
  [Codes.ERROR_GROUP_CREATE_FAIL]: 'Group Created Failed',
  [Codes.ERROR_GROUP_CREATE_FAIL_DOUPLICATE_TITLE]:
    'There is a group with this title',
  [Codes.ERROR_USER_CREATE_FAIL]: 'User Created Failed',
  [Codes.ERROR_USER_CREATE_FAIL_DOUPLICATE_EMAIL]:
    'There is a user with this email',
  [Codes.ERROR_BUSINESS_CREATE_FAIL_DOUPLICATE_EMAIL]:
    'There is a business with this email',
  [Codes.ERROR_PAGE_CREATE_FAIL]: 'Page Created Failed',
  [Codes.ERROR_PAGE_CREATE_FAIL_DOUPLICATE_TITLE]:
    'There is a page with this title',
  [Codes.ERROR_FAQ_CREATE_FAIL]: 'Faq Created Failed',
  [Codes.ERROR_FAQ_CATEGORY_CREATE_FAIL]: 'Faq Category Created Failed',
  [Codes.ERROR_FAQ_CATEGORY_CREATE_FAIL_DOUPLICATE_ITEM]:
    'There is this faq Category',
  [Codes.ERROR_DRIVER_EXPORT_FAIL]: 'Export driver failed',
  [Codes.ERROR_ORDER_EXPORT_FAIL]: 'Export Order failed',
  [Codes.ERROR_TOKEN_RESET_PASSWORD_INVALID]: 'Token is invalid or has expired',
  [Codes.ERROR_EMAIL_ALREADY_TAKEN]:
    'The email you are adding its already registered. Please try another one',
  [Codes.ERROR_MOBILE_ALREADY_TAKEN]:
    'The mobile number is already registered for another customer.',
  [Codes.ERROR_CUSTOMER_EMAIL_REQUIRE]: 'Customer Email required',
  [Codes.ERROR_CUSTOMER_NAME_REQUIRE]: 'Customer Name required',
  [Codes.ERROR_CUSTOMER_MOBILE_REQUIRE]: 'Customer Mobile required',
  [Codes.ERROR_CUSTOMER_ALREDY_REGISTERED]:
    'Customer with this mobile/email already registered',
  [Codes.ERROR_PACKAGE_REQUIRE]: 'Package required',
  [Codes.ERROR_PACKAGE_ITEM_REQUIRE]: 'Some Item in packages is missing',
  [Codes.ERROR_VEHICLE_REQUIRE]: 'Vehicle required',
  [Codes.ERROR_SENDER_REQUIRE]: 'Sender required',
  [Codes.ERROR_SENDER_MODEL_REQUIRE]: 'Sender Model required',
  [Codes.ERROR_ITEM_IMPORT_ORDER_EXIST]:
    'One or more of package reference already exist on the server',
  [Codes.ERROR_ORDER_CANCEL_FAIL]: 'Order cancel failed',
  [Codes.ERROR_ORDER_INVALID_SCHEDULE_TIME]: 'Order invalid schedule date/time. Please reload here and try again.',
  [Codes.ERROR_ORDER_CANCEL_HAS_DRIVER]:
    'Order cannot be cancel, because driver assigned to order',
  [Codes.ERROR_ORDER_ALREADY_PICKED_UP]: 'Order already picked up',
  [Codes.ERROR_ORDER_ALREADY_ASSIGNED_TO_DRIVER]: 'Order already assigned to driver',

  [Codes.ERROR_BUSINESS_CREATE_FAIL]: 'Business created failed',
  [Codes.SERVER_SIDE_ERROR]: 'Somethings went wrong',
  [Codes.ERROR_CREDIT_CARD_INVALID_NUMBER]: 'Invalid credit card number',
  [Codes.ERROR_CREDIT_CARD_INVALID_YEAR]: 'Invalid credit card expire year',
  [Codes.ERROR_CREDIT_CARD_INVALID_MONTH]: 'Invalid credit card expire month',
  [Codes.ERROR_CREDIT_CARD_INVALID_CVV]: 'Invalid credit card cvv',
  [Codes.ERROR_CREDIT_CARD_INVALID_TYPE]: 'Invalid credit card type',
  [Codes.ERROR_PRICING_GROUP_IS_INVALID]: 'Invalid pricing group',
  [Codes.ERROR_TRACKING_CODES_MISMATCH]: 'Tracking codes mismatch.',
  [Codes.ERROR_DELIVERY_CONFIRMATION_CODE_MISMATCH]:
    'Delivery confirmation codes mismatch.',
  [Codes.ERROR_CREDIT_CARD_NOT_MATCHED]: 'Credit card not matched',
  [Codes.ERROR_CREDIT_CARD_DELETE]: 'Error at credit card delete',
  [Codes.ERROR_PAYMENT_PRE_AUTHORIZATION]: 'Payment pre authorization error',
  [Codes.ERROR_DRIVER_PERSONAL_ID_DUPLICATE]:
    'Personal id its already registered.'
}
module.exports.messages = userMessages
module.exports.Codes = Codes

module.exports.userError = function (key, message) {
  return {
    errorCode: key,
    message: message !== undefined ? message : userMessages[key] || key
  }
}
