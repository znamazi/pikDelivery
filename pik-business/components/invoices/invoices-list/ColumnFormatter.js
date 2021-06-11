import React from 'react'
import moment from 'moment'
import SVG from 'react-inlinesvg'
import Link from 'next/link'
import ButtonView from '../../../metronic/partials/ButtonView'

import {
  InvoiceStatusCssClasses,
  InvoiceStatusTitles
} from './InvoicesUIHelpers'
import ShowDate from 'components/partials/ShowDate'
import { useTranslation } from 'react-i18next'

export const DateColumnFormatter = (cellContent, row) => {
  return <ShowDate date={row.date} id={row.id} />
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

export const ActionColumnFormatter = (cellContent, row) => {
  return <ButtonView href={`/invoice/[id]`} as={`/invoice/${row.id}`} />
}
