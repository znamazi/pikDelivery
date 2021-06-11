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

const NextAuthContext = createContext(null)

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

  if (authContext !== null) {
    throw new Error('<NextAuthProvider /> has already been declared.')
  }

  const [user, setUser] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const login = useCallback(
    (username, password) => {
      return axios
        .post('/admin/auth/signin', { username, password })
        .then(({ data }) => {
          if (data.success) {
            cookie.set('next_auth_token', data.token)
            axios.defaults.headers.common = assign(
              axios.defaults.headers.common,
              {
                Authorization: 'Bearer ' + data.token
              }
            )
            setUser(data.user)
            setLoggedIn(true)
          } else {
            console.log('Error happend', data)
          }
          return data
        })
        .catch((error) => {
          console.log('Error happend', error)

          return error
        })
    },
    [authContext, user, loggedIn]
  )

  const logout = useCallback(() => {
    router.push('/')

    let config = {
      headers: {
        Authorization: `Bearer ${cookie.get('next_auth_token')}`
      },
      data: { chatOnline: false }
    }
    return axios
      .post(`/admin/auth/signout/${user._id}`, config)
      .then(({ data }) => {
        if (data.success) {
          cookie.remove('next_auth_token')
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
        Authorization: `Bearer ${cookie.get('next_auth_token')}`
      }
    }
    axios
      .get('/admin/auth/user', config)
      .then(({ data }) => {
        if (data.success) {
          setUser(data.user)
          setLoggedIn(true)
          axios.defaults.headers.common = assign(
            axios.defaults.headers.common,
            {
              Authorization: 'Bearer ' + cookie.get('next_auth_token')
            }
          )
        } else {
          console.log(error)
          // const errorMessage = data.errorCode
          //   ? t(`server_errors.${data.errorCode}`)
          //   : data.message
          // toast.error(errorMessage)
        }
      })
      .catch((error) => {
        console.log(error)
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
      setUser,
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
