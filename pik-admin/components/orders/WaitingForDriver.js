import React, { useState, useEffect } from 'react'
import moment from 'moment'

const WaitingForDriver = ({ order }) => {
  const [waiting, setWaiting] = useState('')
  if (order.status === 'Pending') {
    const confirmTime =
      order.senderModel === 'business' ? order.time.confirm : order.time.create

    const [timer, setTimer] = useState(
      moment(new Date()).diff(moment(confirmTime))
    )

    useEffect(() => {
      let dif = moment.duration(timer)
      let waitingTime = dif.days()
        ? [dif.days(), dif.hours(), dif.minutes(), dif.seconds()].join(':')
        : [dif.hours(), dif.minutes(), dif.seconds()].join(':')
      waitingTime = `${waitingTime} waiting`
      setWaiting(waitingTime)
      const interval = setInterval(() => {
        let newTime = timer + 1000
        setTimer(newTime)
        let dif = moment.duration(newTime)
        let waitingTime = dif.days()
          ? [dif.days(), dif.hours(), dif.minutes(), dif.seconds()].join(':')
          : [dif.hours(), dif.minutes(), dif.seconds()].join(':')
        waitingTime = `${waitingTime} waiting`
        setWaiting(waitingTime)
      }, 1000)

      return () => {
        clearInterval(interval)
      }
    }, [timer])
  }
  return <span className="ml-4 font-weight-bold">{waiting}</span>
}

export default WaitingForDriver
