import React from 'react'
import { useRouter } from 'next/router'
import CSVReader from 'react-csv-reader'
import { useTranslation } from 'react-i18next'

const FormImport = ({ loadCsv, uploadCsv }) => {
  const router = useRouter()
  const { t } = useTranslation()

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase()
  }
  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <p>{t('pages.orders.desc_import')}</p>
          <p>
            <strong>{t('pages.orders.note')} </strong>
            {t('pages.orders.note_desc_import')}
          </p>
        </div>
      </div>
      <div className="row mt-10">
        <div className="col-lg-4">
          <strong> {t('pages.orders.csv_example')}</strong>
        </div>
        <div className="col-lg-8">
          <a
            className="btn btn-light"
            download
            href="/assets/media/csv-example.csv"
          >
            {t('pages.orders.download_csv_example')}
          </a>
        </div>
      </div>
      <div className="row mt-3 mb-20">
        <div className="col-lg-4">
          <strong>{t('pages.orders.select_file_upload')}</strong>
        </div>
        <div className="col-lg-8">
          <div>
            <CSVReader
              cssClass="react-csv-input"
              onFileLoaded={loadCsv}
              parserOptions={papaparseOptions}
              accept=".csv, text/csv"
            />
          </div>
        </div>
      </div>

      <div className="position-absolute right-10 bottom-8">
        <button
          className="btn btn-light"
          onClick={() => router.push('/orders')}
        >
          {t('pages.common.go_back')}
        </button>
        <button className="btn btn-primary ml-5" onClick={uploadCsv}>
          {t('pages.orders.upload_csv')}
        </button>
      </div>
    </>
  )
}

export default FormImport
