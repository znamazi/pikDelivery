import React from 'react'
import AddContent from '../../../components/contentManagemnet/page/AddContent'
import WithPermission from '../../../components/partials/WithPermission'

const addPage = () => {
  return (
    <WithPermission needPermission="content-management:3">
      <AddContent mode="add" />
    </WithPermission>
  )
}

export default addPage
