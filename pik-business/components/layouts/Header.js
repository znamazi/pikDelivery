import React from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
// import { LanguageSelectorDropdown } from './LanguageSelectorDropdown'

import ButtonSearch from 'metronic/partials/ButtonSearch'
import { useAuth } from '../../utils/next-auth'
import InfoUser from './InfoUser'
import { useLayout } from './layoutProvider'

const Header = (props) => {
  let auth = useAuth()
  const layout = useLayout()
  const router = useRouter()
  const { t } = useTranslation()

  const { showTopBar } = layout

  const handleSearch = (value) => {
    router.push({
      pathname: '/orders',
      query: { query: value, search: true }
    })
  }
  return (
    <div id="kt_header" className="header header-fixed">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div
          className={`header-menu-wrapper header-menu-wrapper-left ${
            showTopBar ? 'mt-55' : ''
          }`}
          id="kt_header_menu_wrapper"
        >
          <div
            id="kt_header_menu"
            className="header-menu header-menu-mobile header-menu-layout-default"
          ></div>
        </div>

        <div className={`topbar ${showTopBar ? 'mt-55' : ''}`}>
          {auth.user.enabled && (
            <>
              {props.business && (
                <div className="align-items-center marginAuto">
                  <Link href="/order/add" as="/order/add">
                    <button className="btn btn-primary">
                      <i className="fa fa-plus-square mr-2 text-white "></i>
                      {t('pages.orders.new_order')}
                    </button>
                  </Link>
                </div>
              )}
              <div className="quick-search" id="kt_quick_search_dropdown">
                <div className="quick-search-form">
                  <div className="input-group">
                    <ButtonSearch />

                    <input
                      type="text"
                      className="form-control"
                      autoComplete="off"
                      placeholder={t('header.search_order')}
                      onKeyUp={(e) => {
                        e.preventDefault()
                        if (e.keyCode == 13 || e.target.value === '')
                          handleSearch(e.target.value)
                      }}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text">
                        <i className="quick-search-close ki ki-close icon-sm text-muted"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* <LanguageSelectorDropdown /> */}
          <InfoUser />
        </div>
      </div>
    </div>
  )
}

export default connect((state) => ({
  business: state.business.businessExist
}))(Header)
