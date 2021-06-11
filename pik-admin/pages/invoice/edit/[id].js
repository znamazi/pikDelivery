import React, { useState, useEffect } from 'react'
import EditInvoice from '../../../components/invoices/EditInvoice'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import axios from '../../../utils/axios'
import WithPermission from '../../../components/partials/WithPermission'

const editInvoice = () => {
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
  return (
    <WithPermission needPermission=" invoice-management:3">
      <div className="row">
        {Object.keys(invoice).length > 0 && (
          <EditInvoice invoice={invoice} payments={payments} />
        )}
      </div>
    </WithPermission>
  )
}

export default editInvoice
