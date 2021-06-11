module.exports = {
  /**
   * Order created and not scheduled
   * you need to confirm payment and delivery
   */
  Created: 'Created',
  /**
   * Used for business orders
   * Order scheduled to start in specific date
   * payment confirmed
   * delivery address confirmed
   */
  Scheduled: 'Scheduled',
  /**
   * Schedule time arrived and need to assign driver
   * Drivers gets pending orders list
   */
  Pending: 'Pending',
  /**
   * Drive assigned, Order started and it's on progress
   */
  Progress: 'Progress',
  /**
   * Booking cancelled by business and you need to reschedule delivery
   */
  Reschedule: 'Reschedule',
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
  Delivered: 'Delivered'
  /**
   * when customer not registered
   */
  // TODO-Not Register order (remove it and read not register from customer)
  // NotRegistered: 'Not Registered'
}
