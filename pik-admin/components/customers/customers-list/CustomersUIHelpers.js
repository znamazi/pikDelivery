export const CustomerStatusCssClasses = {
  'Not Registered': 'primary',
  Registered: 'success',
  Suspended: 'warning',
  Disabled: 'danger'
}
export const CustomerStatusTitles = {
  All: 'Registered,Suspended,Disabled',
  Registered: 'Registered',
  Suspended: 'Suspended',
  Disabled: 'Disabled'
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
export const customers = ['Registered', 'Suspended', 'Disabled']
export const filterHeaderCustomer = 'Registered,Suspended,Disabled'
export const filterHeaderNotRegister = 'Not Registered'
