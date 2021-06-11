import React, { useEffect, useState } from 'react'
import NativeSelect from '@material-ui/core/NativeSelect'
import FormControl from '@material-ui/core/FormControl'
import { makeStyles } from '@material-ui/core/styles'
import FormHelperText from '@material-ui/core/FormHelperText'
import { hours } from './HourArray'
import { useSetupState } from './context'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../utils/next-auth'

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: '100%',
    marginBottom: theme.spacing(2)
  }
}))

const SelectHours = (props) => {
  const { t } = useTranslation()
  const auth = useAuth()

  const { state, dispatch } = useSetupState()
  const classes = useStyles()
  const [error, setError] = useState('')
  useEffect(() => {
    setError('')
  }, [props])
  let selectedHour =
    props.parent === 'timeFrames'
      ? state[props.parent][props.index][props.type]
      : state[props.parent][props.type]

  const changeHour = (e) => {
    setError('')
    console.log('++++++', auth.user.permissions)

    if (
      !auth.user.permissions['business-management'] ||
      auth.user.permissions['business-management'] < 2
    ) {
      setError('Permission Denied')
      return
    }
    let value = e.target.value
    let newData = state[props.parent]
    let open =
      props.parent === 'timeFrames' ? newData[props.index].open : newData.open

    let close =
      props.parent === 'timeFrames' ? newData[props.index].close : newData.close
    if (props.type === 'close' && open === '00:00') {
      setError(t('errors.set_open_first'))
      return
    }
    if (props.type === 'close' && open.localeCompare(value) != -1) {
      setError(t('errors.set_open_close_correct'))
      return
    }
    if (props.type === 'open' && close.localeCompare(value) != 1) {
      setError(t('errors.set_open_close_correct'))
      return
    }
    if (props.parent === 'timeFrames') {
      newData[props.index] = {
        ...newData[props.index],
        [props.type]: value
      }
      dispatch({
        type: 'UPDATE_TIME_FRAMES',
        payload: newData
      })
    } else if (props.parent === 'date') {
      dispatch({
        type: 'UPDATE_DATE',
        payload: {
          fieldName: [props.type],
          value: value
        }
      })
    }
  }

  let option = hours.map((item) => (
    <option value={item.value} key={item.value}>
      {item.label}
    </option>
  ))
  return (
    <div className="col-lg-4">
      <FormControl
        className={`${classes.formControl} ${props.className}`}
        error={error ? true : false}
      >
        <NativeSelect
          value={selectedHour !== '00:00' ? selectedHour : props.defaultHour}
          onChange={changeHour}
          inputProps={{
            id: 'name-native-error'
          }}
          className={classes.NativeSelect}
        >
          {option}
        </NativeSelect>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </div>
  )
}

export default SelectHours
