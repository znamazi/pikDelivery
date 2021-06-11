import React, { useState } from 'react'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import { useTranslation } from 'react-i18next'
import { Button, TextField } from '@material-ui/core'
const AddComment = (props) => {
  const { isShowing, toggle } = useModal()
  const { t } = useTranslation()
  const [comment, setComment] = useState('')
  const actionModal = (confirm) => {
    if (confirm) {
      props.handleSubmitComment(comment)
    }
  }
  return (
    <div className="col-lg-2">
      <button className="btn btn-light width-100-percent" onClick={toggle}>
        {t('pages.common.New')}
      </button>

      <BaseModal
        isShowing={isShowing}
        hide={toggle}
        headerLeftButtons={t('information.add_comment')}
        action={true}
        btnCancel={t('information.Cancel')}
        btnConfirm={t('information.Send')}
        actionCallback={actionModal}
      >
        <TextField
          onChange={(e) => setComment(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          autoFocus
          id="comment"
          label={t('information.comment')}
          name="comment"
          autoComplete="commnet"
        />
      </BaseModal>
    </div>
  )
}

export default AddComment
