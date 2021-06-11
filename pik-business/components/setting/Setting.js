import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import HeaderContent from '../layouts/HeaderContent'
import Setup from '../setup/Setup'
import UsersList from './users/UsersList'
import BeforeSetup from 'components/partials/BeforeSetup'
import { useTranslation } from 'react-i18next'

const Setting = (props) => {
  const { t } = useTranslation()

  let defaultTab = props.tab ? props.tab : 'business'
  const [tab, setTab] = useState(defaultTab)

  let userTab = props.business.businessExist ? (
    <UsersList />
  ) : (
    <BeforeSetup title="user" />
  )

  let content = <Setup mode="edit" type="business" />
  switch (tab) {
    case 'business':
      content = <Setup mode="edit" type="business" />
      break
    case 'hours':
      content = <Setup mode="edit" type="hours" />
      break
    case 'users':
      content = userTab
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() => setTab('business')}
          className={`menu-item menu-item-submenu ${
            tab === 'business' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.setting.my_business')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() => setTab('hours')}
          className={`menu-item menu-item-submenu ${
            tab === 'hours' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.setting.hours')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>

        <li
          onClick={() => setTab('users')}
          className={`menu-item menu-item-submenu ${
            tab === 'users' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.setting.users')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      {content}
    </>
  )
}
export default connect((state) => ({
  business: state.business
}))(Setting)
