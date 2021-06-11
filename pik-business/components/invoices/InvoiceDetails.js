import React from 'react'
import { useRouter } from 'next/router'
import moment from 'moment'
import HeaderContent from '../layouts/HeaderContent'
import { StatusColumnFormatter } from './invoices-list/ColumnFormatter'
import { useTranslation } from 'react-i18next'

const InvoiceDetails = ({ invoice, payments }) => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <>
      <HeaderContent>
        <li
          onClick={() => router.push('/invoices')}
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.invoices')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {`${t('pages.invoices.invoice_id')}: ${invoice.id}`}
            </h3>
            <span className="card-title font-weight-bolder">
              {`${t('pages.common.date')}: ${moment(invoice.createdAt).format(
                'DD/MM/YYYY'
              )}`}
            </span>
          </div>
          <div className="card-body d-flex flex-column">
            <div className="row mt-10">
              <div className="text-dark-75 font-weight-bolder font-size-lg col-12">
                <span>{t('pages.invoices.invoice_details')}</span>
                <span className="float-right">
                  {StatusColumnFormatter('', invoice)}
                </span>
              </div>
              <div className="table-responsive col-12">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <td>{t('pages.common.description')}</td>
                      <td>{t('pages.common.total')}</td>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr>
                        <td>{item.description}</td>
                        <td>{item.amount}</td>
                      </tr>
                    ))}

                    <tr>
                      <td>{t('pages.invoices.itbms')}</td>
                      <td>{invoice.amount.itbms}</td>
                    </tr>
                    <tr>
                      <td>{t('pages.common.total')}</td>
                      <td>{invoice.amount.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {invoice.status === 'paid' && (
              <div className="row mt-10">
                <div className="text-dark-75 font-weight-bolder font-size-lg col-12">
                  {t('pages.invoices.payment_details')}
                </div>
                <div className="table-responsive col-12">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <td>{t('Table.columns.payment_id')}</td>
                        <td>{t('Table.columns.date')}</td>
                        <td>{t('Table.columns.transaction')}</td>
                        <td>{t('Table.columns.amount')}</td>
                        <td>{t('Table.columns.method')}</td>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr>
                          <td>{payment._id}</td>
                          <td>
                            {moment(payment.createdAt).format(
                              'DD/MM/YYYY h:mm A'
                            )}
                          </td>
                          <td>{payment.authResponse.transactionid}</td>
                          <td>{payment.captureAmount}</td>
                          <td>{payment.transactionType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default InvoiceDetails
