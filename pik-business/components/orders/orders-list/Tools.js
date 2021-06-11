import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const Tools = () => {
  const { t } = useTranslation()

  return (
    <div className="mr-3">
      <Link href="/order/add" as="/order/add">
        <button className="btn btn-primary">
          <i className="fa fa-plus-square mr-2 text-white "></i>
          {t('pages.orders.new_order')}
        </button>
      </Link>

      <Link href="/order/import" as="/order/import">
        <span>
          <i className="fa fa-upload ml-2 mr-2"></i>
          <strong>{t('pages.common.import')}</strong>
        </span>
      </Link>
    </div>
  )
}

export default Tools
