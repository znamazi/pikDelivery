import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import HeaderContent from '../../layouts/HeaderContent'
import actions from 'store/actions'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import * as InvoicesUIHelpers from './InvoicesUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import {
  StatusColumnFormatter,
  DateColumnFormatter,
  CustomerColumnFormatter
} from './ColumnFormatter'
import ToolBar from './ToolBar'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const InvoicesList = (props) => {
  const { t } = useTranslation()
  console.log('render')
  const router = useRouter()
  let { status, filterHeader } = router.query

  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  let activeMenuDefault = ''
  switch (props.queryParams.filter.status) {
    case InvoicesUIHelpers.filterHeaderOpen:
      activeMenuDefault = 'OPEN'
      break
    case InvoicesUIHelpers.filterHeaderClose:
      activeMenuDefault = 'CLOSED'
      break
    default:
      break
  }
  const [activeMenu, setActiveMenu] = useState(activeMenuDefault)
  useEffect(() => {
    if (!props.queryParams.filter.status) {
      prepareFilter('status', InvoicesUIHelpers.filterHeaderOpen, 'OPEN')
    }
  }, [])

  const prepareFilter = (column, value, filterHeader) => {
    let newQueryParams = { ...props.queryParams }
    newQueryParams = {
      ...newQueryParams,
      pageNumber: 0,
      filter: { ...newQueryParams.filter, [column]: value }
    }
    if (!isEqual(newQueryParams, props.queryParams)) {
      if (column === 'status' && !changeStatus) {
        setChangeStatus(true)
        filterHeader ? setActiveMenu(filterHeader) : setActiveMenu(value)
      }
      props.updateQueryParams(newQueryParams)
    }
  }

  if (filterHeader) {
    prepareFilter('status', status, filterHeader)
    router.push('/invoices')
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
    if (!props.invoices.success && props.invoices.message)
      toast.error(props.invoices.message)
  }, [JSON.stringify(props.queryParams)])

  const columns = [
    {
      dataField: 'id',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '90px' }
      }
    },
    {
      dataField: 'createdAt',
      text: t('Table.columns.date'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: DateColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'customer',
      text: t('Table.columns.customers'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: CustomerColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'items.length',
      text: t('Table.columns.orders'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'amount.total',
      text: t('Table.columns.total'),
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
      formatter: StatusColumnFormatter,
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
          onClick={() => {
            setActiveMenu('OPEN')
            prepareFilter('status', InvoicesUIHelpers.filterHeaderOpen, 'OPEN')
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'OPEN' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.open')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() => {
            setActiveMenu('CLOSED')
            prepareFilter(
              'status',
              InvoicesUIHelpers.filterHeaderClose,
              'CLOSED'
            )
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'CLOSED' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.closed')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() => {
            setActiveMenu('All Invoices')
            prepareFilter('status', '', 'All Invoices')
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'All Invoices' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.all')}</span>
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
          filter: filter,
          component: 'invoices',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_INVOICES',
          UIHelper: InvoicesUIHelpers,
          showButtonFilter: true,
          // selectRow: true,
          Tools: ToolBar,
          showPagination: true,
          changeTypeStatus: () => changeTypeStatus(),
          changeStatus: changeStatus,

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
        type: actions.UPDATE_QUERY_PARAMS_INVOICES,
        payload: queryParams
      })
    }
  })
)(InvoicesList)
