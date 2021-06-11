import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import * as columnFormatters from './column-formatters'
import * as CustomersUIHelpers from './CustomersUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import HeaderContent from '../../layouts/HeaderContent'
import { useTranslation } from 'react-i18next'

const CustomersList = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  let { status, filterHeader } = router.query
  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [activeMenu, setActiveMenu] = useState('All Customers')

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
    router.push('/customers')
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
      dataField: 'name',
      text: t('Table.columns.name'),
      sort: true,
      sortCaret: sortCaret,
      formatter: columnFormatters.NameColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '350px' }
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
      textMuted: 'search_by_name'
    },
    {
      name: 'status',
      type: 'select',
      col: 2,
      options: Object.keys(CustomersUIHelpers.CustomerStatusTitles).map(
        (item) => (
          <option
            key={item}
            value={CustomersUIHelpers.CustomerStatusTitles[item]}
          >
            {t(`status.${CustomersUIHelpers.CustomerStatusTitles[item]}`)}
          </option>
        )
      ),
      textMuted: 'filter_by_status'
    }
  ]
  const onClickRow = (row) => {
    router.push(`/customer/[customerId]`, `/customer/${row._id}`)
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() => {
            setActiveMenu('All Customers')
            prepareFilter('status', '', 'All Customers')
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'All Customers' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.customers.all')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.customers.totalCount,
          entities: props.customers.customers,
          title: 'customer_list',
          filter: filter,
          component: 'customers',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_CUSTOMERS',
          UIHelper: CustomersUIHelpers,
          showButtonFilter: true,
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
    customers: state.customers,
    queryParams: state.customers.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.CUSTOMER_REQUESTED,
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
)(CustomersList)
