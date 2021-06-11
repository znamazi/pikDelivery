module.exports = {

  /**
   * The PENDING status on drivers section are set when some driver request vehicle update
   */
  Pending: 'Pending',
  /**
   * When Driver request to register or  update any sensitive information, driver status will change to InReview
   */
  InReview: 'In Review',
  /**
   * Driver info approved and He/She can use driver app.
   */
  Approved: 'Approved',
  /**
   * Driver need to update some information
   */
  Recheck: 'Recheck',
  /**
   * In some reason this driver cannot be approved
   */
  Rejected: 'Rejected',
  /**
   * Canceling order affect Driver profile.
   * If driver account reach 10% cancellation rate
   * Driver account may be suspended.
   */
  Suspended: 'Suspended',
  /**
   * Session closed in app.
   * Login forbidden.
   */
  Disabled: 'Disabled'
}
