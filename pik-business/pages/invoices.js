import InvoicesList from '../components/invoices/invoices-list/InvoicesList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'

const Invoices = () => {
  return (
    <DTUIProvider>
      <InvoicesList />
    </DTUIProvider>
  )
}

export default Invoices
