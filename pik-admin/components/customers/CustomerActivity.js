import React from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Comments from './Comments'
import Orders from './Orders'
import Transactions from './Transactions'
import Available from './Available'
import SubHeaderContent from '../layouts/SubHeaderContent'
import { useTranslation } from 'react-i18next'
import HeaderContent from '../layouts/HeaderContent'
import * as CustomersUIHelpers from 'components/customers/customers-list/CustomersUIHelpers'
import { Status } from './customers-list/column-formatters/StatusColumnFormatter'

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
const CustomerActivity = (props) => {
  const router = useRouter()
  const [value, setValue] = React.useState(0)
  const { t } = useTranslation()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <>
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/customers',
              query: {
                status: CustomersUIHelpers.filterHeaderCustomer,
                filterHeader: 'All Customers'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            CustomersUIHelpers.customers.includes(props.customer.status)
              ? 'menu-item-active'
              : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {' '}
              {t('header_content.customers.all')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
        <li
          onClick={() =>
            router.push({
              pathname: '/customers',
              query: {
                status: CustomersUIHelpers.filterHeaderNotRegister,
                filterHeader: 'Not Registered'
              }
            })
          }
          className={`menu-item menu-item-submenu ${
            props.customer.status === 'Not Registered' ? 'menu-item-active' : ''
          }`}
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">
              {t('header_content.customers.non_registered')}
            </span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <SubHeaderContent
        title={`${props.customer.firstName} ${props.customer.lastName}`}
      >
        <Status row={props.customer} />
        <button className="ml-3 btn btn-white" onClick={() => router.back()}>
          {t('pages.common.go_back')}
        </button>
      </SubHeaderContent>

      <div className="col-lg-8">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              {props.customer.status !== 'Not Registered' && (
                <Tab label={t('pages.common.Comments')} />
              )}
              {props.customer.status !== 'Not Registered' && (
                <Tab label={t('pages.common.Orders')} />
              )}
              <Tab label={t('pages.customers.Available')} />
              {props.customer.status !== 'Not Registered' && (
                <Tab label={t('pages.customers.Transaction')} />
              )}
            </Tabs>
          </div>
          <div className="card-body d-flex flex-column">
            {value === 0 && props.customer.status !== 'Not Registered' && (
              <TabContainer>
                <Comments
                  id={props.customer._id}
                  urlList={`admin/customer/${props.customer._id}/comment/list`}
                  urlSave={`admin/customer/comment`}
                />
              </TabContainer>
            )}
            {value === 1 && props.customer.status !== 'Not Registered' && (
              <TabContainer>
                <Orders customerId={props.customer._id} />
              </TabContainer>
            )}
            {value === 2 && (
              <TabContainer>
                <Available customerId={props.customer._id} />
              </TabContainer>
            )}
            {value === 3 && props.customer.status !== 'Not Registered' && (
              <TabContainer>
                <Transactions customerId={props.customer._id} />
              </TabContainer>
            )}
            {props.customer.status == 'Not Registered' && value === 0 && (
              <TabContainer>
                <Available customerId={props.customer._id} />
              </TabContainer>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomerActivity
