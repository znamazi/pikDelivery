import React from 'react'
import AddGroup from '../../components/setting/groups/AddGroup'
import WithPermission from '../../components/partials/WithPermission'

const addGroup = () => {
  return (
    <WithPermission needPermission="settings:3">
      <div>
        <AddGroup mode="add" />
      </div>
    </WithPermission>
  )
}

export default addGroup
