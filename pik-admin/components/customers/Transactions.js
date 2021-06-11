import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import moment from 'moment'
import axios from '../../utils/axios'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Table from '../../metronic/dataTable/Table'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import { connect } from 'react-redux'
import { StatusColumnFormatter } from '../payment/transactions-list/column-formatters/StatusColumnFormatter'

const DateFormatter = (cellContent, row) => {
  return <div>{moment(row.createdAt).format('DD/MM/YYYY h:mm A')}</div>
}

const Transactions = (props) => {
  const { t } = useTranslation()

  const [transactions, setTransactions] = useState([])
  const [totalCount, setTotalCount] = useState(transactions.length)
  useEffect(() => {
    axios
      .post(`admin/customer/payments/${props.customerId}`, props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          setTransactions(data.payments)
          setTotalCount(data.payments.length)
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
  }, [JSON.stringify(props.queryParams)])
  const columns = [
    {
      dataField: '_id',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '200px' }
      }
    },

    {
      dataField: 'transactionType',
      text: t('Table.columns.transaction_type'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '180px' }
      }
    },
    {
      dataField: 'createdAt',
      text: t('Table.columns.transaction_date'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: DateFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '180px' }
      }
    },
    {
      dataField: 'captureAmount',
      text: t('Table.columns.Amount'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (cellContent, row) => {
        return (
          <div>
            $
            {row.captureAmount
              ? row.captureAmount.toFixed(2)
              : row.authAmount.toFixed(2)}
          </div>
        )
      },
      headerStyle: (colum, colIndex) => {
        return { width: '100px' }
      }
    },
    {
      dataField: 'resource.id',
      text: t('Table.columns.order_ID'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '110px' }
      }
    },
    {
      dataField: 'status',
      text: t('Table.columns.status'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: StatusColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '110px' }
      }
    }
  ]

  return (
    <DTUIProvider>
      <DataTableContexts.Provider
        value={{
          columns: columns,
          totalCount: totalCount,
          entities: transactions,
          showButtonFilter: false,
          showPagination: true,

          callBack: (value) =>
            !isEqual(value, props.queryParams)
              ? props.updateQueryParams(value)
              : ''
        }}
      >
        <Table
          component="customerTransactions"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_CUSTOMER_TRANSACTIONS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.customerTransactions.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_CUSTOMER_TRANSACTIONS,
        payload: queryParams
      })
    }
  })
)(Transactions)
