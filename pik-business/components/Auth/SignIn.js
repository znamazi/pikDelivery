import React, { useState, useEffect } from 'react'
import {
  Avatar,
  Button,
  Container,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  CssBaseline
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { useAuth } from '../../utils/next-auth'
import ForgotPassword from './ForgotPassword'
import { useTranslation } from 'react-i18next'
import { validationEmail } from 'utils/utils'
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    width: '16px !important',
    height: '16px !important',
    marginLeft: theme.spacing(1),
    color: '#fff'
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white'
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white',
    height: 48
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
export default function SignIn() {
  const classes = useStyles()
  const auth = useAuth()
  const { t } = useTranslation()

  const [forgotPass, setForgotPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  useEffect(() => {
    try {
      if (localStorage.rememberMe && localStorage.email) {
        setRemember(true)
        setEmail(localStorage.email)
        setPassword(localStorage.password)
      }
    } catch (error) {}
  }, [])
  const handleLogin = () => {
    setError('')
    if (!!!email) {
      setError(t('errors.enter_email'))
      return
    }
    if (!validationEmail(email)) {
      setError(t('errors.email_address_not_correct'))
      return
    }
    if (!!!password) {
      setError(t('errors.enter_password'))
      return
    }
    setLoading(true)
    auth
      .login(email, password)
      .catch((error) => {
        // toast.error(error)
        setLoading(false)
      })
      .then(({ success, message }) => {
        if (!success) {
          setError(message)
          setLoading(false)
        }
        if (remember) {
          try {
            localStorage.setItem('rememberMe', true)
            localStorage.setItem('email', email)
            localStorage.setItem('password', password)
          } catch (error) {}
        }
      })
  }

  const handleRememberMe = (e) => {
    const value = e.target.checked
    setRemember(value)
  }

  return forgotPass ? (
    <ForgotPassword forgotCancel={() => setForgotPass(false)} />
  ) : (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t('pages.auth.signin')}
        </Typography>
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
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <Grid container>
          <Grid item xs>
            <FormControlLabel
              control={
                <PrimaryCheckbox
                  checked={remember}
                  name="remember"
                  onChange={handleRememberMe}
                />
              }
              label={t('pages.auth.remember_me')}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs>
            <a className="text-primary" onClick={(e) => setForgotPass(true)}>
              {t('pages.auth.forgot_pass')}?
            </a>
          </Grid>
        </Grid>
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          onClick={handleLogin}
          type="submit"
          fullWidth
          variant="contained"
          // color="primary"
          className={classes.submit}
        >
          {t('pages.auth.signin')}
          {loading && <CircularProgress className={classes.circularProgress} />}
        </Button>
      </div>
    </Container>
  )
}
