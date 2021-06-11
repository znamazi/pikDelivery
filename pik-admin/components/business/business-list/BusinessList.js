import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import HeaderContent from '../../layouts/HeaderContent'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import * as columnFormatters from './column-formatters'
import * as BusinessUIHelpers from './BusinessUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const BusinessList = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  let { status, filterHeader } = router.query

  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [activeMenu, setActiveMenu] = useState('All Business')

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
    router.push('/business')
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
    if (!props.business.success && props.business.message)
      toast.error(props.business.message)
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
        return { width: '220px' }
      }
    },
    {
      dataField: 'group',
      text: 'Group',
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '100px' }
      }
    },
    {
      dataField: 'customers',
      text: t('Table.columns.customers'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
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
      options: Object.keys(BusinessUIHelpers.BusinessStatusTitles).map(
        (item) => (
          <option
            key={item}
            value={BusinessUIHelpers.BusinessStatusTitles[item]}
          >
            {t(`status.${BusinessUIHelpers.BusinessStatusTitles[item]}`)}
          </option>
        )
      ),
      textMuted: 'filter_by_status'
    }
  ]

  const onClickRow = (row) => {
    router.push(`/business/[id]`, `/business/${row._id}`)
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() => {
            setActiveMenu('All Business')
            prepareFilter('status', '', 'All Business')
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'All Business' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.business')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.business.totalCount,
          entities: props.business.business,
          title: 'customers',
          filter: filter,
          component: 'business',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_BUSINESS',
          UIHelper: BusinessUIHelpers,
          showButtonFilter: true,
          showPagination: true,
          changeTypeStatus: () => changeTypeStatus(),
          changeStatus: changeStatus,
          onClickRow: (row) => onClickRow(row),
          callBack: (value) => (value) => setFilter(value)
        }}
      >
        <DataTablePage />
      </DataTableContexts.Provider>
    </>
  )
}

export default connect(
  (state) => ({
    business: state.business,
    queryParams: state.business.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.BUSINESS_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_BUSINESS,
        payload: queryParams
      })
    }
  })
)(BusinessList)
