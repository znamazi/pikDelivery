import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { useRouter } from 'next/router'

import Details from './Details'
import History from './History'
import Chat from './Chat'
import { useTranslation } from 'react-i18next'
import HeaderContent from '../layouts/HeaderContent'
import * as OrdersUIHelpers from './orders-list/OrdersUIHelpers'

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
const OrderActivity = (props) => {
  const { t } = useTranslation()
  const router = useRouter()

  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/orders',
              query: {
                status: OrdersUIHelpers.filterHeaderProgress,
                filterHeader: 'PROGRESS'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            props.order.status === 'Progress' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">PROGRESS</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/orders',
              query: {
                status: OrdersUIHelpers.filterHeaderOpen,
                filterHeader: 'OPEN'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            OrdersUIHelpers.filterHeaderOpen
              .split(',')
              .includes(props.order.status)
              ? 'menu-item-active'
              : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">OPEN</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/orders',
              query: {
                status: OrdersUIHelpers.filterHeaderClose,
                filterHeader: 'CLOSED'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            OrdersUIHelpers.filterHeaderClose
              .split(',')
              .includes(props.order.status)
              ? 'menu-item-active'
              : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">CLOSED</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/orders',
              query: {
                status: '',
                filterHeader: 'All Orders'
              }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">All</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <div className="col-lg-8">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <AntTabs
              value={value}
              onChange={handleChange}
              aria-label="ant example"
            >
              <AntTab label={t('pages.orders.details')} />
              <AntTab label={t('pages.orders.history')} />
              <AntTab label={t('pages.orders.chat')} />
            </AntTabs>
          </div>
          <div className="card-body d-flex flex-column">
            {value === 0 && (
              <TabContainer>
                <Details
                  order={props.order}
                  updateOrder={(data) => props.updateOrder(data)}
                />
              </TabContainer>
            )}
            {value === 1 && (
              <TabContainer>
                <History logs={props.order.logs} />
              </TabContainer>
            )}
            {value === 2 && (
              <TabContainer>
                <Chat order={props.order} />
              </TabContainer>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderActivity
