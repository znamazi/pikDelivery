import React, { useState } from 'react'
import {
  Switch,
  Box,
  FormControlLabel,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import { Alert } from '@material-ui/lab'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import { useSetupState } from './context'
import { replaceAll } from '../../utils/utils'
import PaymentMethod from './PaymentMethod'

const useStyles = makeStyles((theme) => ({
  card: { display: 'block' },
  cvv: { marginTop: '-8px' },
  formControl: {
    margin: theme.spacing(1),
    width: '98%'
  },
  borderRight: {
    borderRight: '1px solid gray'
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    float: 'right'
  },
  btnUpload: {
    marginTop: theme.spacing(2)
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  },
  textarea: {
    marginTop: theme.spacing(1),
    borderRadius: 4,
    borderColor: '#c4c4c4'
  },

  typography: { marginTop: theme.spacing(2) },
  example: {
    borderRadius: 4,
    backgroundColor: '#ffa50059',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  IOSSwitch: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3)
  },
  select: {
    // padding: theme.spacing(0, 2),
    minWidth: 120
  }
}))

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1)
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: ' #fff !important',
      '& + $track': {
        backgroundColor: '#52d869 !important',
        opacity: 1,
        border: 'none'
      }
    },
    '&$focusVisible $thumb': {
      color: '#52d869 !important',
      border: '6px solid #fff '
    }
  },
  thumb: {
    width: 24,
    height: 24
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border'])
  },
  checked: {},
  focusVisible: {}
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  )
})

const BusinessShipping = (props) => {
  const { t } = useTranslation()

  const classes = useStyles()
  const { state, dispatch } = useSetupState()
  const { isShowing, toggle } = useModal()
  const [error, setError] = useState('')

  const handleData = (e) => {
    dispatch({
      type: 'UPDATE_DATA',
      payload: {
        fieldName: e.target.id,
        value: e.target.value
      }
    })
  }
  const handleEnabled = (e) => {
    dispatch({
      type: 'UPDATE_ENABLE',
      payload: e.target.checked
    })
  }

  const [infoCard, setInfoCard] = useState(state.creditCard?.cc_number)

  const addInfoCard = (confirm) => {
    setError('')
    if (confirm) {
      if (
        !state.card.cardNumber ||
        !state.card.month ||
        !state.card.year ||
        !state.card.cvv
      ) {
        setError('info card is required')
        dispatch({
          type: 'UPDATE_ERROR'
        })
        return
      }
      setInfoCard(
        state.card.cardNumber
          .substr(state.card.cardNumber.length - 4)
          .padStart(16, '*')
          .match(/.{1,4}/g)
          .join(' ')
      )
    } else {
      dispatch({
        type: 'REMOVE_CARD'
      })
    }
  }

  const handleDataCard = (e) => {
    dispatch({
      type: 'UPDATE_CARD',
      payload: {
        fieldName: e.target.name,
        value: e.target.value
      }
    })
  }
  const handleCardNumber = (e) => {
    let value = e.target.value
    value = replaceAll(value, ' ', '')
    dispatch({
      type: 'UPDATE_CARD',
      payload: {
        fieldName: 'cardNumber',
        value
      }
    })
  }

  const removeCard = () => {
    dispatch({
      type: 'REMOVE_CARD'
    })
    setInfoCard(false)
  }
  return (
    <>
      <Typography component="h5" variant="h5">
        {t('pages.setup.shipping_coverage')}
      </Typography>
      <Typography className={classes.typography}>
        {t('pages.setup.shipping_coverage_desc')}
      </Typography>
      <Box className={classes.example}>
        {t('pages.setup.shipping_coverage_example')}
      </Box>
      <div className="row mt-3">
        {/* <div className="col-md-3"> */}
        <FormControlLabel
          control={
            <IOSSwitch
              checked={state.coverageEnabled}
              onChange={(event) => handleEnabled(event)}
              name="enabled"
            />
          }
          label={t('information.enabled')}
          labelPlacement="start"
          className={classes.IOSSwitch}
        />
        {/* </div> */}
        <div className="col-md-4">
          <label htmlFor="inlineFormInputGroup">
            {t('pages.setup.coverage_max_value')}
          </label>
          <div className="input-group mb-2">
            <input
              type="text"
              className="form-control"
              id="coverageMaxValue"
              value={state.coverageMaxValue ? state.coverageMaxValue : ''}
              onChange={(e) => handleData(e)}
            />
            <div className="input-group-prepend">
              <div className="input-group-text">{t('pages.setup.usd')}</div>
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <label htmlFor="inlineFormInputGroup " style={{ fontSize: 12 }}>
            {t('pages.setup.payment_method')}
          </label>
          <div className="input-group mb-2">
            {!infoCard && <a onClick={toggle}>+{t('pages.setup.add_card')}</a>}
            <div className="d-flex flex-center">
              {infoCard && (
                <>
                  {state.creditCard?.cc_type && (
                    <span className="card-type">
                      {state.creditCard?.cc_type}
                    </span>
                  )}
                  <span>{infoCard}</span>
                  <a className="ml-15" onClick={removeCard}>
                    <i className="fa fa-times "></i>
                  </a>
                </>
              )}
              {error && <Alert severity="error">{error}</Alert>}
            </div>
          </div>
        </div>
      </div>

      <PaymentMethod
        isShowing={isShowing}
        hide={toggle}
        actionCallback={(confirm) => addInfoCard(confirm)}
        card={state.card}
      >
        {/* <TextField
          value={state.card ? state.card.cardName : ''}
          onChange={(e) => handleDataCard(e)}
          margin="normal"
          required
          fullWidth
          id="cardName"
          label={t('pages.setup.card_name')}
          name="cardName"
          autoComplete="cardName"
          className={classes.card}
        /> */}
        <TextField
          value={
            state.card.cardNumber
              ? state.card.cardNumber.match(/.{1,4}/g).join(' ')
              : ''
          }
          onChange={(e) => handleCardNumber(e)}
          margin="normal"
          required
          fullWidth
          id="cardNumber"
          label={t('pages.setup.card_number')}
          name="cardNumber"
          className={classes.card}
          inputProps={{
            maxLength: 19
          }}
        />
        <FormControl className={classes.formControl}>
          <InputLabel id="month-label">{t('pages.setup.month')}</InputLabel>
          <Select
            labelId="month-label"
            id="month"
            name="month"
            className={classes.select}
            value={state.card ? state.card.month : ''}
            onChange={(e) => handleDataCard(e)}
          >
            {Array.from(Array(12).keys()).map((item, index) => {
              item = item + 1
              let value = ('0' + item).slice(-2)
              return (
                <MenuItem value={value} key={index}>
                  {value}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel id="dyear-label">{t('pages.setup.year')}</InputLabel>
          <Select
            labelId="year-label"
            id="year"
            name="year"
            className={classes.select}
            value={state.card ? state.card.year : ''}
            onChange={(e) => handleDataCard(e)}
          >
            {Array.from(Array(12).keys()).map((item, index) => {
              let data = item + 2020
              let value = item + 20
              return (
                <MenuItem value={value} key={index}>
                  {data}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        <FormControl className={`${classes.cvv} ${classes.formControl}`}>
          <TextField
            value={state.card ? state.card.cvv : ''}
            onChange={(e) => handleDataCard(e)}
            margin="normal"
            required
            id="cvv"
            label={t('pages.setup.cvv')}
            name="cvv"
          />
        </FormControl>
      </PaymentMethod>
    </>
  )
}

export default BusinessShipping
