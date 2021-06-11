import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import { toast } from 'react-toastify'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import axios from '../../../utils/axios'
import HeaderContent from '../../layouts/HeaderContent'
import { Alert, AlertTitle } from '@material-ui/lab'
import { useTranslation } from 'react-i18next'
import { CircularProgress } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    width: '16px !important',
    height: '16px !important',
    marginLeft: theme.spacing(1),
    color: '#fff'
  }
}))

const AddBanner = (props) => {
  const [error, setError] = useState('')
  const { t } = useTranslation()
  const classes = useStyles()
  const [sending, setSending] = useState(false)

  const [newBanner, setNewBanner] = useState({
    title: '',
    file: '',
    // description: '',
    // discount: '',
    preview: '',
    expiration: '',
    published: true
  })
  const router = useRouter()
  const { id } = router.query
  const { getConfirmation } = useConfirmationDialog()
  if (props.mode === 'edit') {
    useEffect(() => {
      axios
        .get(`admin/setting/banner/retrieve/${id}`)
        .then(({ data }) => {
          if (data.success) {
            setNewBanner(data.banner)
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
    setNewBanner({ ...newBanner, [fieldName]: e.target.value })
  }

  const handleRadio = (e) => {
    const value = e.target.value === 'true' ? true : false
    setNewBanner({ ...newBanner, [e.target.id]: value })
  }

  const cancelForm = () => {
    setNewBanner({
      title: '',
      file: '',
      fileName: '',
      expiration: '',
      published: true
    })
    router.push({ pathname: '/settings', query: { tab: 3 } })
  }

  const uploadBanner = (e) => {
    const file = e.currentTarget.files[0]
    setNewBanner({
      ...newBanner,
      file,
      fileName: file.name,
      preview: URL.createObjectURL(file)
    })
  }

  const submitForm = () => {
    setError('')

    if (!!!newBanner.title) {
      setError(t('errors.enter_title'))
      return
    }

    // if (newBanner.discount > 100 || newBanner.discount < 0) {
    //   setError(t('errors.error_range'))
    //   return
    // }
    setSending(true)
    const data = new FormData()
    data.append('file', newBanner.file)
    data.append('filename', newBanner.fileName)
    data.append('title', newBanner.title)
    data.append('expiration', newBanner.expiration)
    data.append('published', newBanner.published)
    // data.append('description', newBanner.description)
    // data.append('discount', newBanner.discount)

    const url =
      props.mode === 'edit'
        ? `admin/setting/banner/update/${id}`
        : 'admin/setting/banner/create'
    const message =
      props.mode === 'edit'
        ? t('pages.setting.banner_updated_successfuly')
        : t('pages.setting.banner_created_successfuly')
    axios['post'](url, data)
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          router.push({ pathname: '/settings', query: { tab: 3 } })
          setSending(false)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          setError(errorMessage)
          setSending(false)
        }
      })
      .catch((error) => {
        setSending(false)

        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        setError(errorMessage)
      })
  }

  const deleteBanner = async (e) => {
    e.preventDefault()
    const confirmed = await getConfirmation({
      title: t('pages.setting.attention'),
      message: t('pages.setting.message_delete_banner', {
        title: newBanner.title
      })
    })

    if (confirmed) {
      axios
        .post(`admin/setting/banner/delete/${id}`)
        .then(({ data }) => {
          if (data.success) {
            toast.success(t('pages.setting.banner_deleted_successfuly'))
            router.push({ pathname: '/settings', query: { tab: 3 } })
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
          onClick={() => router.push('/settings')}
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.settings')}</span>
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
                ? t('pages.setting.edit_banner')
                : t('pages.setting.add_banner')}
            </h3>
          </div>
          <div className="card-body d-flex flex-column border-gray">
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="name">{t('information.Title')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={newBanner.title}
                  onChange={(e) => handleData(e)}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="date">{t('information.expiration')}</label>
                <DatePicker
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  selected={
                    newBanner.expiration
                      ? new Date(newBanner.expiration)
                      : newBanner.expiration
                  }
                  onChange={(date) => {
                    setNewBanner({
                      ...newBanner,
                      expiration: date
                    })
                  }}
                />
              </div>
              {/* <div className="form-group col-md-6">
                <label htmlFor="name">{t('pages.common.Description')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  value={newBanner.description}
                  onChange={(e) => handleData(e)}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="name">{t('pages.invoices.discount')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="discount"
                  value={newBanner.discount}
                  onChange={(e) => handleData(e)}
                />
              </div> */}
              <div className="form-group col-md-6">
                <label htmlFor="formFile" className="form-label">
                  {t('information.banner')}
                </label>

                <input
                  className="form-control"
                  type="file"
                  id="formFile"
                  onChange={(e) => uploadBanner(e)}
                  name="file"
                />
              </div>

              {(newBanner.preview || newBanner.file) && (
                <div className="form-group col-md-12 h-150px">
                  <img
                    src={newBanner.preview ? newBanner.preview : newBanner.file}
                    alt={newBanner.title}
                    className="h-150px"
                  />
                </div>
              )}
            </div>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="password">{t('information.Status')}</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inlineRadioOptions"
                      id="published"
                      value={true}
                      checked={newBanner['published'] ? true : false}
                      onChange={(e) => handleRadio(e)}
                    />
                    <label className="form-check-label" htmlFor="published">
                      {t('status.Active')}
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inlineRadioOptions"
                      id="published"
                      value={false}
                      checked={newBanner['published'] ? false : true}
                      onChange={(e) => handleRadio(e)}
                    />
                    <label className="form-check-label" htmlFor="disabled">
                      {t('status.InActive')}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {props.mode === 'edit' && (
              <div className="row mb-2">
                <div className="col-lg-3">
                  <button
                    className="btn btn-danger width-100-percent"
                    onClick={(e) => deleteBanner(e)}
                  >
                    {t('pages.setting.delete_banner')}
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
                  {sending && (
                    <CircularProgress className={classes.circularProgress} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddBanner
