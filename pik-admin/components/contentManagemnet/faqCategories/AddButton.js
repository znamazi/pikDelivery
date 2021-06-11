import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const Add = () => {
  const { t } = useTranslation()

  const router = useRouter()
  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => router.push('/contentManagement/category/add')}
      >
        <i className="fa fa-plus mr-2"></i>
        <span className="font-weight-bold">
          {t('pages.content.add_category')}
        </span>
      </button>
    </div>
  )
}

export default Add
