import React from 'react'
import CustomersList from '../components/customers/customers-list/CustomersList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'

const Customers = () => {
  return (
    <DTUIProvider>
      <CustomersList />
    </DTUIProvider>
  )
}

export default Customers
