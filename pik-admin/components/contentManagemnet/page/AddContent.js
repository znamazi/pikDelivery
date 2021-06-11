import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { Alert } from '@material-ui/lab'

import axios from '../../../utils/axios'
import HeaderContent from '../../layouts/HeaderContent'
import TinyMCE from '../TinyMCE'

const AddContent = ({ backFun, mode }) => {
  const { t } = useTranslation()

  const router = useRouter()
  const [page, setPage] = useState({
    content: ''
  })
  const [error, setError] = useState('')

  const { id } = router.query
  useEffect(() => {
    if (mode === 'edit') {
      axios
        .get(`/admin/content/page/retrieve/${id}`)
        .then(({ data }) => {
          if (data.success) {
            setPage(data.content)
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
  }, [])
  const submitForm = () => {
    setError('')
    if (!!!page.title) {
      setError(t('errors.enter_title'))
      return
    }

    let url =
      mode === 'edit'
        ? `/admin/content/page/update/${id}`
        : '/admin/content/page/create'
    let message =
      mode === 'edit'
        ? t('pages.content.page_updated_successfuly')
        : t('pages.content.page_created_successfuly')
    axios
      .post(url, { ...page })
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          router.push({
            pathname: '/contentManagement',
            query: { tab: 'content' }
          })
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

  const onEditorChange = (data) => {
    setPage({ ...page, content: data })
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/contentManagement',
              query: { tab: 'content' }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.content.content')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/contentManagement',
              query: { tab: 'faqs' }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.content.faqs')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/contentManagement',
              query: { tab: 'faqCategories' }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.content.faq_categories')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-body">
            <div className="row">
              <div className="col-10">
                {error && <Alert severity="error">{error}</Alert>}
              </div>
            </div>
            <div className="row">
              <div className="col-lg-10">
                <div className="form-group">
                  <label htmlFor="name">{t('pages.common.Title')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={page.title}
                    onChange={(e) =>
                      setPage({ ...page, title: e.target.value })
                    }
                  />
                </div>
                <div className="form-row">
                  <div className="col mb-3">
                    <label>{t('pages.common.content')}</label>
                    <TinyMCE
                      onEditorChange={(data) => onEditorChange(data)}
                      data={page.content}
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-2 d-flex flex-center">
                <button className="btn btn-success" onClick={submitForm}>
                  {t('information.Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddContent
