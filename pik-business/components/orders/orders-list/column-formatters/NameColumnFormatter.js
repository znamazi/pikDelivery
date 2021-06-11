import React from 'react'
import PersonalInfo from '../../../../metronic/partials/PersonalInfo'

export const NameColumnFormatter = (cellContent, row) => {
  return row.status !== 'Not Registered' ? (
    <PersonalInfo
      firstName={row.receiver.firstName}
      lastName={row.receiver.lastName}
      avatar={row.receiver.avatar}
      email={row.receiver.email}
    />
  ) : (
    <span>{row.receiver.email}</span>
  )
}
