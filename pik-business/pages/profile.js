import React, { useState, useEffect } from 'react'
import { Alert } from '@material-ui/lab'
import { useTranslation } from 'react-i18next'
import axios from '../utils/axios'
import { useAuth } from '../utils/next-auth'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

const profile = () => {
  const [error, setError] = useState('')
  const { t } = useTranslation()
  let auth = useAuth()
  const router = useRouter()
  const id = auth.user.id
  const [user, setUser] = useState({})
  const [userData, setUserData] = useState({})

  useEffect(() => {
    axios
      .get(`business/user/retrieve/${id}`)
      .then(({ data }) => {
        if (data.success) {
          setUser(data.user)
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

  const handleData = (e) => {
    setError('')
    let fieldName = e.target.id
    setUserData({ ...userData, [fieldName]: e.target.value })
    setUser({ ...user, [fieldName]: e.target.value })
  }
  const cancelForm = () => {
    setUserData({})
    router.back()
  }
  const submitForm = () => {
    setError('')
    if (password in userData && userData.password.length === 0) {
      setError(t('errors.enter_password'))
      return
    }

    axios
      .post(`business/user/update/profile/${id}`, { ...userData })
      .then(({ data }) => {
        if (data.success) {
          toast.success(t('pages.setting.profile_updated_successfuly'))
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
    <div className="col-lg-12">
      <div className="card card-custom card-stretch gutter-b p-15">
        {error && <Alert severity="error">{error}</Alert>}

        <div className="p-5">
          <h3 className="card-title font-weight-bolder d-inline ">
            {t('header.edit_profile')}
          </h3>
        </div>
        <div className="card-body d-flex flex-column border-gray">
          <div className="row">
            <div className="form-group col-md-6">
              <label htmlFor="firstName">{t('information.firstName')}</label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                value={user['firstName']}
                onChange={(e) => handleData(e)}
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="firstName">{t('information.lastName')}</label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                value={user['lastName']}
                onChange={(e) => handleData(e)}
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="emial">{t('information.email')}</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={user['email']}
                onChange={(e) => handleData(e)}
                disabled
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="password">{t('information.password')}</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={user['password']}
                onChange={(e) => handleData(e)}
              />
            </div>

            {/* <div className="form-group col-md-6">
              <label htmlFor="password">{t('information.status')}</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="enabled"
                    value={true}
                    checked={user['enabled'] ? true : false}
                    disabled
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
                    checked={user['enabled'] ? false : true}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="disabled">
                    {t('information.disabled')}
                  </label>
                </div>
              </div>
            </div> */}
          </div>
          <div className="row">
            <div className="col-12 d-flex justify-content-end">
              <div className="btn-save-cancel">
                <button className="btn btn-light mr-2" onClick={cancelForm}>
                  {t('information.cancel')}
                </button>
                <button className="btn btn-success " onClick={submitForm}>
                  <i className="fa fa-save mr-2"></i> {t('information.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default profile
