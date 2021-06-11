module.exports.waitingTime = (confirmTime, pickupTime) => {
  const create = moment(confirmTime)
  let pickup = moment(pickupTime)

  let dif = moment.duration(pickup.diff(create))

  let waiting = dif.days()
    ? [dif.days(), dif.hours(), dif.minutes(), dif.seconds()].join(':')
    : [dif.hours(), dif.minutes(), dif.seconds()].join(':')
  return waiting
}
