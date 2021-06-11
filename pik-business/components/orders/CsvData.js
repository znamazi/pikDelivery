import React, { useState, useEffect } from 'react'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import VehicleType from '../../../node-back/src/constants/VehicleTypes'
import { validationEmail } from 'utils/utils'
import { useTranslation } from 'react-i18next'

const CsvData = ({ csvInfo, uploadCsv }) => {
  const router = useRouter()
  const { t } = useTranslation()

  const [error, setError] = useState(false)
  const [checkOrders, setCheckOrder] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let checkOrders = []
    let makeOrders = []
    csvInfo.forEach((item, index) => {
      console.log(item)
      item.vehiculo =
        item.vehiculo.charAt(0).toUpperCase() + item.vehiculo.slice(1)

      if (item.email) {
        let orderIndex = makeOrders.findIndex(
          (order) =>
            order.email == item.email.toLowerCase() &&
            order.vehicleType == item.vehiculo
        )
        if (orderIndex === -1) {
          let order = {
            name: item.nombre,
            email: item.email.toLowerCase(),
            phone: item.telefono,
            vehicleType: item.vehiculo,
            packages: []
          }
          let packageOrder = {
            reference: item.referencia,
            description: item.descripción
          }
          order = { ...order, packages: [...order.packages, packageOrder] }

          makeOrders.push(order)
        } else {
          let newOrder = {
            ...makeOrders[orderIndex],
            packages: [
              ...makeOrders[orderIndex].packages,
              { reference: item.referencia, description: item.descripción }
            ]
          }
          makeOrders.splice(orderIndex, 1, newOrder)
        }
        const { err, errorMessage } = checkError(item)
        if (err)
          checkOrders.push({
            ...item,
            index: index + 1,
            errorMessage
          })
      } else {
        const { err, errorMessage } = checkError(item)

        if (err)
          checkOrders.push({
            ...item,
            index: index + 1,
            errorMessage
          })
        // setError('Some row of your csv is empty')
        return
      }
    })
    setOrders(makeOrders)
    if (checkOrders.length > 0) {
      setError(true)
      setCheckOrder(checkOrders)
    }
  }, [])

  const checkError = (item) => {
    let errorMessage = {}
    let err = false

    if (!Object.keys(VehicleType).includes(item.vehiculo)) {
      err = true

      errorMessage = {
        ...errorMessage,
        vehicleType: `${t('errors.vehicle_type_not_valid')} [${Object.keys(
          VehicleType
        )}]`
      }
    }

    if (!item.email) {
      err = true
      errorMessage = {
        ...errorMessage,
        email: t('errors.email_not_recognized')
      }
    }
    if (item.email && !validationEmail(item.email)) {
      err = true
      errorMessage = {
        ...errorMessage,
        email: t('errors.email_address_not_correct')
      }
    }
    if (!item.referencia) {
      err = true
      errorMessage = {
        ...errorMessage,
        reference: t('errors.reference_not_recognized')
      }
    }
    if (!item.nombre) {
      err = true
      errorMessage = {
        ...errorMessage,
        name: t('errors.name_not_recognized')
      }
    }
    if (!item.telefono) {
      err = true
      errorMessage = {
        ...errorMessage,
        phone: t('errors.phone_not_recognized')
      }
    }
    if (!item.descripción) {
      err = true
      errorMessage = {
        ...errorMessage,
        description: t('errors.description_not_recognized')
      }
    }
    return { err, errorMessage }
  }

  let content = orders.map((item, index) => (
    <div className="row mb-5" key={index}>
      <div className="col-lg-3 border-gray text-center p-10 m-2">
        <p>{item.name}</p>
        <p>{item.email}</p>
        <p>{item.phone}</p>
      </div>
      <div className="col-lg-8 border-gray m-2">
        <div className="border-bottom p-5 pb-7">
          <strong className="pt-5">
            {t('pages.orders.order_req_num')}. {index + 1}
          </strong>
          <button
            className={` float-right btn btn-${
              item.vehicleType
                ? item.vehicleType.toLowerCase() === 'car'
                  ? 'primary'
                  : 'light'
                : 'danger'
            }`}
          >
            {t('pages.orders.car')}
          </button>
          <button
            className={` float-right mr-3 btn btn-${
              item.vehicleType
                ? item.vehicleType.toLowerCase() === 'motorcycle'
                  ? 'primary'
                  : 'light'
                : 'danger'
            }`}
          >
            {t('pages.orders.moto')}
          </button>
          <button
            className={` float-right mr-3 btn btn-${
              item.vehicleType
                ? item.vehicleType.toLowerCase() === 'pickup'
                  ? 'primary'
                  : 'light'
                : 'danger'
            }`}
          >
            Pickup
          </button>
        </div>
        <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('pages.orders.reference')}</th>
                <th scope="col">{t('pages.orders.description')}</th>
              </tr>
            </thead>
            <tbody>
              {item.packages.map((pack, index) => (
                <tr key={index}>
                  <td>{pack.reference}</td>
                  <td>{pack.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ))

  const createOrders = () => {
    // let err = false
    // let checkOrders = []
    // csvInfo.forEach((order, index) => {
    //   let errorMessage = {}

    //   if (!Object.keys(VehicleType).includes(order.vehicletype)) {
    //     err = true

    //     errorMessage = {
    //       ...errorMessage,
    //       vehicleType: `${t('errors.vehicle_type_not_valid')} [${Object.keys(
    //         VehicleType
    //       )}]`
    //     }
    //   }

    //   if (!order.email) {
    //     err = true
    //     errorMessage = {
    //       ...errorMessage,
    //       email: t('errors.email_not_recognized')
    //     }
    //   }
    //   if (order.email && !validationEmail(order.email)) {
    //     err = true
    //     errorMessage = {
    //       ...errorMessage,
    //       email: t('errors.email_address_not_correct')
    //     }
    //   }
    //   if (!order.reference) {
    //     err = true
    //     errorMessage = {
    //       ...errorMessage,
    //       reference: t('errors.reference_not_recognized')
    //     }
    //   }
    //   if (!order.name) {
    //     err = true
    //     errorMessage = {
    //       ...errorMessage,
    //       name: t('errors.name_not_recognized')
    //     }
    //   }
    //   if (!order.phone) {
    //     err = true
    //     errorMessage = {
    //       ...errorMessage,
    //       phone: t('errors.phone_not_recognized')
    //     }
    //   }
    //   if (!order.description) {
    //     err = true
    //     errorMessage = {
    //       ...errorMessage,
    //       description: t('errors.description_not_recognized')
    //     }
    //   }
    //   if (err)
    //     checkOrders.push({
    //       ...order,
    //       index: index + 1,
    //       errorMessage
    //     })
    // })
    if (error) {
      return
      // setError(true)
      // setCheckOrder(checkOrders)
    } else {
      axios
        .post('business/order/import', orders)
        .then(({ data }) => {
          if (data.success) {
            router.push('/orders')
            toast.success(t('pages.orders.order_created_successfully'))
          } else {
            const errorMessage = data.errorCode
              ? data.errorData
                ? t(`server_errors.${data.errorCode}`, {
                    errorData: data.errorData
                  })
                : t(`server_errors.${data.errorCode}`)
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
    <div>
      {content}
      <p>
        {error ? t('pages.orders.show_error_csv') : t('pages.orders.review')}
      </p>
      {error && (
        <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">{t('Table.columns.row')}</th>
                <th scope="col">{t('Table.columns.nombre')}</th>
                <th scope="col">{t('Table.columns.email')}</th>
                <th scope="col">{t('Table.columns.telefono')}</th>
                <th scope="col">{t('Table.columns.vehiculo')}</th>
                <th scope="col">{t('Table.columns.referencia')}</th>
                <th scope="col">{t('Table.columns.descripción')}</th>
              </tr>
            </thead>
            <tbody>
              {checkOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.index}</td>
                  <td>
                    <p>{order.nombre}</p>
                    {order.errorMessage.name ? (
                      <p className="text-danger">{order.errorMessage.name}</p>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    <p>{order.email}</p>
                    {order.errorMessage.email ? (
                      <p className="text-danger">{order.errorMessage.email}</p>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    {order.telefono}
                    {order.errorMessage.phone ? (
                      <p className="text-danger">{order.errorMessage.phone}</p>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    <p> {order.vehiculo}</p>
                    {order.errorMessage.vehicleType ? (
                      <p className="text-danger">
                        {order.errorMessage.vehicleType}
                      </p>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    <p>{order.referencia}</p>
                    {order.errorMessage.reference ? (
                      <p className="text-danger">
                        {order.errorMessage.reference}
                      </p>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    <p>{order.descripción}</p>
                    {order.errorMessage.description ? (
                      <p className="text-danger">
                        {order.errorMessage.description}
                      </p>
                    ) : (
                      ''
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="btn btn-primary float-right" onClick={createOrders}>
        {t('pages.orders.create_orders')}
      </button>

      <button className="btn btn-light mr-3 float-right" onClick={uploadCsv}>
        {t('pages.common.go_back')}
      </button>
    </div>
  )
}

export default CsvData
