import { all } from 'redux-saga/effects'

import * as customerHandler from './customers'
import * as driverHandler from './drivers'
import * as invoiceHandler from './invoices'
import * as orderHandler from './orders'
import * as businessHandler from './business'
import * as userHandler from './users'
import * as groupHandler from './groups'
import * as bannerHandler from './banners'
import * as faqCatHandler from './faqCats'
import * as faqHandler from './faqs'
import * as paymentHandler from './payments'

export default function* root() {
  yield all([
    businessHandler.businessWatcher(),
    orderHandler.orderWatcher(),
    orderHandler.cancelOrderWatcher(),
    invoiceHandler.invoiceWatcher(),
    customerHandler.customerWatcher(),
    driverHandler.driverWatcher(),
    userHandler.userWatcher(),
    bannerHandler.bannerWatcher(),
    groupHandler.groupWatcher(),
    faqCatHandler.faqCatWatcher(),
    faqCatHandler.faqCatWatcherDel(),
    faqHandler.faqWatcher(),
    faqHandler.faqWatcherDel(),
    paymentHandler.paymentWatcher()
  ])
}
