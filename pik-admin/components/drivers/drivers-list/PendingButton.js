import React, { useContext } from 'react'
import { DriverContext } from './DriversList'
import { useTranslation } from 'react-i18next'

const PendingButton = () => {
  const { pending } = useContext(DriverContext)
  const { t } = useTranslation()

  return (
    <span className="label label-lg label-light-warning label-inline mr-3 p-5">
      {t('pages.drivers.PENDING')} = {pending}
    </span>
  )
}

export default PendingButton
