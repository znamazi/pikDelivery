import React, { useEffect } from 'react'
import Hours from './Hours'
import { useSetupState } from './context'

const PrepareState = (props) => {
  const { dispatch } = useSetupState()

  let data = {
    ...props.business,
    urlEdit: `admin/business/update/${props.business._id}`
  }

  useEffect(() => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: data
    })
  }, [])

  return (
    <div className="row">
      <Hours
        handleUpdateHour={props.handleUpdateHour}
        business={props.business}
      />
    </div>
  )
}

export default PrepareState
