import React from 'react'
import { useTranslation } from 'react-i18next'

export const Status = ({ row }) => {
  const { t } = useTranslation()
  return (
    <span
      className={`label label-lg label-light-${
        row.enabled ? 'success' : 'danger'
      } label-inline`}
      style={{ width: 110 }}
    >
      {row.enabled ? t('status.Active') : t('status.INACTIVE')}
    </span>
  )
}
export function StatusColumnFormatter(cellContent, row) {
  return <Status row={row} />
}
export function NameColumnFormatter(cellContent, row) {
  return <span>{`${row.firstName} ${row.lastName}`}</span>
}
