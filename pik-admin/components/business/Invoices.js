import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import axios from '../../utils/axios'
import Table from '../../metronic/dataTable/Table'
import Filter from '../../metronic/dataTable/Filter'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import * as InvoicesUIHelpers from '../invoices/invoices-list/InvoicesUIHelpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import {
  StatusColumnFormatter,
  BookingColumnFormatter
} from '../invoices/invoices-list/ColumnFormatter'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import actions from 'store/actions'
import { connect } from 'react-redux'

const Invoices = (props) => {
  const { t } = useTranslation()

  const [invoices, setInvoices] = useState([])
  const [totalCount, setTotalCount] = useState(invoices.length)
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    setListLoading(true)
    axios
      .post(`admin/business/invoices/${props.businessId}`, props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          setInvoices(data.invoices)
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

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }
  const columns = [
    {
      dataField: 'id',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: BookingColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '260px' }
      }
    },
    {
      dataField: 'items.length',
      text: t('Table.columns.orders'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: 'amount.total',
      text: t('Table.columns.Amount'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: 'status',
      text: t('Table.columns.status'),
      sort: true,
      sortCaret: sortCaret,
      formatter: StatusColumnFormatter,
      headerSortingClasses
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
      options: Object.keys(InvoicesUIHelpers.InvoiceStatusTitles).map(
        (item) => (
          <option
            key={item}
            value={InvoicesUIHelpers.InvoiceStatusTitles[item]}
          >
            {t(`status.${InvoicesUIHelpers.InvoiceStatusTitles[item]}`)}
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
          entities: invoices,
          filter: filter,
          UIHelper: InvoicesUIHelpers,
          showButtonFilter: true,
          showPagination: true,
          callBack: (value) => setFilter(value)
        }}
      >
        {filter && (
          <Filter
            filter={filter}
            showButtonFilter={true}
            component="businessInvoices"
            actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_INVOICES"
          />
        )}
        <Table
          component="businessInvoices"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_BUSINESS_INVOICES"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.businessInvoices.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_BUSINESS_INVOICES,
        payload: queryParams
      })
    }
  })
)(Invoices)
