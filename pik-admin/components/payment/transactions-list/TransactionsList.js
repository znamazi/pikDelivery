import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'

import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import HeaderContent from '../../layouts/HeaderContent'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import * as columnFormatters from './column-formatters'
import * as TransactionsUIHelpers from './TransactionsUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import actions from 'store/actions'
import { toast } from 'react-toastify'

const TransactionsList = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  let { status, filterHeader } = router.query
  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [activeMenu, setActiveMenu] = useState('Payments')

  const prepareFilter = (column, value, filterHeader) => {
    let newQueryParams = { ...props.queryParams }
    newQueryParams = {
      ...newQueryParams,
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
    router.push('/transactions')
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
    if (!props.transactions.success && props.transactions.message)
      toast.error(props.transactions.message)
  }, [JSON.stringify(props.queryParams)])

  const columns = [
    {
      dataField: 'ID',
      text: t('Table.columns.id'),
      sort: true,
      sortCaret: sortCaret,
      formatter: columnFormatters.IDColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '230px' }
      }
    },
    {
      dataField: 'transactionType',
      text: t('Table.columns.transaction_type'),
      sort: true,
      sortCaret: sortCaret,
      headerStyle: (colum, colIndex) => {
        return { width: '175px' }
      }
    },
    {
      dataField: 'ownerName',
      text: t('Table.columns.name'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.NameColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '100px' }
      }
    },
    {
      dataField: 'captureAmount',
      text: t('Table.columns.Amount'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '100px' }
      },
      formatter: (cellContent, row) => {
        return (
          <div>
            $
            {row.captureAmount
              ? row.captureAmount.toFixed(2)
              : row.authAmount.toFixed(2)}
          </div>
        )
      }
    },
    {
      dataField: 'resource.id',
      text: t('Table.columns.invoice_id'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.ResourceColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '115px' }
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
        return { width: '100px' }
      }
    },
    {
      dataField: 'user.name',
      text: t('Table.columns.by'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '100px' }
      }
    }
  ]
  const filter = [
    {
      name: 'query',
      type: 'input',
      col: 4,
      placeholder: 'search_by_keyword',
      textMuted: 'search_by_name_transaction_tracking'
    },
    {
      name: 'status',
      type: 'select',
      col: 2,
      options: Object.keys(TransactionsUIHelpers.TransactionStatusTitles).map(
        (item) => (
          <option
            key={item}
            value={TransactionsUIHelpers.TransactionStatusTitles[item]}
          >
            {t(`status.${TransactionsUIHelpers.TransactionStatusTitles[item]}`)}
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

  return (
    <>
      <HeaderContent>
        <li
          onClick={() => {
            setActiveMenu('Payments')
            prepareFilter('status', '', 'Payments')
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'Payments' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.payments')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>

      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.transactions.totalCount,
          entities: props.transactions.transactions,
          title: 'transaction_list',
          filter: filter,
          UIHelper: TransactionsUIHelpers,
          showButtonFilter: true,
          showPagination: true,
          exportButton: true,
          exportUrl: 'admin/payment/export',
          changeTypeStatus: () => changeTypeStatus(),
          changeStatus: changeStatus,
          component: 'transactions',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_TRANSACTIONS',
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
    transactions: state.transactions,
    queryParams: state.transactions.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.PAYMENT_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_TRANSACTIONS,
        payload: queryParams
      })
    }
  })
)(TransactionsList)
