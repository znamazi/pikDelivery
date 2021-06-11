import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import axios from '../../utils/axios'
import Table from '../../metronic/dataTable/Table'
import Filter from '../../metronic/dataTable/Filter'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import * as columnFormatters from '../orders/orders-list/column-formatters'
import * as OrdersUIHelpers from '../orders/orders-list/OrdersUIHelpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import actions from 'store/actions'
import { connect } from 'react-redux'
import { TransactionStatusTitles } from 'components/payment/transactions-list/TransactionsUIHelpers'
import ShowDate from 'components/partials/ShowDate'
import { StatusColumnFormatter } from '../payment/transactions-list/column-formatters/StatusColumnFormatter'

const Payments = (props) => {
  const { t } = useTranslation()

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }

  const [payments, setPayments] = useState([])

  const [totalCount, setTotalCount] = useState(payments.length)
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    setListLoading(true)
    axios
      .post(`admin/business/payments/${props.businessId}`, props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          setPayments(data.payments)
          setTotalCount(data.payments.length)
          setListLoading(false)
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
  }, [props.queryParams, props.statusFilter])

  const columns = [
    {
      dataField: 'createdAt',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (cellContent, row) => {
        return <ShowDate id={row._id} date={row.createdAt} />
      },
      headerStyle: (colum, colIndex) => {
        return { width: '250px' }
      }
    },
    {
      dataField: 'transactionType',
      text: t('Table.columns.type'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
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
            {row.captureAmount
              ? row.captureAmount.toFixed(2)
              : row.authAmount.toFixed(2)}
          </div>
        )
      }
    },
    {
      dataField: 'resource.id',
      text: t('Table.columns.invoice'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: 'status',
      text: t('Table.columns.status'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: StatusColumnFormatter
    }
  ]
  const filter = [
    {
      name: 'query',
      type: 'input',
      col: 4,
      placeholder: 'search_by_keyword',
      textMuted: 'search_by_name_order_tracking'
    },
    {
      name: 'status',
      type: 'select',
      col: 2,
      options: Object.keys(TransactionStatusTitles).map((item) => (
        <option key={item} value={TransactionStatusTitles[item]}>
          {t(`status.${TransactionStatusTitles[item]}`)}
        </option>
      )),

      textMuted: 'filter_by_status'
    }
  ]

  return (
    <DTUIProvider>
      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: totalCount,
          entities: payments,
          filter: filter,
          UIHelper: OrdersUIHelpers,
          showButtonFilter: false,
          exportButton: true,
          showPagination: true,

          exportUrl: 'admin/order/export',
          callBack: (value) => setFilter(value)
        }}
      >
        {filter && (
          <Filter
            filter={filter}
            showButtonFilter={true}
            component="businessPayments"
            actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_PAYMENTS"
          />
        )}
        <Table
          component="businessPayments"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_PAYMENTS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.businessPayments.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_BUSINESS_PAYMENTS,
        payload: queryParams
      })
    }
  })
)(Payments)
