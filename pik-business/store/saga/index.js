import { all } from 'redux-saga/effects'

import * as customerHandler from './customers'
import * as invoiceHandler from './invoices'
import * as orderHandler from './orders'
import * as businessHandler from './business'

export default function* root() {
  yield all([
    customerHandler.customerWatcher(),
    customerHandler.customerOrderWatcher(),
    orderHandler.orderWatcher(),
    invoiceHandler.invoiceWatcher(),
    orderHandler.cancelOrderWatcher(),
    businessHandler.businessWatcher()
  ])
}
