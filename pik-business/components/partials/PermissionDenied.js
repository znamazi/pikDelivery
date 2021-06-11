import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const PermissionDenied = () => {
  const router = useRouter()

  const { t } = useTranslation()
  return (
    <div className="col-lg-12">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-body d-flex flex-column justify-content-center align-items-center font-weight-bolder ">
          {/* <p className="font-size-h1 p-5 text-danger">Permission Denied</p>
          <p className="font-size-h4 p-3">
            you don't currently have Permission to access this page.
          </p> */}
          <img src="/assets/media/error/403.jpg" />
          <button className="btn btn-light" onClick={() => router.back()}>
            {t('pages.common.go_back')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PermissionDenied
