import React from 'react'
import moment from 'moment'

const ShowDate = ({ id, date }) => {
  return (
    <span>
      <div className="d-flex align-items-center">
        <div>
          <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
            {id}
          </div>
          <a className="text-muted font-weight-bold text-hover-primary">
            <div>{moment(date).format('LL')}</div>
          </a>
        </div>
      </div>
    </span>
  )
}

export default ShowDate
