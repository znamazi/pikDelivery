import React from 'react'
import moment from 'moment';
import Link from 'next/link'
import { useRouter } from 'next/router'

import SubHeaderContent from '../layouts/SubHeaderContent'
import { getLabelCssClasses } from './orders-list/column-formatters/StatusColumnFormatter'
import { waitingTime, orderTime } from 'utils/utils'
import PersonalInfo from '../../metronic/partials/PersonalInfo'
import { useTranslation } from 'react-i18next'
import Information from './Information'
import { displayStatus } from './orders-list/OrdersUIHelpers'
import WaitingForDriver from './WaitingForDriver'

const OrderInfo = ({ order }) => {
  console.log('ORDER***********', order)
  const router = useRouter()
  const { t } = useTranslation()
  let waiting = ''

  const result = ['Created', 'Scheduled', 'Reschedule'].includes(order.status)
  if (!result) {
    const confirmTime =
      order.senderModel === 'business' ? order.time.confirm : order.time.create
    const pickupTime = order.time.pickupComplete
      ? order.time.pickupComplete
      : new Date()
    waiting = `${waitingTime(confirmTime, pickupTime)} waiting`
  }
  return (
    <>
      <SubHeaderContent
        title={
          <>
            <Link href="/orders">{t('pages.common.Orders') + '>'}</Link>{' '}
            <span>{order.id} </span>
          </>
        }
      >
        <span
          className={getLabelCssClasses(
            order.receiver.status === 'Not Registered' &&
              order.status != 'Canceled'
              ? order.receiver.status
              : order.status
          )}
          style={{ width: 110, height: 40 }}
        >
          {t(
            `status.${
              displayStatus[
                order.receiver.status === 'Not Registered' &&
                order.status != 'Canceled'
                  ? order.receiver.status
                  : order.status
              ]
            }`
          )}
        </span>
        <button className="ml-3 btn btn-white" onClick={() => router.back()}>
          {t('pages.common.go_back')}
        </button>
      </SubHeaderContent>
      <div className="col-lg-4">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {t('pages.orders.order_information')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column">
            <PersonalInfo
              firstName={order.receiver.firstName}
              lastName={order.receiver.lastName}
              avatar={order.receiver.avatar}
              email={order.receiver.email}
              mobile={order.receiver.mobile}
            />
            <Information title="Order_ID" value={order.id} />
            <Information
              title="delivery_schedule"
              value={moment(order.date).format('DD/MM/YYYY HH:MM:SS')}
            />
            <Information
              title="delivery_code"
              value={order.confirmationCode}
            />
            <Information title="Type" value={order.vehicleType} />
            <div className="mt-7">
              <p className="font-weight-bolder text-dark-75 pl-3 font-size-lg">
                {t('information.Payment')}
              </p>
              <div className="pl-3 font-size-lg">
                {order.payment
                  ? order.payment.map((item, index) => (
                      <p key={index}>{item.transactionType}</p>
                    ))
                  : ''}
              </div>
            </div>

            <Information
              title="Distance"
              value={
                order.direction
                  ? order.direction.routes[0].legs[0].distance.text
                  : '....'
              }
            />
            <Information title="Time" value={orderTime(order.time)} />
            {order.status === 'Pending' && (
              <div className="mt-7">
                <p className="font-weight-bolder text-dark-75 pl-3 font-size-lg">
                  {t('information.waiting_time')}
                </p>
                <p className="font-size-lg">
                  <WaitingForDriver order={order} />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderInfo
