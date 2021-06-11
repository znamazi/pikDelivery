import React from 'react'
import moment from 'moment'

import {
  InvoiceStatusCssClasses,
  InvoiceStatusTitles
} from './InvoicesUIHelpers'
import { useTranslation } from 'react-i18next'
import ShowDate from 'components/partials/ShowDate'

export const BookingColumnFormatter = (cellContent, row) => {
  return <ShowDate id={row.id} date={row.createdAt} />
}
export const DateColumnFormatter = (cellContent, row) => {
  return <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>
}

export const getLabelCssClasses = (status) => {
  return `label label-lg label-light-${InvoiceStatusCssClasses[status]} label-inline`
}
export const Status = ({ row }) => {
  const { t } = useTranslation()
  return (
    <span className={getLabelCssClasses(row.status)} style={{ width: 100 }}>
      {t(`status.${row.status}`)}
    </span>
  )
}
export const StatusColumnFormatter = (cellContent, row) => {
  return <Status row={row} />
}

export const CustomerColumnFormatter = (cellContent, row) => {
  return <div>{row.businessName}</div>
}
