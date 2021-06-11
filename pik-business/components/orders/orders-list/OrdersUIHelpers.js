export const displayStatus = {
  /**
   * Order created and not scheduled
   * you need to confirm payment and delivery
   */
  Created: 'Pending',
  /**
   * Used for business orders
   * Order scheduled to start in specific date
   * payment confirmed
   * delivery address confirmed
   */
  Scheduled: 'Confirmed',
  /**
   * Schedule time arrived and need to assign driver
   * Drivers gets pending orders list
   */
  Pending: 'Confirmed',
  /**
   * Drive assigned, Order started and it's on progress
   */
  Progress: 'Progress',
  /**
   * Booking cancelled by business and you need to reschedule delivery
   */
  Reschedule: 'Pending',
  /**
   * Order Cancelled. Includes order cancelled before start or after start
   */
  Canceled: 'Canceled',
  /**
   * Order marked as returned
   */
  Returned: 'Returned',
  /**
   * Order delivered to destination and completed
   */
  Delivered: 'Completed',

  /**
   * Order Created but Customer not register
   */

  'Not Registered': 'Not Registered'
}

export const OrderStatusCssClasses = {
  Created: 'pending',
  Scheduled: 'confirm',
  Confirmed: 'confirm',
  Pending: 'pending',
  Progress: 'warning',
  Reschedule: 'pending',
  Canceled: 'danger',
  Returned: 'return',
  Delivered: 'success',
  Completed: 'success',
  'Not Registered': '',
  NonRegistered: ''
}
export const OrderStatusTitles = {
  All: 'All',
  Confirmed: 'Scheduled,Pending',
  Pending: 'Created,Reschedule,Not Registered',
  Progress: 'Progress',
  Canceled: 'Canceled',
  Returned: 'Returned',
  Completed: 'Delivered'
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

export const filterHeaderOpen =
  'Created,Progress,Reschedule,Not Registered,Pending,Scheduled'
export const filterHeaderClose = 'Returned,Delivered,Canceled'
export const cancelPermission = [
  'Created',
  'Scheduled',
  'Pending',
  'Reschedule'
]
export const uneditable = ['Canceled', 'Progress', 'Returned', 'Delivered']
