import React from 'react'
import OrdersList from '../components/orders/orders-list/OrdersList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'
import WithPermission from '../components/partials/WithPermission'

const Orders = () => {
  return (
    <WithPermission needPermission="order-management:1">
      <DTUIProvider>
        <OrdersList />
      </DTUIProvider>
    </WithPermission>
  )
}

export default Orders
