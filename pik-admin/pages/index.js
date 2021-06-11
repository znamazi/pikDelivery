import React, { useState } from 'react'
import Dashboard from '../components/dashboard/Dashboard'
import WithPermission from '../components/partials/WithPermission'
const Home = () => {
  return (
    <div>
      <WithPermission needPermission="dashbord-management:1">
        <Dashboard />
      </WithPermission>
    </div>
  )
}

export default Home
