import React from 'react'
import AddCategory from '../../../components/contentManagemnet/faqCategories/AddCategory'
import WithPermission from '../../../components/partials/WithPermission'

const editFaqCat = () => {
  return (
    <WithPermission needPermission="content-management:3">
      <div>
        <AddCategory mode="edit" />
      </div>
    </WithPermission>
  )
}

export default editFaqCat
