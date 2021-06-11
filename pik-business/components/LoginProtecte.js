import React, { Fragment } from 'react'
import { useAuth } from '../utils/next-auth'
import SignIn from './Auth/SignIn'
import AppLoading from './AppLoading'
import AuthPage from './Auth/Auth'

const LoginProtect = ({ children }) => {
  const auth = useAuth()
  return (
    <Fragment>
      {!auth.initialized ? (
        <AppLoading />
      ) : auth.loggedIn ? (
        children
      ) : (
        <AuthPage />
      )}
    </Fragment>
  )
}

export default LoginProtect
