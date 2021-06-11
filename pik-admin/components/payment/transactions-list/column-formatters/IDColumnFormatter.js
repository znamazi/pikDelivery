import React from 'react'
import moment from 'moment'

export const IDColumnFormatter = (cellContent, row) => {
  return (
    <div className="d-flex align-items-center">
      <div>
        <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
          {row._id}
        </div>
        <a className="text-muted font-weight-bold text-hover-primary">
          <div>{moment(row.createdAt).format('DD/MM/YY h:mm A')}</div>
        </a>
      </div>
    </div>
  )
}
