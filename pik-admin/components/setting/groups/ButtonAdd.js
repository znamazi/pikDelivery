import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const ButtonAdd = () => {
  const { t } = useTranslation()

  return (
    <div className="col-lg-3">
      <Link href="/group/add">
        <div className="btn btn-primary width-100-percent">
          <i className="fa fa-plus mr-2"></i>
          <strong>{t('pages.setting.add_group')}</strong>
        </div>
      </Link>
    </div>
  )
}

export default ButtonAdd
