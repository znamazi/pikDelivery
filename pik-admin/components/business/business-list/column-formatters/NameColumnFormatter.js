import React from 'react'
import PersonalInfo from '../../../../metronic/partials/PersonalInfo'

export const NameColumnFormatter = (cellContent, row) => {
  let address = row.address ? row.address.address_components : ''

  let city = address ? `${address[0].long_name} ${address[1].long_name} ` : ''
  return <PersonalInfo firstName={row.name} avatar={row.logo} mobile={city} />
}
