export const TransactionStatusCssClasses = {
  auth: 'primary',
  paid: 'success',
  cancel: 'danger',
  fail: 'danger'
}
export const TransactionStatusTitles = {
  All: 'All',
  Auth: 'auth',
  Paid: 'paid',
  Cancel: 'cancel',
  Fail: 'fail'
}

export const defaultSorted = [{ dataField: 'createdAt', order: 'desc' }]
export const sizePerPageList = [
  { text: '10', value: 10 },
  { text: '25', value: 25 },
  { text: '50', value: 50 },
  { text: '100', value: 100 }
]
export const initialFilter = {
  filter: {
    status: ''
  },
  sortOrder: 'desc', // asc||desc
  sortField: 'createdAt',
  pageNumber: 0,
  pageSize: 10
}
