import InvoicesList from '../components/invoices/invoices-list/InvoicesList'
import { DTUIProvider } from '../metronic/dataTable/DTUIContext'
import WithPermission from '../components/partials/WithPermission'

const Invoices = () => {
  return (
    <WithPermission needPermission="invoice-management:1">
      <DTUIProvider>
        <InvoicesList />
      </DTUIProvider>
    </WithPermission>
  )
}

export default Invoices
