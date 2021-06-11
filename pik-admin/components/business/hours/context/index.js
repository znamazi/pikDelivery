import React, { useReducer, useContext, createContext } from 'react'
import { initState, reducer } from '../state'

export const Context = createContext({})

export const SetupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initState)
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  )
}

export const useSetupState = () => {
  return useContext(Context)
}
