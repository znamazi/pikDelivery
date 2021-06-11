import React, { useState, useEffect } from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import { useSetupState } from './context'
import SelectHours from './SelectHours'

const useStyles = makeStyles((theme) => ({
  borderRight: {
    borderRight: '1px solid gray'
  }
}))
const PrimaryCheckbox = withStyles({
  root: {
    color: '#f1962b',
    '&$checked': {
      color: '#f1962b'
    }
  },
  checked: {}
})((props) => <Checkbox color="default" {...props} />)

const SetupTime = () => {
  const { t } = useTranslation()

  const classes = useStyles()
  const { state, dispatch } = useSetupState()
  const days = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0
  }
  Object.freeze(days)
  const changeDay = (event) => {
    let index = event.target.id.split('-')[1]
    let newData = state.timeFrames.slice()
    newData[index] = event.target.checked
      ? { ...newData[index], totallyClosed: !event.target.checked }
      : { totallyClosed: !event.target.checked, open: '08:00', close: '18:00' }

    dispatch({
      type: 'UPDATE_TIME_FRAMES',
      payload: newData
    })
  }
  return (
    <div className={`col-lg-5 ${classes.borderRight}`}>
      <p>{t('pages.business.business_hours')}</p>

      {Object.keys(days).map((day) => (
        <div className="row" key={days[day]}>
          <div className="col-lg-4">
            <FormControlLabel
              control={
                <PrimaryCheckbox
                  checked={!state.timeFrames[days[day]]['totallyClosed']}
                  id={`day-${days[day]}`}
                  onChange={(event) => changeDay(event)}
                />
              }
              label={t(`information.${day}`)}
            />
          </div>
          {!state.timeFrames[days[day]]['totallyClosed'] ? (
            <>
              <SelectHours
                type="open"
                parent="timeFrames"
                index={days[day]}
                defaultHour="08:00"
              />

              <SelectHours
                type="close"
                parent="timeFrames"
                index={days[day]}
                defaultHour="18:00"
              />
            </>
          ) : (
            <div className="col-lg-4">
              <p className="p-3 font-weight-bold">{t('information.closed')}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default SetupTime
