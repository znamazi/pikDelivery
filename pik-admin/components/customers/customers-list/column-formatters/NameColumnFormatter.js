import React from 'react'
import PersonalInfo from '../../../../metronic/partials/PersonalInfo'

export const NameColumnFormatter = (cellContent, row) => {
  return (
    <PersonalInfo
      firstName={row.firstName}
      lastName={row.lastName}
      avatar={row.avatar}
      email={row.email}
    />
  )
}
