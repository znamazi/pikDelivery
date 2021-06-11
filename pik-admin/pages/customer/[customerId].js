import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import axios from '../../utils/axios'
import CustomerInfo from '../../components/customers/CustomerInfo'
import CustomerActivity from '../../components/customers/CustomerActivity'
import { toast } from 'react-toastify'
import actions from '../../store/actions'

const CustomerDetails = (props) => {
  const router = useRouter()
  const { customerId } = router.query
  const [customer, setCustomer] = useState({})

  useEffect(() => {
    // let customer = props.customers.find((item) => item._id === customerId)
    // if (customer) setCustomer(customer)
    // else
    axios
      .get(`admin/customer/${customerId}`)
      .then(({ data }) => {
        if (data.success) {
          setCustomer(data.customer)
          props.updateCustomerList(data.customer, customerId)
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
      {Object.keys(customer).length > 0 && (
        <>
          <CustomerInfo
            customer={customer}
            updateCustomer={(status) => setCustomer({ ...customer, status })}
          />
          <CustomerActivity customer={customer} />
        </>
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  customers: state.customers.customers
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateCustomerList: (customer, id) => {
      dispatch({
        type: actions.CUSTOMER_UPDATE_REQUESTED,
        payload: { customer, id }
      })
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CustomerDetails)
