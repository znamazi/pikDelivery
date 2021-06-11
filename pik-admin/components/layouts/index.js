import React, { Fragment, useEffect } from 'react'
import HeaderMobile from './HeaderMobile'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import ContentWrapper from './ContentWrapper'
import SideUserPan from './SideUserPan'
import { useLayout } from './layoutProvider'
import { requestFirebaseNotificationPermission } from '../../utils/firebaseNotification'
import axios from '../../utils/axios'
import { registerServiceWorker } from '../../utils/serviceWorker'
import HeadPage from '../partials/HeadPage'
import { useAuth } from 'utils/next-auth'
import PermissionDenied from '../partials/PermissionDenied'

const Layout = ({ children }) => {
  let auth = useAuth()
  const layout = useLayout()
  const { showTopBar } = layout

  registerServiceWorker()
  useEffect(() => {
    requestFirebaseNotificationPermission()
      .then((firebaseToken) => {
        axios
          .post('admin/user/firebaseToken', { firebaseToken })
          .then(({ data }) => {
            if (data.success) {
              // console.log('token save successfully')
            }
          })
          .catch((error) => {
            console.log(
              error?.response?.data?.message || 'Somethings went wrong'
            )
          })
      })
      .catch((err) => {
        return err
      })
  }, [])
  return (
    <div
      style={{ display: 'flex', flex: 1 }}
      id="kt_body"
      className={`header-fixed header-mobile-fixed ${
        layout.hasSubHeader ? 'subheader-enabled subheader-fixed' : ''
      } aside-enabled aside-fixed aside-minimize-hoverable ${
        layout.asideMinimized ? 'aside-minimize' : ''
      }`}
    >
      <HeadPage title="PIK Admin" />
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
            {layout.noContentWrapper ? (
              children
            ) : (
              <div
                className={`content d-flex flex-column flex-column-fluid ${
                  showTopBar ? 'mt-55' : ''
                }`}
                id="kt_content"
              >
                <ContentWrapper>{children}</ContentWrapper>
              </div>
            )}
            {/* <Footer /> */}
          </div>
        </div>
      </div>
      {/* <SideUserPan /> */}
    </div>
  )
}
export default Layout
