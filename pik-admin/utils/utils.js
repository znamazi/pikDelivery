import moment from 'moment'

export const waitingTime = (confirmTime, pickupTime) => {
  const create = moment(confirmTime)
  let pickup = moment(pickupTime)

  let dif = moment.duration(pickup.diff(create))

  let waiting = dif.days()
    ? [dif.days(), dif.hours(), dif.minutes(), dif.seconds()].join(':')
    : [dif.hours(), dif.minutes(), dif.seconds()].join(':')
  return waiting
}
export const orderTime = (time) => {
  let diff = 0
  if (time.deliveryComplete) {
    let delivery = moment(time.deliveryComplete)
    diff = moment.duration(delivery.diff(time.create))
  } else if (time.returnComplete) {
    let returnTime = moment(time.returnComplete)
    diff = moment.duration(returnTime.diff(time.create))
  }
  if (diff != 0) {
    let time = [diff.hours(), diff.minutes(), diff.seconds()].join(':')
    return time
  } else return 'Order is not Completed'
}

export const getLabelCssClasses = (statusTitle, statusCssClass, status) => {
  let item = Object.keys(statusTitle).find((key) => statusTitle[key] === status)
  return statusCssClass[item]
}

export const validationEmail = (email) => {
  let pattern = new RegExp(/^\w+([-+.']\w+)*@([\w-]+\.)+[\w-]{2,4}$/)
  if (pattern.test(email.trim())) return true
  else return false
}

export const diffDays = (customDate) => {
  const date = moment(customDate)
  let now = moment(new Date())
  let dif = moment.duration(date.diff(now)).days()
  return dif
}

export const diffHours = (customDate) => {
  const date = moment(customDate)
  let now = moment(new Date())
  let dif = moment.duration(date.diff(now)).hours()
  return dif
}

// export const uploadUrl = (path) => {
//   return `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_API_PORT}${path}`
// }

//  delivery => deliveryFee
//  cancel => cancelFee
//  return => deliveryfee + returnFee

export const calculateCostDriver = (cost, status, cancel, driverId) => {
  // console.log({
  //   cancel,
  //   driverId,
  //   condition: status == 'Canceled' ? cancel.canceler === driverId : ''
  // })
  let finalCost = 0
  switch (status) {
    case 'Delivered':
      finalCost = cost.deliveryFee
      break
    case 'Returned':
      finalCost =
        cancel.cancelerModel !== 'driver'
          ? cost.deliveryFee + cost.returnFee
          : 0
      break
    case 'Canceled':
      finalCost = cancel.canceler === driverId ? 0 : cost.cancelFee
      break
  }
  return finalCost
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const addHttp = (url) => {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = 'http://' + url
  }
  return url
}
