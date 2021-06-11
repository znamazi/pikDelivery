import React, { useState } from 'react'
import ReactModal from 'react-modal'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import { Alert } from '@material-ui/lab'
import { makeStyles, TextField } from '@material-ui/core'
import { toast } from 'react-toastify'
import axios from '../../utils/axios'
import business from 'store/reducers/business'

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
const AddPayment = (props) => {
  const classes = useStyles()

  let { isShowing, hide, invoice, updatePayment } = props
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [newPayment, setNewPayment] = useState({})

  const onConfirm = () => {
    setError('')
    if (!newPayment.amount || !newPayment.description) {
      setError(t('errors.amount_required'))
      return
    } else {
      hide()
      let data = {
        resource: invoice._id,
        ownerName: invoice.businessName,
        owner: invoice.business,
        description: newPayment.description,
        captureAmount: newPayment.amount
      }
      axios
        .post('admin/payment', {
          ...data
        })
        .then(({ data }) => {
          if (data.success) {
            setNewPayment({})
            updatePayment({ ...data.payment, user: { ...data.user } })
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            toast.error(errorMessage)
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          toast.error(errorMessage)
        })
    }
  }

  const onDismiss = () => {
    hide()
    setNewPayment({})
  }

  return isShowing ? (
    <ReactModal
      isOpen={isShowing}
      style={customStyles}
      closeTimeoutMS={200}
      onRequestClose={hide}
      shouldCloseOnOverlayClick={true}
    >
      <div className="modal-header border-bottom-modal">
        <h4 className="text-left float-left">
          {t('pages.invoices.new_payment')}
        </h4>
        <button className="close" onClick={hide}>
          <span aria-hidden="true" style={{ fontSize: '1.35em' }}>
            ×
          </span>
        </button>
      </div>

      <div style={{ padding: '1em', flexGrow: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <div>
          <TextField
            id="description"
            label={t('Table.columns.Description')}
            fullWidth
            value={newPayment.description}
            onChange={(e) =>
              setNewPayment({ ...newPayment, description: e.target.value })
            }
          />
          <TextField
            id="amount"
            label={t('Table.columns.Amount')}
            fullWidth
            value={newPayment.amount}
            onChange={(e) =>
              setNewPayment({ ...newPayment, amount: e.target.value })
            }
          />
        </div>
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

export default AddPayment
