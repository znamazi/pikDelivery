import React, { useState, useEffect, createContext, useMemo } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import HeaderContent from '../../layouts/HeaderContent'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import * as columnFormatters from './column-formatters'
import * as DriversUIHelpers from './DriversUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import PendingButton from './PendingButton'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'

export const DriverContext = createContext({ pending: 0 })

const DriversList = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  let { status, filterHeader } = router.query
  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  let activeMenuDefault = ''
  switch (props.queryParams.filter.status) {
    case DriversUIHelpers.filterHeaderRecruitment:
      activeMenuDefault = 'Recruitment'
      break
    case DriversUIHelpers.filterHeaderDriver:
      activeMenuDefault = 'All Drivers'
      break
    default:
      break
  }
  const [activeMenu, setActiveMenu] = useState(activeMenuDefault)

  useEffect(() => {
    if (!props.queryParams.filter.status)
      prepareFilter(
        'status',
        DriversUIHelpers.filterHeaderDriver,
        'All Drivers'
      )
  }, [])
  const prepareFilter = (column, value, filterHeader) => {
    let newQueryParams = { ...props.queryParams }
    newQueryParams = {
      ...newQueryParams,
      pageNumber: 0,

      filter: {
        ...newQueryParams.filter,
        [column]: value,
        hired: filterHeader === 'All Drivers'
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
    prepareFilter('status', status, filterHeader)
    router.push('/drivers')
  }

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }
  const changeTypeStatus = () => {
    // setActiveMenu('')
    setChangeStatus(false)
  }
  useEffect(() => {
    setListLoading(true)
    props.getData(props.queryParams)
    setListLoading(false)
    if (!props.drivers.success && props.drivers.message)
      toast.error(props.drivers.message)
  }, [JSON.stringify(props.queryParams)])

  const columns =
    activeMenu === 'Recruitment'
      ? [
          {
            dataField: 'name',
            text: t('Table.columns.name'),
            sort: true,
            sortCaret: sortCaret,
            formatter: columnFormatters.NameColumnFormatter,
            headerSortingClasses,
            headerStyle: (colum, colIndex) => {
              return { width: '250px' }
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
            dataField: 'createdAt',
            text: t('Table.columns.date'),
            sort: true,
            sortCaret: sortCaret,
            headerSortingClasses,
            formatter: columnFormatters.DateColumnFormatter,
            headerStyle: (colum, colIndex) => {
              return { width: '150px' }
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
              return { width: '150px' }
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
              return { width: '300px' }
            }
          },
          {
            dataField: 'mobile',
            text: t('Table.columns.phone'),
            sort: true,
            sortCaret: sortCaret,
            headerStyle: (colum, colIndex) => {
              return { width: '150px' }
            }
          },
          {
            dataField: 'cancel',
            text: t('Table.columns.Cancel'),
            sort: true,
            sortCaret: sortCaret,
            headerSortingClasses,
            formatter: (content, row) => {
              return <span>{row.cancel ? row.cancel.toFixed(2) : ''}</span>
            },
            headerStyle: (colum, colIndex) => {
              return { width: '120px' }
            }
          },
          {
            dataField: 'reject',
            text: t('Table.columns.Reject'),
            sort: true,
            sortCaret: sortCaret,
            headerSortingClasses,
            formatter: (content, row) => {
              return (
                <span>
                  {row.jobs?.ignore
                    ? ((row.jobs.ignore / row.jobs.total) * 100).toFixed(2)
                    : ''}
                </span>
              )
            },

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
              return { width: '150px' }
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
      options:
        activeMenu === 'Recruitment'
          ? Object.keys(DriversUIHelpers.RecruitmentStatusTitles).map(
              (item) => (
                <option
                  key={item}
                  value={DriversUIHelpers.RecruitmentStatusTitles[item]}
                >
                  {item}
                </option>
              )
            )
          : Object.keys(DriversUIHelpers.DriverStatusTitles).map((item) => (
              <option
                key={item}
                value={DriversUIHelpers.DriverStatusTitles[item]}
              >
                {item}
              </option>
            )),
      textMuted: 'filter_by_status'
    }
  ]

  const onClickRow = (row) => {
    router.push(`/driver/[driverId]`, `/driver/${row._id}`)
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() => {
            setActiveMenu('All Drivers')
            prepareFilter(
              'status',
              DriversUIHelpers.filterHeaderDriver,
              'All Drivers'
            )
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'All Drivers' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.drivers.all')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() => {
            setActiveMenu('Recruitment')
            prepareFilter(
              'status',
              DriversUIHelpers.filterHeaderRecruitment,
              'Recruitment'
            )
          }}
          className={`menu-item menu-item-submenu ${
            activeMenu === 'Recruitment' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.drivers.recruitment')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.drivers.totalCount,
          entities: props.drivers.drivers,
          title:
            activeMenu === 'Recruitment' ? 'recruitment_list' : 'drivers_list',
          filter: filter,
          component: 'drivers',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_DRIVERS',
          UIHelper: DriversUIHelpers,
          showButtonFilter: true,
          exportButton: activeMenu === 'Recruitment' ? false : true,
          showPagination: true,
          Tools: activeMenu === 'Recruitment' ? false : PendingButton,
          exportUrl: 'admin/driver/export',
          changeTypeStatus: () => changeTypeStatus(),
          changeStatus: changeStatus,

          onClickRow: (row) => onClickRow(row),
          callBack: (value) => setFilter(value)
        }}
      >
        <DriverContext.Provider
          value={{ pending: props.drivers.pendingDriver }}
        >
          <DataTablePage />
        </DriverContext.Provider>
      </DataTableContexts.Provider>
    </>
  )
}

export default connect(
  (state) => ({
    drivers: state.drivers,
    queryParams: state.drivers.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.DRIVER_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_DRIVERS,
        payload: queryParams
      })
    }
  })
)(DriversList)
