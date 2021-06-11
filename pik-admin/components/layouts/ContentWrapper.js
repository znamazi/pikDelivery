import React from 'react'

const ContentWrapper = ({ children }) => {
  return (
    <div className="d-flex flex-column-fluid">
      <div className="container" style={{ marginTop: 10 }}>
        {children}
      </div>
    </div>
  )
}

export default ContentWrapper
