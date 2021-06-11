import React from 'react'

export const NameColumnFormatter = (cellContent, row) => {
  return (
    <div className="d-flex align-items-center">
      <div>
        <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
          {row.ownerName}
        </div>
        <a className="text-muted font-weight-bold text-hover-primary">
          <div>{row.ownerModel}</div>
        </a>
      </div>
    </div>
  )
}
