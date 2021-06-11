import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { toast } from 'react-toastify'

import axios from '../../utils/axios'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Table from '../../metronic/dataTable/Table'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import * as columnFormatters from '../orders/orders-list/column-formatters'
import { useTranslation } from 'react-i18next'
import ShowDate from 'components/partials/ShowDate'
import { calculateCostDriver } from '../../utils/utils'
import actions from 'store/actions'
import { connect } from 'react-redux'

const IDColumnFormatter = (cellContent, row) => {
  return <ShowDate id={row.id} date={moment(row.createdAt).format('LL')} />
}
const NameColumnFormatter = (cellContent, row) => {
  return <span>{`${row.customer.firstName} ${row.customer.lastName}`}</span>
}

const CostColumnFormatter = (cellContent, row) => {
  return (
    <div className="d-flex align-items-center">
      {row.cost
        ? `$ ${calculateCostDriver(
            row.cost,
            row.status,
            row.cancel,
            row.driver
          ).toFixed(2)} `
        : ''}
    </div>
  )
}
const Orders = ({ driverId, queryParams, updateQueryParams }) => {
  const { t } = useTranslation()

  const [orders, setOrders] = useState([])
  const [totalCount, setTotalCount] = useState(orders.length)

  useEffect(() => {
    axios
      .post(`admin/driver/orders/${driverId}`, queryParams)
      .then(({ data }) => {
        if (data.success) {
          setOrders(data.orders)
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
  }, [queryParams])
  const columns = [
    {
      dataField: 'id',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: IDColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '200px' }
      }
    },
    {
      dataField: 'name',
      text: t('Table.columns.name'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: NameColumnFormatter
    },
    {
      dataField: 'vehicleType',
      text: t('Table.columns.vehicle'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: 'cost',
      text: t('Table.columns.cost'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: CostColumnFormatter
    }
  ]

  return (
    <DTUIProvider>
      <DataTableContexts.Provider
        value={{
          columns: columns,
          totalCount: totalCount,
          entities: orders,
          showButtonFilter: false,
          showPagination: true,

          callBack: (value) =>
            !isEqual(value, queryParams) ? updateQueryParams(value) : ''
        }}
      >
        <Table
          component="driverOrders"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_DRIVERS_ORDERS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.driverOrders.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_DRIVERS_ORDERS,
        payload: queryParams
      })
    }
  })
)(Orders)
