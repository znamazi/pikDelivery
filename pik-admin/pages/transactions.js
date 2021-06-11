import React from 'react'
import TransactionsList from '../components/payment/transactions-list/TransactionsList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'
import WithPermission from '../components/partials/WithPermission'

const transactions = () => {
  return (
    <WithPermission needPermission="payment-management:1">
      <DTUIProvider>
        <TransactionsList />
      </DTUIProvider>
    </WithPermission>
  )
}

export default transactions
