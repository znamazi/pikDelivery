import React from 'react'
import AddGroup from 'components/setting/groups/AddGroup'
import WithPermission from '../../components/partials/WithPermission'

const EditGroup = () => {
  return (
    <WithPermission needPermission="settings:3">
      <div>
        <AddGroup mode="edit" />
      </div>
    </WithPermission>
  )
}

export default EditGroup
