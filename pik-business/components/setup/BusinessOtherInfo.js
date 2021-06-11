import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import { useSetupState } from './context'
import BusinessLocation from './BusinessLocation'
import BusinessShipping from './BusinessShipping'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { submit } from './utils'
import { toast } from 'react-toastify'
import actions from 'store/actions'
import { useTranslation } from 'react-i18next'
import { Alert, AlertTitle } from '@material-ui/lab'
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    float: 'right',
    background: 'linear-gradient(to bottom right, #f12711 0%, #f5af19 100%)',
    color: 'white'
  },
  circularProgress: {
    width: '16px !important',
    height: '16px !important',
    marginLeft: theme.spacing(1),
    color: '#fff'
  }
}))
const BusinessOtherInfo = (props) => {
  const { t } = useTranslation()
  const [error, setError] = useState('')

  const { state, dispatch } = useSetupState()
  const classes = useStyles()

  const handleSubmit = async () => {
    setError('')
    if (state.error) return

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

    if (
      state.coverageEnabled &&
      !(state.card.cardNumber || state.creditCard.cc_number)
    ) {
      setError(t('errors.card_info_required'))
      return
    }

    dispatch({
      type: 'UPDATE_SENDING',
      payload: true
    })
    let response = await submit(state)
    if (response.success) {
      toast.success(t('pages.setup.business_updated'))
      props.setBuisness()
      dispatch({
        type: 'UPDATE_CREDIT_CARD',
        payload: response.business.creditCard
      })
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

  const changeContent = () => {
    setError('')

    if (state.error) return
    if (
      !state.address ||
      state.address.formatted_address == 'Unnamed Road, Panama'
    ) {
      setError(t('errors.business_address_required'))
      return
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

    dispatch({
      type: 'CHANGE_CONTENT'
    })
  }
  return (
    <div className="col-lg-8">
      <BusinessLocation />
      <BusinessShipping />
      {error && <Alert severity="error">{error}</Alert>}

      {state.mode === 'edit' || state.tab === 'business' ? (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
        >
          {t('information.save')}
          {state.sending && (
            <CircularProgress className={classes.circularProgress} />
          )}
        </Button>
      ) : (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={changeContent}
        >
          Next
        </Button>
      )}
    </div>
  )
}

export default connect('', (dispatch) => ({
  setBuisness: () => {
    dispatch({
      type: actions.BUSINESS_INIT_REQUESTED
    })
  }
}))(BusinessOtherInfo)
