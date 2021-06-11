import React from 'react'
import { displayStatus, OrderStatusCssClasses } from '../OrdersUIHelpers'

import { useTranslation } from 'react-i18next'

export const Status = ({ row }) => {
  const { t } = useTranslation()
  let status =
    row.receiver.status === 'Not Registered' && row.status != 'Canceled'
      ? 'Not Registered'
      : row.status
  status = displayStatus[status]
  return (
    <span className={getLabelCssClasses(status)} style={{ width: 110 }}>
      {t(`status.${status}`)}
    </span>
  )
}
export const getLabelCssClasses = (status) => {
  return `label label-lg label-light-${OrderStatusCssClasses[status]} label-inline`
}
export function StatusColumnFormatter(cellContent, row) {
  return <Status row={row} />
}
