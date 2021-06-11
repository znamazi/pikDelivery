import React from 'react'
import AddContent from '../../../components/contentManagemnet/page/AddContent'
import WithPermission from '../../../components/partials/WithPermission'

// import dynamic from 'next/dynamic'
// const AddContent = dynamic(
//   () => import('components/contentManagemnet/page/AddContent'),
//   {
//     ssr: false
//   }
// )

const contentPage = () => {
  return (
    <WithPermission needPermission="content-management:3">
      <AddContent mode="edit" />
    </WithPermission>
  )
}

export default contentPage
