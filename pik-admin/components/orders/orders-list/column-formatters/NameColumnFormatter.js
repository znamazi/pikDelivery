import React from 'react'
import PersonalInfo from '../../../../metronic/partials/PersonalInfo'

export const NameColumnFormatter = (cellContent, row) => {
  return (
    <PersonalInfo
      firstName={row.receiver.firstName}
      lastName={row.receiver.lastName}
      avatar={row.receiver.avatar}
      email={row.receiver.email}
    />
  )
}
