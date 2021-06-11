import React from 'react'
import EagleEye from '../components/eagleEye/EagleEye'
import { useLayout } from '../components/layouts/layoutProvider'
const eagle = () => {
  const layout = useLayout()
  React.useEffect(() => {
    layout.setNoContentWrapper(true)
    return () => {
      layout.setNoContentWrapper(false)
    }
  }, [])

  return <EagleEye />
}

export default eagle
