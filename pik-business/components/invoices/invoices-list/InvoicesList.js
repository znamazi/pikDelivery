import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import HeaderContent from '../../layouts/HeaderContent'

import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import * as InvoicesUIHelpers from './InvoicesUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import {
  StatusColumnFormatter,
  DateColumnFormatter,
  ActionColumnFormatter
} from './ColumnFormatter'
import ToolBar from './ToolBar'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'

const InvoicesList = (props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')

  const prepareFilter = (column, value) => {
    let newQueryParams = { ...props.queryParams }
    newQueryParams = {
      ...newQueryParams,
      filter: { ...newQueryParams.filter, [column]: value }
    }
    if (!isEqual(newQueryParams, props.queryParams)) {
      setChangeStatus(true)

      props.updateQueryParams(newQueryParams)
    }
  }
  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }
  const changeTypeStatus = () => {
    setActiveMenu('')
    setChangeStatus(false)
  }
  useEffect(() => {
    setListLoading(true)
    props.getData(props.queryParams)
    setListLoading(false)
  }, [JSON.stringify(props.queryParams)])

  const columns = [
    {
      dataField: 'id',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: DateColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '200px' }
      }
    },
    {
      dataField: 'items.length',
      text: t('Table.columns.orders'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '110px' }
      }
    },
    {
      dataField: 'amount.total',
      text: t('Table.columns.amount'),
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
      formatter: StatusColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '110px' }
      }
    },
    {
      dataField: 'action',
      text: t('Table.columns.action'),
      sort: false,
      sortCaret: sortCaret,
      formatter: ActionColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '110px' }
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
    },
    {
      name: 'date_from',
      type: 'date',
      col: 2,
      textMuted: 'date_from'
    },
    {
      name: 'date_to',
      type: 'date',
      col: 2,
      textMuted: 'date_to'
    }
  ]

  const onClickRow = (row) => {
    router.push(`/invoice/[id]`, `/invoice/${row.id}`)
  }

  return (
    <>
      <HeaderContent>
        <li
          onClick={() => prepareFilter('status', '')}
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.invoices')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>

      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.invoices.totalCount,
          entities: props.invoices.invoices,
          title: 'invoices',
          UIHelper: InvoicesUIHelpers,
          filter: filter,
          exportButton: true,
          exportUrl: 'business/invoice/export',

          component: 'invoices',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_INVOICES',
          // selectRow: true,
          showPagination: true,
          changeStatus: changeStatus,
          changeTypeStatus: () => changeTypeStatus(),
          onClickRow: (row) => onClickRow(row),
          callBack: (value) => setFilter(value)
        }}
      >
        <DataTablePage />
      </DataTableContexts.Provider>
    </>
  )
}

export default connect(
  (state) => ({
    invoices: state.invoices,
    queryParams: state.invoices.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.INVOICE_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_ORDERS,
        payload: queryParams
      })
    }
  })
)(InvoicesList)
