import React, { useState } from 'react'
import SubHeaderContent from '../layouts/SubHeaderContent'
import * as InvoicesUIHelpers from './invoices-list/InvoicesUIHelpers'
import HeaderContent from '../layouts/HeaderContent'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { v4 as UUID } from 'uuid'
import { toast } from 'react-toastify'
import axios from '../../utils/axios'

const EditInvoice = ({ invoice }) => {
  const router = useRouter()
  const { t } = useTranslation()
  const [discount, setDiscount] = useState(invoice.discount)
  const [error, setError] = useState({
    field: '',
    id: '',
    message: ''
  })
  const [status, setStatus] = useState(invoice.status)
  const [errorStatus, setErrorStatus] = useState('')
  const [invoices, setInvoices] = useState(invoice.items)
  const [amount, setAmount] = useState(invoice.amount)
  const calculateTotal = () => {
    let sumOfItems = invoices.reduce(
      (acc, i) => (parseFloat(i.amount) ? acc + parseFloat(i.amount) : acc + 0),
      0
    )
    let subTotal = sumOfItems - discount
    let itbms = parseFloat((subTotal * 0.07).toFixed(2))
    let total = parseFloat((subTotal + itbms).toFixed(2))
    setAmount({ subTotal, itbms, total })
  }

  const addInvoice = (e, id) => {
    setError({ field: '', id: '', message: '' })
    let index = invoices.findIndex((item) => item._id === id)
    let newData = invoices.slice()
    let type = newData[index].type ? newData[index].type : 'edit'
    newData[index] = {
      ...newData[index],
      [e.target.name]: e.target.value,
      type
    }
    setInvoices(newData)
  }

  const removeInvoice = (id) => {
    let newData = invoices.filter((item) => item._id !== id)
    setInvoices(newData)
    let sumOfItems = newData.reduce(
      (acc, i) => (parseFloat(i.amount) ? acc + parseFloat(i.amount) : acc + 0),
      0
    )
    let subTotal = sumOfItems - discount
    let itbms = parseFloat((subTotal * 0.07).toFixed(2))
    let total = parseFloat((subTotal + itbms).toFixed(2))
    setAmount({ subTotal, itbms, total })
    if (invoices.length === 1) {
      setInvoices([
        {
          _id: UUID(),
          description: '',
          amount: ''
        }
      ])
    }
  }
  const handleAddAmount = () => {
    setError({
      field: '',
      id: '',
      message: ''
    })
    calculateTotal()
  }
  const handleAdd = () => {
    setError({
      field: '',
      id: '',
      message: ''
    })

    calculateTotal()

    setInvoices([
      ...invoices,
      {
        _id: UUID(),
        description: '',
        amount: '',
        type: 'add'
      }
    ])
  }
  const checkValidation = (e, id) => {
    const value = e.target.value
    if (!value || isNaN(value)) {
      setError({
        field: 'amount',
        id: id,
        message: t('errors.amount_not_valid')
      })
      return
    }
    handleAddAmount()
  }
  const updateInvoice = () => {
    if (error.message) {
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
      delete item._id
    })
    axios
      .post(`admin/invoice/update/${invoice._id}`, {
        items,
        discount,
        status
      })
      .then(({ data }) => {
        if (data.success) {
          toast.success(t('pages.invoices.invoice_updated_successfuly'))
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
      <SubHeaderContent title={t('pages.invoices.update_invoice')}>
        <button className="ml-3 btn btn-white" onClick={() => router.back()}>
          {t('information.Cancel')}
        </button>
        <button className="ml-3 btn btn-primary" onClick={updateInvoice}>
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
                        <>
                          <td>
                            <input
                              value={item['description']}
                              className={`form-control ${
                                error.field == 'description' &&
                                error.id == item._id
                                  ? 'is-invalid'
                                  : ''
                              }`}
                              name="description"
                              onChange={(e) => addInvoice(e, item._id)}
                              onBlur={(e) => {
                                if (!e.target.value)
                                  setError({
                                    id: item._id,
                                    field: 'description',
                                    message: t('errors.description_required')
                                  })
                              }}
                            />
                            {error.field == 'description' &&
                              error.id == item._id && (
                                <div className="invalid-feedback">
                                  {error.message}
                                </div>
                              )}
                          </td>
                          <td>
                            <input
                              value={item['amount']}
                              className={`form-control ${
                                error.field == 'amount' && error.id == item._id
                                  ? 'is-invalid'
                                  : ''
                              }`}
                              name="amount"
                              onChange={(e) => addInvoice(e, item._id)}
                              onBlur={(e) => {
                                checkValidation(e, item._id)
                              }}
                              onKeyUp={(e) => {
                                if (e.keyCode == 13) {
                                  checkValidation(e, item._id)
                                }
                              }}
                            />
                            {error.field == 'amount' &&
                              error.id == item._id && (
                                <div className="invalid-feedback">
                                  {error.message}
                                </div>
                              )}
                          </td>
                        </>

                        <td>
                          {invoices[index + 1] ? (
                            <div>
                              <i
                                className="fa fa-minus"
                                onClick={() => removeInvoice(item._id)}
                              ></i>
                            </div>
                          ) : (
                            <div>
                              <i
                                className="fa fa-plus mr-3"
                                onClick={handleAdd}
                              ></i>

                              <i
                                className="fa fa-minus"
                                onClick={() => removeInvoice(item._id)}
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
                      <td>{amount.subTotal}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.invoices.itbms')}</td>
                      <td>{amount.itbms}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>{t('pages.common.Total')}</td>
                      <td>{amount.total}</td>
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
                  value={status}
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

export default EditInvoice
