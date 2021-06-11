const Order = require('../models/Order')
const moment = require('moment')
const CustomTimeFrame = require('../models/CustomTimeFrame')

/*

A: Add Time Frame
    A1: Is Totali closed
    is there orders schaduled in this timeframe
    A2: Not Totally Closed
is there order scheduled in corresponding week-day and rejected with this timeframe

B: Remove Time Frame
    B1: Is Totali closed
    its ok, no need to check any things
    B2: Not Totally Closed
is there any order matched with this timeframe and rejected with the corresponding week-day timeframe

*/

const status = ['Created', 'Scheduled', 'Pending']

module.exports.checkConflict = async (
  newCustomTimeFrames,
  deletedCustomTimeFrame,
  deletedId,
  timeFrames,
  newTimeFrames,
  businessId
) => {
  let isValid = true
  let ordersConflict = []
  let difference = []
  let customTimeFramesConflict = []
  let customTimeFramesConflictRemove = []

  // Change Time Frames
  for (let index = 0; index < timeFrames.length; index++) {
    if (
      !(
        timeFrames[index].totallyClosed ===
          newTimeFrames[index].totallyClosed &&
        timeFrames[index].open === newTimeFrames[index].open &&
        timeFrames[index].close === newTimeFrames[index].close
      )
    ) {
      difference.push({ ...newTimeFrames[index], index })
    }
  }
  if (difference.length > 0) {
    const orders = await Order.find({
      sender: businessId,
      schedule: { $exists: true },
      status: { $in: status }
    }).populate('receiver')
    for (let index = 0; index < difference.length; index++) {
      const timeFrame = difference[index]
      let resultFilter = orders.filter(
        (order) => moment(order.schedule.date).format('d') == timeFrame.index
      )
      if (timeFrame.totallyClosed && resultFilter.length > 0) {
        for (let index = 0; index < resultFilter.length; index++) {
          const order = resultFilter[index]
          const customTimeFrames = await CustomTimeFrame.find({
            business: businessId,
            from: {
              $lte: new Date(order.schedule.date)
            },
            to: {
              $gte: new Date(order.schedule.date)
            },
            open: {
              $lte: order.schedule.from
            },
            close: {
              $gte: order.schedule.to
            },
            id: { $nin: deletedId }
          })
          if (customTimeFrames.length === 0) {
            const existCustomTime = newCustomTimeFrames.find(
              (item) =>
                moment(item.from).format('YYYY-MM-DD') <=
                  moment(order.schedule.date).format('YYYY-MM-DD') &&
                moment(item.to).format('YYYY-MM-DD') >=
                  moment(order.schedule.date).format('YYYY-MM-DD') &&
                item.open <= order.schedule.from &&
                item.close >= order.schedule.to
            )
            if (!existCustomTime) {
              isValid = false
              let existOrder = ordersConflict.find(
                (item) => item.id === order.id
              )
              // console.log(existOrder)
              if (!existOrder) ordersConflict.push(order)
            }
          }
        }
      } else if (!timeFrame.totallyClosed && resultFilter.length > 0) {
        resultFilter = resultFilter.filter(
          (order) =>
            !(
              order.schedule.from >= timeFrame.open &&
              order.schedule.to <= timeFrame.close
            )
        )
        if (resultFilter.length > 0) {
          for (let index = 0; index < resultFilter.length; index++) {
            const order = resultFilter[index]
            const customTimeFrames = await CustomTimeFrame.find({
              business: businessId,
              from: {
                $lte: new Date(order.schedule.date)
              },
              to: {
                $gte: new Date(order.schedule.date)
              },
              open: {
                $lte: order.schedule.from
              },
              close: {
                $gte: order.schedule.to
              },
              id: { $nin: deletedId }
            })
            if (customTimeFrames.length === 0) {
              const existCustomTime = newCustomTimeFrames.find(
                (item) =>
                  moment(item.from).format('YYYY-MM-DD') <=
                    moment(order.schedule.date).format('YYYY-MM-DD') &&
                  moment(item.to).format('YYYY-MM-DD') >=
                    moment(order.schedule.date).format('YYYY-MM-DD') &&
                  item.open <= order.schedule.from &&
                  item.close >= order.schedule.to
              )
              if (!existCustomTime) {
                isValid = false
                let existOrder = ordersConflict.find(
                  (item) => item.id === order.id
                )
                // console.log(existOrder)
                if (!existOrder) ordersConflict.push(order)
              }
            }
          }
        }
      }
    }
  }

  // add customTime Frame

  if (newCustomTimeFrames && newCustomTimeFrames.length > 0) {
    for (let index = 0; index < newCustomTimeFrames.length; index++) {
      const element = newCustomTimeFrames[index]
      const orders = await Order.find({
        sender: businessId,
        schedule: { $exists: true },
        'schedule.date': {
          $gte: new Date(element.from),
          $lte: new Date(element.to)
        },
        status: { $in: status }
      }).populate('receiver')

      if (element.totallyClosed && orders.length > 0) {
        isValid = false
        customTimeFramesConflict.push(element.id)
        orders.forEach((order) => {
          let existOrder = ordersConflict.find((item) => item.id === order.id)
          // console.log('existOrder', existOrder)
          if (!existOrder) ordersConflict.push(order)
        })
      } else if (!element.totallyClosed && orders.length > 0) {
        orders.forEach((order) => {
          if (
            !(
              order.schedule.from >= element.open &&
              order.schedule.to <= element.close
            )
          ) {
            customTimeFramesConflict.push(element.id)
            isValid = false
            let existOrder = ordersConflict.find((item) => item.id === order.id)
            if (!existOrder) ordersConflict.push(order)
          }
        })
      }
    }
  }

  // remove Custom Time Frame

  if (deletedCustomTimeFrame && deletedCustomTimeFrame.length > 0) {
    for (let index = 0; index < deletedCustomTimeFrame.length; index++) {
      const element = deletedCustomTimeFrame[index]

      if (!element.totallyClosed) {
        const orders = await Order.find({
          sender: businessId,
          schedule: { $exists: true },
          'schedule.date': {
            $gte: new Date(element.from),
            $lte: new Date(element.to)
          },
          status: { $in: status }
        }).populate('receiver')
        orders.forEach((order) => {
          const existCustomTime = newCustomTimeFrames.find(
            (item) =>
              moment(item.from).format('YYYY-MM-DD') <=
                moment(order.schedule.date).format('YYYY-MM-DD') &&
              moment(item.to).format('YYYY-MM-DD') >=
                moment(order.schedule.date).format('YYYY-MM-DD') &&
              item.open <= order.schedule.from &&
              item.close >= order.schedule.to
          )
          console.log('exist custom time', existCustomTime)
          if (!existCustomTime) {
            let dayOfWeek = moment(order.schedule.date).format('d')
            tf = newTimeFrames[dayOfWeek]
            let { open, close, totallyClosed } = tf
            if (totallyClosed) {
              console.log('element iddddddddddd', element.id)
              customTimeFramesConflictRemove.push(element)
              isValid = false
              let existOrder = ordersConflict.find(
                (item) => item.id === order.id
              )
              if (!existOrder) ordersConflict.push(order)
            } else {
              if (
                !(order.schedule.from >= open && order.schedule.to <= close)
              ) {
                isValid = false
                customTimeFramesConflictRemove.push(existCustomTime)

                let existOrder = ordersConflict.find(
                  (item) => item.id === order.id
                )
                if (!existOrder) ordersConflict.push(order)
              }
            }
          }
        })
      }
    }
  }
  return {
    isValid,
    ordersConflict,
    customTimeFramesConflict,
    customTimeFramesConflictRemove
  }
}
