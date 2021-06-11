import React from 'react'

const ToolBar = () => {
  return (
    <div>
      <button
        className="btn btn-light"
        onClick={() => alert('Create Invoice Clicked')}
      >
        {t('pages.invoices.create_invoice')}
      </button>
    </div>
  )
}

export default ToolBar
