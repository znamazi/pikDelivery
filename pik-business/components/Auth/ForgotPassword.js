import React, { useState } from 'react'
import {
  Button,
  Container,
  TextField,
  Typography,
  CssBaseline
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles'
import axios from '../../utils/axios'
import { validationEmail } from 'utils/utils'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(15),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    marginBottom: theme.spacing(8)
  },
  submit: {
    margin: theme.spacing(3, 3, 2),
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white'
  }
}))

const ForgotPassword = ({ forgotCancel }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState({})

  const submitForm = () => {
    setMessage({})
    if (!!!email) {
      setMessage({ message: t('errors.enter_email'), type: 'error' })
      return
    }
    if (!validationEmail(email)) {
      setMessage({
        message: t('errors.email_address_not_correct'),
        type: 'error'
      })
      return
    }

    axios
      .post('business/auth/forgotPassword', { email })
      .then(({ data }) => {
        if (data.success) {
          setMessage({ message: t('pages.auth.token_sent'), type: 'success' })
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          setMessage({
            message: errorMessage,
            type: 'error'
          })
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        setMessage({
          message: errorMessage,
          type: 'error'
        })
      })
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {t('pages.auth.forgot_password')} ?
        </Typography>
        <Typography className={classes.form}>
          {t('pages.auth.enter_email_reset_pass')}
        </Typography>
        {Object.keys(message).length > 0 && (
          <Alert severity={message.type}>{message.message}</Alert>
        )}

        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label={t('information.email')}
          name="email"
          autoComplete="email"
          autoFocus
        />

        <div>
          <Button
            onClick={submitForm}
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {t('information.submit')}
          </Button>
          <Button
            onClick={() => forgotCancel()}
            type="submit"
            variant="contained"
            className={classes.submit}
          >
            {t('information.cancel')}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default ForgotPassword
