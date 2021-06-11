import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Avatar from '@material-ui/core/Avatar'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { useDTUIContext } from '../../../metronic/dataTable/DTUIContext'
import useModal from '../../../metronic/partials/modal/useModal'
import BaseModal from '../../../metronic/partials/modal/BaseModal'
import actions from 'store/actions'
import { cancelPermission } from './OrdersUIHelpers'
const Grouping = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  // DT UI Context
  const DTUIContext = useDTUIContext()
  const DTUIProps = useMemo(() => {
    return {
      ids: DTUIContext.ids,
      setIds: DTUIContext.setIds,
      selectedRow: DTUIContext.selectedRow,
      setSelectedRow: DTUIContext.setSelectedRow
    }
  }, [DTUIContext])
  const { isShowing, toggle } = useModal()
  const [banId, setBanId] = useState([])
  const [contentModal, setContentModal] = useState('')
  useEffect(() => {
    setBanId(banId.filter((item) => DTUIProps.ids.includes(item)))
    let contentModal = DTUIProps.selectedRow.map((row, index) => {
      // TODO-Not Register order (remove it and read not register from customer)

      // if (['Pending', 'Not Registered'].includes(row.status)) {
      if (
        row.receiver.status === 'Not Registered' ||
        cancelPermission.includes(row.status)
      ) {
        return (
          <div className="p-7 border-bottom" key={index}>
            <div className="d-flex align-items-center">
              {row.receiver.status !== 'Not Registered' && (
                <Avatar
                  alt={row.receiver.firstName}
                  src={row.receiver.avatar}
                />
              )}

              <div className="ml-4">
                <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
                  {`${row.receiver.firstName} ${row.receiver.lastName}`}
                </div>
                <a className="text-muted font-weight-bold text-hover-primary">
                  {row.receiver.email}
                </a>
              </div>
              <div className="position-absolute right-40 text-center">
                <div>
                  <strong>Items</strong>
                </div>
                <div>{row.items}</div>
              </div>
            </div>
          </div>
        )
      } else {
        let newBan = [...banId, row._id]
        setBanId(newBan)
      }
    })

    setContentModal(contentModal)
  }, [DTUIProps.ids])

  const actionModal = (confirm) => {
    if (confirm) {
      props.cancelOrder(DTUIProps.ids)
      DTUIProps.setIds([])
      DTUIProps.setSelectedRow([])
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-danger font-weight-bolder font-size-sm width-100-percent col-md-2"
        onClick={toggle}
        disabled={banId.length > 0}
        title={
          banId.length > 0
            ? 'Orders can becancelled only if status is: Pending, Non Registered'
            : ''
        }
      >
        {banId.length > 0 && <i className="fa fa-ban"></i>}{' '}
        {t('pages.orders.cancel_order')}
      </button>
      <BaseModal
        isShowing={isShowing}
        hide={toggle}
        headerLeftButtons={t('pages.orders.sure_cancel')}
        action={true}
        btnCancel={t('pages.common.go_back')}
        btnConfirm={t('pages.orders.confirm_cancel')}
        actionCallback={actionModal}
        theme="warning"
      >
        {contentModal}
      </BaseModal>
    </>
  )
}

export default connect('', (dispatch) => ({
  cancelOrder: (ids) => {
    dispatch({
      type: actions.CANCEL_ORDER_REQUESTED,
      payload: ids
    })
  }
}))(Grouping)
