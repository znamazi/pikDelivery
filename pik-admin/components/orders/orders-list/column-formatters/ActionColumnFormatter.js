import React from 'react'
import ButtonView from '../../../../metronic/partials/ButtonView'

export const ActionColumnFormatter = (cellContent, row) => {
  return (
    <div>
      <ButtonView href={`/order/[id]`} as={`/order/${row.id}`} />
    </div>
  )
}
