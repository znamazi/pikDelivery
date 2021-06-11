import React from 'react'
import SVG from 'react-inlinesvg'
import Link from 'next/link'
import { toast } from 'react-toastify'
import axios from '../../../utils/axios'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import ButtonEdit from '../../../metronic/partials/ButtonEdit'
import ButtonDelete from '../../../metronic/partials/ButtonDelete'
import { useTranslation } from 'react-i18next'

const ActionButtons = ({ id, onDelete, title, published }) => {
  const { t } = useTranslation()

  const { getConfirmation } = useConfirmationDialog()
  const handleConfirm = async (id) => {
    const confirmed = await getConfirmation({
      title: t('pages.content.delete_page'),
      message: t('pages.content.message_delete_page', { title })
    })

    if (confirmed) {
      axios
        .post(`/admin/content/page/delete/${id}`)
        .then(({ data }) => {
          if (data.success) {
            onDelete(id)
            // toast.success('Page Deleted Successfuly')
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            toast.error(errorMessage)
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          toast.error(errorMessage)
        })
    }
  }
  return (
    <div>
      <ButtonEdit
        href={`/contentManagement/page/[id]`}
        as={`/contentManagement/page/${id}`}
      />
      <span
        // className="btn btn-icon btn-light btn-sm mx-1"
        onClick={() => handleConfirm(id)}
      >
        <ButtonDelete />
      </span>
    </div>
  )
}

export default ActionButtons
