import React from 'react'
import { SetupProvider } from './context'
import PrepareState from './PrepareState'

const Setup = (props) => {
  return (
    <SetupProvider>
      <PrepareState
        business={props.businessInfo}
        handleUpdateHour={props.handleUpdateHour}
      />
    </SetupProvider>
  )
}

export default Setup
