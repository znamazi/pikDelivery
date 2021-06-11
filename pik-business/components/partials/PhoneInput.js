import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import { replaceAll } from '../../utils/utils'
import { PhoneNumberUtil } from 'google-libphonenumber'

const PhoneBox = ({ label, value, handlePhone, className, containerClass }) => {
  const phoneUtils = PhoneNumberUtil.getInstance()

  return (
    <>
      <PhoneInput
        inputClass={className}
        containerClass={containerClass}
        specialLabel={label}
        country={'pa'}
        value={value}
        onChange={(value, data, event, formattedValue) => {
          let omitSpace = replaceAll(formattedValue, ' ', '')
          let omitDash = replaceAll(omitSpace, '-', '')
          let omitOther = replaceAll(omitDash, '(', '')
          let phoneNumber = replaceAll(omitOther, ')', '')
          handlePhone(phoneNumber)
        }}
        isValid={(value, country) => {
          if (value && value.length > 5) {
            let number = phoneUtils.parseAndKeepRawInput(`+${value}`)
            let valid = phoneUtils.isValidNumber(number)
            if (!valid) {
              return `Invalid ${label}`
            } else {
              return true
            }
          } else if (
            value != country.countryCode &&
            value &&
            value.length <= 5
          ) {
            return `Invalid ${label}`
          } else if (value == country.countryCode) {
            return true
          }
          return true
        }}
      />
    </>
  )
}

export default PhoneBox
