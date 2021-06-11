import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from '../../utils/axios'
import OrderInfo from '../../components/customers/OrderInfo'
import OrderPackages from '../../components/customers/OrderPackages'
import HeaderContent from '../../components/layouts/HeaderContent'
import { connect } from 'react-redux'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import actions from '../../store/actions'

const CustomerDetails = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  const { customerId } = router.query
  const [customer, setCustomer] = useState({})
  useEffect(() => {
    // let customer = props.customers.find((item) => item._id === customerId)
    // if (customer) setCustomer(customer)
    // else
    axios
      .get(`business/customer/${customerId}`)
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
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/customers',
              query: { status: '', filterHeader: 'All Customers' }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.customers.all')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      {Object.keys(customer).length > 0 && (
        <DTUIProvider>
          <OrderInfo customer={customer} />
          <OrderPackages customerId={customerId} />
        </DTUIProvider>
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
