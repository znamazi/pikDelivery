import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import axios from '../../utils/axios'
import OrderInfo from 'components/orders/OrderInfo'
import OrderActivity from 'components/orders/OrderActivity'
import { useTranslation } from 'react-i18next'
import actions from 'store/actions'

const OrderDetails = (props) => {
  const router = useRouter()
  const { id } = router.query
  const { t } = useTranslation()
  const [order, setOrder] = useState({})
  useEffect(() => {
    // let order = props.orders.find((item) => item.id === parseInt(id))
    // if (order) setOrder(order)
    // else
    axios
      .get(`admin/order/${id}`)
      .then(({ data }) => {
        if (data.success) {
          data.order.logs.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          })
          setOrder({ ...data.order, payment: data.payment })
          // props.updateOrderList(data.order, id)
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
  return (
    <>
      <div className="row">
        {Object.keys(order).length > 0 && (
          <>
            <OrderInfo order={order} />
            <OrderActivity
              order={order}
              updateOrder={(data) =>
                setOrder({
                  ...order,
                  status: data.status,
                  driver: data.driver,
                  time: data.time,
                  vehicleType: data.vehicleType
                })
              }
            />
          </>
        )}
      </div>
    </>
  )
}

const mapStateToProps = (state) => ({
  orders: state.orders.orders
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateOrderList: (order, id) => {
      dispatch({
        type: actions.ORDER_UPDATE_REQUESTED,
        payload: { order, id }
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetails)
