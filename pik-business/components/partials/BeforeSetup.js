import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const BeforeSetup = ({ title }) => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="card card-custom card-stretch gutter-b">
      <div className="card-header border-bottom pt-5">
        <h3 className="card-title font-weight-bolder ">{title}</h3>
      </div>
      <div className="card-body d-flex flex-column">
        <div className="row">
          <div className="col-12">
            <p className="text-center m-10 font-weight-bold">
              {`${t('pages.create_first')} ${title} ${t(
                'pages.complete_configuration'
              )}`}
            </p>
            <div
              className="d-felx justify-content-center mt-5"
              style={{ display: 'flex' }}
            >
              <button
                className="btn btn-primary"
                onClick={() => router.push('/setup')}
              >
                {t('pages.business_setup')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BeforeSetup
