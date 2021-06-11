import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { connect } from 'react-redux'

import DataTablePage from '../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import * as columnFormatters from '../orders/orders-list/column-formatters'
import * as OrdersUIHelpers from '../orders/orders-list/OrdersUIHelpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const OrderPackages = (props) => {
  const { t } = useTranslation()

  const [listLoading, setListLoading] = useState(false)

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      DTUIProps.setQueryParams(value)
    }
  }

  useEffect(() => {
    setListLoading(true)
    props.getData({
      queryParams: props.queryParams,
      customerId: props.customerId
    })
    setListLoading(false)
  }, [JSON.stringify(props.queryParams)])

  const columns = [
    {
      dataField: 'id',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.BookingColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '175px' }
      }
    },
    {
      dataField: 'countPackages',
      text: t('Table.columns.packages'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'status',
      text: t('Table.columns.status'),
      sort: true,
      sortCaret: sortCaret,
      formatter: columnFormatters.StatusColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'action',
      text: t('Table.columns.action'),
      sort: false,
      sortCaret: sortCaret,
      formatter: columnFormatters.ActionColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    }
  ]
  return (
    <div className="col-lg-8">
      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.customers.ordersCount,
          entities: props.customers.orders,
          title: 'order_packages',
          component: 'customerOrders',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_CUSTOMER_ORDERS',
          UIHelper: OrdersUIHelpers,
          showPagination: true,
          // selectRow: true,
          callBack: (value) => setFilter(value)
        }}
      >
        <DataTablePage />
      </DataTableContexts.Provider>
    </div>
  )
}

export default connect(
  (state) => ({
    customers: state.customers,
    queryParams: state.customerOrders.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.CUSTOMER_ORDER_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_CUSTOMER_ORDERS,
        payload: queryParams
      })
    }
  })
)(OrderPackages)
