import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import moment from 'moment'
import Link from 'next/link'
import axios from '../../utils/axios'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Table from '../../metronic/dataTable/Table'
// import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import BalanceDetails from './BalanceDetails'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { calculateCostDriver } from 'utils/utils'
import actions from 'store/actions'
import { connect } from 'react-redux'
const AmountColumnFormatter = (cellContent, row) => {
  return (
    <span>
      <strong>$ </strong> {row.costValue.toFixed(2)}
    </span>
  )
}
const Balance = ({ driverId }) => {
  const [selected, setSelected] = useState(false)
  const { t } = useTranslation()

  const DateColumnFormatter = (cellContent, row) => {
    let currentWeekStart = moment().startOf('isoWeek').format('LL')
    console.log('Date column formatter')
    console.log({ currentWeekStart, row })
    let showWeek =
      currentWeekStart == row.startOfWeek
        ? t('pages.drivers.current_week')
        : `${row.startOfWeek} - ${row.endOfWeek}`

    return <span>{showWeek}</span>
  }
  const initialFilter = {
    filter: {},
    sortOrder: 'desc', // asc||desc
    sortField: '_id',
    pageNumber: 0,
    pageSize: 10
  }
  const [dataBalance, setDataBalance] = useState([])
  const [customValue, setCustomValue] = useState([])
  let [queryParams, setQueryParams] = useState(initialFilter)
  const [totalCount, setTotalCount] = useState(0)
  useEffect(() => {
    axios
      .post(`admin/driver/balance/${driverId}`, queryParams)
      .then(({ data }) => {
        if (data.success) {
          setDataBalance(data.balance)
          setCustomValue(data.customValue)
          setTotalCount(data.totalCount)
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
  }, [queryParams, selected])
  const balance = useMemo(() => {
    let balanceData = []
    dataBalance.forEach((item) => {
      let date
      switch (item.status) {
        case 'Canceled':
          date = item.cancel.date
          break
        case 'Returned':
          date = item.time.returnComplete
          break
        case 'Delivered':
          date = item.time.deliveryComplete
          break
        default:
          break
      }
      if (date) {
        const year = moment(date).year()
        const numWeek = moment(date).isoWeek()
        const id = `${year}-${numWeek}`
        const index = balanceData.findIndex((item) => item.id == id)
        console.log({ date, item })
        if (index === -1) {
          let newData = {
            id,
            timestamp: parseFloat(moment(date).format('X')),
            startOfWeek: moment(date, 'YYYY-MM-DD')
              .startOf('isoWeek')
              .format('LL'),
            endOfWeek: moment(date, 'YYYY-MM-DD').endOf('isoWeek').format('LL'),
            numWeek,
            year,
            costValue: calculateCostDriver(
              item.cost,
              item.status,
              item.cancel,
              item.driver
            ),
            countOrder: 1,
            details: [
              {
                date: moment(date).format('dddd'),
                amount: calculateCostDriver(
                  item.cost,
                  item.status,
                  item.cancel,
                  item.driver
                ),
                countOrder: 1
              }
            ]
          }
          balanceData.push(newData)
        } else {
          const indexDetails = balanceData[index].details.findIndex(
            (item) => item.date == moment(date).format('dddd')
          )
          balanceData[index].costValue =
            balanceData[index].costValue +
            calculateCostDriver(
              item.cost,
              item.status,
              item.cancel,
              item.driver
            )
          balanceData[index].countOrder++

          if (indexDetails == -1) {
            balanceData[index].details = [
              ...balanceData[index].details,
              {
                date: moment(date).format('dddd'),
                amount: calculateCostDriver(
                  item.cost,
                  item.status,
                  item.cancel,
                  item.driver
                ),
                countOrder: 1
              }
            ]
          } else {
            balanceData[index].details[indexDetails].amount =
              balanceData[index].details[indexDetails].amount +
              calculateCostDriver(
                item.cost,
                item.status,
                item.cancel,
                item.driver
              )
            balanceData[index].details[indexDetails].countOrder++
          }
        }
      }
    })

    balanceData = balanceData.map((item) => {
      const existCustomValue = customValue.find(
        (cv) => cv._id.numWeek == item.numWeek && cv._id.year == item.year
      )

      return existCustomValue
        ? {
            ...item,
            costValue: item.costValue + existCustomValue.amountValue
          }
        : { ...item }
    })
    balanceData.sort((a, b) => {
      return b.timestamp - a.timestamp
    })
    return balanceData
  }, [selected, customValue])
  const columns = [
    {
      dataField: '_id',
      text: t('Table.columns.date'),
      sort: false,
      formatter: DateColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '280px' }
      }
    },
    {
      dataField: 'countOrder',
      text: t('Table.columns.orders'),
      sort: false
    },
    {
      dataField: 'costValue',
      text: t('Table.columns.Amount'),
      sort: false,
      formatter: AmountColumnFormatter
    }
  ]
  const onClickRow = (row) => {
    setSelected(row)
  }
  const setFilter = (value) => {
    if (!isEqual(value, queryParams) && value.sortField != 'createdAt') {
      setQueryParams(value)
    }
  }
  return (
    <>
      {selected && (
        <BalanceDetails
          backClick={() => setSelected(false)}
          week={selected.startOfWeek}
          year={selected.year}
          data={selected.details}
          driverId={driverId}
        />
      )}
      {!selected && (
        <div>
          <div className="col-4 float-right mb-5">
            <span className="btn btn-primary">
              {t('pages.common.Total')} ={' '}
              {balance
                .reduce(
                  (accumulator, currentValue) =>
                    accumulator + currentValue.costValue,
                  0
                )
                .toFixed(2)}
            </span>
          </div>
          <DTUIProvider>
            <DataTableContexts.Provider
              value={{
                columns: columns,
                totalCount: totalCount,
                entities: balance,
                showButtonFilter: false,
                showPagination: true,
                onClickRow: (row) => onClickRow(row),

                callBack: (value) => setFilter(value)
              }}
            >
              <Table
                component="queryParams"
                actionDisptachFilter="UPDATE_QUERY_PARAMS"
              />
            </DataTableContexts.Provider>
          </DTUIProvider>
        </div>
      )}
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
)(Balance)
