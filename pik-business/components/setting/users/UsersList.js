import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { useRouter } from 'next/router'

import * as columnFormatters from './ColumnFormatter'
import axios from '../../../utils/axios'
import { DTUIProvider } from '../../../metronic/dataTable/DTUIContext'
import Filter from '../../../metronic/dataTable/Filter'
import Table from '../../../metronic/dataTable/Table'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import ButtonAdd from './ButtonAdd'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import actions from 'store/actions'
import { connect } from 'react-redux'

const UsersList = (props) => {
  const { t } = useTranslation()

  const router = useRouter()

  const [users, setUsers] = useState([])
  const [totalCount, setTotalCount] = useState(users.length)
  useEffect(() => {
    axios
      .post('business/user/list', props.queryParams)
      .then(({ data }) => {
        if (data.success) {
          setUsers(data.users)
          setTotalCount(data.totalCount)
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
  }, [JSON.stringify(props.queryParams)])
  const columns = [
    {
      dataField: 'firstName',
      text: t('Table.columns.name'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: columnFormatters.NameColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    // {
    //   dataField: 'userName',
    //   text: t('Table.columns.user'),
    //   sort: true,
    //   sortCaret: sortCaret,
    //   headerSortingClasses
    // },
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
      textMuted: 'search_name'
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
    //   textMuted: '<b>Filter</b> by type'
    // }
  ]
  const onClickRow = (row) => {
    router.push(`/user/[id]`, `/user/${row._id}`)
  }

  return (
    <div className="col-12">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-body d-flex flex-column">
          <div className="row">
            <div className="col-12 mb-5">
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
                    totalCount: totalCount,
                    entities: users,
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default connect((state) => ({
  queryParams: state.users.queryParams
}))(UsersList)
