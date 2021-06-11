import React from 'react'
import useModal from '../metronic/partials/modal/useModal'
import BaseModal from '../metronic/partials/modal/BaseModal'
import { useConfirmationDialog } from '../metronic/partials/modal/ConfirmationDialog'

const showModal = () => {
  // For Modal Base
  const { isShowing, toggle } = useModal()

  // For Confirm Box
  const { getConfirmation } = useConfirmationDialog()
  const handleConfirm = async () => {
    const confirmed = await getConfirmation({
      title: 'Attention!',
      message: 'are you sure?'
    })

    if (confirmed) alert('You clicked Confirm')
  }
  return (
    <>
      <div className="mb-10">
        <button className="button-default" onClick={toggle}>
          Show Modal
        </button>

        <BaseModal
          isShowing={isShowing}
          hide={toggle}
          headerLeftButtons="Title For Modal"
        >
          MODAL Base
        </BaseModal>
      </div>
      <div>
        {/* use Provider in _app.js */}
        <button className="button-default" onClick={handleConfirm}>
          Show Confirm Box
        </button>
      </div>
    </>
  )
}

export default showModal
