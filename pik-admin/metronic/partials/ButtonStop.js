import React from 'react'
import SVG from 'react-inlinesvg'

const ButtonStop = React.forwardRef((props, ref) => {
  return (
    <div
      className="btn btn-icon btn-light border-action-bottom btn-sm mx-1"
      onClick={props.onClick}
    >
      <span className="svg-icon svg-icon-md svg-icon-primary">
        <SVG src="/assets/media/svg/icons/Code/Stop.svg" title="Cancel" />
      </span>
    </div>
  )
})

export default ButtonStop
