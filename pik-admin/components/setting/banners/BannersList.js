import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'

import * as columnFormatters from './ColumnFormatter'
import { DTUIProvider } from '../../../metronic/dataTable/DTUIContext'
import Filter from '../../../metronic/dataTable/Filter'
import Table from '../../../metronic/dataTable/Table'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import ButtonAdd from './ButtonAdd'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const BannersList = (props) => {
  const { t } = useTranslation()

  const router = useRouter()

  useEffect(() => {
    props.getData(props.queryParams)
    if (!props.banners.success && props.banners.message)
      toast.error(props.banners.message)
  }, [JSON.stringify(props.queryParams)])
  const columns = [
    {
      dataField: 'title',
      text: t('Table.columns.title'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'uploadedBy.name',
      text: t('Table.columns.uploaded_by'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'expiration',
      text: t('Table.columns.expiration'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.ExpireColumnFormatter,
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
      textMuted: 'search_by_title'
    },
    {
      name: 'published',
      type: 'select',
      col: 2,
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
  ]
  const onClickRow = (row) => {
    router.push(`/banner/[id]`, `/banner/${row._id}`)
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
          totalCount: props.banners.totalCount,
          entities: props.banners.banners,
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
    banners: state.banners,
    queryParams: state.users.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.BANNER_REQUESTED,
        payload: { ...queryParams }
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_BANNERS,
        payload: queryParams
      })
    }
  })
)(BannersList)
