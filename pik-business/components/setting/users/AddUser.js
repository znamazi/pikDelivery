import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import permissions from '../../../../node-back/src/api/permisions'
import axios from '../../../utils/axios'
import HeaderContent from '../../layouts/HeaderContent'
import { useAuth } from '../../../utils/next-auth'
import { Alert } from '@material-ui/lab'
import { validationEmail } from 'utils/utils'
import { useTranslation } from 'react-i18next'

const AddUser = ({ mode }) => {
  let auth = useAuth()
  const { t } = useTranslation()

  const [error, setError] = useState('')
  const [newUser, setNewUser] = useState({
    business: auth.user.business,
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    role: '',
    enabled: true
  })
  const router = useRouter()
  const { id } = router.query
  const { getConfirmation } = useConfirmationDialog()
  if (mode === 'edit') {
    useEffect(() => {
      axios
        .get(`business/user/retrieve/${id}`)
        .then(({ data }) => {
          if (data.success) {
            setNewUser(data.user)
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            setError(errorMessage)
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          setError(errorMessage)
        })
    }, [])
  }

  const handleData = (e) => {
    setError('')
    let fieldName = e.target.id
    setNewUser({ ...newUser, [fieldName]: e.target.value })
  }
  const handleCheck = (e) => {
    setNewUser({ ...newUser, role: e.target.id })
  }
  const handleRadio = (e) => {
    const value = e.target.value === 'true' ? true : false
    setNewUser({ ...newUser, [e.target.id]: value })
  }

  const cancelForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: ''
    })
    router.push({ pathname: '/settings', query: { tab: 'users' } })
  }
  const checkEmail = () => {
    setError('')

    if (!validationEmail(newUser.email)) {
      setError(t('errors.email_address_not_correct'))
      return
    }
  }
  const submitForm = () => {
    setError('')

    if (!!!newUser.email) {
      setError(t('errors.enter_email'))
      return
    }
    if (!validationEmail(newUser.email)) {
      setError(t('errors.email_address_not_correct'))
      return
    }
    if (!!!newUser.role) {
      setError(t('errors.select_role'))
      return
    }
    const url =
      mode === 'edit' ? `business/user/update/${id}` : 'business/user/create'
    const message =
      mode === 'edit'
        ? t('pages.setting.user_updated_successfuly')
        : t('pages.setting.user_created_successfuly')
    axios
      .post(url, { ...newUser })
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          setNewUser({ permissions: {} })
          router.push({ pathname: '/settings', query: { tab: 'users' } })
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          setError(errorMessage)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        setError(errorMessage)
      })
  }

  const deleteUser = async (e) => {
    e.preventDefault()
    const confirmed = await getConfirmation({
      title: t('pages.setting.attention'),
      message: t('pages.setting.message_delete_user', { name: newUser.name })
    })

    if (confirmed) {
      axios
        .post(`business/user/delete/${id}`)
        .then(({ data }) => {
          if (data.success) {
            toast.success(t('pages.setting.user_deleted_successfuly'))
            router.push({ pathname: '/settings', query: { tab: 'users' } })
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            setError(errorMessage)
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          setError(errorMessage)
        })
    }
  }

  return (
    <>
      <HeaderContent>
        <li
          onClick={() =>
            router.push({ pathname: '/settings', query: { tab: 'users' } })
          }
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.users')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b p-15">
          {error && <Alert severity="error">{error}</Alert>}

          <div className="p-5">
            <h3 className="card-title font-weight-bolder d-inline ">
              {mode === 'edit'
                ? t('pages.setting.edit_user')
                : t('pages.setting.add_user')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column border-gray">
            <div className="row">
              <div className="col-lg-4 border-right border-right-dark">
                {/* <form id="addNewUser"> */}
                <div className="form-group">
                  <label htmlFor="firstName">
                    {t('information.firstName')}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    value={newUser['firstName']}
                    onChange={(e) => handleData(e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">{t('information.lastName')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    value={newUser['lastName']}
                    onChange={(e) => handleData(e)}
                  />
                </div>
                {/* <div className="form-group">
                  <label htmlFor="user">{t('information.user')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="userName"
                    value={newUser['userName']}
                    onChange={(e) => handleData(e)}
                  />
                </div> */}
                <div className="form-group">
                  <label htmlFor="emial">{t('information.email')}</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={newUser['email']}
                    onChange={(e) => handleData(e)}
                    onBlur={checkEmail}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">{t('information.password')}</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={newUser['password']}
                    onChange={(e) => handleData(e)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">{t('information.status')}</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="inlineRadioOptions"
                        id="enabled"
                        value={true}
                        checked={newUser['enabled'] ? true : false}
                        onChange={(e) => handleRadio(e)}
                      />
                      <label className="form-check-label" htmlFor="enabled">
                        {t('information.enabled')}
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="inlineRadioOptions"
                        id="enabled"
                        value={false}
                        checked={newUser['enabled'] ? false : true}
                        onChange={(e) => handleRadio(e)}
                      />
                      <label className="form-check-label" htmlFor="disabled">
                        {t('information.disabled')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <p>{t('pages.setting.select_role')}</p>
                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="Manager"
                    checked={newUser['role'] == 'Manager' ? true : false}
                    onChange={(e) => handleCheck(e)}
                  />
                  <label className="form-check-label" htmlFor="Manager">
                    {t('pages.setting.manager')}
                  </label>
                  <p>{t('pages.setting.manager_responsibility')}</p>
                </div>
                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="Super Admin"
                    checked={newUser['role'] == 'Super Admin' ? true : false}
                    onChange={(e) => handleCheck(e)}
                  />
                  <label className="form-check-label" htmlFor="superAdmin">
                    {t('pages.setting.super_admin')}
                  </label>
                  <p>{t('pages.setting.super_admin_responsibility')}</p>
                </div>
              </div>
            </div>
            {mode === 'edit' && (
              <div className="row mb-2">
                <div className="col-lg-3">
                  <button
                    className="btn btn-danger width-100-percent"
                    onClick={(e) => deleteUser(e)}
                  >
                    {t('pages.setting.delete_user')}
                  </button>
                </div>
              </div>
            )}
            <div className="row ">
              <div className="col-lg-12 d-flex justify-content-end">
                <button className="btn btn-light mr-2" onClick={cancelForm}>
                  {t('information.cancel')}
                </button>

                <button className="btn btn-primary" onClick={submitForm}>
                  <i className="fa fa-save mr-2"></i> {t('information.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddUser
