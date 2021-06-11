import React, { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Avatar,
  Button,
  Link,
  Container,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  CssBaseline
} from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles'
import axios from '../../utils/axios'
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
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(8)
  },
  submit: {
    margin: theme.spacing(3, 3, 2),
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white'
  }
}))

const ResetPassword = ({ forgotCancel }) => {
  const classes = useStyles()
  const router = useRouter()
  const { resetToken } = router.query
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({})
  const { t } = useTranslation()

  const submitForm = () => {
    setMessage({})
    if (!!!password) {
      setMessage({ message: t('errors.enter_password'), type: 'error' })
      return
    }

    axios
      .post(`business/auth/resetPassword/${resetToken}`, { password })
      .then(({ data }) => {
        if (data.success) {
          setMessage({
            message: t('pages.auth.reset_successfully'),
            type: 'success'
          })
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
      .catch((message) => {
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
          {t('pages.auth.reset_password')}
        </Typography>
        <Typography className={classes.form}>
          {t('pages.auth.new_password')}
        </Typography>
        {Object.keys(message).length > 0 && (
          <Alert severity={message.type}>{message.message}</Alert>
        )}

        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          type="password"
          id="password"
          label={t('information.password')}
          name="password"
          autoComplete="password"
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
            onClick={() => router.push('/')}
            type="submit"
            variant="contained"
            className={classes.submit}
          >
            {t('pages.common.back')}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default ResetPassword
