import React, {createContext, useContext, useState} from 'react'
import initHeadManager from './head-manager.ts'
import Effect from "./side-effect";
import {defaultHead} from "./SubHeader";

const headManager = initHeadManager()

export const HeadManagerContext: React.Context<{
    heads?: any
    updateHead?: (state: any) => void
    mountedInstances?: any
}> = React.createContext({})

export const HeadManagerProvider = ({children}) => {
    const [heads, setHeads] = useState([]);

    return <HeadManagerContext.Provider
        // value={headManager}
        value={{
            // heads,
            // updateHead: state => {heads = state;},
            updateHead: items => {
                console.log(
                    'updateHead',
                    JSON.stringify(items.map(i=>i.props)),
                    JSON.stringify(heads.map(i=>i.props))
                );
                // if(JSON.stringify(items.map(i=>i.props)) != JSON.stringify(heads.map(i=>i.props)))
                //     setHeads(items);
            },
            mountedInstances: new Set(),
        }}
    >
        {children}
    </HeadManagerContext.Provider>
};

export const ReactRemoteSection = ({children, name}) => {
    const Context = createContext(null);
    const [items, setItems] = useState([<span>{name}</span>]);

    return <Context.Provider value={{items}}>
        {items}
    </Context.Provider>
}

function onlyReactElement(list: Array<React.ReactElement<any>>, child: React.ReactChild): Array<React.ReactElement<any>> {
  // React children can be "string" or "number" in this case we ignore them for backwards compat
  if (typeof child === 'string' || typeof child === 'number') {
    return list
  }
  // Adds support for React.Fragment
  if (child.type === React.Fragment) {
    return list.concat(
      React.Children.toArray(child.props.children).reduce(
        (
          fragmentList: Array<React.ReactElement<any>>,
          fragmentChild: React.ReactChild
        ): Array<React.ReactElement<any>> => {
          if (
            typeof fragmentChild === 'string' ||
            typeof fragmentChild === 'number'
          ) {
            return fragmentList
          }
          return fragmentList.concat(fragmentChild)
        },
        []
      )
    )
  }
  return list.concat(child)
}
function reduceComponents(headElements: Array<React.ReactElement<any>>) {
  return headElements
    .reduce(
      (list: React.ReactChild[], headElement: React.ReactElement<any>) => {
        const headElementChildren = React.Children.toArray(
          headElement.props.children
        )
        return list.concat(headElementChildren)
      },
      []
    )
    .reduce(onlyReactElement, [])
    .reverse()
    .concat(defaultHead())
    // .filter(unique())
    .reverse()
    .map((c: React.ReactElement<any>, i: number) => {
      const key = c.key || i
      return React.cloneElement(c, { key })
    })
}
export const ReactRemoteRender = ({children, name}) => {
  // const headManager = useContext(HeadManagerContext)
    return <Effect
      reduceComponentsToState={reduceComponents}
      headManager={headManager}
    >
      {children}
    </Effect>
}

if (process.env.NODE_ENV !== 'production') {
    HeadManagerContext.displayName = 'LayoutSubHeaderManagerContext'
}
