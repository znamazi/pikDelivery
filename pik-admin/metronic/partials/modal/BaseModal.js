import React, { useState } from 'react'
import ReactModal from 'react-modal'
import PropTypes from 'prop-types'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { makeStyles, withStyles } from '@material-ui/core/styles'

if (typeof window !== 'undefined') {
  ReactModal.setAppElement('body')
}
const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '95%'
  },
  head: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
    color: '#999',
    // padding: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  body: {
    padding: '1em',
    minWidth: '15em',
    flexGrow: 1
  },

  footer: {
    borderTop: '1px solid #ddd',
    padding: '0.5rem',
    padding: '5px',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left'
  },
  btnClose: {
    color: '#b9b9b9',
    cursor: 'pointer',
    padding: 0,
    backgroundColor: 'transparent',
    border: 0,
    WebkitAppearance: 'none',
    padding: '0.5rem',
    margin: '-0.5rem'
  }
}

const useStyles = makeStyles((theme) => ({
  submit: {
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white'
  }
}))

const BaseModal = (props) => {
  let {
    title,
    footer,
    headerLeftButtons,
    HeaderRightButtons,
    theme,
    isShowing,
    action,
    hide,
    actionCallback,
    btnCancel,
    btnConfirm
  } = props
  const classes = useStyles()

  const onConfirm = () => {
    hide()
    actionCallback(true)
  }

  const onDismiss = () => {
    hide()
    actionCallback(false)
  }

  return isShowing ? (
    <ReactModal
      isOpen={isShowing}
      style={customStyles}
      closeTimeoutMS={200}
      onRequestClose={hide}
      shouldCloseOnOverlayClick={true}
    >
      {headerLeftButtons && (
        // <div className={`modal-header bg-primary bg-modal-${theme}`}>
        <div className="modal-header border-bottom-modal ">
          {headerLeftButtons && (
            <div style={{ position: 'absolute', left: 8 }}>
              {headerLeftButtons}
            </div>
          )}
          <h4 className="modal-title text-white mb-0">{title}</h4>
          {HeaderRightButtons && <div>{<HeaderRightButtons />}</div>}
          {!HeaderRightButtons && (
            <button className="close" onClick={hide}>
              <span
                aria-hidden="true"
                style={{ fontSize: '1.35em' }}
                // className={`bg-modal-${theme}`}
              >
                ×
              </span>
            </button>
          )}
        </div>
      )}

      <div style={{ padding: '1em', minWidth: '30em', flexGrow: 1 }}>
        {props.children}
      </div>
      {action && (
        <DialogActions>
          <Button variant="contained" onClick={onDismiss}>
            {btnCancel ? btnCancel : 'Cancel'}
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={onConfirm}
            className={classes.submit}
          >
            {btnConfirm ? btnConfirm : 'Confirm'}
          </Button>
        </DialogActions>
      )}
      {footer && <div className="p-3 modal-footer">{footer}</div>}
    </ReactModal>
  ) : (
    ''
  )
}

BaseModal.propTypes = {
  visible: PropTypes.bool,
  theme: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark'
  ])
}

BaseModal.defaultProps = {
  theme: 'primary'
}
export default BaseModal
