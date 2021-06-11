import React, { useState } from 'react'
import Link from 'next/link'
import SVG from 'react-inlinesvg'
import MenuItem from './SideBarMenuItem'
import { useLayout } from './layoutProvider'
import { useAuth } from 'utils/next-auth'
import { useTranslation } from 'react-i18next'

const Sidebar = () => {
  const layout = useLayout()
  const { asideMinimized, setAsideMinimized, asideOn } = layout
  let auth = useAuth()
  const { t } = useTranslation()

  return (
    <div
      className={`aside aside-left aside-fixed d-flex flex-column flex-row-auto ${
        asideOn ? 'aside-on' : ''
      }`}
      id="kt_aside"
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          className="brand flex-column-auto"
          id="kt_brand"
          style={{ flexGrow: 0 }}
        >
          <a className="brand-logo">
            <img
              className="max-width-160"
              alt="Logo"
              src="/assets/media/logos/logo-sidebar-business.png"
            />
          </a>
          <button
            onClick={() => setAsideMinimized(!asideMinimized)}
            className="brand-toggle btn btn-sm px-0"
            id="kt_aside_toggle"
          >
            <span className="svg-icon svg-icon svg-icon-xl">
              <SVG
                src="/assets/media/svg/icons/Navigation/Angle-double-left.svg"
                title="min sidebar"
              />
            </span>
          </button>
        </div>
        <div
          className="aside-menu-wrapper"
          id="kt_aside_menu_wrapper"
          style={{ flexGrow: 1, overflow: 'auto' }}
        >
          <div
            id="kt_aside_menu"
            className="aside-menu my-4"
            data-menu-vertical="1"
            data-menu-scroll="1"
            data-menu-dropdown-timeout="500"
          >
            <ul className="menu-nav">
              {auth.user.enabled && (
                <>
                  <MenuItem
                    title={'dashboard'}
                    path={'/'}
                    icon={'/assets/media/svg/icons/Design/Layers.svg'}
                  />
                  <MenuItem
                    title={'customers'}
                    path={'/customers'}
                    icon={'/assets/media/svg/icons/Communication/Group.svg'}
                  />
                  <MenuItem
                    title={'orders'}
                    path={'/orders'}
                    icon={'/assets/media/svg/icons/Shopping/Cart1.svg'}
                  />
                  <MenuItem
                    title={'invoices'}
                    path={'/invoices'}
                    icon={
                      '/assets/media/svg/icons/Communication/Clipboard-list.svg'
                    }
                  />

                  {auth.user.role === 'Super Admin' && (
                    <MenuItem
                      title={'settings'}
                      path={'/settings'}
                      icon={'/assets/media/svg/icons/Code/Settings4.svg'}
                    />
                  )}
                  <MenuItem
                    title={'help'}
                    path={'/help'}
                    icon={'/assets/media/svg/icons/Code/Question-circle.svg'}
                  />
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="text-white">
          <div className="d-flex flex-center bottomLink">
            <Link href="privacy">
              <span style={{ marginRight: 20 }}>{t('pages.auth.privacy')}</span>
            </Link>
            <Link href="legal">
              <span style={{ marginRight: 20 }}>{t('pages.auth.legal')}</span>
            </Link>
            <Link href="/contact">
              <span style={{ marginRight: 10 }}>{t('pages.auth.contact')}</span>
            </Link>
          </div>
          <div className="font-weight-bold	mt-4 d-flex flex-center">
            &copy; {t('pages.auth.copyright')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
