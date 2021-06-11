import React from 'react'
import {
  BusinessStatusCssClasses,
  BusinessStatusTitles
} from '../BusinessUIHelpers'
import { useTranslation } from 'react-i18next'

const Status = ({ row }) => {
  const { t } = useTranslation()
  const getLabelCssClasses = () => {
    let item = Object.keys(BusinessStatusTitles).find(
      (key) => BusinessStatusTitles[key] === row.status
    )
    return `label label-lg label-light-${BusinessStatusCssClasses[item]} label-inline`
  }
  return (
    <span className={getLabelCssClasses()} style={{ width: 110 }}>
      {t(`status.${row.status}`)}
    </span>
  )
}

export const StatusColumnFormatter = (cellContent, row) => {
  return <Status row={row} />
}
