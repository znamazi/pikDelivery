import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import moment from 'moment'
import Link from 'next/link'
const OrderInfo = ({
  name,
  avatar,
  receiver,
  email,
  mobile,
  ordersTrack,
  orderId,
  timeConfirm,
  id
}) => {
  let title = ''
  let info = `Order start at ${moment(timeConfirm).format('h:mm A')}`
  let infoColor = 'primary'
  if (ordersTrack && ordersTrack.length > 0) {
    const orderTrack = ordersTrack.find((item) => item.order == orderId)
    title =
      orderTrack?.headingTo == 'delivery'
        ? 'is heading to customer'
        : 'is heading to you'
    if (orderTrack?.timeToArrive.value <= 10) {
      infoColor = 'warning'
      info = 'On Place'
    } else {
      info = `Arriving in ${Math.ceil(
        orderTrack?.timeToArrive.value / 60
      )} minutes`
    }
  }
  return (
    <>
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <Avatar alt={name} src={avatar} />
          <div className="text-muted font-weight-bold text-hover-primary">
            <div className="ml-4">
              <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
                {`${name} ${title}`}
              </div>

              <div className={`text-${infoColor}`}>{info}</div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column">
          <div className="font-weight-bolder ">
            <Link href={`/order/[id]`} as={`/order/${id}`}>
              View Order
            </Link>
          </div>
          <div className="text-center">
            {mobile && (
              <a href={`tel:${mobile}`}>
                <i className="fa fa-mobile-alt"></i>
                <div className="font-size-sm font-weight-light">call</div>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="mt-10 ml-3 text-dark-75 font-weight-bolder">
        <span>
          <i className="fa fa-user-alt mr-2"></i>
          {receiver}
        </span>
        <span>
          <i className="fa fa-envelope mr-2 ml-10"></i>
          {email}
        </span>
      </div>
    </>
  )
}

export default OrderInfo
