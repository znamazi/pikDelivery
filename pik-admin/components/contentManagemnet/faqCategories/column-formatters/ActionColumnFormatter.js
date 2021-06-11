import React from 'react'
import Link from 'next/link'
import ButtonEdit from 'metronic/partials/ButtonEdit'

export const ActionColumnFormatter = (cellContent, row) => {
  return (
    <div>
      <ButtonEdit
        href={`/contentManagement/category/[id]`}
        as={`/contentManagement/category/${row._id}`}
      />
    </div>
  )
}
