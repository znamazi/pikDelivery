import React from 'react'
import Link from 'next/link'
import ButtonEdit from 'metronic/partials/ButtonEdit'

export const ActionColumnFormatter = (cellContent, row) => {
  return (
    <div>
      <ButtonEdit
        href={`/contentManagement/faq/[id]`}
        as={`/contentManagement/faq/${row._id}`}
      />
    </div>
  )
}
