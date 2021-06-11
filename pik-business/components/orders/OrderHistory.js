import React from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const Bubble = () => {
  return (
    <div>
      <i className="fa fa-circle mr-2 ml-2"></i>
    </div>
  )
}

const DataHistory = ({ title, time }) => {
  return (
    <div className="">
      <p>{title}</p>
      <p>{moment(time).format('DD/MM/YYYY')}</p>
      <p>{moment(time).format('h:mm A')}</p>
    </div>
  )
}
const OrderHistory = ({ time, status, cancel }) => {
  const { t } = useTranslation()
  return (
    <div className="mt-15">
      <p className="font-weight-bold font-size-h3">
        {t('pages.orders.order_history')}
      </p>
      <div className="pt-10">
        <div
          className={status === 'Created' ? 'mb-3' : 'mb-3 container-circle'}
        >
          <Bubble />
          {[
            'Scheduled',
            'Pending',
            'Progress',
            'Delivered',
            'Returned',
            'Canceled'
          ].includes(status) &&
            time.confirm && <Bubble />}
          {['Progress', 'Delivered', 'Returned', 'Canceled'].includes(status) &&
            time.pickupComplete && <Bubble />}
          {['Delivered'].includes(status) && <Bubble />}
          {['Returned'].includes(status) && <Bubble />}
          {['Canceled'].includes(status) && <Bubble />}
        </div>
        <div className="container-history">
          <DataHistory
            title={t('pages.orders.order_created')}
            time={time.create}
          />

          {[
            'Scheduled',
            'Pending',
            'Progress',
            'Delivered',
            'Returned',
            'Canceled'
          ].includes(status) &&
            time.confirm && (
              <DataHistory
                title={t('pages.orders.order_confirmed')}
                time={time.confirm}
              />
            )}
          {['Progress', 'Delivered', 'Returned', 'Canceled'].includes(status) &&
            time.pickupComplete && (
              <DataHistory
                title={t('pages.orders.pickup')}
                time={time.pickupComplete}
              />
            )}
          {['Returned'].includes(status) && (
            <DataHistory
              title={t('pages.orders.returned')}
              time={time.returnComplete}
            />
          )}
          {['Canceled'].includes(status) && (
            <DataHistory title={t('information.Canceled')} time={cancel.date} />
          )}
          {['Delivered'].includes(status) && (
            <DataHistory
              title={t('pages.orders.delivered')}
              time={time.deliveryComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
