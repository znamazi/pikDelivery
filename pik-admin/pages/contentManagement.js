import React from 'react'
import { useRouter } from 'next/router'

import ContentManagement from '../components/contentManagemnet/ContentManagement'
import WithPermission from '../components/partials/WithPermission'

const contentManagement = () => {
  const router = useRouter()
  const { tab } = router.query
  return (
    <WithPermission needPermission="content-management:1">
      <div>{tab ? <ContentManagement tab={tab} /> : <ContentManagement />}</div>
    </WithPermission>
  )
}

export default contentManagement
