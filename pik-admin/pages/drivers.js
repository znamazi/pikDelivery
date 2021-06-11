import React from 'react'
import DriversList from '../components/drivers/drivers-list/DriversList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'
import WithPermission from '../components/partials/WithPermission'

const Drivers = () => {
  return (
    <WithPermission needPermission="driver-management:1">
      <DTUIProvider>
        <DriversList />
      </DTUIProvider>
    </WithPermission>
  )
}

export default Drivers
