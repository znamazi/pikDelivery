import React, { useState, useEffect } from 'react'
import SetupTime from './SetupTime'
import SetupDate from './SetupDate'
import { Button, TextareaAutosize, CircularProgress } from '@material-ui/core'
import { Alert, ToggleButtonGroup } from '@material-ui/lab'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { makeStyles, withStyles } from '@material-ui/core/styles'
import { useSetupState } from './context'
import { toast } from 'react-toastify'
import axios from '../../utils/axios'
import { submit } from './utils'
import actions from 'store/actions'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import ShowDate from '../partials/ShowDate'
import PersonalInfo from '../../metronic/partials/PersonalInfo'
import moment from 'moment'
import { Status } from '../orders/orders-list/column-formatters/StatusColumnFormatter'

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
    float: 'right'
  },

  circularProgress: {
    width: '16px !important',
    height: '16px !important',
    marginLeft: theme.spacing(1),
    color: '#fff'
  }
}))

const Hours = (props) => {
  const { t } = useTranslation()

  // const classes = useStyles()
  // const router = useRouter()
  const { state, dispatch } = useSetupState()
  const [error, setError] = useState('')
  const { isShowing, toggle } = useModal()
  const [orders, setOrders] = useState([])
  const [customTimeFramesConflict, setCustomTimeFramesConflict] = useState([])
  const [
    customTimeFramesConflictRemove,
    setCustomTimeFramesConflictRemove
  ] = useState([])
  const [cleanError, setCleanError] = useState(false)

  useEffect(() => {
    if (state.handleSubmit) handleSubmit()
  }, [state.handleSubmit])

  const handleSubmit = async () => {
    setError('')
    if (state.tab !== 'business') {
      if (
        state.timeFrames.some(
          (obj) =>
            (!obj.totallyClosed &&
              (obj.close === '00:00' || obj.open === '00:00')) ||
            (!obj.totallyClosed &&
              (!obj.hasOwnProperty('open') || !obj.hasOwnProperty('close')))
        )
      ) {
        setError(t('errors.set_business_hours'))
        return
      }
    }
    if (!state.name) {
      setError(t('errors.enter_business_name'))
      return
    }
    if (!state.phone) {
      setError(t('errors.enter_phone'))
      return
    }
    if (!state.mobile) {
      setError(t('errors.enter_mobile'))
      return
    }
    if (!state.email) {
      setError(t('errors.enter_email'))
      return
    }
    if (
      !state.address ||
      state.address.formatted_address == 'Unnamed Road, Panama'
    ) {
      setError(t('errors.business_address_required'))
      return
    }
    dispatch({
      type: 'UPDATE_SENDING',
      payload: true
    })

    let response = await submit(state)

    let message =
      state.mode === 'edit'
        ? t('pages.business.business_updated')
        : t('pages.business.business_created')
    if (response.success) {
      dispatch({
        type: 'UPDATE_MODE',
        payload: {
          mode: 'edit'
        }
      })
      dispatch({
        type: 'CLEAN_CARD'
      })
      dispatch({
        type: 'UPDATE_CREDIT_CARD',
        payload: response.business.creditCard
      })
      dispatch({
        type: 'CLEAR_TYPE_CUSTOM_TIME_FRAMES'
      })
      // if (state.mode != 'edit') {
      //   router.push('/')
      // }
      dispatch({
        type: 'UPDATE_SENDING',
        payload: false
      })
      props.setBuisness()
      setCleanError(true)
    } else if (!response.success && response.conflict) {
      toggle()
      setOrders(response.orders)
      setCustomTimeFramesConflict(response.customTimeFramesConflict)
      setCustomTimeFramesConflictRemove(response.customTimeFramesConflictRemove)
      dispatch({
        type: 'UPDATE_SENDING',
        payload: false
      })
    } else {
      const errorMessage = response.errorCode
        ? t(`server_errors.${response.errorCode}`)
        : response.message
      toast.error(errorMessage)
      dispatch({
        type: 'UPDATE_SENDING',
        payload: false
      })
    }
  }
  const actionModal = (confirm) => {
    if (confirm) {
      const ordersId = orders.map((order) => order._id)
      const customTimeFrames = state.customTimeFrames.filter(
        (item) => item.type === 'add'
      )
      let data = { ...state, customTimeFrames }
      let removeDate = [
        'date',
        'mode',
        'tab',
        'showDetails',
        'error',
        'urlEdit',
        'urlAdd',
        'group',
        'createdAt',
        'updatedAt',
        'handleSubmit',
        '__v',
        '_id'
      ]
      removeDate.forEach((item) => delete data[item])

      axios
        .post('business/setup/edit', { ...data, ordersId })
        .then(({ data }) => {
          if (data.success) {
            let message =
              state.mode === 'edit'
                ? t('pages.business.business_updated')
                : t('pages.business.business_created')

            dispatch({
              type: 'UPDATE_MODE',
              payload: {
                mode: 'edit'
              }
            })
            dispatch({
              type: 'CLEAR_TYPE_CUSTOM_TIME_FRAMES'
            })
            props.setBuisness()
            toast.success(message)
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
    } else {
      let newData = state.customTimeFrames.filter(
        (item) => !customTimeFramesConflict.includes(item.id)
      )
      newData = [...newData, ...customTimeFramesConflictRemove]
      dispatch({
        type: 'REMOVE_CUSTOM_TIME_FRAMES_CONFILICT',
        payload: newData
      })
    }
  }
  return (
    <>
      <div className="col-12 mb-5">
        {error && <Alert severity="error">{error}</Alert>}
      </div>
      <SetupTime />
      <SetupDate
        cleanError={cleanError}
        changeClearError={() => setCleanError(false)}
      />
      {/* <div className="col-12">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
        >
          {t('information.Send')}
          {state.sending && (
            <CircularProgress className={classes.circularProgress} />
          )}
        </Button>
      </div> */}
      <BaseModal
        isShowing={isShowing}
        hide={toggle}
        action={true}
        btnCancel={t('information.cancel')}
        btnConfirm={t('information.procees')}
        actionCallback={actionModal}
      >
        <div className="border-bottom mb-3 pb-2 font-weight-bolder">
          {t('pages.setup.order_conflict')}
        </div>
        <p className="mb-5 p-3">{t('pages.setup.msg_exist_order')}</p>
        <table className="table table-striped table-responsive table-bordered">
          <thead className="thead-light">
            <tr>
              <th scope="col">{t('Table.columns.id')}</th>
              <th scope="col">{t('Table.columns.name')}</th>
              <th scope="col">{t('Table.columns.scheduled_for')}</th>
              <th scope="col">{t('Table.columns.items')}</th>
              <th scope="col">{t('Table.columns.status')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              return (
                <tr key={order._id}>
                  <td>
                    <ShowDate date={order.date} id={order.id} />
                  </td>
                  <td>
                    <PersonalInfo
                      firstName={order.receiver.firstName}
                      lastName={order.receiver.lastName}
                      avatar={order.receiver.avatar}
                      email={order.receiver.email}
                    />
                  </td>
                  <td>
                    <p>{moment(order.schedule.date).format('LL')}</p>
                    <p>
                      {moment(order.schedule.from, 'hh:mm').format('LT')} -{' '}
                      {moment(order.schedule.to, 'hh:mm').format('LT')}
                    </p>
                  </td>
                  <td>{order.packages.length}</td>
                  <td>
                    <Status row={order} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="p-3">{t('pages.setup.msg_procced')}</p>
      </BaseModal>
    </>
  )
}

export default connect('', (dispatch) => ({
  setBuisness: () => {
    dispatch({
      type: actions.BUSINESS_INIT_REQUESTED
    })
  }
}))(Hours)
