import React from 'react'

import { useRouter } from 'next/router'

import Setting from '../components/setting/Setting'
import WithPermission from '../components/partials/WithPermission'

const Settings = () => {
  const router = useRouter()
  const { tab } = router.query
  return (
    <WithPermission needPermission="settings:1">
      <div>{tab ? <Setting tab={parseInt(tab)} /> : <Setting />}</div>
    </WithPermission>
  )
}

export default Settings
