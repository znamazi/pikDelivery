import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'

import * as columnFormatters from './ColumnFormatter'
import axios from '../../../utils/axios'
import { DTUIProvider } from '../../../metronic/dataTable/DTUIContext'
import Filter from '../../../metronic/dataTable/Filter'
import Table from '../../../metronic/dataTable/Table'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import ButtonAdd from '../groups/ButtonAdd'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const GroupsList = (props) => {
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    props.getData(props.queryParams)
    if (!props.groups.success && props.groups.message)
      toast.error(props.groups.message)
  }, [JSON.stringify(props.queryParams)])
  const columns = [
    {
      dataField: 'title',
      text: 'Group',
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'kmPrice',
      text: 'km price',
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      // formatter: columnFormatters.KmPriceColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'role',
      text: 'credito',
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.CreditColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'status',
      text: 'Satus',
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
      textMuted: 'search_by_title'
    }
  ]
  const onClickRow = (row) => {
    router.push(`/group/[id]`, `/group/${row._id}`)
  }
  return (
    <DTUIProvider>
      {filter && (
        <Filter
          filter={filter}
          Tools={<ButtonAdd />}
          component="groups"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_GROUPS"
        />
      )}
      <DataTableContexts.Provider
        value={{
          columns: columns,
          totalCount: props.groups.totalCount,
          entities: props.groups.groups,
          showPagination: true,
          onClickRow: (row) => onClickRow(row),
          callBack: (value) =>
            !isEqual(value, props.queryParams)
              ? props.updateQueryParams(value)
              : ''
        }}
      >
        <Table
          component="groups"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_GROUPS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}
export default connect(
  (state) => ({
    groups: state.groups,
    queryParams: state.groups.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.GROUP_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_GROUPS,
        payload: queryParams
      })
    }
  })
)(GroupsList)
