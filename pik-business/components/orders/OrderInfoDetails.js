import React, { useState, useEffect, useMemo } from 'react'
import { Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { toast } from 'react-toastify'
import Link from 'next/link'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import axios from '../../utils/axios'
import HeaderContent from '../layouts/HeaderContent'
import SubHeaderContent from '../layouts/SubHeaderContent'
import * as OrdersUIHelpers from './orders-list/OrdersUIHelpers'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import QRCode from 'qrcode.react'
import { cancelPermission } from './orders-list/OrdersUIHelpers'
import ButtonEdit from 'metronic/partials/ButtonEdit'
import { useDTUIContext } from '../../metronic/dataTable/DTUIContext'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  large: {
    width: theme.spacing(10),
    height: theme.spacing(10)
  }
}))

const OrderInfoDetails = ({ order, changeOrder }) => {
  const { t } = useTranslation()

  const classes = useStyles()
  const router = useRouter()
  const { isShowing, toggle } = useModal()
  const [cancel, setCancel] = useState()
  const DTUIContext = useDTUIContext()

  // const DTUIProps = useMemo(() => {
  //   return {
  //     queryParams: DTUIContext.queryParams,
  //     setQueryParams: DTUIContext.setQueryParams
  //   }
  // }, [DTUIContext])
  useEffect(() => {
    if (order.cancel) {
      let cancelBy = ''
      switch (order.cancel.cancelerModel) {
        case 'driver':
          cancelBy = 'Driver'
          break
        case 'customer':
          cancelBy = 'Customer'
          break
        case 'business':
          cancelBy = `Business (${order.cancel.cancelledBy})`
          break
        default:
          cancelBy
          break
      }
      let cancelData = { ...order.cancel, cancelledBy: cancelBy }
      setCancel(cancelData)
    }
  }, [order.cancel])
  const getLabelCssClasses = (status) => {
    return `label label-lg label-light-${OrdersUIHelpers.OrderStatusCssClasses[status]} label-inline`
  }

  const actionModal = (confirm) => {
    if (confirm) {
      axios
        .post('business/order/cancel', [order._id])
        .then(({ data }) => {
          if (data.success) {
            toast.success(t('pages.orders.order_cancelled_successfully'))
            changeOrder(data.order.cancel)
            setCancel(data.order.cancel)
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
    }
  }

  return (
    <>
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/orders',
              query: {
                status: OrdersUIHelpers.filterHeaderOpen,
                filterHeader: 'OPEN'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            OrdersUIHelpers.filterHeaderOpen.split(',').includes(order.status)
              ? 'menu-item-active'
              : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.open')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/orders',
              query: {
                status: OrdersUIHelpers.filterHeaderClose,
                filterHeader: 'CLOSED'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            OrdersUIHelpers.filterHeaderClose.split(',').includes(order.status)
              ? 'menu-item-active'
              : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.closed')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/orders',
              query: {
                status: '',
                filterHeader: 'All Orders'
              }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.all')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <SubHeaderContent
        title={
          <>
            <Link href="/orders">{'Orders >'}</Link> <span>{order.id} </span>
          </>
        }
      >
        <button
          className="btn btn-light text-primary font-weight-bold p-2 pr-5 pl-5"
          onClick={() => router.back()}
        >
          {t('pages.common.go_back')}
        </button>
        <ButtonEdit href={`/order/edit/[id]`} as={`/order/edit/${order.id}`} />
      </SubHeaderContent>

      <div className="col-lg-4">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {t('pages.orders.order_information')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column">
            <div className="">
              {order.receiver.status !== 'Not Registered' && (
                <Avatar src={order.receiver.avatar} className={classes.large} />
              )}

              <div className="ml-2">
                <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
                  {`${order.receiver.firstName} ${order.receiver.lastName}`}
                </div>
                <div>{order.receiver.email}</div>
                <div>{order.receiver.mobile}</div>
              </div>
            </div>
            <div className="mt-7">
              <p className="font-weight-bold">{t('information.order_id')}</p>
              <p>{order.id}</p>
            </div>

            <div className="mt-5">
              <p className="font-weight-bold">
                {t('information.publish_date')}
              </p>
              <p>{moment(order.date).format('DD/MM/YYYY h:mm A')}</p>
            </div>
            <div className="mt-5">
              <div className="d-inline-block">
                <p className="font-weight-bold">{t('information.status')}</p>
                <p>
                  <span
                    className={getLabelCssClasses(
                      cancel
                        ? 'Canceled'
                        : OrdersUIHelpers.displayStatus[
                            order.receiver.status === 'Not Registered' &&
                            order.status != 'Canceled'
                              ? order.receiver.status
                              : order.status
                          ]
                    )}
                    style={{ width: 110 }}
                  >
                    {order.receiver.status === 'Not Registered' &&
                    order.status != 'Canceled'
                      ? t(`status.${order.receiver.status}`)
                      : t(
                          `status.${
                            OrdersUIHelpers.displayStatus[order.status]
                          }`
                        )}
                  </span>
                  {/* // TODO-Not Register order (remove it and read not register from customer) */}

                  {/* {['Pending', 'Not Registered'].includes(order.status) */}
                  {(order.receiver.status === 'Not Registered' ||
                    cancelPermission.includes(order.status)) &&
                    !cancel && (
                      <span
                        className="label label-lg label-danger label-inline mt-3 ml-2"
                        onClick={toggle}
                      >
                        {t('pages.orders.cancel_order')}
                      </span>
                    )}
                </p>
              </div>
              {order.status === 'Returned' && (
                <>
                  <p className="font-weight-bold ">
                    {t('pages.orders.confirm_code')}
                  </p>
                  <div className=" d-flex flex-center justify-content-start">
                    {/* <div className=""> */}
                    <span>
                      <i className="fa fa-lock mr-3"></i>
                      {order.confirmationCode}
                    </span>
                    <QRCode
                      id={order.confirmationCode}
                      value={order.confirmationCode}
                      size={80}
                      level={'H'}
                      includeMargin={true}
                    />
                    {/* </div> */}
                  </div>
                </>
              )}
            </div>

            <div className="mt-5">
              <p className="font-weight-bold">
                {cancel
                  ? `${t('pages.orders.cancelled_by')} ${cancel.cancelledBy}`
                  : order.time.confirm
                  ? t('pages.orders.delivery_schedule')
                  : ''}
              </p>
              <p>
                {cancel
                  ? moment(cancel.date).format('DD/MM/YYYY h:mm A')
                  : order.schedule?.date
                  ? `${moment(order.schedule.date).format('DD/MM/YYYY')} ${
                      order.schedule.from
                    } - ${order.schedule.to}`
                  : ''}
              </p>
            </div>
            <BaseModal
              isShowing={isShowing}
              hide={toggle}
              headerLeftButtons={t('pages.orders.cancel_order')}
              action={true}
              btnCancel={t('pages.common.go_back')}
              btnConfirm={t('pages.orders.confirm_cancel')}
              actionCallback={actionModal}
              theme="warning"
            >
              {t('pages.orders.sure_cancel_order')}
            </BaseModal>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderInfoDetails
