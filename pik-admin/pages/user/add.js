import React from 'react'
import AddUser from '../../components/setting/users/AddUser'
import WithPermission from '../../components/partials/WithPermission'

const addUser = () => {
  return (
    <WithPermission needPermission="settings:3">
      <div>
        <AddUser mode="add" />
      </div>
    </WithPermission>
  )
}

export default addUser
