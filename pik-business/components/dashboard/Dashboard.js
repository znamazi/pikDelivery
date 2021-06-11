import React, { useState, useEffect } from 'react'
import moment from 'moment'
import HeaderContent from '../layouts/HeaderContent'
import axios from '../../utils/axios'
import OrderInfo from './OrderInfo'
import { FormControlLabel, Checkbox } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { green } from '@material-ui/core/colors'
import SendNotification from '../notification/SendNotification'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600]
    }
  },
  checked: {}
})((props) => <Checkbox color="default" {...props} />)

const Dashboard = () => {
  const [orders, setOrders] = useState([])
  const [ordersTrack, setOrdersTrack] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    axios
      .get('business/order/today')
      .then(({ data }) => {
        if (data.success) {
          setOrdersTrack(data.ordersTrack)

          setOrders(data.orders)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
      })
  }, [])

  let content =
    orders.length > 0 ? (
      orders.map((order) => (
        <div className="col-lg-6" key={order._id}>
          <div className="card card-custom card-stretch gutter-b">
            <div className="card-body d-flex flex-column">
              {/* TODO: info and infoColor change to dynamic */}

              {order.driver && (
                <OrderInfo
                  name={`${order.driver.firstName} ${order.driver.lastName}`}
                  avatar={order.driver.avatar}
                  receiver={`${order.receiver.firstName} ${order.receiver.lastName}`}
                  email={order.receiver.email}
                  mobile={order.driver.mobile}
                  orderId={order._id}
                  id={order.id}
                  ordersTrack={ordersTrack}
                />
              )}
              {!order.driver && (
                <OrderInfo
                  name={t('pages.dashboard.scheduled_for_today')}
                  receiver={`${order.receiver.firstName} ${order.receiver.lastName}`}
                  email={order.receiver.email}
                  timeConfirm={order.time.confirm}
                  id={order.id}
                />
              )}
              <div className="table-responsive col-12 mt-10">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <td>{t('pages.dashboard.tracking')}</td>
                      <td>{t('pages.dashboard.dispatched')}</td>
                    </tr>
                  </thead>
                  <tbody>
                    {order.packages.map((packageItem, index) => (
                      <tr key={index}>
                        <td className="p-5">
                          <div className="ftext-dark-75 font-weight-bolder">
                            {packageItem.trackingCode}
                          </div>
                          <div className="font-size-sm">
                            {packageItem.description}
                          </div>
                        </td>
                        <td>
                          {packageItem.trackingConfirmation ? (
                            <FormControlLabel
                              control={<GreenCheckbox checked={true} />}
                              label={moment(
                                packageItem.trackingConfirmation
                              ).format('HH:MM A')}
                            />
                          ) : (
                            <Checkbox checked={true} color="default" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="col-12 text-center mt-30 text-dark-75 font-weight-bolder font-size-h2">
        Not orders scheduled for today
      </div>
    )
  return (
    <div>
      <HeaderContent>
        <li
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="font-weight-bold text-primary">
            <span className="menu-text">
              {t('header_content.dashboard.today_orders')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      {/* <div className="row">
        <SendNotification />
      </div> */}
      <div className="row">{content}</div>
    </div>
  )
}

export default Dashboard
