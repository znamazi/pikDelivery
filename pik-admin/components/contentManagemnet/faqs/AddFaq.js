import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { Alert } from '@material-ui/lab'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

import axios from '../../../utils/axios'
import HeaderContent from '../../layouts/HeaderContent'
import FaqTypes from '../../../../node-back/src/constants/FaqTypes'
import TinyMCE from '../TinyMCE'

const AddFaq = (props) => {
  const { t } = useTranslation()

  const router = useRouter()
  const [faq, setFaq] = useState({
    answer: ''
  })
  const [error, setError] = useState('')
  let category = []
  // const [category, setCategory] = useState([])
  const [allCategories, setAllCategories] = useState(props.faqCategories)
  const { id } = router.query
  useEffect(() => {
    if (category.length === 0) {
      axios
        .post('/admin/content/faq-cat/list', {
          filter: {},
          sortOrder: 'desc', // asc||desc
          sortField: 'createdAt',
          pageNumber: 0,
          pageSize: 100
        })
        .then(({ data }) => {
          if (data.success) {
            setAllCategories(data.faqCategories)
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
    if (props.mode === 'edit') {
      let data = props.faqsInfo.find((item) => item._id === id)
      if (data) {
        setFaq(data)
      } else {
        axios
          .get(`/admin/content/faq/retrieve/${id}`)
          .then(({ data }) => {
            if (data.success) {
              setFaq(data.faq)
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
  }, [])
  const submitForm = () => {
    setError('')
    if (!!!faq.question) {
      setError(t('errors.enter_question'))
      return
    }
    if (!!!faq.answer) {
      setError(t('errors.enter_answer'))
      return
    }

    if (!!!faq.type) {
      setError(t('errors.select_type'))
      return
    }
    if (!!!faq.category) {
      setError(t('errors.select_category'))
      return
    }
    let url =
      props.mode === 'edit'
        ? `/admin/content/faq/update/${id}`
        : '/admin/content/faq/create'
    let message =
      props.mode === 'edit'
        ? t('pages.content.faq_updated_successfuly')
        : t('pages.content.faq_created_successfuly')
    axios
      .post(url, { ...faq })
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          router.push({
            pathname: '/contentManagement',
            query: { tab: 'faqs' }
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
  const changeType = (e) => {
    const type = e.target.value
    setFaq({ ...faq, type })
    category = allCategories.filter((item) => item.type == type)
  }
  const onEditorChange = (data) => {
    setFaq({ ...faq, answer: data })
  }
  category = allCategories.filter((item) => item.type == faq.type)

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
      <div className="row">
        <div className="col-lg-9">
          <div className="card card-custom card-stretch gutter-b">
            <div className="card-body">
              <div className="row">
                {error && <Alert severity="error">{error}</Alert>}

                <div className="form-group col-12">
                  <label htmlFor="name">{t('pages.content.Question')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="question"
                    value={faq['question']}
                    onChange={(e) =>
                      setFaq({ ...faq, question: e.target.value })
                    }
                  />
                </div>

                <div className="form-group col-12 mb-3">
                  {/* <div className="col-12 mb-3"> */}
                  <label>{t('pages.content.Answer')}</label>
                  <TinyMCE
                    onEditorChange={(data) => onEditorChange(data)}
                    data={faq.answer}
                  />
                  {/* </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="card card-custom card-stretch gutter-b">
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="type">{t('pages.common.Type')}</label>
                <select
                  className="form-control"
                  id="type"
                  value={faq['type']}
                  onChange={changeType}
                >
                  <option value="">Select</option>
                  {Object.keys(FaqTypes).map((type, index) => (
                    <option value={type} key={index}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">{t('information.Status')}</label>
                <select
                  className="form-control"
                  id="status"
                  value={faq['published']}
                  onChange={(e) =>
                    setFaq({ ...faq, published: e.target.value })
                  }
                >
                  <option value={true}>{t('status.PUBLISHED')}</option>
                  <option value={false}>{t('status.INACTIVE')}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="category">{t('pages.content.Category')}</label>
                <select
                  className="form-control"
                  id="category"
                  value={faq['category']}
                  onChange={(e) => setFaq({ ...faq, category: e.target.value })}
                >
                  <option value="">Select</option>

                  {category.map((item) => {
                    if (item.published)
                      return (
                        <option value={item._id} key={item._id}>
                          {item.category}
                        </option>
                      )
                  })}
                </select>
              </div>
              <div>
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
export default connect((state) => ({
  faqsInfo: state.faqs.faqsList,
  faqCategories: state.faqCats.faqCategories
}))(AddFaq)
