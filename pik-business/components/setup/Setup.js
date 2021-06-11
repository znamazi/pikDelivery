import React, { useEffect } from 'react'
import { SetupProvider } from './context'
import SetupContent from './SetupContent'

const Setup = (props) => {
  return (
    <SetupProvider>
      <SetupContent mode={props.mode} type={props.type} />
    </SetupProvider>
  )
}

export default Setup
