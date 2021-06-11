import React, { Fragment } from 'react'
import { useAuth } from '../utils/next-auth'
import SignIn from './SignIn'
import AppLoading from './AppLoading'

const LoginProtect = ({ children }) => {
  const auth = useAuth()
  return (
    <Fragment>
      {!auth.initialized ? (
        <AppLoading />
      ) : auth.loggedIn ? (
        children
      ) : (
        <SignIn />
      )}
    </Fragment>
  )
}

export default LoginProtect
