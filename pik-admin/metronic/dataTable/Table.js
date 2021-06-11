import React, { useEffect, useMemo, useContext } from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory, {
  PaginationProvider
} from 'react-bootstrap-table2-paginator'
import { getSelectRow, getHandlerTableChange } from '../_helpers'
import * as uiHelpers from './UIHelpers'
import { Pagination } from '../partials/controls'
import { useDTUIContext } from './DTUIContext'
import DataTableContexts from '../contexts/DataTableContexts'
import { connect } from 'react-redux'

const Table = (props) => {
  const DataTableContext = useContext(DataTableContexts)
  const DTProps = useMemo(() => {
    return {
      callBack: DataTableContext.callBack,
      listLoading: DataTableContext.listLoading,
      columns: DataTableContext.columns,
      totalCount: DataTableContext.totalCount,
      entities: DataTableContext.entities,
      UIHelper: DataTableContext.UIHelper,
      selectRow: DataTableContext.selectRow,
      showPagination: DataTableContext.showPagination,
      onClickRow: DataTableContext.onClickRow,
      title: DataTableContext.title
    }
  }, [DataTableContext])

  let defaultSorted = DTProps.UIHelper
    ? DTProps.UIHelper.defaultSorted
    : uiHelpers.defaultSorted
  // DT UI Context
  const DTUIContext = useDTUIContext()
  const DTUIProps = useMemo(() => {
    return {
      ids: DTUIContext.ids,
      setIds: DTUIContext.setIds,
      selectedRow: DTUIContext.selectedRow,
      setSelectedRow: DTUIContext.setSelectedRow
    }
  }, [DTUIContext])

  // Table pagination properties
  const paginationOptions = {
    custom: true,
    totalSize: DTProps.totalCount,
    sizePerPageList: uiHelpers.sizePerPageList,
    sizePerPage: props.queryParams.pageSize,
    page: props.queryParams.pageNumber
  }

  useEffect(() => {
    DTProps.callBack(props.queryParams)
  }, [JSON.stringify(props.queryParams)])

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      DTProps.onClickRow ? DTProps.onClickRow(row) : console.log('row clicked')
    }
  }

  const onTableChange = (type, data) => {
    const result = getHandlerTableChange(type, data, props.queryParams)
    props.updateQueryParams(result)
  }

  return (
    <>
      {!DTProps.showPagination && (
        <BootstrapTable
          wrapperClasses="table-responsive"
          bordered={false}
          classes="table table-head-custom table-vertical-center"
          bootstrap4
          remote
          striped
          hover
          keyField="_id"
          // headerClasses="header-class"
          rowStyle={{ padding: '5px 0' }}
          defaultSorted={defaultSorted}
          data={DTProps.entities}
          noDataIndication={
            DTProps.title
              ? `You have no ${props.component}`
              : 'No records found'
          }
          columns={DTProps.columns}
          onTableChange={(type, data) => onTableChange(type, data)}
          rowEvents={rowEvents}
          selectRow={
            DTProps.selectRow
              ? getSelectRow({
                  entities: DTProps.entities,
                  idss: DTUIProps.ids,
                  setIds: DTUIProps.setIds,
                  selectedRow: DTUIProps.selectedRow,
                  setSelectedRow: DTUIProps.setSelectedRow
                })
              : undefined
          }
        ></BootstrapTable>
      )}
      {DTProps.showPagination && (
        <PaginationProvider pagination={paginationFactory(paginationOptions)}>
          {({ paginationProps, paginationTableProps }) => {
            return (
              <Pagination
                isLoading={DTProps.listLoading}
                paginationProps={paginationProps}
              >
                <BootstrapTable
                  wrapperClasses="table-responsive"
                  bordered={false}
                  classes="table table-head-custom table-vertical-center"
                  bootstrap4
                  hover
                  remote
                  selected={DTUIProps.ids}
                  keyField="_id"
                  defaultSorted={defaultSorted}
                  data={DTProps.entities}
                  columns={DTProps.columns}
                  onTableChange={(type, data) => onTableChange(type, data)}
                  {...paginationTableProps}
                  rowEvents={rowEvents}
                  noDataIndication={
                    DTProps.title
                      ? `You have no ${props.component}`
                      : 'No records found'
                  }
                  selectRow={
                    DTProps.selectRow
                      ? getSelectRow({
                          entities: DTProps.entities,
                          ids: DTUIProps.ids,
                          setIds: DTUIProps.setIds,
                          selectedRow: DTUIProps.selectedRow,
                          setSelectedRow: DTUIProps.setSelectedRow
                        })
                      : undefined
                  }
                ></BootstrapTable>
              </Pagination>
            )
          }}
        </PaginationProvider>
      )}
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  return { queryParams: state[ownProps.component].queryParams }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateQueryParams: (queryParams) => {
      dispatch({
        type: ownProps.actionDisptachFilter,
        payload: queryParams
      })
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Table)
