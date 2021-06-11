import React from 'react'
import SVG from 'react-inlinesvg'

const ButtonDelete = React.forwardRef((props, ref) => {
  return (
    <div className="btn btn-icon btn-light border-action-bottom btn-sm mx-1">
      <span className="svg-icon svg-icon-md svg-icon-primary">
        <SVG
          src="/assets/media/svg/icons/Files/Deleted-file.svg"
          title="Delete"
        />
      </span>
    </div>
  )
})

export default ButtonDelete
