import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import HeaderContent from '../../layouts/HeaderContent'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import * as columnFormatters from './column-formatters'
import * as CustomersUIHelpers from './CustomersUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'

const CustomersList = (props) => {
  const router = useRouter()
  const { t } = useTranslation()
  let { status, filterHeader } = router.query
  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [activeMenu, setActiveMenu] = useState(
    props.queryParams.filter.status === 'Not Registered'
      ? 'Not Registered'
      : 'All Customers'
  )
  useEffect(() => {
    if (!props.queryParams.filter.status)
      prepareFilter(
        'status',
        CustomersUIHelpers.filterHeaderCustomer,
        'All Customers'
      )
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
    router.push('/customers')
  }

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }

  useEffect(() => {
    setListLoading(true)
    props.getData(props.queryParams)
    setListLoading(false)
    if (!props.customers.success && props.customers.message)
      toast.error(props.customers.message)
  }, [JSON.stringify(props.queryParams)])

  const changeTypeStatus = () => {
    // setActiveMenu('')
    setChangeStatus(false)
  }

  const columns =
    activeMenu === 'All Customers'
      ? [
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
      : [
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
          }
        ]
  const filter =
    activeMenu === 'All Customers'
      ? [
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
                  {t(`status.${item}`)}
                </option>
              )
            ),
            textMuted: 'filter_by_status'
          }
        ]
      : [
          {
            name: 'query',
            type: 'input',
            col: 4,
            placeholder: 'search_by_keyword',
            textMuted: 'search_by_name'
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
            prepareFilter(
              'status',
              CustomersUIHelpers.filterHeaderCustomer,
              'All Customers'
            )
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
        <li
          onClick={() => {
            setActiveMenu('Not Registered')
            prepareFilter(
              'status',
              CustomersUIHelpers.filterHeaderNotRegister,
              'Not Registered'
            )
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'Not Registered' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.customers.non_registered')}
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
          changeStatus: changeStatus,
          changeTypeStatus: () => changeTypeStatus(),
          UIHelper: CustomersUIHelpers,
          showButtonFilter: true,
          showPagination: true,
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
        type: actions.UPDATE_QUERY_PARAMS_CUSTOMERS,
        payload: queryParams
      })
    }
  })
)(CustomersList)
