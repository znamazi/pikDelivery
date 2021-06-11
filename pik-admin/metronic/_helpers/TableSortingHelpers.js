/* Pagination Helprs */
import React from 'react'
import SVG from 'react-inlinesvg'
import { toAbsoluteUrl } from './AssetsHelpers'

export const sortCaret = (order, column) => {
  if (!order)
    return (
      <span className="svg-icon svg-icon-sm svg-icon-primary ml-1 svg-icon-sort">
        <SVG src="/assets/media/svg/icons/Shopping/Sort1.svg" title="Sort" />
      </span>
    )
  else if (order === 'asc')
    return (
      <span className="svg-icon svg-icon-sm svg-icon-primary ml-1">
        <SVG src="/assets/media/svg/icons/Navigation/Up-2.svg" title="Up" />
      </span>
    )
  else if (order === 'desc')
    return (
      <span className="svg-icon svg-icon-sm svg-icon-primary ml-1">
        <SVG src="/assets/media/svg/icons/Navigation/Down-2.svg" title="Down" />
      </span>
    )
  return null
}

export const headerSortingClasses = (
  column,
  sortOrder,
  isLastSorting,
  colIndex
) => (sortOrder === 'asc' || sortOrder === 'desc' ? 'sortable-active' : '')
