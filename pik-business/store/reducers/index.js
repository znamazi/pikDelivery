import { combineReducers } from 'redux'

import customers from './customers'
import orders from './orders'
import invoices from './invoices'
import business from './business'
import customerOrders from './customerOrders'
import users from './users'
export default combineReducers({
  customers,
  orders,
  invoices,
  business,
  customerOrders,
  users
})
