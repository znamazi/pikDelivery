import React from 'react'
import PropTypes from 'prop-types'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { useRouter } from 'next/router'

import HeaderContent from '../layouts/HeaderContent'
import UsersList from './users/UsersList'
import GroupsList from './groups/GroupsList'
import AddFee from './Fee/AddFee'
import { useTranslation } from 'react-i18next'
import BannersList from './banners/BannersList'

const TabContainer = (props) => {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  )
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
}
const Setting = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  let defaultTab = props.tab ? props.tab : 0
  const [value, setValue] = React.useState(defaultTab)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <>
      <HeaderContent>
        <li
          onClick={() => router.push('/settings')}
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.settings')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label={t('pages.setting.users')} />
              <Tab label={t('pages.setting.groups')} />
              <Tab label="Tax & Others" />
              <Tab label={t('pages.setting.banners')} />
            </Tabs>
          </div>
          <div className="card-body d-flex flex-column">
            {value === 0 && (
              <TabContainer>
                <UsersList />
              </TabContainer>
            )}
            {value === 1 && (
              <TabContainer>
                <GroupsList />
              </TabContainer>
            )}
            {value === 2 && (
              <TabContainer>
                <AddFee />
              </TabContainer>
            )}
            {value === 3 && (
              <TabContainer>
                <BannersList />
              </TabContainer>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Setting
