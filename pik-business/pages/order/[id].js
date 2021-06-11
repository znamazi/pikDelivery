import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import axios from '../../utils/axios'

import OrderInfoDetails from 'components/orders/OrderInfoDetails'
import OrderPackagesDetails from 'components/orders/OrderPackagesDetails'
import actions from 'store/actions'

const OrderDetails = (props) => {
  const router = useRouter()
  const { id } = router.query

  const [order, setOrder] = useState({})
  useEffect(() => {
    // let order = props.orders.find((item) => item.id === parseInt(id))
    // if (order) setOrder(order)
    // else
    axios
      .get(`business/order/${id}`)
      .then(({ data }) => {
        if (data.success) {
          setOrder(data.order)
          props.updateOrderList(data.order, id)
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
  const changeOrder = (cancel) => {
    const newOrder = { ...order, status: 'Canceled', cancel }
    setOrder(newOrder)
  }
  return (
    <div>
      <div className="row">
        {Object.keys(order).length > 0 && (
          <>
            <OrderInfoDetails order={order} changeOrder={changeOrder} />
            <OrderPackagesDetails order={order} />
          </>
        )}
      </div>
    </div>
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
