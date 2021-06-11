import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'

import Comments from '../customers/Comments'
import Orders from './Orders'
import Balance from './Balance'
import Others from './Others'
import Feedback from './Feedback'
import PendingDriver from './PendingDriver'
import SubHeaderContent from '../layouts/SubHeaderContent'
import SubHeaderStatus from 'metronic/partials/SubHeaderStatus'
import {
  filterHeaderDriver,
  filterHeaderRecruitment,
  DriverStatusCssClasses,
  recruitment
} from './drivers-list/DriversUIHelpers'
import DriverStatus from '../../../node-back/src/constants/DriverStatuses'
import axios from '../../utils/axios'
import Vehicles from './Vehicles'
import { useTranslation } from 'react-i18next'
import HeaderContent from '../layouts/HeaderContent'

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
const DriverActivity = ({ driver, updateDriver }) => {
  const router = useRouter()
  const { t } = useTranslation()

  const [value, setValue] = React.useState(0)
  // const [driver, setDriver] = useState({ ...props.driverInfo })

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  const changeStatus = (status) => {
    if (!driver.vehicle && !driver.vehicle?.type && status === 'Approved') {
      toast.error('Vehicle type is require')
      return
    }
    let data =
      status === 'Approved'
        ? {
            personalId: { ...driver.personalId, approved: true },
            drivingLicence: { ...driver.drivingLicence, approved: true },
            vehicle: { ...driver.vehicle, approved: true },
            carInsurance: { ...driver.carInsurance, approved: true },
            status
          }
        : { status }

    axios
      .post(`admin/driver/update/${driver._id}`, { ...data })
      .then(({ data }) => {
        if (data.success) {
          toast.success('Driver updated Successfuly')
          let newData =
            status === 'Approved'
              ? { ...driver, status, hired: true }
              : { ...driver, status }
          updateDriver(newData)
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
  let contentDriver =
    recruitment.indexOf(driver.status) !== -1 || !driver.hired ? (
      <PendingDriver
        driver={driver}
        changeStatusSubHeader={(status) =>
          status === 'Approved'
            ? updateDriver({ ...driver, status, hired: true })
            : updateDriver({ ...driver, status })
        }
        updateVehicle={(vehicle) => updateDriver({ ...driver, vehicle })}
      />
    ) : (
      <div className="col-lg-8">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <AntTabs
              value={value}
              onChange={handleChange}
              aria-label="ant example"
            >
              <AntTab label={t('pages.common.Comments')} />
              <AntTab label={t('pages.common.Orders')} />
              <AntTab label={t('pages.drivers.Balance')} />
              <AntTab label={t('pages.drivers.Others')} />
              <AntTab label={t('pages.drivers.Feedback')} />
              {/* <AntTab label={t('pages.drivers.Vehicles')} /> */}
            </AntTabs>
          </div>
          <div className="card-body d-flex flex-column">
            {value === 0 && (
              <TabContainer>
                <Comments
                  id={driver._id}
                  urlList={`admin/driver/${driver._id}/comment/list`}
                  urlSave={`admin/driver/comment`}
                />
              </TabContainer>
            )}
            {value === 1 && (
              <TabContainer>
                <Orders driverId={driver._id} />
              </TabContainer>
            )}
            {value === 2 && (
              <TabContainer>
                <Balance driverId={driver._id} />
              </TabContainer>
            )}
            {value === 3 && (
              <TabContainer>
                <Others driver={driver} />
              </TabContainer>
            )}
            {value === 4 && (
              <TabContainer>
                <Feedback driverId={driver._id} />
              </TabContainer>
            )}
            {value === 5 && (
              <TabContainer>
                <Vehicles />
              </TabContainer>
            )}
          </div>
        </div>
      </div>
    )
  return (
    <>
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/drivers',
              query: { status: filterHeaderDriver, filterHeader: 'All Drivers' }
            })
          }
          className={`menu-item menu-item-submenu ${
            driver.hired ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">Drivers</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/drivers',
              query: {
                status: filterHeaderRecruitment,
                filterHeader: 'Recruitment'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            !driver.hired ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">Recruitment</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>

      <SubHeaderContent title={`${driver.firstName} ${driver.lastName}`}>
        <SubHeaderStatus
          status={driver.status}
          // statusTitle={DriverStatus}
          hired={driver.hired}
          statusCssClass={DriverStatusCssClasses}
          changeStatus={(newStatus) => changeStatus(newStatus)}
        />
        <button className="ml-3 btn btn-white" onClick={() => router.back()}>
          {t('pages.common.go_back')}
        </button>
      </SubHeaderContent>
      {contentDriver}
    </>
  )
}

export default DriverActivity
