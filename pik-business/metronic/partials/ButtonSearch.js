import React from 'react'
import SVG from 'react-inlinesvg'

const ButtonSearch = React.forwardRef((props, ref) => {
  return (
    <div className="input-group-prepend d-inline-block">
      <span className="input-group-text">
        <span className="svg-icon svg-icon-lg">
          <SVG
            src="/assets/media/svg/icons/General/Search.svg"
            title="Search"
          />
        </span>
      </span>
    </div>
  )
})

export default ButtonSearch
