import React from 'react'
import CustomersList from '../components/customers/customers-list/CustomersList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'
import WithPermission from '../components/partials/WithPermission'

const Customers = () => {
  return (
    <WithPermission needPermission="customer-management:1">
      <DTUIProvider>
        <CustomersList />
      </DTUIProvider>
    </WithPermission>
  )
}

export default Customers
