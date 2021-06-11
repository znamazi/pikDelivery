import React from 'react'
import { useTranslation } from 'react-i18next'

export const Status = ({ row }) => {
  const { t } = useTranslation()
  return (
    <span
      className={`label label-lg label-light-${
        row.active ? 'success' : 'danger'
      } label-inline`}
      style={{ width: 110 }}
    >
      {row.active ? t('status.ACTIVE') : t('status.INACTIVE')}
    </span>
  )
}
export function StatusColumnFormatter(cellContent, row) {
  return <Status row={row} />
}

export const KmPriceColumnFormatter = (cellContent, row) => {
  let data = Object.keys(row.prices).map((device, index) => (
    <p key={index}>
      {device}: {row.prices[device].kmPrice}
    </p>
  ))
  return data
}

export const Credit = ({ row }) => {
  const { t } = useTranslation()
  return row.credit ? t('pages.setting.yes') : t('pages.setting.no')
}

export function CreditColumnFormatter(cellContent, row) {
  return <Credit row={row} />
}
