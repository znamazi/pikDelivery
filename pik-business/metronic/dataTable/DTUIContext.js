import React, { createContext, useContext, useState, useCallback } from 'react'
import { isEqual, isFunction } from 'lodash'
import { initialFilter } from './UIHelpers'

const DTUIContext = createContext()

export function useDTUIContext() {
  return useContext(DTUIContext)
}

export const DTUIConsumer = DTUIContext.Consumer

export function DTUIProvider({ DTUIEvents, children }) {
  const [queryParams, setQueryParamsBase] = useState(initialFilter)
  const [ids, setIds] = useState([])
  const [selectedRow, setSelectedRow] = useState([])
  const setQueryParams = useCallback((nextQueryParams) => {
    setQueryParamsBase((prevQueryParams) => {
      if (isFunction(nextQueryParams)) {
        nextQueryParams = nextQueryParams(prevQueryParams)
      }

      if (isEqual(prevQueryParams, nextQueryParams)) {
        return prevQueryParams
      }

      return nextQueryParams
    })
  }, [])

  const value = {
    queryParams,
    setQueryParamsBase,
    ids,
    setIds,
    setSelectedRow,
    selectedRow,
    setQueryParams
  }

  return <DTUIContext.Provider value={value}>{children}</DTUIContext.Provider>
}
