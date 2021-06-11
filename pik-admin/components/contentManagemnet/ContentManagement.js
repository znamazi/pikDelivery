import React, { useState, useEffect, useMemo } from 'react'
import HeaderContent from '../layouts/HeaderContent'
import Contents from './page/Contents'
import Faqs from './faqs/Faqs'
import FaqCategories from './faqCategories/FaqCategories'
import actions from 'store/actions'
import { connect } from 'react-redux'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import { useTranslation } from 'react-i18next'

const ContentManagement = (props) => {
  const { t } = useTranslation()

  let defaultTab = props.tab ? props.tab : 'content'
  const [tab, setTab] = useState(defaultTab)

  useEffect(() => {
    props.getData({
      filter: {},
      sortOrder: 'desc', // asc||desc
      sortField: 'createdAt',
      pageNumber: 0,
      pageSize: 100
    })
  }, [])
  let content = <Contents />
  switch (tab) {
    case 'content':
      content = <Contents />
      break
    case 'faqs':
      content = (
        <DTUIProvider>
          <Faqs tab={tab} />
        </DTUIProvider>
      )
      break
    case 'faqCategories':
      content = (
        <DTUIProvider>
          <FaqCategories tab={tab} />
        </DTUIProvider>
      )
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() => setTab('content')}
          className={`menu-item menu-item-submenu ${
            tab === 'content' ? 'menu-item-active' : ''
          }`}
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
          onClick={() => setTab('faqs')}
          className={`menu-item menu-item-submenu ${
            tab === 'faqs' ? 'menu-item-active' : ''
          }`}
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
          onClick={() => setTab('faqCategories')}
          className={`menu-item menu-item-submenu ${
            tab === 'faqCategories' ? 'menu-item-active' : ''
          }`}
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
      {content}
    </>
  )
}

export default connect('', (dispatch) => ({
  getData: (queryParams) => {
    dispatch({
      type: actions.FAQCAT_REQUESTED,
      payload: { ...queryParams }
    })
  }
}))(ContentManagement)
