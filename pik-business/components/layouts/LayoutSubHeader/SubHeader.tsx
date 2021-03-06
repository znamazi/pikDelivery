import React, { useContext } from 'react'
import Effect from './side-effect.tsx'
import { HeadManagerContext } from './head-manager-context.tsx';

export function defaultHead(): JSX.Element[] {
  const heads = []
  return heads
}

function onlyReactElement(
  list: Array<React.ReactElement<any>>,
  child: React.ReactChild
): Array<React.ReactElement<any>> {
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

const METATYPES = ['name', 'httpEquiv', 'charSet', 'itemProp']

/*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/
function unique() {
  const keys = new Set()
  const tags = new Set()
  const metaTypes = new Set()
  const metaCategories: { [metatype: string]: Set<string> } = {}

  return (h: React.ReactElement<any>) => {
    let isUnique = true

    if (h.key && typeof h.key !== 'number' && h.key.indexOf('$') > 0) {
      const key = h.key.slice(h.key.indexOf('$') + 1)
      if (keys.has(key)) {
        isUnique = false
      } else {
        keys.add(key)
      }
    }

    // eslint-disable-next-line default-case
    switch (h.type) {
      case 'title':
      case 'base':
        if (tags.has(h.type)) {
          isUnique = false
        } else {
          tags.add(h.type)
        }
        break
      case 'meta':
        for (let i = 0, len = METATYPES.length; i < len; i++) {
          const metatype = METATYPES[i]
          if (!h.props.hasOwnProperty(metatype)) continue

          if (metatype === 'charSet') {
            if (metaTypes.has(metatype)) {
              isUnique = false
            } else {
              metaTypes.add(metatype)
            }
          } else {
            const category = h.props[metatype]
            const categories = metaCategories[metatype] || new Set()
            if (categories.has(category)) {
              isUnique = false
            } else {
              categories.add(category)
              metaCategories[metatype] = categories
            }
          }
        }
        break
    }

    return isUnique
  }
}

/**
 *
 * @param headElements List of multiple <Head> instances
 */
function reduceComponents(
  headElements: Array<React.ReactElement<any>>
) {
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
    .filter(unique())
    .reverse()
    .map((c: React.ReactElement<any>, i: number) => {
      const key = c.key || i
      return React.cloneElement(c, { key })
    })
}

/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 */
function Head({ children }: { children: React.ReactNode }) {
  const headManager = useContext(HeadManagerContext)
  return (
    <Effect
      reduceComponentsToState={reduceComponents}
      headManager={headManager}
    >
      {children}
    </Effect>
  )
}

// TODO: Remove in the next major release
Head.rewind = () => {}

export default Head
