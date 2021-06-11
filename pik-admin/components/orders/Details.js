import React, { useState, useEffect } from 'react'
import Avatar from '@material-ui/core/Avatar'
import { makeStyles } from '@material-ui/core/styles'
import Select from 'react-select'
import { Alert } from '@material-ui/lab'
import axios from '../../utils/axios'
import Route from './Route'
import BaseModal from '../../metronic/partials/modal/BaseModal'
// import UpdateDriver from './UpdateDriver'
import { toast } from 'react-toastify'
import PersonalInfo from '../../metronic/partials/PersonalInfo'
import { useTranslation } from 'react-i18next'

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

const Details = ({ order, updateOrder }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const [isShowing, setIsShowing] = useState(false)

  const toggle = () => {
    setIsShowing(!isShowing)
  }
  const [search, setSearch] = useState(false)
  const [querySearch, setQuerySearch] = useState('')
  const [driver, setDriver] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState({})
  const [error, setError] = useState('')

  const actionModal = (confirm) => {
    if (confirm) {
      if (Object.keys(selectedDriver).length === 0) {
        setError(t('errors.select_driver'))
        setIsShowing(true)
        return
      } else {
        setError('')
        setIsShowing(false)
      }
      let vehicleType = driver.find((item) => item._id === selectedDriver._id)
        .vehicle.type
      axios
        .post('admin/order/assignDriver', {
          driver: selectedDriver._id,
          orderId: order._id,
          vehicleType
        })
        .then(({ data }) => {
          if (data.success) {
            let newData = driver.find((d) => d._id === selectedDriver._id)
            updateOrder({ ...data.order, driver: newData })
            setSelectedDriver({})
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
    } else {
      setSelectedDriver({})
      setError('')
      setIsShowing(false)
    }
  }
  const searchDriver = (data) => {
    setQuerySearch(data)
    setSearch(false)
    setTimeout(() => setSearch(true), 2000)
  }
  const handleDriver = (data) => {
    let newData = data ? { ...data.label.props, _id: data.value } : ''
    setSelectedDriver(newData)
  }
  useEffect(() => {
    if (search) {
      setIsLoading(true)
      axios
        .post('admin/driver/getDrivers', { query: querySearch })
        .then(({ data }) => {
          if (data.success) {
            setDriver(data.driver)
            setIsLoading(false)
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
  }, [search])

  const driverOptions = driver.map((d) => ({
    value: d._id,
    label: `${d.firstName} ${d.lastName} (${d.email} - ${d.mobile})`
  }))

  return (
    <>
      <div className="row">
        <div className="col-lg-6">
          <div>
            <p>
              <span className="text-dark-75 font-weight-bolder font-size-lg mr-20">
                {t('pages.orders.driver')}
              </span>
              {/* // Update driver only show for pending, progress, returni that not completed */}

              {['Pending', 'Progress', 'Returned'].includes(order.status) &&
                !order.time?.returnComplete && (
                  <a onClick={toggle} className="text-primary">
                    {t('pages.orders.update_driver')}
                  </a>
                )}
            </p>
            {order.driver && (
              <div className="d-flex align-items-center mt-12">
                <Avatar
                  alt={order.driver.firstName}
                  src={order.driver.avatar}
                  className={classes.large}
                />

                <div className="ml-4">
                  <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
                    {`${order.driver.firstName} ${order.driver.lastName}`}
                  </div>
                  <div className="text-muted font-weight-bold text-hover-primary">
                    <div>{order.driver.email}</div>

                    <div>{order.driver.mobile}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-6 border-left">
          <div>
            <div className="text-dark-75 font-weight-bolder font-size-lg float-left">
              {t('pages.orders.costs')}
            </div>
            {order.cost && (
              <>
                <div className="text-dark-75 font-weight-bolder font-size-h1  mt--13 float-right">{`$ 
                ${order.cost.total.toFixed(2)}`}</div>
                <div className="pt-15">
                  <table
                    className="table table-cost"
                    cellSpacing="0"
                    cellPadding="0"
                  >
                    <tbody>
                      <tr>
                        <td>
                          {t('pages.orders.distance')}{' '}
                          {order.direction
                            ? order.direction.routes[0].legs[0].distance.text
                            : '....'}
                        </td>
                        <td>{order.cost.distance.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>{t('pages.orders.vehicle_type')}</td>
                        <td>{order.cost.vehicleType.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>{t('pages.orders.tax')}</td>
                        <td>{order.cost.tax.toFixed(2)}</td>
                      </tr>
                      {order.cost.businessCoverage > 0 && (
                        <tr>
                          <td>{t('pages.orders.coverage')}</td>
                          <td>{order.cost.businessCoverage.toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* <div className="row mt-10"> */}
      <Route order={order} />
      {/* </div> */}

      {order.packages.length > 0 && order.senderModel === 'business' && (
        <div className="row mt-10">
          <p className="text-dark-75 font-weight-bolder font-size-lg col-12">
            {t('pages.orders.packages')}
          </p>
          <div className="table-responsive col-12">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <td>{t('pages.orders.tracking')}</td>
                  <td>{t('pages.orders.reference')}</td>
                  <td>{t('pages.common.Type')}</td>
                  <td>{t('pages.common.Description')}</td>
                </tr>
              </thead>
              <tbody>
                {order.packages.map((item, index) => (
                  <tr key={index}>
                    <td>{item.trackingCode ? item.trackingCode : ''}</td>
                    <td>{item.reference}</td>
                    <td>{order.vehicleType === 'Car' ? 'large' : 'small'}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <BaseModal
        isShowing={isShowing}
        hide={toggle}
        headerLeftButtons={t('pages.orders.update_driver')}
        action={true}
        btnCancel={t('information.Cancel')}
        btnConfirm={t('information.Send')}
        actionCallback={(confirm) => actionModal(confirm)}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <Select
          className="basic-single"
          classNamePrefix="select"
          isLoading={isLoading}
          isClearable
          isSearchable
          name="driver"
          options={driverOptions}
          // optionRenderer={renderOption}
          onInputChange={searchDriver}
          // optionComponent={driverOptions}
          onChange={(e) => handleDriver(e)}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => {
              const { zIndex, ...rest } = base
              return { ...rest, zIndex: 9999 }
            }
          }}
        />
      </BaseModal>
    </>
  )
}

export default Details
