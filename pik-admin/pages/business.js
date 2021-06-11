import React from 'react'
import BusinessList from '../components/business/business-list/BusinessList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'
import WithPermission from '../components/partials/WithPermission'

const Business = () => {
  return (
    <WithPermission needPermission="business-management:1">
      <DTUIProvider>
        <BusinessList />
      </DTUIProvider>
    </WithPermission>
  )
}

export default Business
