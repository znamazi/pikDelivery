import { combineReducers } from 'redux'

import customers from './customers'
import drivers from './drivers'
import business from './business'
import orders from './orders'
import invoices from './invoices'
import users from './users'
import groups from './groups'
import banners from './banners'
import faqCats from './faqCats'
import faqs from './faqs'
import transactions from './tranasactions'
import customerOrders from './customerOrders'
import customerAvailbles from './customerAvailbles'
import comments from './comments'
import customerTransactions from './customerTransactions'
import driverOrders from './driverOrders'
import queryParams from './queryParams'
import businessCustomers from './businessCustomers'
import businessInvoices from './businessInvoices'
import businessOrders from './businessOrders'
import businessPayments from './businessPayments'

export default combineReducers({
  customers,
  drivers,
  business,
  orders,
  invoices,
  banners,
  groups,
  users,
  faqCats,
  faqs,
  transactions,
  customerAvailbles,
  comments,
  customerOrders,
  customerTransactions,
  driverOrders,
  queryParams,
  businessPayments,
  businessOrders,
  businessInvoices,
  businessCustomers
})
