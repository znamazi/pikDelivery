import React, { useState, useEffect } from 'react'
import { Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'

import SubHeaderContent from '../layouts/SubHeaderContent'
import { useConfirmationDialog } from '../../metronic/partials/modal/ConfirmationDialog'
import PersonalInfo from '../../metronic/partials/PersonalInfo'
import axios from '../../utils/axios'
import { useAuth } from 'utils/next-auth'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Alert, AlertTitle } from '@material-ui/lab'
import { validationEmail } from 'utils/utils'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  large: {
    width: theme.spacing(10),
    height: theme.spacing(10)
  }
}))

const OrderInfo = ({ customer }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const classes = useStyles()
  let auth = useAuth()
  const [edit, setEdit] = useState(false)
  const [relatedEmailMain, setRelatedEmailMain] = useState([])
  const [relatedEmail, setRelatedEmail] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let data = {
      business: auth.user.business,
      customer: customer._id
    }
    axios
      .post('business/customer/relatedEmail/list', data)
      .then(({ data }) => {
        if (data.success) {
          let result = data.relatedEmails ? data.relatedEmails.emails : ['']
          result = result.length > 0 ? result : ['']
          setRelatedEmail(result)
          setRelatedEmailMain(result)
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

  const { getConfirmation } = useConfirmationDialog()

  const handleConfirm = async () => {
    const confirmed = await getConfirmation({
      title: t('pages.customers.sure_delete_user'),
      message: t('pages.customers.message_delete')
    })

    if (confirmed) {
      axios
        .post(`business/customer/delete/${customer._id}`)
        .then(({ data }) => {
          if (data.success) {
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
  }

  const removeRelatedEmail = (email) => {
    let newEmails = relatedEmail.filter((item) => item !== email)
    newEmails = newEmails.length > 0 ? newEmails : ['']
    setRelatedEmail(newEmails)
  }
  const addRelatedEmail = () => {
    if (!!!relatedEmail[relatedEmail.length - 1]) {
      setError(t('errors.enter_email'))
      return
    }
    setRelatedEmail([...relatedEmail, ''])
  }
  const changeEmail = (e, index) => {
    setError('')

    let newEmail = relatedEmail.slice()
    newEmail[index] = e.target.value
    setRelatedEmail(newEmail)
  }
  const checkValidation = (e) => {
    setError('')
    let email = e.target.value
    if (!!!email) {
      setError(t('errors.enter_email'))
      return
    }
    if (!validationEmail(email)) {
      setError(t('errors.email_address_not_correct'))
      return
    }
  }
  const handleCancel = () => {
    setRelatedEmail(relatedEmailMain)
    setEdit(false)
    setError('')
  }
  const handleSave = () => {
    if (error) return
    let data = {
      business: auth.user.business,
      customer: customer._id,
      emails: relatedEmail
    }
    axios
      .post('business/customer/relatedEmail', data)
      .then(({ data }) => {
        if (data.success) {
          setEdit(false)
          setRelatedEmailMain(relatedEmail)
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
      <SubHeaderContent title={`${customer.firstName} ${customer.lastName}`}>
        {customer.status == 'Not Registered' && (
          <span className="btn btn-light">
            {t('pages.customers.non_registerd')}
          </span>
        )}
        {customer.status !== 'Not Registered' && (
          <span className="btn bg-modal-primary">
            {t('pages.common.active')}
          </span>
        )}

        <button className="ml-3 btn btn-white" onClick={() => router.back()}>
          {t('pages.common.go_back')}
        </button>
      </SubHeaderContent>
      <div className="col-lg-4">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              {t('pages.orders.order_information')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column">
            <div className="row">
              <div className="col-lg-12">
                {customer.status !== 'Not Registered' ? (
                  <PersonalInfo
                    firstName={customer.firstName}
                    lastName={customer.lastName}
                    avatar={customer.avatar}
                    email={customer.email}
                    mobile={customer.mobile}
                  />
                ) : (
                  <PersonalInfo
                    firstName={customer.firstName}
                    lastName={customer.lastName}
                    email={customer.email}
                  />
                )}

                {customer.status == 'Not Registered' && (
                  <div>
                    <button className="btn btn-light mt-5">
                      {t('pages.customers.non_registerd')}
                    </button>
                  </div>
                )}
                <div className="mt-10">
                  {customer.status !== 'Not Registered' && (
                    <div className="mb-7">
                      <p className="font-weight-bolder text-dark-75  font-size-lg">
                        {t('pages.customers.related_emails')}
                      </p>
                      <p>{t('pages.customers.related_emails_desc')}</p>
                      {error && <Alert severity="error">{error}</Alert>}
                      <div className="pt-5">
                        {!edit && (
                          <>
                            {relatedEmail.map((email, index) => (
                              <p key={index}>{email}</p>
                            ))}
                            <a
                              className="text-primary"
                              onClick={() => setEdit(true)}
                            >
                              {t('pages.customers.edit_related_emails')}
                            </a>
                          </>
                        )}
                        {edit && (
                          <>
                            {relatedEmail.map((email, index) => {
                              return (
                                <div key={index} className="mb-3">
                                  <input
                                    value={email}
                                    className="form-control d-inline-block width-75-percent"
                                    onChange={(e) => changeEmail(e, index)}
                                    onBlur={(e) => checkValidation(e)}
                                  />
                                  <a onClick={() => removeRelatedEmail(email)}>
                                    <i className="fa fa-minus ml-3"></i>
                                  </a>

                                  {relatedEmail[index + 1] === undefined && (
                                    <a onClick={() => addRelatedEmail(email)}>
                                      <i className="fa fa-plus ml-1"></i>
                                    </a>
                                  )}
                                </div>
                              )
                            })}

                            <div className="d-flex justify-conten-start">
                              <button
                                className="btn btn-light mr-2"
                                onClick={handleCancel}
                              >
                                {t('information.cancel')}
                              </button>
                              <button
                                className="btn btn-primary"
                                onClick={handleSave}
                              >
                                {t('information.save')}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {customer.status == 'Not Registered' && (
                  <div>
                    <button className="btn btn-danger" onClick={handleConfirm}>
                      {t('pages.customers.delete_record')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderInfo
