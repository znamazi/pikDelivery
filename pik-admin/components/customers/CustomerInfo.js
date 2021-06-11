import React, { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import CustomerStatus from '../../../node-back/src/constants/CustomerStatuses'
import axios from '../../utils/axios'
import { useTranslation } from 'react-i18next'
import Information from './Information'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  large: {
    width: theme.spacing(10),
    height: theme.spacing(10)
  }
}))

const CustomerInfo = ({ customer, updateCustomer }) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const refChangeStatus = useRef()

  const changeStatus = (event) => {
    let status = event.target.value
    axios
      .post('admin/customer/changeStatus', { id: customer._id, status })
      .then(({ data }) => {
        if (data.success) {
          toast.success('Status updated Successfuly')
          updateCustomer(status)
          refChangeStatus.current.blur()
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
  return (
    <div className="col-lg-4">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">
            {t('pages.customers.customer_information')}
          </h3>
        </div>
        <div className="card-body d-flex flex-column">
          {customer['status'] != 'Not Registered' && (
            <div
              className="flex-grow-1"
              style={{ position: 'relative', margin: 'auto' }}
            >
              <Avatar src={customer.avatar} className={classes.large} />
            </div>
          )}

          <div className="mt-10">
            <Information
              title="Name"
              value={`${customer.firstName} ${customer.lastName}`}
            />
            {/* <Information title="last_name" value={customer.lastName} /> */}
            <Information title="Email" value={customer.email} />
            <Information title="mobile_phone" value={customer.mobile} />
            <Information
              title="Registered"
              value={moment(customer.createdAt).format('LL')}
            />
            {customer['status'] != 'Not Registered' && (
              <div className="mb-7">
                <p className="font-weight-bolder text-dark-75 pl-3 font-size-lg">
                  {t(`information.Status`)}
                </p>
                <div className="pl-3 col-8">
                  <select
                    className=" form-control"
                    value={customer.status}
                    onChange={changeStatus}
                    ref={refChangeStatus}
                  >
                    {Object.keys(CustomerStatus).map((item, index) => (
                      <option value={CustomerStatus[item]} key={index}>
                        {t(`status.${CustomerStatus[item]}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerInfo
