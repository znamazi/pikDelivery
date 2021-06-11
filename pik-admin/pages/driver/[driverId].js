import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import axios from '../../utils/axios'
import DriverInfo from '../../components/drivers/DriverInfo'
import DriverActivity from '../../components/drivers/DriverActivity'
import { toast } from 'react-toastify'
import actions from '../../store/actions'

const DriverDetails = (props) => {
  const router = useRouter()

  const { driverId } = router.query
  const [driver, setDriver] = useState({})
  useEffect(() => {
    // let driver = props.drivers.find((item) => item._id === driverId)

    // if (driver) setDriver(driver)
    // else
    axios
      .get(`admin/driver/${driverId}`)
      .then(({ data }) => {
        if (data.success) {
          setDriver({
            ...data.driver,
            cancel: data.cancel,
            feedback: data.avgFeedback,
            bankAccount: data.bankAccount
          })
          props.updateDriverList(data.driver, driverId)
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
    <div className="row">
      {Object.keys(driver).length > 0 && (
        <>
          <DriverInfo driver={driver} />
          <DriverActivity
            driver={driver}
            updateDriver={(driver) => setDriver(driver)}
          />
        </>
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  drivers: state.drivers.drivers
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateDriverList: (driver, id) => {
      dispatch({
        type: actions.DRIVER_UPDATE_REQUESTED,
        payload: { driver, id }
      })
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DriverDetails)
