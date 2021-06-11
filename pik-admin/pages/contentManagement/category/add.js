import React from 'react'
import AddCategory from '../../../components/contentManagemnet/faqCategories/AddCategory'
import WithPermission from '../../../components/partials/WithPermission'

const addFaqCat = () => {
  return (
    <WithPermission needPermission="content-management:3">
      <div>
        <AddCategory mode="add" />
      </div>
    </WithPermission>
  )
}

export default addFaqCat
