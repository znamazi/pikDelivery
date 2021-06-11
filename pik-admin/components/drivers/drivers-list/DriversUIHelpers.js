export const DriverStatusCssClasses = {
  Disabled: 'dark',
  Approved: 'success',
  InReview: 'primary',
  Recheck: 'warning',
  Suspended: 'danger',
  Pending: 'warning',
  Rejected: 'danger'
}
export const AllStatusTitle = {
  Approved: 'Approved',
  Suspended: 'Suspended',
  Disabled: 'Disabled',
  InReview: 'In Review',
  Recheck: 'Recheck',
  Rejected: 'Rejected',
  Pending: 'Pending'
}
export const DriverStatusTitles = {
  All: 'Suspended,Disabled,Approved,Recheck,Pending,In Review',
  Approved: 'Approved',
  Suspended: 'Suspended',
  Disabled: 'Disabled',
  'In Review': 'In Review',
  Recheck: 'Recheck',
  Pending: 'Pending'
}
export const RecruitmentStatusTitles = {
  All: 'Recheck,Pending,In Review,Rejected',
  'In Review': 'In Review',
  Recheck: 'Recheck',
  Rejected: 'Rejected',
  Pending: 'Pending'
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

export const recruitment = ['Recheck', 'Pending', 'In Review', 'Rejected']

// Based on these filter give driver list I remove rejected from filterHeaderDriver
export const filterHeaderRecruitment = 'Recheck,Pending,In Review,Rejected'

export const filterHeaderDriver =
  'Suspended,Disabled,Approved,Recheck,Pending,In Review,Rejected'
