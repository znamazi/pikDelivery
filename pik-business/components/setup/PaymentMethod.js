import React, { useState } from 'react'
import ReactModal from 'react-modal'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import { Alert } from '@material-ui/lab'

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
const PaymentMethod = (props) => {
  let { isShowing, hide, actionCallback, card } = props
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const classes = useStyles()

  const onConfirm = () => {
    setError('')
    if (!card.cardNumber || !card.month || !card.year || !card.cvv) {
      setError(t('errors.info_card_required'))
      return
    } else if (!['4', '5'].includes(card.cardNumber.charAt(0))) {
      setError(t('errors.credit_card_invalid'))
      return
    } else {
      hide()
      actionCallback(true)
    }
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
      <div className="modal-header border-bottom-modal space-between">
        <h4>{t('pages.setup.add_payment_method')}</h4>

        <img className="w-80px" src="/assets/media/visa.png" />
      </div>

      <div style={{ padding: '1em', flexGrow: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {props.children}
      </div>

      <DialogActions>
        <Button variant="contained" onClick={onDismiss}>
          {t('information.cancel')}
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={onConfirm}
          className={classes.submit}
        >
          {t('information.continue')}
        </Button>
      </DialogActions>
    </ReactModal>
  ) : (
    ''
  )
}

export default PaymentMethod
