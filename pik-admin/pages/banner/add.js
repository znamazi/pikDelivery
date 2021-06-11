import React from 'react'
import AddBanner from '../../components/setting/banners/AddBanner'
import WithPermission from '../../components/partials/WithPermission'

const addBanner = () => {
  return (
    <WithPermission needPermission="settings:3">
      <div>
        <AddBanner mode="add" />
      </div>
    </WithPermission>
  )
}

export default addBanner
