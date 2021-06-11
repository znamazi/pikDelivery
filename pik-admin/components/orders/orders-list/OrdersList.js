import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import HeaderContent from '../../layouts/HeaderContent'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import * as columnFormatters from './column-formatters'
import * as OrdersUIHelpers from './OrdersUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import Grouping from './Grouping'

const OrdersList = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  let { status, query, search, filterHeader } = router.query
  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  let activeMenuDefault = ''
  if (!query) {
    switch (props.queryParams.filter.status) {
      case OrdersUIHelpers.filterHeaderProgress:
        activeMenuDefault = 'PROGRESS'
        break
      case OrdersUIHelpers.filterHeaderOpen:
        activeMenuDefault = 'OPEN'
        break
      case OrdersUIHelpers.filterHeaderClose:
        activeMenuDefault = 'CLOSED'
        break
      default:
        break
    }
  }
  const [activeMenu, setActiveMenu] = useState(activeMenuDefault)
  useEffect(() => {
    if (!props.queryParams.filter.status && !query)
      prepareFilter('status', OrdersUIHelpers.filterHeaderOpen, 'OPEN')
  }, [])

  const prepareFilter = (column, value, filterHeader) => {
    let newQueryParams = { ...props.queryParams }
    if (column === 'queryHeader') {
      newQueryParams = {
        ...newQueryParams,
        pageNumber: 0,

        filter: { ...newQueryParams.filter, [column]: value, status: '' }
      }
    } else {
      newQueryParams = {
        ...newQueryParams,
        pageNumber: 0,

        filter: { ...newQueryParams.filter, [column]: value }
      }
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
    router.push('/orders')

    prepareFilter('status', status, filterHeader)
  }
  if (query != undefined && search) {
    if (!query) router.push('/orders')
    prepareFilter('queryHeader', query)
    search = false
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
    if (!props.orders.success && props.orders.message)
      toast.error(props.orders.message)
  }, [JSON.stringify(props.queryParams)])

  const columns = [
    {
      dataField: 'id',
      text: t('Table.columns.id_booking_time'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.BookingColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '165px' }
      }
    },
    {
      dataField: 'name',
      text: t('Table.columns.name'),
      sort: true,
      sortCaret: sortCaret,
      formatter: columnFormatters.NameColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '200px' }
      },
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          e.stopPropagation()
        }
      }
    },
    {
      dataField: 'driverName',
      text: t('Table.columns.driver'),
      sort: true,
      sortCaret: sortCaret,
      formatter: columnFormatters.DriverColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '190px' }
      },
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          e.stopPropagation()
        }
      }
    },
    {
      dataField: 'vehicleType',
      text: t('Table.columns.vehicle'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '97px' }
      },
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          e.stopPropagation()
        }
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
        return { width: '80px' }
      },
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          e.stopPropagation()
        }
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
        return { width: '110px' }
      },
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          e.stopPropagation()
        }
      }
    },
    {
      dataField: 'action',
      text: '',
      sort: false,
      sortCaret: sortCaret,
      formatter: columnFormatters.ActionColumnFormatter,
      headerSortingClasses,
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          e.stopPropagation()
        }
      }
      // headerStyle: (colum, colIndex) => {
      //   return { width: '30px' }
      // }
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
      options: Object.keys(OrdersUIHelpers.OrderStatusTitles).map((item) => (
        <option key={item} value={OrdersUIHelpers.OrderStatusTitles[item]}>
          {t(`status.${item}`)}
        </option>
      )),

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

  // const onClickRow = (row) => {
  //   router.push(`/order/[id]`, `/order/${row.id}`)
  // }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() => {
            setActiveMenu('PROGRESS')
            prepareFilter(
              'status',
              OrdersUIHelpers.filterHeaderProgress,
              'PROGRESS'
            )
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'PROGRESS' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.orders.progress')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() => {
            setActiveMenu('OPEN')
            prepareFilter('status', OrdersUIHelpers.filterHeaderOpen, 'OPEN')
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
            prepareFilter('status', OrdersUIHelpers.filterHeaderClose, 'CLOSED')
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
            setActiveMenu('All Orders')
            prepareFilter('status', '', 'All Orders')
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'All Orders' ? 'menu-item-active' : ''
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
          totalCount: props.orders.totalCount,
          entities: props.orders.orders,
          title: 'progress_orders',
          filter: filter,
          component: 'orders',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_ORDERS',
          UIHelper: OrdersUIHelpers,
          showButtonFilter: true,
          exportButton: true,
          showPagination: true,
          selectRow: true,
          Grouping: Grouping,
          changeTypeStatus: () => changeTypeStatus(),
          changeStatus: changeStatus,

          // onClickRow: (row) => onClickRow(row),
          exportUrl: 'admin/order/export',
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
    orders: state.orders,
    queryParams: state.orders.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.ORDER_REQUESTED,
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
)(OrdersList)
