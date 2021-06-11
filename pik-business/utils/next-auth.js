import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react'
import axios from './axios'
import cookie from 'js-cookie'
import { omit, assign } from 'lodash'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

const NextAuthContext = createContext(null)
const COOKIE_NAME = 'next_auth_token_business'

function useAuth() {
  const authContext = useContext(NextAuthContext)

  if (authContext === null) {
    throw new Error(
      'useAuth() can only be used inside of <NextAuthProvider />, ' +
        'please declare it at a higher level.'
    )
  }

  const { auth } = authContext

  return useMemo(
    () => ({
      ...auth
    }),
    [authContext, auth]
  )
}

function NextAuthProvider({ children }) {
  const authContext = useContext(NextAuthContext)
  const router = useRouter()
  const { t } = useTranslation()

  if (authContext !== null) {
    throw new Error('<NextAuthProvider /> has already been declared.')
  }

  const [user, setUser] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const login = useCallback(
    (email, password) => {
      return axios
        .post('/business/auth/signin', { email, password })
        .then(({ data }) => {
          if (data.success) {
            cookie.set(COOKIE_NAME, data.token)
            axios.defaults.headers.common = assign(
              axios.defaults.headers.common,
              {
                Authorization: 'Bearer ' + data.token
              }
            )
            setUser(data.user)
            setLoggedIn(true)
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            // toast.error(errorMessage)
          }
          return data
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          // toast.error(errorMessage)
          return errorMessage
        })
    },
    [authContext, user, loggedIn]
  )

  const logout = useCallback(() => {
    router.push('/')

    let config = {
      headers: {
        Authorization: `Bearer ${cookie.get(COOKIE_NAME)}`
      }
    }
    return axios
      .post('/business/auth/signout', config)
      .then(({ data }) => {
        if (data.success) {
          cookie.remove(COOKIE_NAME)
          setLoggedIn(false)
          setUser(null)
          axios.defaults.headers.common = omit(axios.defaults.headers.common, [
            'Authorization'
          ])
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
        }
        return data
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
        return error.response
      })
  }, [authContext, user, loggedIn])

  useEffect(() => {
    let config = {
      headers: {
        Authorization: `Bearer ${cookie.get(COOKIE_NAME)}`
      }
    }
    axios
      .get('/business/auth/user', config)
      .then(({ data }) => {
        if (data.success) {
          setUser(data.user)
          setLoggedIn(true)
          axios.defaults.headers.common = assign(
            axios.defaults.headers.common,
            {
              Authorization: 'Bearer ' + cookie.get(COOKIE_NAME)
            }
          )
        } else {
          // const errorMessage = data.errorCode
          //   ? t(`server_errors.${data.errorCode}`)
          //   : data.message
          // toast.error(errorMessage)
        }
      })
      .catch((error) => {
        // const errorMessage = error?.response?.data?.errorCode
        //   ? t(`server_errors.${error?.response?.data?.errorCode}`)
        //   : error?.response?.data?.message
        // toast.error(errorMessage)
      })
      .then(() => {
        setInitialized(true)
      })
    return () => {}
  }, [authContext, loggedIn])

  let auth = useMemo(
    () => ({
      loggedIn,
      initialized,
      user,
      error,
      login,
      logout
    }),
    [loggedIn, initialized, user, error, login, logout]
  )

  return (
    <NextAuthContext.Provider
      value={{
        auth: auth
      }}
    >
      {children}
    </NextAuthContext.Provider>
  )
}

export { NextAuthProvider, useAuth }
