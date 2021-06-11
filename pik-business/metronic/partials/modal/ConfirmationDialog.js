import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
const useStyles = makeStyles({
  root: {
    // color: '#ffa800 !important',
    // backgroundColor: '#fff4de !important',
    // boxShadow: '0 3px 5px 2px rgba(255, 177, 26, 0.62)',
    borderBottom: '1px solid #b9b9b9',
    height: 48,
    marginBottom: 20
  },
  submit: {
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white'
  }
})
const ConfirmationDialog = ({
  open,
  title,
  message,
  onConfirm,
  onDismiss,
  btnCancel,
  btnConfirm
}) => {
  const classes = useStyles()
  return (
    <Dialog open={open} onClose={onDismiss}>
      <DialogTitle className={classes.root}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
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
    </Dialog>
  )
}

const ConfirmationDialogContext = React.createContext({})

const ConfirmationDialogProvider = ({ children }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogConfig, setDialogConfig] = React.useState({})

  const openDialog = ({
    title,
    message,
    actionCallback,
    btnConfirm,
    btnCancel
  }) => {
    setDialogOpen(true)
    setDialogConfig({ title, message, actionCallback, btnConfirm, btnCancel })
  }

  const resetDialog = () => {
    setDialogOpen(false)
    setDialogConfig({})
  }

  const onConfirm = () => {
    resetDialog()
    dialogConfig.actionCallback(true)
  }

  const onDismiss = () => {
    resetDialog()
    dialogConfig.actionCallback(false)
  }

  return (
    <ConfirmationDialogContext.Provider value={{ openDialog }}>
      <ConfirmationDialog
        open={dialogOpen}
        title={dialogConfig?.title}
        message={dialogConfig?.message}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        btnCancel={dialogConfig?.btnCancel}
        btnConfirm={dialogConfig?.btnConfirm}
      />
      {children}
    </ConfirmationDialogContext.Provider>
  )
}

const useConfirmationDialog = () => {
  const { openDialog } = React.useContext(ConfirmationDialogContext)

  const getConfirmation = ({ ...options }) =>
    new Promise((res) => {
      openDialog({ actionCallback: res, ...options })
    })

  return { getConfirmation }
}

export default ConfirmationDialog
export { ConfirmationDialogProvider, useConfirmationDialog }
