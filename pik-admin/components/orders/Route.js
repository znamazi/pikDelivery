import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import MapRoute from './MapRoute'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import { withScriptjs } from 'react-google-maps'

const Bubble = ({ status }) => {
  return (
    <div className="col-2 circle">
      {status === 'COMPLETE' ? (
        <i className="fa fa-circle color-green"></i>
      ) : (
        <i className="fa fa-circle-notch color-green"></i>
      )}
    </div>
  )
}
const TimeHistory = ({ title, status, text, note }) => {
  return (
    <div className="col-8 min-h-90px">
      <div>
        <span>
          {title} {status ? ' - ' : ''}
        </span>
        <span
          className={status === 'COMPLETE' ? ' text-success' : ' text-warning'}
        >
          {status}
        </span>
      </div>
      <div className="font-weight-bolder">{text}</div>
      {note && <p className="message-box-route">{note}</p>}
    </div>
  )
}
const Hour = ({ data }) => {
  return (
    <div className="col-2">
      <span className="text-primary"> {data}</span>
    </div>
  )
}
const Route = ({ order }) => {
  const { t } = useTranslation()
  const { isShowing, toggle } = useModal()
  const MapLoader = withScriptjs(MapRoute)

  return (
    <>
      <div className="row mt-10">
        <div className="col-12">
          <div>
            <span className="text-dark-75 font-weight-bolder font-size-lg mr-20">
              {t('pages.orders.route')}
            </span>
            {order.status !== 'Created' && (
              <a className="text-primary" onClick={toggle}>
                {t('pages.orders.view_route')}
              </a>
            )}
          </div>
        </div>
      </div>

      {order.status !== 'Created' ? (
        <div className="row mt-5">
          <Bubble status={!!order.driver ? 'COMPLETE' : 'IN PROGRESS'} />
          <TimeHistory
            title="RIDE START"
            status={!!order.driver ? 'COMPLETE' : 'IN PROGRESS'}
            text={!!order.driver ? 'Driver Assigned' : 'Driver Not Assigned'}
          />
          <Hour
            data={
              !!order.time?.driverAssign
                ? moment(order.time.driverAssign).format('h:mm A')
                : ''
            }
          />
          {/* {order.senderModel === 'business' && order.driver && (
            <>
              <Bubble
                status={
                  !!order.time?.pickupComplete ? 'COMPLETE' : 'IN PROGRESS'
                }
              />
              <TimeHistory
                title="PICKUP FROM"
                status={
                  !!order.time?.pickupComplete ? 'COMPLETE' : 'IN PROGRESS'
                }
                text={order.pickup.address?.formatted_address}
                note={order.pickup?.note}
              />
              <Hour
                data={
                  !!order.time?.pickupComplete
                    ? moment(order.time.pickupComplete).format('h:mm A')
                    : ''
                }
              />
            </>
          )} */}

          <Bubble
            status={!!order.time?.pickupComplete ? 'COMPLETE' : 'IN PROGRESS'}
          />
          <TimeHistory
            title="PICKUP FROM"
            status={
              order.senderModel === 'business' && order.driver
                ? !!order.time?.pickupComplete
                  ? 'COMPLETE'
                  : 'IN PROGRESS'
                : !!order.time?.pickupArrival
                ? !!order.time?.pickupComplete
                  ? 'COMPLETE'
                  : 'IN PROGRESS'
                : ''
            }
            text={order.pickup.address?.formatted_address}
            note={order.pickup?.note}
          />
          <Hour
            data={
              !!order.time?.pickupComplete
                ? moment(order.time.pickupComplete).format('h:mm A')
                : ''
            }
          />

          <Bubble
            status={!!order.time?.deliveryComplete ? 'COMPLETE' : 'IN PROGRESS'}
          />
          <TimeHistory
            title="DROP OFF"
            status={
              !!order.time?.pickupComplete
                ? order.status !== 'Returned'
                  ? !!order.time?.deliveryComplete
                    ? 'COMPLETE'
                    : 'IN PROGRESS'
                  : ''
                : ''
            }
            text={order.delivery.address?.formatted_address}
            note={order.delivery?.note}
          />
          <Hour
            data={
              !!order.time?.deliveryComplete
                ? moment(order.time.deliveryComplete).format('h:mm A')
                : ''
            }
          />
          {order.status === 'Returned' && (
            <>
              <Bubble
                status={
                  !!order.time?.returnComplete ? 'COMPLETE' : 'IN PROGRESS'
                }
              />
              <TimeHistory
                title="Return"
                status={order.time?.returnComplete ? 'COMPLETE' : 'IN PROGRESS'}
                text={order.pickup.address?.formatted_address}
                note={
                  order.cancel?.reason
                    ? order.cancel?.reason
                    : 'Customer No Show'
                }
              />
              <Hour
                data={
                  !!order.time?.returnComplete
                    ? moment(order.time.returnComplete).format('h:mm A')
                    : ''
                }
              />
            </>
          )}
          <div className="col-2"></div>
          <div className="col-8">
            <span className="font-weight-bolder mr-30">
              <i className="fa fa-user mr-3"></i>
              {`${order.receiver.firstName} ${order.receiver.lastName}`}
            </span>
            <span className="font-weight-bolder">
              <i className="fa fa-mobile mr-3"></i>
              {order.receiver.mobile}
            </span>
          </div>
        </div>
      ) : (
        <div className=" row col-12 mt-5">
          <p className="font-weight-bolder p-5">
            {t('pages.drivers.waiting_complete_order')}
          </p>
        </div>
      )}

      <BaseModal isShowing={isShowing} hide={toggle}>
        <MapLoader
          googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API}`}
          loadingElement={<div style={{ height: `100%` }} />}
          order={order}
          toggle={toggle}
        />
      </BaseModal>
    </>
  )
}

export default Route
