import React from 'react'
import axios from '../../utils/axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { connect } from 'react-redux'

const ExportData = (props) => {
  const { t } = useTranslation()

  const exportData = (e) => {
    e.preventDefault()
    let queryParam = {
      ...props.queryParams,
      exportData: true
    }
    axios
      .post(props.url, queryParam)
      .then(({ data }) => {
        const csvData = new Blob([data], { type: 'text/csv;charset=utf-8;' })
        const blobURL = URL.createObjectURL(csvData)
        const a = document.createElement('a')
        a.href = blobURL
        a.download = `${props.title}.csv`
        a.style = 'display: none'

        document.body.appendChild(a)
        a.click()
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
      })
    // DTProps.callBackExport(qparam)
  }
  return (
    <div>
      <a onClick={(e) => exportData(e)}>
        <i className="fa fa-download mr-2"></i>
        <strong>{t('pages.common.export')}</strong>
      </a>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return { queryParams: state[ownProps.component].queryParams }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateQueryParams: (queryParams) => {
      dispatch({
        type: ownProps.actionDisptachFilter,
        payload: queryParams
      })
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ExportData)
