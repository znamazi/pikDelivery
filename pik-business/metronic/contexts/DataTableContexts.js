import React, { createContext } from 'react'

const DataTableContexts = createContext({
  listLoading: false,
  columns: [],
  totalCount: '',
  entities: [],
  title: '',
  filter: [],
  UIHelper: '',
  callBack: '',
  callBackExport: '',
  selectRow: false,
  Tools: false,
  Grouping: false,
  exportButton: false,
  showButtonFilter: true,
  showPagination: true,
  changeStatus: false,
  changeTypeStatus: '',
  component: '',
  component: '',
  actionDisptachFilter: ''
})

export default DataTableContexts
