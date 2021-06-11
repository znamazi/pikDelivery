import React from 'react'

import AddInvoice from 'components/invoices/AddInvoice'
import WithPermission from '../../components/partials/WithPermission'

const addInvoice = () => {
  return (
    <WithPermission needPermission="invoice-management:3">
      <div>
        <AddInvoice />
      </div>
    </WithPermission>
  )
}

export default addInvoice
