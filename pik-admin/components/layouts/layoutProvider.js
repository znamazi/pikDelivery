import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react'

const LayoutContext = createContext(null)

function useLayout() {
  const layoutContext = useContext(LayoutContext)

  if (layoutContext === null) {
    throw new Error(
      'useLayout() can only be used inside of <LayoutProvider />, ' +
        'please declare it at a higher level.'
    )
  }

  const { layout } = layoutContext

  return useMemo(
    () => ({
      ...layout
    }),
    [layoutContext, layout]
  )
}

function LayoutProvider({ children }) {
  const layoutContext = useContext(LayoutContext)

  if (layoutContext !== null) {
    throw new Error('<LayoutProvider /> has already been declared.')
  }

  const [hasSubHeader, setHasSubHeader] = useState(false)
  const [subHeaderItems, setSubHeaderItems] = useState([])
  const [asideMinimized, setAsideMinimized] = useState(false)
  const [asideOn, setAsideOn] = useState(false)
  const [showTopBar, setShowTopBar] = useState(false)
  const [noContentWrapper, setNoContentWrapper] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')

  const displaySubHeader = useCallback(() => {
    setHasSubHeader(true)
  }, [layoutContext, hasSubHeader])

  const hideSubHeader = useCallback(() => {
    setHasSubHeader(false)
  }, [layoutContext, hasSubHeader])

  useEffect(() => {
    return () => {}
  }, [layoutContext, hasSubHeader])

  let layout = useMemo(
    () => ({
      hasSubHeader,
      displaySubHeader,
      hideSubHeader,
      subHeaderItems,
      setSubHeaderItems,
      asideMinimized,
      setAsideMinimized,
      asideOn,
      setAsideOn,
      showTopBar,
      setShowTopBar,
      noContentWrapper,
      setNoContentWrapper,
      activeMenu,
      setActiveMenu
    }),
    [
      hasSubHeader,
      displaySubHeader,
      hideSubHeader,
      subHeaderItems,
      setSubHeaderItems,
      asideMinimized,
      setAsideMinimized,
      asideOn,
      setAsideOn,
      showTopBar,
      setShowTopBar,
      noContentWrapper,
      setNoContentWrapper,
      activeMenu,
      setActiveMenu
    ]
  )

  return (
    <LayoutContext.Provider
      value={{
        layout: layout
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export { LayoutProvider, useLayout }
