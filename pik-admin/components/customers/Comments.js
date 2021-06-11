import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'

import axios from '../../utils/axios'
import { toast } from 'react-toastify'

import AddComment from './AddComment'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Filter from '../../metronic/dataTable/Filter'
import Table from '../../metronic/dataTable/Table'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import { useTranslation } from 'react-i18next'
import actions from 'store/actions'
import { connect } from 'react-redux'

export const DateColumnFormatter = (cellContent, row) => {
  return <div> {moment(row.createdAt).format('LL')}</div>
}
const Comments = ({ id, urlList, urlSave, queryParams, updateQueryParams }) => {
  const { t } = useTranslation()
  const [comments, setComments] = useState([])
  const [totalCount, setTotalCount] = useState(comments.length)
  const [listLoading, setListLoading] = useState(false)
  useEffect(() => {
    setListLoading(true)
    axios
      .post(urlList, queryParams)
      .then(({ data }) => {
        if (data.success) {
          setComments(data.comments)
          setTotalCount(data.totalCount)
          setListLoading(false)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
      })
  }, [queryParams])
  const handleSubmitComment = (data) => {
    if (data) {
      axios
        .post(urlSave, { comment: data, receiver: id })
        .then(({ data }) => {
          if (data.success) {
            setComments((prev) => [
              ...prev,
              { ...data.comment, sender: data.sender }
            ])
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            toast.error(errorMessage)
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          toast.error(errorMessage)
        })
    }
  }
  const columns = [
    {
      dataField: 'createdAt',
      text: t('Table.columns.date'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: DateColumnFormatter
    },
    {
      dataField: 'comment',
      text: t('Table.columns.description'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '200px' }
      }
    },
    {
      dataField: 'sender.name',
      text: t('Table.columns.user'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    }
  ]
  const filter = [
    {
      name: 'query',
      type: 'input',
      col: 10,
      placeholder: 'Search'
    }
  ]
  return (
    <DTUIProvider>
      {filter && (
        <Filter
          filter={filter}
          Tools={
            <AddComment
              handleSubmitComment={(data) => handleSubmitComment(data)}
            />
          }
          component="customerAvailbles"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_COMMENTS"
        />
      )}
      <DataTableContexts.Provider
        value={{
          columns: columns,
          totalCount: totalCount,
          entities: comments,
          showButtonFilter: false,
          showPagination: true,

          callBack: (value) =>
            !isEqual(value, queryParams) ? updateQueryParams(value) : ''
        }}
      >
        <Table
          component="comments"
          actionDisptachFilter="UPDATE_QUERY_PARAMS_COMMENTS"
        />
      </DataTableContexts.Provider>
    </DTUIProvider>
  )
}

export default connect(
  (state) => ({
    queryParams: state.comments.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_COMMENTS,
        payload: queryParams
      })
    }
  })
)(Comments)
