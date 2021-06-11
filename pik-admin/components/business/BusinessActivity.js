import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Orders from './Orders'
import Customers from './Customers'
import Invoices from './Invoices'
import SetupHours from './hours/SetupHours'
import Payments from './Payments'
import Profile from './Profile'
import SubHeaderContent from '../layouts/SubHeaderContent'
import { useTranslation } from 'react-i18next'
import { getLabelCssClasses } from '../../utils/utils'
import { BusinessStatusCssClasses } from './business-list/BusinessUIHelpers'

const AntTabs = withStyles({
  root: {
    borderBottom: '1px solid #e8e8e8'
  },
  indicator: {
    backgroundColor: '#1890ff'
  }
})(Tabs)

const AntTab = withStyles((theme) => ({
  root: {
    textTransform: 'none',
    minWidth: 72,
    fontWeight: theme.typography.fontWeightBold,
    marginRight: theme.spacing(4),
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(','),
    '&:hover': {
      color: '#40a9ff',
      opacity: 1
    },
    '&$selected': {
      color: '#1890ff',
      fontWeight: theme.typography.fontWeightMedium
    },
    '&:focus': {
      color: '#40a9ff'
    }
  },
  selected: {}
}))((props) => <Tab disableRipple {...props} />)

const TabContainer = (props) => {
  return (
    <Typography component="div" style={{ padding: 8 * 1 }}>
      {props.children}
    </Typography>
  )
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
}
const BusinessActivity = (props) => {
  const { t } = useTranslation()

  const router = useRouter()
  const [value, setValue] = React.useState(0)
  const handleUpdateHour = (time) => {
    props.updateBusiness({
      timeFrames: [...time.timeFrames],
      customTimeFrames: [...time.customTimeFrames]
    })
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  const statusTitle = {
    Active: 'Active',
    Disabled: 'Disabled'
  }

  return (
    <>
      <SubHeaderContent title={props.business.name}>
        {/* {props.business.status == 'Disabled' && (
          <span className="btn btn-light">{t('status.Disabled')}</span>
        )}
        {props.business.status !== 'Disabled' && (
          <span className="btn bg-modal-primary">
            {t('pages.common.active')}
          </span>
        )} */}
        <div>
          <div className="dropdown">
            <button
              className={`btn btn-${getLabelCssClasses(
                statusTitle,
                BusinessStatusCssClasses,
                props.business.status
              )} dropdown-toggle`}
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {props.business.status}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {Object.keys(statusTitle).map((item, index) => (
                <a
                  className="dropdown-item"
                  onClick={() => props.changeStatus(statusTitle[item])}
                  key={index}
                >
                  {t(`status.${statusTitle[item]}`)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <button className="ml-3 btn btn-white" onClick={() => router.back()}>
          {t('pages.common.go_back')}
        </button>
      </SubHeaderContent>
      <div className="col-lg-12 ">
        <div className="card card-custom card-stretch gutter-b ">
          <div className="card-header border-bottom pt-5">
            <AntTabs
              value={value}
              onChange={handleChange}
              aria-label="Business Activity"
            >
              <AntTab label={t('pages.business.Profiles')} />
              <AntTab label={t('pages.common.Hours')} />
              <AntTab label={t('pages.common.Customers')} />
              <AntTab label={t('pages.common.Orders')} />
              <AntTab label={t('pages.common.Payments')} />
              <AntTab label={t('pages.common.Invoices')} />
            </AntTabs>
          </div>
          <div className="card-body d-flex flex-column">
            {value === 0 && (
              <TabContainer>
                <Profile
                  business={props.business}
                  updateBusiness={(group) => props.updateBusiness(group)}
                />
              </TabContainer>
            )}
            {value === 1 && (
              <TabContainer>
                <SetupHours
                  businessInfo={props.business}
                  handleUpdateHour={(time) => handleUpdateHour(time)}
                />
              </TabContainer>
            )}

            {value === 2 && (
              <TabContainer>
                <Customers businessId={props.business._id} />
              </TabContainer>
            )}
            {value === 3 && (
              <TabContainer>
                <Orders businessId={props.business._id} />
              </TabContainer>
            )}
            {value === 4 && (
              <TabContainer>
                <Payments businessId={props.business._id} />
              </TabContainer>
            )}
            {value === 5 && (
              <TabContainer>
                <Invoices businessId={props.business._id} />
              </TabContainer>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default BusinessActivity
