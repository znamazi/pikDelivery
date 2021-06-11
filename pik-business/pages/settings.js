import React from 'react'
import Setting from 'components/setting/Setting'
import { useRouter } from 'next/router'
const settings = () => {
  const router = useRouter()
  const { tab } = router.query
  return <div>{tab ? <Setting tab={tab} /> : <Setting />}</div>
}

export default settings
