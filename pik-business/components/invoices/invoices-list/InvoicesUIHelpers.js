export const InvoiceStatusCssClasses = {
  open: 'primary',
  unpaid: 'warning',
  paid: 'success',
  cancel: 'danger'
}
export const InvoiceStatusTitles = {
  All: 'All',
  open: 'open',
  paid: 'paid',
  cancel: 'cancel'
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
