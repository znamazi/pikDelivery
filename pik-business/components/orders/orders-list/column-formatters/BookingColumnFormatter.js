import React from 'react'
import moment from 'moment'
import Link from 'next/link'
import ShowDate from 'components/partials/ShowDate'

export const BookingColumnFormatter = (cellContent, row) => {
  return (
    // <Link href={`/order/[id]`} as={`/order/${row.id}`}>
    <ShowDate date={row.date} id={row.id} />
    // </Link>
  )
}
