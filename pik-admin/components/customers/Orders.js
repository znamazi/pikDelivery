import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { toast } from 'react-toastify'

import axios from '../../utils/axios'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Filter from '../../metronic/dataTable/Filter'
import Table from '../../metronic/dataTable/Table'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import * as columnFormatters from '../orders/orders-list/column-formatters'
import * as OrdersUIHelpers from '../orders/orders-list/OrdersUIHelpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import { useTranslation } from 'react-i18next'
import actions from 'store/actions'
import { connect } from 'react-redux'

const Orders = (props) => {
  const { t } = useTranslation()

  const router = useRouter()

  const [orders, setOrders] = useState([])
  const [totalCount, setTotalCount] = useState(Orders.length)
  useEffect(() => {
    axios
      .post(`admin/customer/orders/${props.customerId}`, props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          setOrders(data.orders)
          setTotalCount(data.orders.length)
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
      dataField: 'id',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.BookingColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '165px' }
      }
    },
    {
      dataField: 'vehicleType',
      text: t('Table.columns.vehicle'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '100px' }
      }
    },
    {
      dataField: 'type',
      text: t('Table.columns.type'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.TypeColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '78px' }
      }
    },
    {
      dataField: 'cost.total',
      text: t('Table.columns.cost'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.CostColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '78px' }
      }
    },
    {
      dataField: 'status',
      text: t('Table.columns.status'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.StatusColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    }
  ]
  const filter = [
    {
      name: 'query',
      type: 'input',
      col: 5,
      placeholder: 'search_by_keyword',
      textMuted: 'search_by_id_vehicle_cost'
    },
    {
      name: 'status',
      type: 'select',
      col: 3,
      options: Object.keys(OrdersUIHelpers.OrderStatusTitles).map((item) => (
        <option key={item} value={OrdersUIHelpers.OrderStatusTitles[item]}>
          {t(`status.${item}`)}
        </option>
      )),

      textMuted: 'filter_by_status'
    },
    {
      name: 'type',
      type: 'select',
      col: 3,
      options: [
        <option value="" key="all">
          {t('status.All')}
        </option>,
        <option value="Customer" key="Customer">
          {t('status.Standard')}
        </option>,
        <option value="Business" key="Business">
          {t('status.Business')}
        </option>
      ],
      textMuted: 'filter_by_type'
    }
  ]
  const onClickRow = (row) => {
    router.push(`/order/[id]`, `/order/${row.id}`)
  }
  return (
    <DTUIProvider>
      {filter && (
        <Filter
          filter={filter}
          showButtonFilter={true}
          component="customerOrders"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_CUSTOMER_ORDERS"
        />
      )}
      <DataTableContexts.Provider
        value={{
          columns: columns,
          totalCount: totalCount,
          entities: orders,
          UIHelper: OrdersUIHelpers,
          showButtonFilter: true,
          showPagination: true,
          onClickRow: (row) => onClickRow(row),
          callBack: (value) =>
            !isEqual(value, props.queryParams)
              ? props.updateQueryParams(value)
              : ''
        }}
      >
        <Table
          component="customerOrders"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_CUSTOMER_ORDERS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.customerOrders.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_CUSTOMER_ORDERS,
        payload: queryParams
      })
    }
  })
)(Orders)
