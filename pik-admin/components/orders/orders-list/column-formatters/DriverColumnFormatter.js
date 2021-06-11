import React from 'react'
import PersonalInfo from '../../../../metronic/partials/PersonalInfo'
import WaitingForDriver from '../../WaitingForDriver'

export const DriverColumnFormatter = (cellContent, row) => {
  console.log({ row })
  if (!row.driver && row.status !== 'Canceled') {
    return <WaitingForDriver order={row} />
  } else if (!row.driver && row.status === 'Canceled') {
    return ''
  } else {
    return (
      <PersonalInfo
        firstName={row.driver.firstName}
        lastName={row.driver.lastName}
        avatar={row.driver.avatar}
        mobile={row.driver.mobile}
      />
    )
  }
}
