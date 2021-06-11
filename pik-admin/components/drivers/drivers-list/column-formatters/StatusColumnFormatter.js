import React from 'react'
import { DriverStatusCssClasses, AllStatusTitle } from '../DriversUIHelpers'
import { useTranslation } from 'react-i18next'

const Status = ({ row }) => {
  const { t } = useTranslation()
  const getLabelCssClasses = () => {
    let item = Object.keys(AllStatusTitle).find(
      (key) => AllStatusTitle[key] === row.status
    )
    return `label label-lg label-light-${DriverStatusCssClasses[item]} label-inline`
  }
  return (
    <span className={getLabelCssClasses()} style={{ width: 135 }}>
      {t(`status.${row.status}`)}
    </span>
  )
}
export function StatusColumnFormatter(cellContent, row) {
  return <Status row={row} />
}
