import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const ToolBar = () => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div>
      <button
        className="btn btn-light"
        onClick={() => router.push('/invoice/add')}
      >
        {t('pages.invoices.create_invoice')}
      </button>
    </div>
  )
}

export default ToolBar
