import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import axios from '../../utils/axios'
import HeaderContent from '../layouts/HeaderContent'
import Table from '../../metronic/dataTable/Table'
import Filter from '../../metronic/dataTable/Filter'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'

import * as columnFormatters from '../customers/customers-list/column-formatters'
import * as BusinessUIHelpers from './business-list/BusinessUIHelpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import { useTranslation } from 'react-i18next'
import actions from 'store/actions'
import { connect } from 'react-redux'

const Customers = (props) => {
  const { t } = useTranslation()

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }

  const [customers, setCustomers] = useState([])
  const [totalCount, setTotalCount] = useState(customers.length)
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    setListLoading(true)
    axios
      .post(`admin/business/customers/${props.businessId}`, props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          setCustomers(data.customers)
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
      dataField: 'mobile',
      text: t('Table.columns.phone'),
      sort: true,
      sortCaret: sortCaret,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'orders',
      text: t('Table.columns.orders'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '95px' }
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
      textMuted: 'search_by_name'
    },
    {
      name: 'status',
      type: 'select',
      col: 2,
      options: Object.keys(BusinessUIHelpers.CustomerStatusTitles).map(
        (item) => (
          <option
            key={item}
            value={BusinessUIHelpers.CustomerStatusTitles[item]}
          >
            {t(`status.${item}`)}
          </option>
        )
      ),
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
          entities: customers,
          filter: filter,
          // UIHelper: CustomersUIHelpers,
          showButtonFilter: true,
          showPagination: true,

          callBack: (value) => setFilter(value)
        }}
      >
        {filter && (
          <Filter
            filter={filter}
            showButtonFilter={true}
            component="businessCustomers"
            actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_CUSTOMERS"
          />
        )}
        <Table
          component="businessCustomers"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_CUSTOMERS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}
export default connect(
  (state) => ({
    queryParams: state.businessCustomers.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_BUSINESS_CUSTOMERS,
        payload: queryParams
      })
    }
  })
)(Customers)
