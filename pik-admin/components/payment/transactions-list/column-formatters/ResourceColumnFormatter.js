import React from 'react'

export const ResourceColumnFormatter = (cellContent, row) => {
  return (
    <div>
      <p>{row.resourceModel === 'business-invoice' ? row.resource.id : ''}</p>
    </div>
  )
}
