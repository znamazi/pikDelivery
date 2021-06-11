import React from 'react'
import AddFaq from '../../../components/contentManagemnet/faqs/AddFaq'
import WithPermission from '../../../components/partials/WithPermission'

const editFaq = () => {
  return (
    <WithPermission needPermission="content-management:3">
      <div>
        <AddFaq mode="edit" />
      </div>
    </WithPermission>
  )
}

export default editFaq
