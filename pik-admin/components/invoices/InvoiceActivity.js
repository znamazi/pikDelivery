import React, { useState, useEffect } from 'react'
import SVG from 'react-inlinesvg'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import SubHeaderContent from '../layouts/SubHeaderContent'
import { getLabelCssClasses } from './invoices-list/ColumnFormatter'
import ButtonEdit from 'metronic/partials/ButtonEdit'
import ButtonStop from 'metronic/partials/ButtonStop'
import { useTranslation } from 'react-i18next'
import HeaderContent from '../layouts/HeaderContent'
import * as InvoicesUIHelpers from './invoices-list/InvoicesUIHelpers'
import useModal from 'metronic/partials/modal/useModal'
import BaseModal from 'metronic/partials/modal/BaseModal'
import AddPayment from './AddPayment'
import axios from '../../utils/axios'

const InvoiceActivity = ({
  invoice,
  payments,
  updatePayment,
  changeStatus,
  updateStatusInvoice
}) => {
  const { t } = useTranslation()

  const { isShowing, toggle } = useModal()

  const [pagos, setPagos] = useState(0)
  const [allowCancel, setAllowCancel] = useState(true)

  const router = useRouter()
  useEffect(() => {
    if (payments.length > 0) {
      let allowCancel = true
      for (let index = 0; index < payments.length; index++) {
        const element = payments[index]
        if (element.status != 'cancel') {
          allowCancel = false
        }
      }
      setAllowCancel(allowCancel)
    }
    let sum = payments.reduce((sum, item) => {
      if (item.status == 'paid') {
        return sum + item.captureAmount
      } else {
        return sum
      }
    }, 0)
    setPagos(sum)
  }, [payments])
  const cancelPayment = (id) => {
    axios
      .post(`admin/payment/update/${id}`, { status: 'cancel' })
      .then(({ data }) => {
        if (data.success) {
          changeStatus(id)
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
  const cancelInvoice = () => {
    axios
      .post(`admin/invoice/update/${invoice._id}`, { status: 'cancel' })
      .then(({ data }) => {
        if (data.success) {
          updateStatusInvoice()
          // changeStatus(id)
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
  return (
    <>
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/invoices',
              query: {
                status: InvoicesUIHelpers.filterHeaderOpen,
                filterHeader: 'OPEN'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            InvoicesUIHelpers.filterHeaderOpen
              .split(',')
              .includes(invoice.status)
              ? 'menu-item-active'
              : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.open')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/invoices',
              query: {
                status: InvoicesUIHelpers.filterHeaderClose,
                filterHeader: 'CLOSED'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            InvoicesUIHelpers.filterHeaderClose
              .split(',')
              .includes(invoice.status)
              ? 'menu-item-active'
              : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.closed')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/invoices',
              query: {
                status: '',
                filterHeader: 'All Invoices'
              }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.all')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <SubHeaderContent title={t('pages.invoices.invoice') + ' ' + invoice.id}>
        {allowCancel && <ButtonStop onClick={cancelInvoice} />}
        <ButtonEdit
          href="/invoice/edit/[id]"
          as={`/invoice/edit/${invoice.id}`}
        />
        <span
          className={getLabelCssClasses(invoice.status)}
          style={{ width: 110, height: 40 }}
        >
          {t(`status.${invoice.status}`)}
        </span>
      </SubHeaderContent>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {t('pages.invoices.invoiced_to') + ' ' + invoice.businessName}
            </h3>
            <span className="card-title font-weight-bolder">
              {t('pages.common.Date') +
                ':  ' +
                moment(invoice.createdAt).format('DD/MM/YYYY')}
            </span>
          </div>
          <div className="card-body d-flex flex-column">
            <div className="row">
              <div className="table-responsive col-12">
                <table className="table table-hover table-striped position-relative">
                  <thead>
                    <tr>
                      <td>{t('pages.common.Description')}</td>
                      <td>{t('pages.common.Total')}</td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item['description']}</td>
                        <td>{item['amount']}</td>
                        <td></td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.invoices.discount')}</td>
                      <td>{invoice.amount.discount}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.invoices.sub_total')}</td>
                      <td>{invoice.amount.subTotal}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.invoices.itbms')}</td>
                      <td>{invoice.amount.itbms}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.common.Total')}</td>
                      <td>{invoice.amount.total}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {t('pages.invoices.pagos')} = {pagos.toFixed(2)}
            </h3>
            <button className="btn btn-light mb-2" onClick={toggle}>
              {t('pages.invoices.new_payment')}
            </button>
          </div>
          <div className="card-body d-flex flex-column">
            <div className="row">
              <div className="table-responsive col-12">
                <table className="table table-hover table-striped position-relative">
                  <thead>
                    <tr>
                      <td>{t('Table.columns.Payment_ID')}</td>
                      <td>{t('Table.columns.date')}</td>
                      <td>{t('Table.columns.Description')}</td>
                      <td>{t('Table.columns.Amount')}</td>
                      <td>{t('Table.columns.user')}</td>
                      <td>{t('Table.columns.Action')}</td>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={index}>
                        <td>{payment._id}</td>
                        <td>
                          {moment(payment.createdAt).format(
                            'DD/MM/YYYY h:mm A'
                          )}
                        </td>

                        <td>{payment.description}</td>
                        <td>{payment.captureAmount}</td>

                        <td>{payment.user?.name}</td>
                        <td>
                          {payment.status === 'cancel' ? (
                            <span
                              className="label label-lg label-light-danger label-inline"
                              style={{ width: 100 }}
                            >
                              {t(`status.cancel`)}
                            </span>
                          ) : (
                            <ButtonStop
                              onClick={() => cancelPayment(payment._id)}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {t('pages.invoices.invoice_log')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column">
            <div className="row">
              <div className="table-responsive col-12">
                <table className="table table-hover table-striped position-relative">
                  <thead>
                    <tr>
                      <td>{t('Table.columns.date')}</td>
                      <td>{t('Table.columns.Description')}</td>
                      <td>{t('Table.columns.user')}</td>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.logs.map((log, index) => (
                      <tr key={index}>
                        <td> {moment(log.date).format('DD/MM/YYYY h:mm A')}</td>
                        <td>{log.description}</td>
                        <td>{log.user?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddPayment
        isShowing={isShowing}
        hide={toggle}
        invoice={invoice}
        updatePayment={(payment) => updatePayment(payment)}
      />
    </>
  )
}

export default InvoiceActivity
