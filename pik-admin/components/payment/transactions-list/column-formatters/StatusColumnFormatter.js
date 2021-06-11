import React from 'react'
import {
  TransactionStatusCssClasses,
  TransactionStatusTitles
} from '../TransactionsUIHelpers'

import { useTranslation } from 'react-i18next'

const Status = ({ row }) => {
  const { t } = useTranslation()

  return (
    <span
      className={`label label-lg label-light-${
        TransactionStatusCssClasses[row.status]
      } label-inline`}
      style={{ width: 85 }}
    >
      {t(`status.${row.status}`)}
    </span>
  )
}
export function StatusColumnFormatter(cellContent, row) {
  return <Status row={row} />
}
