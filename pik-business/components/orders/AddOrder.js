import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { Alert, AlertTitle } from '@material-ui/lab'
import { toast } from 'react-toastify'
import OrderInfo from './OrderInfo'
import OrderItems from './OrderItems'
import { useRouter } from 'next/router'
import axios from '../../utils/axios'
import { useAuth } from '../../utils/next-auth'
import HeaderContent from '../layouts/HeaderContent'
import OrderPackages from 'components/customers/OrderPackages'
import { validationEmail } from 'utils/utils'
import * as OrdersUIHelpers from './orders-list/OrdersUIHelpers'
import { debounce } from 'lodash'
import SubHeaderContent from '../layouts/SubHeaderContent'
import { CircularProgress } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    width: '16px !important',
    height: '16px !important',
    marginLeft: theme.spacing(1),
    color: '#fff'
  }
}))
const AddOrder = ({ mode }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const router = useRouter()
  const { id } = router.query
  const [error, setError] = useState('')
  const [fetchData, setFetchData] = useState([])
  const [nameOptions, setNameOptions] = useState([])
  const [emailOptions, setEmailOptions] = useState([])

  const [isLoadingName, setIsLoadingName] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)
  const [sending, setSending] = useState(false)

  const [order, setOrder] = useState({
    senderModel: 'business',
    email: '',
    name: '',
    mobile: '',
    vehicleType: '',
    receiver: '',
    packages: [
      {
        reference: '',
        description: ''
      }
    ]
  })

  const handleDataSelectSearch = (data, field) => {
    let customerData = data
      ? fetchData.find((item) => item[field].trim() === data.trim())
      : ''

    if (customerData) {
      if (!order.name) setNameOptions([customerData.name])
      if (!order.email) setEmailOptions([customerData.email])
      setOrder({
        ...order,
        email: order.email ? order.email : customerData.email,
        mobile: order.mobile ? order.mobile : customerData.mobile,
        name: order.name ? order.name : customerData.name
      })
    } else {
      setOrder({ ...order, [field]: data ? data : '' })
    }
  }
  const updateData = (data, field) => {
    setOrder({ ...order, [field]: data ? data : '' })
  }
  const handleSearch = debounce((searchData, field) => {
    if (searchData) {
      let url =
        field === 'name' ? 'business/order/names' : 'business/order/emails'
      field === 'name' ? setIsLoadingName(true) : setIsLoadingEmail(true)
      axios
        .post(url, { [field]: searchData })
        .then(({ data }) => {
          if (data.success) {
            let optionData = data.customer.map((item) => item[field])
            field === 'name'
              ? setNameOptions(optionData)
              : setEmailOptions(optionData)
            setFetchData(data.customer)
            field === 'name'
              ? setIsLoadingName(false)
              : setIsLoadingEmail(false)
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
  }, 1500)

  useEffect(() => {
    if (mode === 'edit') {
      axios
        .get(`business/order/${id}`)
        .then(({ data }) => {
          if (data.success) {
            setOrder({
              senderModel: 'business',
              email: data.order.receiver.email,
              name: data.order.delivery.name,
              mobile: data.order.delivery.phone,
              vehicleType: data.order.vehicleType,
              receiver: data.order.receiver,
              packages: data.order.packages.map((packageItem) => ({
                reference: packageItem.reference,
                description: packageItem.description
              })),
              status: data.order.status
            })

            setEmailOptions([data.order.receiver.email])
            setNameOptions([data.order.delivery.name])
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
  }, [])

  const submitOrder = () => {
    setError('')
    if (!!!order.name) {
      setError(t('errors.enter_customer_name'))
      return
    }
    if (!!!order.email) {
      setError(t('errors.enter_email'))
      return
    }
    if (!validationEmail(order.email)) {
      setError(t('errors.email_address_not_correct'))
      return
    }

    if (!!!order.mobile) {
      setError(t('errors.enter_phone'))
      return
    }
    if (!!!order.vehicleType) {
      setError(t('errors.select_vehicle'))
      return
    }
    const isEmptyPackages = order.packages.some(
      (x) => !!!x.reference || !!!x.description
    )
    let checkKeyPresenceInPackages = order.packages.every(
      (obj) =>
        Object.keys(obj).includes('reference') &&
        Object.keys(obj).includes('description')
    )

    if (isEmptyPackages || !checkKeyPresenceInPackages) {
      setError(t('errors.enter_info_packages'))
      return
    }
    setSending(true)
    const url =
      mode === 'edit' ? `business/order/update/${id}` : 'business/order'
    const message =
      mode === 'edit'
        ? t('pages.orders.order_updated_successfully')
        : t('pages.orders.order_created_successfully')
    let data = { ...order }
    axios
      .post(url, data)
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          router.back()
          setSending(false)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
          setSending(false)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
        setSending(false)
      })
  }

  const handlePhone = (phone) => {
    setOrder({ ...order, mobile: phone })
  }
  const selectVehicle = (data) => {
    setOrder({ ...order, vehicleType: data })
  }
  const handleAddPackages = (e, index) => {
    let newData = order.packages.slice()
    newData[index] = { ...newData[index], [e.target.name]: e.target.value }
    setOrder({ ...order, packages: newData })
  }
  const addPackages = () => {
    setOrder({
      ...order,
      packages: [
        ...order.packages,
        {
          reference: '',
          description: ''
        }
      ]
    })
  }
  const removePackages = (indexDel) => {
    let newData = order.packages.filter((item, index) => index !== indexDel)
    if (newData.length === 0) {
      newData = [
        {
          reference: '',
          description: ''
        }
      ]
    }
    setOrder({ ...order, packages: newData })
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
      <SubHeaderContent title={mode === 'edit' ? 'Edit Order' : 'New Order'}>
        <button className="btn btn-light" onClick={() => router.back()}>
          {t('information.cancel')}
        </button>
        <button className="btn btn-primary ml-3" onClick={submitOrder}>
          {t('information.save')}
          {sending && <CircularProgress className={classes.circularProgress} />}
        </button>
      </SubHeaderContent>
      <div className="row col-12">
        <div className="col-lg-12 m-3">
          {error && <Alert severity="error">{error}</Alert>}
        </div>
      </div>

      <div className="row">
        <OrderInfo
          handleSearch={(data, field) => {
            if (data) {
              field == 'name' ? setIsLoadingName(true) : setIsLoadingEmail(true)
            }
            handleSearch(data, field)
          }}
          handleDataSelectSearch={(data, field) =>
            handleDataSelectSearch(data, field)
          }
          updateData={(data, field) => updateData(data, field)}
          nameOptions={nameOptions}
          emailOptions={emailOptions}
          handlePhone={(phone) => handlePhone(phone)}
          order={order}
          isLoadingName={isLoadingName}
          isLoadingEmail={isLoadingEmail}
        />
        <OrderItems
          selectVehicle={(data) => selectVehicle(data)}
          order={order}
          handleAddPackages={(e, index) => handleAddPackages(e, index)}
          addPackages={addPackages}
          // submitOrder={submitOrder}
          removePackages={(index) => removePackages(index)}
          // sending={sending}
        />
      </div>
    </>
  )
}

export default AddOrder
