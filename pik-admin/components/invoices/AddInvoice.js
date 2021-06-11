import React, { useState } from 'react'
import { useRouter } from 'next/router'
import SubHeaderContent from '../layouts/SubHeaderContent'
import { useTranslation } from 'react-i18next'
import * as InvoicesUIHelpers from './invoices-list/InvoicesUIHelpers'
import HeaderContent from '../layouts/HeaderContent'
import { v4 as UUID } from 'uuid'
import { toast } from 'react-toastify'
import axios from '../../utils/axios'
import BusinessSearch from './BusinessSearch'

const AddInvoice = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedBusiness, setSelectedBusiness] = useState()
  const [price, setPrice] = useState({
    subTotal: 0,
    total: 0,
    itbms: 0
  })
  const [invoices, setInvoices] = useState([
    {
      id: UUID(),
      description: '',
      amount: ''
    }
  ])
  const [discount, setDiscount] = useState(0)
  const [errorAmount, setErrorAmount] = useState('')
  const [errorDescription, setErrorDescription] = useState('')
  const [status, setStatus] = useState('')
  const [errorStatus, setErrorStatus] = useState('')
  const calculateTotal = () => {
    let sumOfItems = invoices.reduce(
      (acc, i) => (parseFloat(i.amount) ? acc + parseFloat(i.amount) : acc + 0),
      0
    )
    let subTotal = sumOfItems - discount
    let itbms = parseFloat((subTotal * 0.07).toFixed(2))
    let total = parseFloat((subTotal + itbms).toFixed(2))
    setPrice({ subTotal, itbms, total })
  }
  const addInvoice = (e, id) => {
    setErrorAmount('')
    setErrorDescription('')
    let index = invoices.findIndex((item) => item.id === id)
    let newData = invoices.slice()

    newData[index] = { ...newData[index], [e.target.name]: e.target.value }
    setInvoices(newData)
  }
  const removeInvoice = (e, id) => {
    alert('hi remove')
    e.stopPropagation()

    let newData = invoices.filter((item) => item.id !== id)
    setInvoices(newData)
    let sumOfItems = newData.reduce(
      (acc, i) => (parseFloat(i.amount) ? acc + parseFloat(i.amount) : acc + 0),
      0
    )
    let subTotal = sumOfItems - discount
    let itbms = parseFloat((subTotal * 0.07).toFixed(2))
    let total = parseFloat((subTotal + itbms).toFixed(2))
    setPrice({ subTotal, itbms, total })
  }
  const handleAdd = (e) => {
    e.stopPropagation()
    setErrorAmount('')
    setErrorDescription('')

    if (
      isNaN(invoices[invoices.length - 1].amount) ||
      !invoices[invoices.length - 1].amount
    ) {
      setErrorAmount(t('errors.amount_not_valid'))
      return
    }
    calculateTotal()

    if (!invoices[invoices.length - 1].description) {
      setErrorDescription(t('errors.description_required'))
      return
    }
    setInvoices([
      ...invoices,
      {
        id: UUID(),
        description: '',
        amount: ''
      }
    ])
  }
  const saveInvoice = () => {
    if (errorAmount || errorDescription || errorStatus) {
      return
    }
    if (!selectedBusiness) {
      toast.error(t('errors.business_required'))
      return
    }
    const items = invoices.filter((invoice) => invoice.amount !== '')

    if (items.length === 0) {
      toast.error(t('errors.amount_required'))
      return
    }
    if (!status) {
      setErrorStatus(t('errors.status_required'))
      toast.error(t('errors.status_required'))
      return
    }
    items.forEach((item) => {
      delete item.id
    })
    axios
      .post('admin/invoice', {
        business: selectedBusiness,
        items,
        discount,
        status
      })
      .then(({ data }) => {
        if (data.success) {
          toast.success(t('pages.invoices.invoice_created_successfuly'))
          router.back()
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
    <div>
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
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">OPEN</span>
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
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">CLOSED</span>
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
            <span className="menu-text">ALL</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>

      <SubHeaderContent title={t('pages.invoices.new_invoice')}>
        <button className="ml-3 btn btn-white" onClick={() => router.back()}>
          {t('information.Cancel')}
        </button>
        <button className="ml-3 btn btn-primary" onClick={saveInvoice}>
          {t('information.Save')}
        </button>
      </SubHeaderContent>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {t('pages.invoices.invoices')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column">
            <div className="row">
              <div className="col-12">
                <BusinessSearch
                  selectBusiness={(value) => setSelectedBusiness(value)}
                />
              </div>
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
                    {invoices.map((item, index) => (
                      <tr key={index}>
                        {invoices[index + 1] ? (
                          <>
                            <td>{item['description']}</td>
                            <td>{item['amount']}</td>
                          </>
                        ) : (
                          <>
                            <td>
                              <input
                                value={item['description']}
                                className={`form-control ${
                                  errorDescription ? 'is-invalid' : ''
                                }`}
                                name="description"
                                onChange={(e) => addInvoice(e, item.id)}
                              />
                              {errorDescription && (
                                <div className="invalid-feedback">
                                  {errorDescription}
                                </div>
                              )}
                            </td>
                            <td>
                              <input
                                value={item['amount']}
                                className={`form-control ${
                                  errorAmount ? 'is-invalid' : ''
                                }`}
                                name="amount"
                                onChange={(e) => addInvoice(e, item.id)}
                                // onBlur={(e) => {
                                //   handleAdd(e)
                                // }}
                                onKeyUp={(e) => {
                                  if (e.keyCode == 13) {
                                    handleAdd(e)
                                  }
                                }}
                              />
                              {errorAmount && (
                                <div className="invalid-feedback">
                                  {errorAmount}
                                </div>
                              )}
                            </td>
                          </>
                        )}
                        <td>
                          {invoices[index + 1] ? (
                            <div>
                              <i
                                className="fa fa-minus"
                                onClick={(e) => removeInvoice(e, item.id)}
                              ></i>
                            </div>
                          ) : (
                            <div>
                              <i
                                className="fa fa-plus mr-3"
                                onClick={(e) => handleAdd(e)}
                              ></i>

                              <i
                                className="fa fa-minus"
                                onClick={(e) => removeInvoice(e, item.id)}
                              ></i>
                            </div>
                          )}
                        </td>
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
                      <td>
                        <input
                          value={discount}
                          className="form-control"
                          name="desc"
                          onChange={(e) => setDiscount(e.target.value)}
                          onBlur={() => calculateTotal()}
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.invoices.sub_total')}</td>
                      <td>{price.subTotal}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.invoices.itbms')}</td>
                      <td>{price.itbms}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.common.Total')}</td>
                      <td>{price.total}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-lg-4">
                <select
                  className={`form-select form-select-lg mb-3 form-control ${
                    errorStatus ? 'is-invalid' : ''
                  }`}
                  aria-label=".form-select-lg example"
                  onChange={(e) => {
                    setErrorStatus('')
                    setStatus(e.target.value)
                  }}
                >
                  <option>{t('pages.invoices.select_status')}</option>
                  <option value="open">{t('status.open')}</option>
                  <option value="paid">{t('status.paid')}</option>
                  <option value="unpaid">{t('status.unpaid')}</option>
                </select>
                {errorStatus && (
                  <div className="invalid-feedback">{errorStatus}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddInvoice
