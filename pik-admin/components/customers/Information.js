import React from 'react'
import { useTranslation } from 'react-i18next'

const Information = ({ title, value }) => {
  const { t } = useTranslation()

  return (
    <div className="mb-7">
      <p className="font-weight-bolder text-dark-75 pl-3 font-size-lg">
        {t(`information.${title}`)}
      </p>
      <p className="pl-3 font-size-lg">{value}</p>
    </div>
  )
}

export default Information
