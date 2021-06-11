import React, { useEffect, useState } from 'react'
import OrdersList from '../components/orders/orders-list/OrdersList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'
import axios from 'utils/axios'

const Orders = () => {
  return (
    <DTUIProvider>
      <OrdersList />
    </DTUIProvider>
  )
}

export default Orders
