import React from 'react'
import { useRouter } from 'next/router'

import CategoryDetails from '../../components/help/CategoryDetails'

const ShowCategoryDetails = (props) => {
  const router = useRouter()

  const { id } = router.query

  return <CategoryDetails categoryID={id} />
}

export default ShowCategoryDetails
