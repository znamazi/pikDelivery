import React from 'react'
import AddBanner from 'components/setting/banners/AddBanner'
import WithPermission from '../../components/partials/WithPermission'

const EditBanner = () => {
  return (
    <WithPermission needPermission="settings:3">
      <AddBanner mode="edit" />
    </WithPermission>
  )
}

export default EditBanner
