import React from 'react'
import SVG from 'react-inlinesvg'
import Link from 'next/link'

const ButtonView = React.forwardRef((props, ref) => {
  return (
    <Link href={props.href} as={props.as}>
      <div className="btn btn-icon btn-light border-action-bottom btn-sm mx-1">
        <span className="svg-icon svg-icon-md svg-icon-primary">
          <SVG
            src="/assets/media/svg/icons/Navigation/Sign-out.svg"
            title="View"
          />
        </span>
      </div>
    </Link>
  )
})

export default ButtonView
