import BusinessStatus from '../../../../node-back/src/constants/BusinessStatuses'

export const BusinessStatusCssClasses = {
  Active: 'success',
  Disabled: 'danger'
}
export const BusinessStatusTitles = {
  All: 'All',
  ...BusinessStatus
}

export const CustomerStatusTitles = {
  All: 'ALL',
  Registered: 'Registered',
  Suspended: 'Suspended',
  Disabled: 'Disabled',
  'Not Registered': 'Not Registered'
}

export const defaultSorted = [{ dataField: 'createdAt', order: 'desc' }]
export const sizePerPageList = [
  { text: '10', value: 10 },
  { text: '25', value: 25 },
  { text: '50', value: 50 },
  { text: '100', value: 100 }
]
export const initialFilter = {
  filter: {},
  sortOrder: 'desc', // asc||desc
  sortField: 'createdAt',
  pageNumber: 0,
  pageSize: 10
}
