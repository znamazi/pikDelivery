import React from 'react'
import moment from 'moment'
import ShowDate from 'components/partials/ShowDate'

export const BookingColumnFormatter = (cellContent, row) => {
  return <ShowDate date={row.date} id={row.id} />
}
