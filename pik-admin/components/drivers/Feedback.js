import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import axios from '../../utils/axios'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Table from '../../metronic/dataTable/Table'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import { useTranslation } from 'react-i18next'
import actions from 'store/actions'
import { connect } from 'react-redux'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(0),
    minWidth: 120
  }
}))
const DateColumnFormatter = (cellContent, row) => {
  return <span>{moment(row.createdAt).format('LL')}</span>
}
const Feedback = ({ driverId, queryParams, updateQueryParams }) => {
  const { t } = useTranslation()

  const classes = useStyles()

  const [feedback, setFeedback] = useState([])
  const [showFeedback, setShowFeedback] = useState([])
  const [avg, setAvg] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const handleChange = (event) => {
    const rate = event.target.value
    const result = feedback.filter((item) => item.rate >= rate)
    setShowFeedback(result)
  }

  useEffect(() => {
    axios
      .post(`admin/driver/feedback/${driverId}`, queryParams)
      .then(({ data }) => {
        if (data.success) {
          const feedback = []
          data.orders.forEach((item) => {
            if (item.receiverFeedback) {
              let newData = { ...item.receiverFeedback, id: item.id }
              feedback.push(newData)
            }
            if (item.senderFeedback) {
              let newData = { ...item.senderFeedback, id: item.id }
              feedback.push(newData)
            }
          })
          setFeedback(feedback)
          setShowFeedback(feedback)
          if (feedback.length > 0) {
            const sum = feedback.reduce((sum, item) => {
              sum = sum + item.rate
              return sum
            }, 0)
            const avg = sum / feedback.length
            setAvg(avg)
          }

          setTotalCount(feedback.length)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
      })
  }, [queryParams])
  const columns = [
    {
      dataField: 'createdAt',
      text: t('Table.columns.date'),
      sort: false,
      formatter: DateColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '150px' }
      }
    },
    {
      dataField: 'rate',
      text: t('Table.columns.Rate'),
      sort: false,
      headerStyle: (colum, colIndex) => {
        return { width: '80px' }
      }
    },
    {
      dataField: 'id',
      text: t('Table.columns.order'),
      sort: false,
      headerStyle: (colum, colIndex) => {
        return { width: '90px' }
      }
    },
    {
      dataField: 'comment',
      text: t('Table.columns.Comment'),
      sort: false
      // headerStyle: (colum, colIndex) => {
      //   return { width: '300px' }
      // }
    }
  ]
  return (
    <>
      <div>
        <p className="text-dark-75 font-weight-bolder ">
          {t('pages.drivers.total_feedback')} = {totalCount}
        </p>
        <p className="text-dark-75 font-weight-bolder ">
          {t('pages.drivers.avg_feedback')} = {avg.toFixed(2)}
        </p>
      </div>

      <div className="float-right mb-5">
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">
            {t('pages.drivers.filter_by')}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            // value={queryParams.filter.rate}
            onChange={handleChange}
          >
            <MenuItem value={0}>All</MenuItem>
            <MenuItem value={1}>One</MenuItem>
            <MenuItem value={2}>Two</MenuItem>
            <MenuItem value={3}>Three</MenuItem>
            <MenuItem value={4}>Four</MenuItem>
            <MenuItem value={5}>Five</MenuItem>
          </Select>
        </FormControl>
      </div>
      <DTUIProvider>
        <DataTableContexts.Provider
          value={{
            columns: columns,
            entities: showFeedback,
            showButtonFilter: false,
            showPagination: false,
            callBack: (value) =>
              !isEqual(value, queryParams) ? setQueryParams(value) : ''
          }}
        >
          <Table
            component="queryParams"
            actionDisptachFilter="UPDATE_QUERY_PARAMS"
          />
        </DataTableContexts.Provider>
      </DTUIProvider>
    </>
  )
}

export default connect(
  (state) => ({
    queryParams: state.queryParams.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS,
        payload: queryParams
      })
    }
  })
)(Feedback)
