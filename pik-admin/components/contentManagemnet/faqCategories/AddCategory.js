import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { Alert, AlertTitle } from '@material-ui/lab'

import axios from '../../../utils/axios'
import HeaderContent from '../../layouts/HeaderContent'
import FaqTypes from '../../../../node-back/src/constants/FaqTypes'
import { useTranslation } from 'react-i18next'

const AddCategory = ({ backFun, mode }) => {
  const { t } = useTranslation()

  const router = useRouter()
  const [data, setData] = useState({
    published: true
  })
  const { id } = router.query
  const [error, setError] = useState('')
  useEffect(() => {
    if (mode === 'edit') {
      axios
        .get(`/admin/content/faq-cat/retrieve/${id}`)
        .then(({ data }) => {
          if (data.success) {
            setData(data.faqCategories)
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
    if (!!!data.category) {
      setError(t('errors.enter_title'))
      return
    }
    if (!!!data.type) {
      setError(t('errors.select_type'))
      return
    }
    let url =
      mode === 'edit'
        ? `/admin/content/faq-cat/update/${id}`
        : '/admin/content/faq-cat/create'
    let message =
      mode === 'edit'
        ? t('pages.content.faq_category_updated_successfuly')
        : t('pages.content.faq_category_created_successfuly')
    axios
      .post(url, { ...data })
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          router.push({
            pathname: '/contentManagement',
            query: { tab: 'faqCategories' }
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
              <div className="col-lg-12 mb-5">
                {error && <Alert severity="error">{error}</Alert>}
              </div>

              <div className="col-lg-7">
                <div className="form-group">
                  <label htmlFor="name">{t('pages.common.Title')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="category"
                    value={data['category']}
                    autoFocus
                    onChange={(e) =>
                      setData({ ...data, category: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">{t('pages.common.Type')}</label>
                  <select
                    className="form-control"
                    id="type"
                    value={data['type']}
                    onChange={(e) => setData({ ...data, type: e.target.value })}
                  >
                    <option value="">Select</option>
                    {Object.keys(FaqTypes).map((type, index) => (
                      <option value={type} key={index}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="published"
                    checked={data['published']}
                    onChange={(e) =>
                      setData({ ...data, published: e.target.checked })
                    }
                  />
                  <label className="form-check-label" htmlFor="published">
                    {t('pages.common.Publish')}
                  </label>
                </div>
              </div>
              <div className="col-lg-5 d-flex flex-center">
                <button
                  className="btn btn-success width-100-percent"
                  onClick={submitForm}
                >
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

export default AddCategory
