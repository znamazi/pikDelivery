import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useTranslation } from 'react-i18next'
import axios from '../../utils/axios'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Table from '../../metronic/dataTable/Table'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import ShowDate from '../partials/ShowDate'
import { toast } from 'react-toastify'
import actions from 'store/actions'
import { connect } from 'react-redux'

const IDColumnFormatter = (cellContent, row) => {
  return <ShowDate id={row.id} date={moment(row.date).format('LL')} />
}
const businessColumnFormatter = (cellContent, row) => {
  return <span>{row.businesses ? row.businesses.name : ''}</span>
}
const Available = (props) => {
  const { t } = useTranslation()
  const [available, setAvailable] = useState([])
  const [totalCount, setTotalCount] = useState(available.length)
  useEffect(() => {
    axios
      .post(`admin/customer/orders/${props.customerId}`, props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          let availables = data.orders.filter(
            (order) =>
              ['Pending', 'Created', 'Reschedule'].includes(order.status) &&
              order.senderModel == 'business'
          )
          setAvailable(availables)
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
      formatter: IDColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '200px' }
      }
    },

    {
      dataField: 'vehicleType',
      text: t('Table.columns.vehicle'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'business',
      text: t('Table.columns.business'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: businessColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'countPackages',
      text: t('Table.columns.package'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    }
  ]

  return (
    <DTUIProvider>
      <DataTableContexts.Provider
        value={{
          columns: columns,
          totalCount: totalCount,
          entities: available,
          showButtonFilter: false,
          showPagination: true,
          callBack: (value) =>
            !isEqual(value, props.queryParams)
              ? props.updateQueryParams(value)
              : ''
        }}
      >
        <Table
          component="customerAvailbles"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_CUSTOMER_AVAILBLES"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.customerAvailbles.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_CUSTOMER_AVAILBLES,
        payload: queryParams
      })
    }
  })
)(Available)
