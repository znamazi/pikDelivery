import React from 'react'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import { useRouter } from 'next/router'
import axios from '../../utils/axios'
import InvoiceDetails from 'components/invoices/InvoiceDetails'
import actions from 'store/actions'

const ShowInvoiceDetails = (props) => {
  const router = useRouter()

  const { id } = router.query
  const [invoice, setInvoice] = useState({})
  const [payments, setPayments] = useState([])
  useEffect(() => {
    // let invoice = props.invoices.find((item) => item.id === parseInt(id))
    // if (invoice) setInvoice(invoice)
    // else
    axios
      .get(`business/invoice/${id}`)
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
  return (
    Object.keys(invoice).length > 0 && (
      <InvoiceDetails invoice={invoice} payments={payments} />
    )
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
export default connect(mapStateToProps, mapDispatchToProps)(ShowInvoiceDetails)
