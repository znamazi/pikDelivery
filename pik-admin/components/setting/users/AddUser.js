import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'

import { toast } from 'react-toastify'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import permissions from '../../../../node-back/src/api/permisions'
import axios from '../../../utils/axios'
import HeaderContent from '../../layouts/HeaderContent'
import { Alert, AlertTitle } from '@material-ui/lab'
import { validationEmail } from 'utils/utils'
import { useTranslation } from 'react-i18next'

const AddUser = (props) => {
  const [error, setError] = useState('')
  const { t } = useTranslation()

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Admin',
    permissions: {},
    enabled: true
  })
  const [dataEdit, setDataEdit] = useState({})
  const router = useRouter()
  const { id } = router.query
  const { getConfirmation } = useConfirmationDialog()
  if (props.mode === 'edit') {
    useEffect(() => {
      let user = props.users.find((item) => item._id === id)
      if (user) setNewUser(user)
      else
        axios
          .get(`admin/user/retrieve/${id}`)
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
    let fieldName = e.target.id
    setNewUser({ ...newUser, [fieldName]: e.target.value })
    setDataEdit({ ...dataEdit, [fieldName]: e.target.value })
  }
  const handleCheck = (e) => {
    const value = e.target.checked ? 'Super Admin' : 'Admin'
    setNewUser({ ...newUser, role: value })
    setDataEdit({ ...dataEdit, role: value })
  }
  const handleRadio = (e) => {
    const value = e.target.value === 'true' ? true : false
    setNewUser({ ...newUser, [e.target.id]: value })
    setDataEdit({ ...dataEdit, [e.target.id]: value })
  }
  const handlePermission = (e) => {
    let fieldName = e.target.id
    let result = 0
    let userPermission = !newUser.hasOwnProperty('permissions')
      ? { ...newUser, permissions: {} }
      : { ...newUser }
    result = e.target.checked
      ? userPermission.permissions[fieldName]
        ? userPermission.permissions[fieldName] + parseInt(e.target.value)
        : 0 + parseInt(e.target.value)
      : userPermission.permissions[fieldName] - parseInt(e.target.value)
    setNewUser({
      ...newUser,
      permissions: { ...newUser.permissions, [fieldName]: result }
    })
    setDataEdit({
      ...dataEdit,
      permissions: { ...newUser.permissions, [fieldName]: result }
    })
  }
  const cancelForm = () => {
    setNewUser({
      name: '',
      username: '',
      email: '',
      password: '',
      permissions: {}
    })
    setDataEdit({})
    router.push('/settings')
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
    if (!!!newUser.password) {
      setError(t('errors.enter_password'))
      return
    }
    let data =
      props.mode === 'edit'
        ? dataEdit
        : newUser.hasOwnProperty('permissions')
        ? { ...newUser }
        : { ...newUser, permissions: {} }
    const url =
      props.mode === 'edit' ? `admin/user/update/${id}` : 'admin/user/create'
    const method = props.mode === 'edit' ? 'post' : 'post'
    const message =
      props.mode === 'edit'
        ? t('pages.setting.user_updated_successfuly')
        : t('pages.setting.user_created_successfuly')
    axios[method](url, data)
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          setNewUser({ permissions: {} })
          setDataEdit({})
          router.push('/settings')
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
        .post(`admin/user/delete/${id}`)
        .then(({ data }) => {
          if (data.success) {
            toast.success(t('pages.setting.user_deleted_successfuly'))
            router.push('/settings')
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

  let tableContent = Object.keys(permissions.AdminUser).map((per) => (
    <tr key={per}>
      <td>{permissions.AdminUser[per]}</td>
      <td style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          className="form-check-input"
          id={permissions.AdminUser[per]}
          value={1}
          checked={
            newUser.permissions &&
            (newUser.permissions[permissions.AdminUser[per]] == 3 ||
              newUser.permissions[permissions.AdminUser[per]] == 1)
          }
          onChange={(e) => handlePermission(e)}
        />
      </td>
      <td style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          className="form-check-input"
          id={permissions.AdminUser[per]}
          value={2}
          checked={
            newUser.permissions &&
            (newUser.permissions[permissions.AdminUser[per]] == 3 ||
              newUser.permissions[permissions.AdminUser[per]] == 2)
          }
          onChange={(e) => handlePermission(e)}
        />
      </td>
    </tr>
  ))

  return (
    <>
      <HeaderContent>
        <li
          onClick={() => router.push('/settings')}
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
              {props.mode === 'edit'
                ? t('pages.setting.edit_user')
                : t('pages.setting.add_user')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column border-gray">
            <div className="row">
              <div className="col-lg-4 border-right border-right-dark">
                {/* <form id="addNewUser"> */}
                <div className="form-group">
                  <label htmlFor="name">{t('information.Name')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={newUser['name']}
                    onChange={(e) => handleData(e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="user">{t('information.User')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={newUser['username']}
                    onChange={(e) => handleData(e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emial">{t('information.Email')}</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={newUser['email']}
                    onChange={(e) => handleData(e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">{t('information.Password')}</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={newUser['password']}
                    onChange={(e) => handleData(e)}
                  />
                </div>
                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="superAdmin"
                    checked={newUser['role'] == 'Super Admin' ? true : false}
                    onChange={(e) => handleCheck(e)}
                  />
                  <label className="form-check-label" htmlFor="superAdmin">
                    {t('information.super_admin')}
                  </label>
                </div>
                <div className="form-group">
                  <label htmlFor="password">{t('information.Status')}</label>
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
                <table className="table table-striped table-responsive">
                  <thead>
                    <tr>
                      <th scope="col" className="col-3">
                        {t('pages.setting.section')}
                      </th>
                      <th scope="col"> {t('pages.setting.read')}</th>
                      <th scope="col"> {t('pages.setting.edit')}</th>
                    </tr>
                  </thead>
                  <tbody>{tableContent}</tbody>
                </table>
              </div>
            </div>
            {props.mode === 'edit' && (
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
                  {t('information.Cancel')}
                </button>

                <button className="btn btn-success" onClick={submitForm}>
                  <i className="fa fa-save mr-2"></i> {t('information.Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default connect((state) => ({
  users: state.users.users
}))(AddUser)
