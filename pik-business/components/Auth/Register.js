import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Button,
  Container,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  CssBaseline
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { toast } from 'react-toastify'
import { useAuth } from '../../utils/next-auth'
import { useTranslation } from 'react-i18next'

import axios from '../../utils/axios'
import { validationEmail } from 'utils/utils'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column'
    // alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  Checkbox: {
    color: '#f12711',
    '&$checked': {
      color: '#f12711'
    }
  },

  submit: {
    margin: theme.spacing(3, 0, 2),
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white',
    height: 48
  },
  typography: {
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(7)
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
}))
const PrimaryCheckbox = withStyles({
  root: {
    color: '#f1962b',
    '&$checked': {
      color: '#f1962b'
    }
  },
  checked: {}
})((props) => <Checkbox color="default" {...props} />)
const Register = (props) => {
  const router = useRouter()
  const auth = useAuth()
  const { t } = useTranslation()

  const classes = useStyles()
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [agree, setAgree] = useState(false)

  const handleData = (e) => {
    let fieldName = e.target.id
    setNewUser({ ...newUser, [fieldName]: e.target.value })
  }

  const submitForm = () => {
    setError('')
    if (!!!newUser.firstName) {
      setError(t('errors.enter_firstName'))
      return
    }
    if (!!!newUser.lastName) {
      setError(t('errors.enter_lastName'))
      return
    }

    if (!!!newUser.email) {
      setError(t('errors.enter_email'))
      return
    }
    if (!validationEmail(newUser.email)) {
      setError(t('errors.email_address_not_correct'))
      return
    }
    if (!!!newUser.password) {
      setError(t('errors.enter_password'))
      return
    }
    axios
      .post('business/auth/create', newUser)
      .then(({ data }) => {
        if (data.success) {
          auth
            .login(newUser.email, newUser.password)
            .catch((error) => {
              const errorMessage = error?.response?.data?.errorCode
                ? t(`server_errors.${error?.response?.data?.errorCode}`)
                : error?.response?.data?.message
              toast.error(errorMessage)
            })
            .then(({ success, message }) => {
              router.push('/setup')
              setNewUser('')
              if (!success) {
                const errorMessage = data.errorCode
                  ? t(`server_errors.${data.errorCode}`)
                  : data.message
                setError(errorMessage)
              }
            })
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

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <div className={classes.paper}>
        <div className={classes.box}>
          <Typography component="h1" variant="h5">
            {t('pages.auth.signup')}
          </Typography>
          <Typography component="p" className={classes.typography}>
            {t('pages.auth.signup_details')}
          </Typography>
        </div>
        <TextField
          value={newUser['firstName']}
          onChange={(e) => handleData(e)}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="firstName"
          label={t('information.firstName')}
          name="firstName"
          autoComplete="firstName"
          autoFocus
        />
        <TextField
          value={newUser['lastName']}
          onChange={(e) => handleData(e)}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="lastName"
          label={t('information.lastName')}
          name="lastName"
          autoComplete="lastName"
        />
        <TextField
          value={newUser['email']}
          onChange={(e) => handleData(e)}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          type="email"
          id="email"
          label={t('information.email')}
          name="email"
          autoComplete="email"
        />
        <TextField
          value={newUser['password']}
          onChange={(e) => handleData(e)}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label={t('information.password')}
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <FormControlLabel
          control={
            <PrimaryCheckbox
              value={agree}
              onChange={(event) => setAgree(event.target.checked)}
              name="agree"
            />
          }
          label={
            <span>
              {t('pages.auth.agree')}
              <a onClick={() => props.showCondition()} className="text-primary">
                {t('pages.auth.term_condition')}
              </a>
            </span>
          }
        />
        {/* <FormControlLabel
          control={
            <Checkbox
              className={classes.Checkbox}
              value={agree}
              color="primary"
              onChange={(event) => setAgree(event.target.checked)}
            />
          }
          label={
            <span>
              {t('pages.auth.agree')}
              <a onClick={() => props.showCondition()} className="text-primary">
                {t('pages.auth.term_condition')}
              </a>
            </span>
          }
        /> */}
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          onClick={submitForm}
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={agree ? false : true}
        >
          {t('pages.auth.create_account')}
        </Button>
      </div>
    </Container>
  )
}
export default Register
