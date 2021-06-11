import React, { Fragment, useEffect } from 'react'
import HeaderMobile from './HeaderMobile'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import ContentWrapper from './ContentWrapper'
import SideUserPan from './SideUserPan'
import { useLayout } from './layoutProvider'
import actions from 'store/actions'
import { connect } from 'react-redux'
import HeadPage from '../partials/HeadPage'
import { useAuth } from 'utils/next-auth'

const Layout = (props) => {
  const layout = useLayout()
  const { showTopBar } = layout

  const auth = useAuth()
  useEffect(() => {
    props.setBuisness()
  }, [])
  return (
    <>
      <HeadPage title="PIK Business" />

      <div
        style={{ display: 'flex', flex: 1 }}
        id="kt_body"
        className={`header-fixed header-mobile-fixed ${
          layout.hasSubHeader ? 'subheader-enabled subheader-fixed' : ''
        } aside-enabled aside-fixed aside-minimize-hoverable ${
          layout.asideMinimized ? 'aside-minimize' : ''
        }`}
      >
        <HeaderMobile />
        <div className="d-flex flex-column flex-root">
          <div className="d-flex flex-row flex-column-fluid page">
            <Sidebar />
            <div
              className="d-flex flex-column flex-row-fluid wrapper"
              id="kt_wrapper"
            >
              <Header />
              <div id="addSubHeader"></div>

              <div
                className={`content d-flex flex-column flex-column-fluid ${
                  showTopBar ? 'mt-55' : ''
                }`}
                id="kt_content"
              >
                {auth.user.enabled && (
                  <ContentWrapper>{props.children}</ContentWrapper>
                )}
              </div>
              {/* <Footer /> */}
            </div>
          </div>
        </div>
        {/* <SideUserPan /> */}
      </div>
    </>
  )
}

export default connect('', (dispatch) => ({
  setBuisness: () => {
    dispatch({
      type: actions.BUSINESS_INIT_REQUESTED
    })
  }
}))(Layout)
