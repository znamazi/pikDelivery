import React from 'react'
import Import from '../../components/orders/Import'
import { connect } from 'react-redux'
import PermissionDenied from '../../components/partials/PermissionDenied'

const importOrder = (props) => {
  return props.business.businessExist &&
    props.business.businessExist.status === 'Active' ? (
    <Import />
  ) : (
    <PermissionDenied />
  )
}

export default connect((state) => ({
  business: state.business
}))(importOrder)
