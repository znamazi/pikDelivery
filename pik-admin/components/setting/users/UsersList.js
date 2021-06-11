import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import * as columnFormatters from './ColumnFormatter'
import { DTUIProvider } from '../../../metronic/dataTable/DTUIContext'
import Filter from '../../../metronic/dataTable/Filter'
import Table from '../../../metronic/dataTable/Table'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import ButtonAdd from './ButtonAdd'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'

const UsersList = (props) => {
  const { t } = useTranslation()

  const router = useRouter()

  useEffect(() => {
    props.getData(props.queryParams)
    if (!props.users.success && props.users.message)
      toast.error(props.users.message)
  }, [JSON.stringify(props.queryParams)])
  const columns = [
    {
      dataField: 'name',
      text: t('Table.columns.name'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'username',
      text: t('Table.columns.user'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'role',
      text: t('Table.columns.type'),
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
      headerSortingClasses,
      formatter: columnFormatters.StatusColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    }
  ]
  const filter = [
    {
      name: 'query',
      type: 'input',
      col: 5,
      placeholder: 'search_by_keyword',
      textMuted: 'search_by_name_user'
    },
    {
      name: 'enabled',
      type: 'select',
      col: 3,
      options: [
        <option key="All" value="">
          {t('status.All')}
        </option>,
        <option key="Active" value={true}>
          {t('status.Active')}
        </option>,
        <option key="InActive" value={false}>
          {t('status.InActive')}
        </option>
      ],

      textMuted: 'filter_by_status'
    }
    // {
    //   name: 'type',
    //   type: 'select',
    //   col: 2,
    //   options: [
    //     <option value="">All</option>,
    //     <option value="Admin">Admin</option>,
    //     <option value="Super Admin">Super Admin</option>
    //   ],
    //   textMuted: 'filter_by_type'
    // }
  ]
  const onClickRow = (row) => {
    router.push(`/user/[id]`, `/user/${row._id}`)
  }

  return (
    <DTUIProvider>
      {filter && (
        <Filter
          filter={filter}
          showButtonFilter={true}
          Tools={<ButtonAdd />}
          component="users"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_USERS"
        />
      )}
      <DataTableContexts.Provider
        value={{
          columns: columns,

          totalCount: props.users.totalCount,
          entities: props.users.users,
          showButtonFilter: true,
          showPagination: true,
          onClickRow: (row) => onClickRow(row),
          callBack: (value) =>
            !isEqual(value, props.queryParams)
              ? props.updateQueryParams(value)
              : ''
        }}
      >
        <Table
          component="users"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_USERS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}
export default connect(
  (state) => ({
    users: state.users,
    queryParams: state.users.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.USER_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_USERS,
        payload: queryParams
      })
    }
  })
)(UsersList)
