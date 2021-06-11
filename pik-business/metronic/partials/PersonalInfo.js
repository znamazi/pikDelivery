import React from 'react'
import Avatar from '@material-ui/core/Avatar'

const PersonalInfo = ({ avatar, firstName, lastName, mobile, email }) => {
  return (
    <div className="d-flex align-items-center">
      <Avatar alt={`${firstName} ${lastName}`} src={avatar} />
      <a className="text-muted font-weight-bold text-hover-primary">
        <div className="ml-4">
          <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
            {`${firstName} ${lastName ? lastName : ''}`}
          </div>
          <div>{email ? email : ''}</div>
          <div>{mobile ? mobile : ''}</div>
        </div>
      </a>
    </div>
  )
}

export default PersonalInfo
