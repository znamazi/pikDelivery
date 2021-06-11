import React from 'react'
import AddFaq from '../../../components/contentManagemnet/faqs/AddFaq'
import WithPermission from '../../../components/partials/WithPermission'

const addFaq = () => {
  return (
    <WithPermission needPermission="content-management:3">
      <div>
        <AddFaq mode="add" />
      </div>
    </WithPermission>
  )
}

export default addFaq
