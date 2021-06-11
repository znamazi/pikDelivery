import React from 'react'
import { useAuth } from 'utils/next-auth'
import PermissionDenied from './PermissionDenied'

const WithPermission = ({ needPermission, children }) => {
  let auth = useAuth()

  const checkPermission = () => {
    if (!auth.user.enabled) return false
    // const permissions = {
    //   Business: '',
    //   Customers: '',
    //   Drivers: '',
    //   Invoices: '',
    //   addInvoice: '',
    //   editInvoice: '',
    //   Orders: '',
    //   transactions: '',
    //   contentManagement: '',
    //   addPage: '',
    //   contentPage: '',
    //   addFaq: '',
    //   editFaq: 'content-management:3',
    //   addFaqCat: 'content-management:3',
    //   editFaqCat: 'content-management:3',
    //   Settings: 'settings:1',

    // }
    // const needPermission = permissions[componentName]

    if (needPermission) {
      const userPermission = auth.user.permissions
      const permission = needPermission.split(':')
      console.log(permission, userPermission[permission[0]])
      if (!(permission[0] in userPermission)) return false
      if (permission[1] > userPermission[permission[0]]) return false
    }

    return true
  }
  return <> {checkPermission() ? children : <PermissionDenied />}</>
}

export default WithPermission
