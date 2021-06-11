import React from 'react'
import AddUser from 'components/setting/users/AddUser'
import WithPermission from '../../components/partials/WithPermission'

const EditUser = () => {
  return (
    <WithPermission needPermission="settings:3">
      <AddUser mode="edit" />
    </WithPermission>
  )
}

export default EditUser
