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

const Orders = (props) => {
  const { t } = useTranslation()

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }
  const [orders, setOrders] = useState([])

  const [totalCount, setTotalCount] = useState(orders.length)
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    setListLoading(true)
    axios
      .post(`admin/business/orders/${props.businessId}`, props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          setOrders(data.orders)
          setTotalCount(data.totalCount)
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
      dataField: 'id',
      text: t('Table.columns.id_booking_time'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.BookingColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '220px' }
      }
    },
    {
      dataField: 'name',
      text: t('Table.columns.name'),
      sort: true,
      sortCaret: sortCaret,
      formatter: columnFormatters.NameColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '220px' }
      }
    },
    {
      dataField: 'receiver.mobile',
      text: t('Table.columns.phone'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'items',
      text: t('Table.columns.package'),
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
      options: Object.keys(OrdersUIHelpers.OrderStatusTitles).map((item) => (
        <option key={item} value={OrdersUIHelpers.OrderStatusTitles[item]}>
          {t(`status.${item}`)}
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
          entities: orders,
          filter: filter,
          UIHelper: OrdersUIHelpers,
          showButtonFilter: true,
          showPagination: true,
          callBack: (value) => setFilter(value)
        }}
      >
        {filter && (
          <Filter
            filter={filter}
            showButtonFilter={true}
            component="businessOrders"
            actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_ORDERS"
          />
        )}
        <Table
          component="businessOrders"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_ORDERS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.businessOrders.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_BUSINESS_ORDERS,
        payload: queryParams
      })
    }
  })
)(Orders)
