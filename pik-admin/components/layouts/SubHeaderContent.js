import React from 'react'
import ReactDOM from 'react-dom'

// These two containers are siblings in the DOM
const isServer = () => typeof window === `undefined`

class SubHeaderContent extends React.Component {
  constructor(props) {
    super(props)
    if (!isServer()) {
      this.el = document.createElement('div')
      this.el.className = 'subheader py-2 py-lg-4   subheader-solid'
      this.el.id = 'kt_subheader'
    }
  }

  componentDidMount() {
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.
    this.componentRoot = document.getElementById('addSubHeader')
    this.componentRoot.appendChild(this.el)
  }

  componentWillUnmount() {
    this.componentRoot.removeChild(this.el)
  }

  render() {
    return ReactDOM.createPortal(
      <div
        className={`container-fluid ${
          this.props.title
            ? 'd-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap'
            : ''
        }`}
      >
        {this.props.title && (
          <div className="d-flex align-items-center flex-wrap ">
            <div className="d-flex align-items-baseline ">
              <h5 className="text-dark font-weight-bold my-2">
                {this.props.title}
              </h5>
            </div>
          </div>
        )}
        <div className="d-flex align-items-center flex-wrap ">
          {this.props.children}
        </div>
      </div>,
      this.el
    )
  }
}

export default SubHeaderContent
