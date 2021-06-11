import React from 'react';
import ReactDOM from 'react-dom'

// These two containers are siblings in the DOM
const isServer = () => typeof window === `undefined`;

class HeaderContent extends React.Component {
  constructor(props) {
    super(props);
    if(!isServer()) {
      this.el = document.createElement('ul');
      this.el.className = 'menu-nav';
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
    this.componentRoot = document.getElementById('kt_header_menu');
    this.componentRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    this.componentRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el
    );
  }
}

export default HeaderContent;