import React from 'react'
import { useTranslation } from 'react-i18next'

const InformationProfile = ({ title, value }) => {
  const { t } = useTranslation()

  return (
    <div className="mb-6 col-md-6">
      <p className="font-weight-bolder text-dark-75 font-size-lg">
        {t(`information.${title}`)}
      </p>
      <p className="font-size-lg">{value}</p>
    </div>
  )
}

export default InformationProfile
