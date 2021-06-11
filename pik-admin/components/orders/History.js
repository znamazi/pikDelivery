import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const History = ({ logs }) => {
  const { t } = useTranslation()

  return (
    <div className="row">
      <div className="table-responsive col-12">
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <td>{t('Table.columns.date')}</td>
              <td>{t('Table.columns.description')}</td>
            </tr>
          </thead>
          <tbody>
            {logs.map((item, index) => (
              <tr key={index}>
                <td>{moment(item.date).format('DD/MM/YYYY h:mm A')}</td>
                <td>{item.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default History
