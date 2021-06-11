import React from 'react'

import SelectSearch from './SelectSearch'

import PhoneInput from '../partials/PhoneInput'
import { useTranslation } from 'react-i18next'

const OrderInfo = ({
  order,
  handlePhone,
  handleDataSelectSearch,
  isLoadingName,
  isLoadingEmail,
  nameOptions,
  emailOptions,
  handleSearch,
  updateData
}) => {
  const { t } = useTranslation()

  return (
    <div className="col-lg-4">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">
            {t('pages.orders.order_information')}
          </h3>
        </div>
        <div className="card-body d-flex flex-column">
          <SelectSearch
            label={t('pages.orders.customer_name')}
            name="name"
            value={order.name}
            isLoading={isLoadingName}
            options={nameOptions}
            handleSearch={(e) => handleSearch(e, 'name')}
            handleChange={(data) => handleDataSelectSearch(data, 'name')}
            updateData={(data) => updateData(data, 'name')}
          />
          <SelectSearch
            label={t('pages.orders.customer_email')}
            name="email"
            value={order.email}
            isLoading={isLoadingEmail}
            options={emailOptions}
            handleSearch={(e) => handleSearch(e, 'email')}
            handleChange={(data) => handleDataSelectSearch(data, 'email')}
            updateData={(data) => updateData(data, 'email')}
          />

          <PhoneInput
            label={t('pages.orders.customer_mobile')}
            value={order.mobile}
            handlePhone={(phone) => handlePhone(phone)}
            containerClass="mt-5"
            className="pt-8 pr-20 pb-8"
          />
        </div>
      </div>
    </div>
  )
}

export default OrderInfo
