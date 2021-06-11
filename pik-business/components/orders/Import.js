import React, { useState } from 'react'
import CSVReader from 'react-csv-reader'
import FormImport from './FormImport'
import CsvData from './CsvData'
import { Alert, AlertTitle } from '@material-ui/lab'
import { useTranslation } from 'react-i18next'

const Import = () => {
  const { t } = useTranslation()

  const [prevData, setPrevData] = useState(false)
  const [csvData, setCsvData] = useState([])
  const validCsvColumn = [
    'nombre',
    'email',
    'telefono',
    'referencia',
    'descripción',
    'vehiculo'
  ]
  const validTypes = ['text/csv', 'text/comma-separated-values']
  const loadCsv = (data, fileInfo) => {
    setError('')
    if (validTypes.includes(fileInfo.type)) {
      setCsvData(data)
    } else {
      setError(t('errors.choose_csv_file'))
    }
  }
  const [error, setError] = useState('')

  return (
    <div className="col-12">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5 ">
          <h3 className="card-title font-weight-bolder ">
            {t('pages.orders.import_orders')}
          </h3>
        </div>
        <div className="card-body d-flex flex-column">
          {error && <Alert severity="error">{error}</Alert>}

          {!prevData && (
            <FormImport
              loadCsv={(data, fileInfo) => loadCsv(data, fileInfo)}
              uploadCsv={() => {
                setError('')
                if (csvData.length === 0) {
                  setError(t('errors.choose_csv_file'))
                  return
                }

                let csvColumn = Object.keys(csvData[0])
                let validCsv =
                  csvColumn.length == validCsvColumn.length &&
                  csvColumn.every((element, index) => {
                    console.log({ element, valid: validCsvColumn[index] })
                    return element === validCsvColumn[index]
                  })
                if (!validCsv) {
                  setError(t('errors.csv_format_not_valid'))
                  return
                }

                setPrevData(true)
              }}
            />
          )}
          {prevData && (
            <CsvData csvInfo={csvData} uploadCsv={() => setPrevData(false)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Import
