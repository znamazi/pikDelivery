import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import actions from '../../store/actions'
import axios from '../../utils/axios'
import InvoiceActivity from 'components/invoices/InvoiceActivity'
import WithPermission from '../../components/partials/WithPermission'

const InvoiceDetails = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  const { id } = router.query
  const [invoice, setInvoice] = useState({})
  const [payments, setPayments] = useState([])
  useEffect(() => {
    // let existInvoice = props.invoices.find((item) => item.id === parseInt(id))
    // if (existInvoice) setInvoice(existInvoice)
    // else
    axios
      .get(`admin/invoice/${id}`)
      .then(({ data }) => {
        if (data.success) {
          setInvoice(data.invoice)
          setPayments(data.payments)
          props.updateInvoiceList(data.invoice, id)
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
  const changeStatus = (id) => {
    const index = payments.findIndex((item) => item._id === id)
    let newData = payments.slice()
    newData[index] = { ...newData[index], status: 'cancel' }
    setPayments(newData)
  }
  return (
    <div className="row">
      {Object.keys(invoice).length > 0 && (
        <InvoiceActivity
          invoice={invoice}
          payments={payments}
          updateStatusInvoice={() =>
            setInvoice({ ...invoice, status: 'cancel' })
          }
          updatePayment={(payment) => setPayments([...payments, payment])}
          changeStatus={(id) => changeStatus(id)}
        />
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  invoices: state.invoices.invoices
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateInvoiceList: (invoice, id) => {
      dispatch({
        type: actions.INVOICE_UPDATE_REQUESTED,
        payload: { invoice, id }
      })
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(InvoiceDetails)
