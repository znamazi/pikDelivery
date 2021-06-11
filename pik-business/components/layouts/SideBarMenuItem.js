import React, { useState } from 'react'
import Link from 'next/dist/client/link'
import SVG from 'react-inlinesvg'
import { useTranslation } from 'react-i18next'
import { useLayout } from './layoutProvider'

const SideMenuSection = ({ title }) => {
  const { t, i18n } = useTranslation()

  return (
    <li className="menu-section">
      <h4 className="menu-text">{t(`sidebar.${title}`)}</h4>
      <i className="menu-icon ki ki-bold-more-hor icon-md"></i>
    </li>
  )
}

const SideMenuSingleItem = ({ path, icon, title }) => {
  const { t, i18n } = useTranslation()
  const layout = useLayout()
  const { asideOn, setAsideOn, activeMenu, setActiveMenu } = layout

  return (
    <li
      className={`menu-item ${activeMenu === title ? 'menu-item-active' : ''} `}
      aria-haspopup="true"
    >
      <Link href={path}>
        <a
          className="menu-link"
          onClick={() => {
            setAsideOn(!asideOn)
            setActiveMenu(title)
          }}
        >
          <span className="svg-icon menu-icon">
            <SVG src={icon} title={t(`sidebar.${title}`)} />
          </span>
          <span className="menu-text">{t(`sidebar.${title}`)}</span>
        </a>
      </Link>
    </li>
  )
}

const SideMenuGroupItem = ({ path, icon, title, children }) => {
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const toggleOpen = () => {
    setOpen(!open)
  }

  return (
    <li
      onClick={toggleOpen}
      className={`menu-item menu-item-submenu ${open ? 'menu-item-open' : ''}`}
    >
      <a className="menu-link menu-toggle">
        <span className="svg-icon menu-icon">
          <SVG src={icon} title={t(`sidebar.${title}`)} />
        </span>
        <span className="menu-text">{t(`sidebar.${title}`)}</span>
        <i className="menu-arrow"></i>
      </a>
      <div className="menu-submenu">
        <i className="menu-arrow"></i>
        <ul className="menu-subnav">{children}</ul>
      </div>
    </li>
  )
}

const SideBarMenuItem = ({ type, path, icon, title, children }) => {
  if (React.Children.count(children) > 0) {
    return (
      <SideMenuGroupItem {...{ type, path, icon, title }}>
        {children}
      </SideMenuGroupItem>
    )
  } else if (type === 'section') {
    return <SideMenuSection {...{ title }} />
  } else {
    return <SideMenuSingleItem {...{ path, icon, title }} />
  }
}

SideBarMenuItem.defaultProps = {
  type: 'menu-item'
}

export default SideBarMenuItem
